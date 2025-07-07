import { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

import SidebarLayout from '../components/SidebarLayout';
import '../CSS/AnalyticsDashboard.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Font Awesome

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('https://lead-management-psag.onrender.com/api/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error('Analytics fetch error:', err);
      }
    };
    fetchAnalytics();
  }, []);

  if (!data) return <p className="loading">Loading analytics...</p>;

  // Pie chart for status distribution
  const statusData = {
    labels: data.statusCounts.map((s) => s._id),
    datasets: [
      {
        label: 'Lead Status',
        data: data.statusCounts.map((s) => s.count),
        backgroundColor: ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#AB47BC'],
      },
    ],
  };

  // Bar chart for agent performance
  const agentData = {
    labels: data.agentStats.map((a) => a.name),
    datasets: [
      {
        label: 'Leads Handled',
        data: data.agentStats.map((a) => a.count),
        backgroundColor: '#4285F4',
      },
    ],
  };

  return (
    <SidebarLayout>
      <div className="analytics-container">
        <h2><i className="fas fa-chart-line"></i> Dashboard & Analytics</h2>

        <div className="analytics-section">
          <h3><i className="fas fa-users"></i> Total Leads: {data.totalLeads}</h3>

          <div className="charts">
            <div className="chart-box">
              <h4><i className="fas fa-stream"></i> Status Distribution</h4>
              <Pie data={statusData} />
            </div>

            <div className="chart-box">
              <h4><i className="fas fa-user-check"></i> Agent Performance</h4>
              <Bar data={agentData} />
            </div>
          </div>

          <div className="recent-activity">
            <h4><i className="fas fa-clock"></i> Recent Lead Activity</h4>
            <ul>
              {data.recentLeads.map((l) => (
                <li key={l._id}>
                  <b>{l.name}</b> - {l.status} (Updated: {new Date(l.updatedAt).toLocaleString()}) by{' '}
                  {l.assignedTo?.name || 'Unassigned'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default AnalyticsDashboard;
