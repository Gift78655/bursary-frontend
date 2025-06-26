import React, { useState } from 'react';
import DashboardHome from './adminTabs/DashboardHome';
import ManageBursaries from './adminTabs/ManageBursaries';
import Profile from './adminTabs/Profile';
import Applicants from './adminTabs/Applicants';
import MessagesAdmin from './adminTabs/messages_admin'; // ✅ New Tab Import

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Home');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Home':
        return <DashboardHome />;
      case 'Bursaries':
        return <ManageBursaries />;
      case 'Applicants':
        return <Applicants />;
      case 'Messages':
        return <MessagesAdmin />; // ✅ Render new tab
      case 'Profile':
        return <Profile />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="container mt-4">
      <h2>🛠️ Welcome to the Admin Dashboard</h2>

      <ul className="nav nav-tabs mt-3">
        {['Home', 'Bursaries', 'Applicants', 'Messages', 'Profile'].map(tab => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {{
                'Bursaries': 'Manage Bursaries',
                'Applicants': 'View Applicants',
                'Messages': 'Messages',
                'Profile': 'My Profile',
                'Home': 'Dashboard Home'
              }[tab] || tab}
            </button>
          </li>
        ))}
      </ul>

      <div className="p-3 border border-top-0 bg-light">
        {renderTabContent()}
      </div>
    </div>
  );
}
