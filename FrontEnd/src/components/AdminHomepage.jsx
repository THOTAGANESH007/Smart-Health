import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Calendar, ClipboardList, Bell, Clock, List, Stethoscope, CalendarCheck, ClipboardPlus } from 'lucide-react';
import Header from './Header';

// Navigation Component
const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/admin/dashboard', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/app-admin', label: 'All Appointments', icon: Calendar },
     { path: '/admin/manage-doctors', label: 'Manage Doctors', icon: Stethoscope },
    { path: '/admin/send-notification', label: 'Notifiy All', icon: Bell },
    { path: '/admin/schedule-notification', label: 'Medicine Remainders', icon: Clock },
    { path: '/admin/scheduled-list', label: 'Scheduled Notifications', icon: CalendarCheck },
    { path: '/admin/allreports', label: 'All Lab Reports', icon: ClipboardPlus },
    {path:'/admin/allprescriptions' ,label:'All Prescriptions',icon:ClipboardList},
    { path: '/admin/allhealthcards', label: 'All Health Cards', icon: List },
    { path: '/admin/all-feedbacks', label: 'All FeedBacks', icon: List },
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
const AdminHomepage = () => {
  return (
    <div className="h-screen flex flex-col m-0 p-0">
      <Header />
      
      <div className="flex flex-1">
        {/* Left half - Navigation */}
        <div className="w-2/10 overflow-auto">
          <Navigation />
        </div>
        
        {/* Right half - Dynamic Content (Outlet renders nested routes here) */}
        <div className="w-8/10 overflow-auto">
          <div className="bg-gradient-to-br from-blue-50 to-green-50 h-full p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomepage;