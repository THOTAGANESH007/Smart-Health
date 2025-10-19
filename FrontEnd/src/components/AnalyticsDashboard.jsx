import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Activity, TrendingUp } from 'lucide-react';

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
};

export default function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState('week');

  // Dummy data for new users over time
  const newUsersData = {
    day: [
      { name: 'Mon', users: 45 },
      { name: 'Tue', users: 52 },
      { name: 'Wed', users: 61 },
      { name: 'Thu', users: 48 },
      { name: 'Fri', users: 70 },
      { name: 'Sat', users: 38 },
      { name: 'Sun', users: 42 }
    ],
    week: [
      { name: 'Week 1', users: 320 },
      { name: 'Week 2', users: 398 },
      { name: 'Week 3', users: 445 },
      { name: 'Week 4', users: 412 }
    ],
    month: [
      { name: 'Jan', users: 1240 },
      { name: 'Feb', users: 1398 },
      { name: 'Mar', users: 1580 },
      { name: 'Apr', users: 1720 },
      { name: 'May', users: 1650 },
      { name: 'Jun', users: 1890 },
      { name: 'Jul', users: 1240 },
      { name: 'Aug', users: 1398 },
      { name: 'Sep', users: 1580 },
      { name: 'Oct', users: 1720 },
      { name: 'Nov', users: 1650 },
      { name: 'Dec', users: 1890 }
    ]
  };

  // Dummy data for role distribution
  const roleData = [
    { name: 'Doctors', value: 145, color: '#ef4444' },
    { name: 'Patients', value: 3420, color: '#3b82f6' },
    { name: 'Receptionists', value: 48, color: '#10b981' },
    { name: 'Admins', value: 12, color: '#f59e0b' }
  ];

  const totalVisitors = 3625;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-600">
            Users: <span className="font-bold text-red-500">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-bold" style={{ color: payload[0].payload.color }}>
              {payload[0].value}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Overview of hospital user statistics</p>
        </div>

        

        {/* Bottom Section - Total Visitors and Role Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
          {/* Total Visitors Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Total Hospital Visitors</h2>
                <p className="text-sm text-gray-600">All-time registered users</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="text-5xl font-bold text-gray-900">
                <AnimatedCounter end={totalVisitors} duration={2000} />
              </div>
              <div className="mt-4 flex items-center text-green-600">
                <Activity className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">+12.5% from last month</span>
              </div>
            </div>
          </div>

          {/* Role Distribution - Pie Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">User Role Distribution</h2>
                <p className="text-sm text-gray-600">Breakdown by user type</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {roleData.map((role, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: role.color }}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {role.name}: <span className="font-semibold text-gray-900">{role.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* New Users Over Time - Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">New Users Over Time</h2>
                <p className="text-sm text-gray-600">User registration trends</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeframe('day')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeframe === 'day'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setTimeframe('week')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeframe === 'week'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeframe('month')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeframe === 'month'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Month
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={newUsersData[timeframe]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="users" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}