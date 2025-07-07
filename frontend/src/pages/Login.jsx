
// export default Login;
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../CSS/login.css';


const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Role-based redirection
      if (user.role === 'super-admin') navigate('/analytics');
      else if (user.role === 'sub-admin') navigate('/leads');
      else navigate('/leads');
    } catch (err) {
      setError(err.response?.data?.message || '❌ Login failed');
      setTimeout(() => setError(''), 3000); // Auto-hide error
    }
  };

  return (
    <div className="login-container">
      {error && <div className="toast toast-error">{error}</div>}

      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Welcome Back</h2>
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Login</button>
        <p className="register-link">
          New here? <a href="/">Create an account</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
