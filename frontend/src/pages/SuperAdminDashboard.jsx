import { useEffect, useState } from 'react';
import axios from 'axios';
import UserForm from '../components/UserForm';
import SidebarLayout from '../components/SidebarLayout';
import '../CSS/SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logUser, setLogUser] = useState(null);

  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users', err);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleEdit = user => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    fetchUsers();
  };

  const handleViewLogs = async userId => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/logs/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data.logs);
      setLogUser(res.data.name);
    } catch (err) {
      console.error('Failed to load logs');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <SidebarLayout>
      <div className="super-admin-container">
        <h2><i className="fas fa-user-shield"></i> Super Admin - User Management</h2>

        <button onClick={handleCreate} className="create-btn">
          <i className="fas fa-user-plus"></i> Create New User
        </button>

        {showForm && (
          <UserForm user={editingUser} onClose={handleCloseForm} />
        )}

        <div className="table-wrapper">
          <table className="super-admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Edit</th>
                <th>Delete</th>
                <th>Logs</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <button onClick={() => handleEdit(u)} title="Edit User">
                      <i className="fas fa-pen"></i>
                    </button>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(u._id)} title="Delete User">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                  <td>
                    <button onClick={() => handleViewLogs(u._id)} title="View Logs">
                      <i className="fas fa-file-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length > 0 && (
          <div className="logs-container">
            <h3><i className="fas fa-clock"></i> Activity Logs for {logUser}</h3>
            <ul>
              {logs.map((log, idx) => (
                <li key={idx}>
                  {new Date(log.timestamp).toLocaleString()} - {log.message}
                </li>
              ))}
            </ul>
            <button onClick={() => setLogs([])}>
              <i className="fas fa-times-circle"></i> Close Logs
            </button>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default SuperAdminDashboard;
