import { useEffect, useState } from 'react';
import axios from 'axios';
import '../CSS/LeadDetails.css';

const LeadDetails = ({ leadId }) => {
  const [lead, setLead] = useState(null);
  const [comment, setComment] = useState('');
  const [token] = useState(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState('');

  const fetchLead = async () => {
    try {
      const res = await axios.get(`https://lead-management-psag.onrender.com/api/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLead(res.data);
    } catch (err) {
      console.error('Failed to fetch lead:', err);
    }
  };

  const fetchRole = async () => {
    try {
      const res = await axios.get(`https://lead-management-psag.onrender.com/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserRole(res.data.role);
    } catch (err) {
      console.error('Failed to get user role');
    }
  };

  useEffect(() => {
    fetchLead();
    fetchRole();
  }, []);

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      await axios.post(`https://lead-management-psag.onrender.com/api/leads/${leadId}/comments`, { text: comment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComment('');
      fetchLead();
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleDeleteComment = async commentId => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await axios.delete(`https://lead-management-psag.onrender.com/api/leads/${leadId}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLead();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  if (!lead) return <p>Loading lead details...</p>;

  return (
    <div className="lead-details">
      <h3><i className="fa-solid fa-user"></i> {lead.name}</h3>
      <p><i className="fa-solid fa-envelope"></i> <strong>Email:</strong> {lead.email}</p>
      <p><i className="fa-solid fa-phone"></i> <strong>Phone:</strong> {lead.phone}</p>
      <p><i className="fa-solid fa-share-nodes"></i> <strong>Source:</strong> {lead.source}</p>
      <p><i className="fa-solid fa-list-check"></i> <strong>Status:</strong> {lead.status}</p>
      <p><i className="fa-solid fa-tags"></i> <strong>Tags:</strong> {lead.tags.join(', ')}</p>
      <p><i className="fa-solid fa-user-tie"></i> <strong>Assigned To:</strong> {lead.assignedTo?.name || 'Unassigned'}</p>
      <p><i className="fa-regular fa-clock"></i> <strong>Created At:</strong> {new Date(lead.createdAt).toLocaleString()}</p>
      <p><i className="fa-regular fa-clock"></i> <strong>Updated At:</strong> {new Date(lead.updatedAt).toLocaleString()}</p>

      <div className="comments-section">
        <h4><i className="fa-regular fa-comments"></i> Comments</h4>
        <ul>
          {lead.comments?.map(c => (
            <li key={c._id}>
              {c.text}
              <small> - {new Date(c.createdAt).toLocaleString()}</small>
              {userRole !== 'support-agent' && (
                <button onClick={() => handleDeleteComment(c._id)}>
                  <i className="fa-solid fa-trash"></i>
                </button>
              )}
            </li>
          ))}
        </ul>
        <div>
          <input
            type="text"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <button onClick={handleAddComment}>
            <i className="fa-solid fa-plus"></i> Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadDetails;

