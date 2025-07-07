import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../CSS/Sidebar.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // ✅ Font Awesome

const SidebarLayout = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const renderMenu = () => {
    if (!user) return null;

    switch (user.role) {
      case 'super-admin':
        return (
          <>
            <li><Link to="/super-admin"><i className="fas fa-home"></i> Dashboard</Link></li>
            <li><Link to="/users"><i className="fas fa-users"></i> Manage Users</Link></li>
            <li><Link to="/leads"><i className="fas fa-table-list"></i> All Leads</Link></li>
            <li><Link to="/analytics"><i className="fas fa-chart-line"></i> Analytics</Link></li>
          </>
        );
      case 'sub-admin':
        return (
          <>
            <li><Link to="/sub-admin"><i className="fas fa-home"></i> Dashboard</Link></li>
            <li><Link to="/leads"><i className="fas fa-table-list"></i> Manage Leads</Link></li>
          </>
        );
      case 'support-agent':
        return (
          <>
            <li><Link to="/leads"><i className="fas fa-address-book"></i> My Leads</Link></li>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="sidebar-layout">
      {/* ✅ Mobile Toggle Button */}
      <button className="menu-toggle" onClick={toggleMenu}>
        <i className="fas fa-bars"></i>
      </button>

      {/* ✅ Sidebar */}
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <h2>
          <i className="fas fa-user-shield"></i>{' '}
          {user?.role === 'super-admin' ? 'Super Admin' :
            user?.role === 'sub-admin' ? 'Sub Admin' :
              user?.role === 'support-agent' ? 'Support Agent' : 'Dashboard'}
        </h2>
        <p>{user?.name}</p>
        <nav>
          <ul>
            {renderMenu()}
            <li>
              <button onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Logout</button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* ✅ Main Content Area */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default SidebarLayout;
