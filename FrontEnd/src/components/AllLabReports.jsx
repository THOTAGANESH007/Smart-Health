import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Download, Calendar, User, Stethoscope, AlertCircle } from 'lucide-react';

const AllLabTests = () => {
  const [labTests, setLabTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLabTests();
  }, []);

  useEffect(() => {
    filterTests();
  }, [searchQuery, labTests]);

  const fetchLabTests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/labtests/all`,{withCredentials:true});
      console.log(response)
      setLabTests(response.data.tests || []);
      setFilteredTests(response.data.tests || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch lab tests');
      console.error('Error fetching lab tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterTests = () => {
    if (!searchQuery.trim()) {
      setFilteredTests(labTests);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = labTests.filter(test => {
      const patientName = test.patientId?.userId?.name?.toLowerCase() || '';
      return patientName.includes(query);
    });
    
    setFilteredTests(filtered);
  };

  const handleDownloadReport = (fileUrl) => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    return status === 'COMPLETED' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Lab Tests</h1>
          <p className="text-gray-600">View and manage all laboratory test records</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by patient name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Showing {filteredTests.length} of {labTests.length} test{labTests.length !== 1 ? 's' : ''}
        </div>

        {/* Lab Test Cards */}
        {filteredTests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Lab Tests Found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try adjusting your search criteria' : 'No lab tests available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <div
                key={test._id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(test.status)}`}>
                      {test.status}
                    </span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(test.test_date)}
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <User className="w-5 h-5 text-indigo-600 mr-2" />
                      <span className="text-sm font-medium text-gray-500">Patient</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-800 ml-7">
                      {test.patientId?.userId?.name || 'N/A'}
                    </p>
                    {test.patientId?.userId?.email && (
                      <p className="text-sm text-gray-500 ml-7">{test.patientId.userId.email}</p>
                    )}
                  </div>

                  {/* Doctor Info */}
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <Stethoscope className="w-5 h-5 text-indigo-600 mr-2" />
                      <span className="text-sm font-medium text-gray-500">Doctor</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-800 ml-7">
                      {test.doctorId?.userId?.name || 'N/A'}
                    </p>
                    {test.doctorId?.userId?.specialization && (
                      <p className="text-sm text-gray-500 ml-7">{test.doctorId.userId.specialization}</p>
                    )}
                  </div>

                  {/* Diagnosis */}
                  {test.diagnosis && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">Diagnosis</p>
                      <p className="text-sm text-gray-600">{test.diagnosis}</p>
                    </div>
                  )}

                  {/* Test Results Count */}
                  {test.test_results && test.test_results.length > 0 && (
                    <div className="mb-4 text-sm text-gray-600">
                      <span className="font-medium">{test.test_results.length}</span> test result{test.test_results.length !== 1 ? 's' : ''} recorded
                    </div>
                  )}

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownloadReport(test.file_url)}
                    disabled={!test.file_url}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      test.file_url
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    {test.file_url ? 'Download Report' : 'No Report Available'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllLabTests;