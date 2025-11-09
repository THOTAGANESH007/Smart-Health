import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Video, FileText, ClipboardList } from 'lucide-react';
import Header from './Header';

// Navigation Component
const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/doctor/app-doctor', label: 'My Appointments', icon: Calendar },
    { path: '/doctor/popup', label: 'Video Call', icon: Video },
    { path: '/doctor/pres-create', label: 'Create Prescription', icon: FileText },
    { path: '/doctor/lab-create', label: 'Create Lab Test', icon: ClipboardList },
    { path: '/doctor/lab-update', label: 'Update Lab Test', icon: ClipboardList },
    { path: '/doctor/healthcards', label: 'All Health Cards', icon: ClipboardList },
    {path:'/doctor/myfeedback' ,label:'My FeedBacks',icon:ClipboardList}
  ];

  return (
    <nav className="bg-gradient-to-br from-blue-50 to-green-50 shadow-lg h-full">
      <ul className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gray-200 shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

// Main Dashboard Component (Layout)
const DoctorHomepage = () => {
  return (
    <div className="h-screen flex flex-col m-0 p-0">
      <Header />
      
      <div className="flex flex-1">
        {/* Left half - Navigation */}
        <div className="w-1/3 overflow-auto">
          <Navigation />
        </div>
        
        {/* Right half - Dynamic Content (Outlet renders nested routes here) */}
        <div className="w-2/3 overflow-auto">
          <div className="bg-gradient-to-br from-blue-50 to-green-50 h-full p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorHomepage;