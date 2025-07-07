import { useState, useEffect } from 'react';
import axios from 'axios';
import '../CSS/leadForm.css';

const LeadForm = ({ lead, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    status: 'New',
    tags: '',
    assignedTo: ''
  });

  const [agents, setAgents] = useState([]);
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    if (lead) {
      setFormData({
        ...lead,
        tags: lead.tags?.join(', ') || '',
        assignedTo: lead.assignedTo?._id || ''
      });
    }

    const fetchAgents = async () => {
      if (userRole !== 'support-agent') {
        try {
          const res = await axios.get('http://localhost:5000/api/users/support-agents', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setAgents(res.data);
        } catch (err) {
          console.error('Failed to fetch agents:', err);
        }
      }
    };

    fetchAgents();
  }, [lead, userRole]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const updatedData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim())
    };

    if (userRole === 'support-agent') {
      delete updatedData.assignedTo;
    }

    onSubmit(updatedData);
  };

  return (
    <div className="lead-form-container">
      <form onSubmit={handleSubmit} className="lead-form">
        <h3>{lead ? '✏️ Edit Lead' : '➕ Add New Lead'}</h3>

        <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
        <input name="source" placeholder="Source" value={formData.source} onChange={handleChange} />

        <select name="status" value={formData.status} onChange={handleChange}>
          <option>New</option>
          <option>Contacted</option>
          <option>Qualified</option>
          <option>Lost</option>
          <option>Won</option>
        </select>

        <input
          name="tags"
          placeholder="Tags (comma separated)"
          value={formData.tags}
          onChange={handleChange}
        />

        {userRole !== 'support-agent' && (
          <select name="assignedTo" value={formData.assignedTo} onChange={handleChange}>
            <option value="">-- Assign to Agent --</option>
            {agents.map(agent => (
              <option key={agent._id} value={agent._id}>{agent.name}</option>
            ))}
          </select>
        )}

        <div className="lead-form-buttons">
          <button type="submit">💾 Save</button>
          <button type="button" className="cancel-btn" onClick={onClose}>❌ Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;


