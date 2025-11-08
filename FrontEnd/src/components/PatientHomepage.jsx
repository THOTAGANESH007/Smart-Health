import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Video, MessageSquare, FileText, ClipboardList, Clock } from 'lucide-react';
import Header from './Header';

// Navigation Component
const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/patient/app-patient', label: 'Create Appointments', icon: Calendar },
    { path: '/patient/video', label: 'Video', icon: Video },
    { path: '/patient/chat', label: 'Chat', icon: MessageSquare },
    { path: '/patient/pres-patient', label: 'My Prescriptions', icon: FileText },
    { path: '/patient/lab-patient-test', label: 'My Lab Reports', icon: ClipboardList },
    { path: '/patient/myappointments', label: 'My Appointments', icon: Clock },
     { path: '/patient/feedback', label: 'Feedback', icon: FileText },
  ];

  return (
    <nav className="bg-gradient-to-br from-blue-50 to-green-50 shadow-lg h-full ">
      {/* <h2 className="text-xl font-semibold text-gray-800 mb-6">Navigation</h2> */}
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
                    ? 'bg-gray-200  shadow-md'
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
const PatientHomepage = () => {
  return (
    <div className="flex flex-col m-0 p-0 ">
      <Header />
      
      <div className="flex flex-1 ">
        {/* Left half - Navigation */}
        <div className="w-2/10 overflow-auto">
          <Navigation />
        </div>
        
        {/* Right half - Dynamic Content (Outlet renders nested routes here) */}
        <div className="w-8/10 mb-2">
          <div className="bg-gradient-to-br from-blue-50 to-green-50 h-full p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientHomepage;