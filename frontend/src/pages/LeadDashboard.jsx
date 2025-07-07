import { useState, useEffect } from 'react';
import axios from 'axios';
import LeadForm from '../components/LeadForm';
import LeadDetails from '../components/LeadDetails';
import SidebarLayout from '../components/SidebarLayout';
import '../CSS/LeadDashboard.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const LeadDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [editingLead, setEditingLead] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [commentLead, setCommentLead] = useState(null);
  const [agents, setAgents] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    tag: '',
    assignedTo: '',
    from: '',
    to: ''
  });

  const token = localStorage.getItem('token');

  const fetchUser = async () => {
    try {
      const res = await axios.get('https://lead-management-psag.onrender.com/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserRole(res.data.role);
    } catch (err) {
      console.error('Failed to fetch user info:', err);
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchLeads = async () => {
    if (!token) return;
    try {
      const res = await axios.get('https://lead-management-psag.onrender.com/api/leads', {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      setLeads(res.data);
    } catch (err) {
      console.error('Failed to fetch leads:', err.message);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await axios.get('https://lead-management-psag.onrender.com/users/support-agents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAgents(res.data);
    } catch (err) {
      console.error('Failed to fetch agents:', err.message);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await axios.delete(`https://lead-management-psag.onrender.com/api/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (selectedLeadId === id) setSelectedLeadId(null);
      fetchLeads();
    } catch (err) {
      alert('Delete failed!');
      console.error(err);
    }
  };

  const handleEdit = lead => {
    setEditingLead(lead);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingLead(null);
    setShowForm(true);
  };

  const handleFormSubmit = async data => {
    try {
      if (editingLead) {
        await axios.put(`https://lead-management-psag.onrender.com/api/leads/${editingLead._id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('https://lead-management-psag.onrender.com/api/leads', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowForm(false);
      fetchLeads();
    } catch (err) {
      alert('Save failed!');
      console.error(err);
    }
  };

  const handleExport = async () => {
    try {
      const res = await axios.get('https://lead-management-psag.onrender.com/api/leads/export', {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads_export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Export failed!');
      console.error(err);
    }
  };

  const handleImport = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post('https://lead-management-psag.onrender.com/api/leads/import', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Leads imported successfully');
      fetchLeads();
    } catch (err) {
      alert('Import failed!');
      console.error(err);
    }
  };

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    fetchUser();
    fetchAgents();
  }, []);

  useEffect(() => {
    if (!loadingUser) fetchLeads();
  }, [filters, loadingUser]);

  useEffect(() => {
    const handleEsc = e => {
      if (e.key === 'Escape') {
        setSelectedLeadId(null);
        setCommentLead(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (loadingUser) return <p>Loading...</p>;

  return (
    <SidebarLayout>
      <div className="lead-dashboard">
        <h2><i className="fas fa-table-list"></i> Lead Management</h2>

        {/* Filters */}
        <div className="filter-bar">
          <input name="search" placeholder="🔍 Search (name/email/phone)" value={filters.search} onChange={handleFilterChange} />
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Status</option>
            <option>New</option>
            <option>Contacted</option>
            <option>Qualified</option>
            <option>Lost</option>
            <option>Won</option>
          </select>
          <input name="tag" placeholder="🏷️ Tag" value={filters.tag} onChange={handleFilterChange} />
          {userRole !== 'support-agent' && (
            <select name="assignedTo" value={filters.assignedTo} onChange={handleFilterChange}>
              <option value="">All Agents</option>
              {agents.map(agent => (
                <option key={agent._id} value={agent._id}>{agent.name}</option>
              ))}
            </select>
          )}
          <input type="date" name="from" value={filters.from} onChange={handleFilterChange} />
          <input type="date" name="to" value={filters.to} onChange={handleFilterChange} />
        </div>

        {/* Admin Actions */}
        {userRole !== 'support-agent' && (
          <div className="lead-actions">
            <button onClick={handleCreate}><i className="fas fa-plus"></i> Create Lead</button>
            <button onClick={handleExport}><i className="fas fa-file-export"></i> Export</button>
            <label className="import-label">
              <i className="fas fa-file-import"></i> Import Excel
              <input type="file" accept=".xlsx" onChange={handleImport} hidden />
            </label>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <LeadForm
            lead={editingLead}
            onClose={() => setShowForm(false)}
            onSubmit={handleFormSubmit}
          />
        )}

        {/* Details Modal */}
        {selectedLeadId && (
          <div className="modal-overlay">
            <div className="modal-box">
              <button className="close-btn" onClick={() => setSelectedLeadId(null)}><i className="fas fa-times"></i></button>
              <LeadDetails leadId={selectedLeadId} />
            </div>
          </div>
        )}

        {/* Comments Modal */}
        {commentLead && (
          <div className="modal-overlay">
            <div className="modal-box">
              <button className="close-btn" onClick={() => setCommentLead(null)}><i className="fas fa-times"></i></button>
              <h3><i className="fas fa-comment-alt"></i> Comments for {commentLead.name}</h3>
              {commentLead.comments && commentLead.comments.length > 0 ? (
                <ul>
                  {commentLead.comments.map(comment => (
                    <li key={comment._id}>
                      <strong>{comment.createdBy?.name || 'User'}:</strong> {comment.text}
                      <br />
                      <small><i className="far fa-clock"></i> {new Date(comment.createdAt).toLocaleString()}</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p><em>No comments available.</em></p>
              )}
            </div>
          </div>
        )}

        {/* Lead Table */}
        <div className="lead-table-wrapper">
          <table className="lead-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Phone</th><th>Source</th><th>Status</th>
                <th>Tags</th><th>Assigned To</th><th><i className="fas fa-comment-dots"></i></th>
                <th><i className="far fa-clock"></i> Created</th><th><i className="far fa-clock"></i> Updated</th>
                <th colSpan="3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead._id}>
                  <td>{lead.name}</td>
                  <td>{lead.email}</td>
                  <td>{lead.phone}</td>
                  <td>{lead.source}</td>
                  <td>{lead.status}</td>
                  <td>{lead.tags?.join(', ')}</td>
                  <td>{lead.assignedTo?.name || '-'}</td>
                  <td>
                    <button onClick={() => setCommentLead(lead)}><i className="fas fa-comments"></i></button>
                  </td>
                  <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                  <td>{new Date(lead.updatedAt).toLocaleDateString()}</td>
                  <td><button onClick={() => setSelectedLeadId(lead._id)}><i className="fas fa-eye"></i></button></td>
                  <td><button onClick={() => handleEdit(lead)}><i className="fas fa-edit"></i></button></td>
                  <td>
                    {userRole !== 'support-agent' && (
                      <button onClick={() => handleDelete(lead._id)}><i className="fas fa-trash-alt"></i></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default LeadDashboard;
