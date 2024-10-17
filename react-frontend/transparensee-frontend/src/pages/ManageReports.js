import React, { useState, useEffect } from 'react';
import { getReports, updateReportStatus } from '../services/api';
import SearchBar from '../components/SearchBar';

const ManageReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await getReports(filters);
      setReports(response.data.results);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch reports');
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await updateReportStatus(reportId, newStatus);
      fetchReports(); // Refresh the list
    } catch (err) {
      setError('Failed to update report status');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-5">
      <h2>Manage Reports</h2>
      <SearchBar onSearch={fetchReports} type="report" />
      <table className="table mt-3">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(report => (
            <tr key={report.id}>
              <td>{report.title}</td>
              <td>{report.status}</td>
              <td>{new Date(report.created_at).toLocaleDateString()}</td>
              <td>
                <select 
                  value={report.status} 
                  onChange={(e) => handleStatusChange(report.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="under_investigation">Under Investigation</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageReports;