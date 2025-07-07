import { useState } from 'react';
import axios from 'axios';
import '../CSS/userForm.css';

const UserForm = ({ user, onClose }) => {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'support-agent',
  });

  const token = localStorage.getItem('token');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (user) {
        // Update
        const payload = { ...form };
        if (!payload.password) delete payload.password; // Don't send empty password
        await axios.put(`http://localhost:5000/api/users/${user._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Create
        await axios.post(`http://localhost:5000/api/users`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="user-form-container">
      <h3>{user ? '✏️ Edit User' : '➕ Create User'}</h3>
      <form onSubmit={handleSubmit} className="user-form">
        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder={user ? 'Leave blank to keep password' : 'Password'}
          value={form.password}
          onChange={handleChange}
          {...(!user && { required: true })}
        />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="sub-admin">Sub Admin</option>
          <option value="support-agent">Support Agent</option>
        </select>
        <div className="user-form-buttons">
          <button type="submit">{user ? 'Update' : 'Create'}</button>
          <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
