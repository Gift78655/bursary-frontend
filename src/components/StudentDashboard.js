import React, { useState } from 'react';
import DashboardHome from './studentTabs/DashboardHome';
import ApplyBursary from './studentTabs/ApplyBursary';
import MyApplications from './studentTabs/MyApplications';
import UploadDocuments from './studentTabs/UploadDocuments';
import Messages from './studentTabs/Messages';
import Profile from './studentTabs/Profile';

// 🔗 Import API_BASE_URL (used by child tabs)
import { API_BASE_URL } from '../App';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('Home');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Home': return <DashboardHome />;
      case 'Apply': return <ApplyBursary API_BASE_URL={API_BASE_URL} />;
      case 'Applications': return <MyApplications API_BASE_URL={API_BASE_URL} />;
      case 'Documents': return <UploadDocuments API_BASE_URL={API_BASE_URL} />;
      case 'Messages': return <Messages API_BASE_URL={API_BASE_URL} />;
      case 'Profile': return <Profile API_BASE_URL={API_BASE_URL} />;
      default: return <DashboardHome />;
    }
  };

  return (
    <div className="container mt-4">
      <h2>🎓 Welcome to the Student Dashboard</h2>

      <ul className="nav nav-tabs mt-4">
        {['Home', 'Apply', 'Applications', 'Documents', 'Messages', 'Profile'].map(tab => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Apply' ? 'Apply for Bursary' :
               tab === 'Applications' ? 'My Applications' :
               tab === 'Documents' ? 'Upload Documents' :
               tab}
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
