import React, { useState, useEffect } from 'react';
import { getReports } from '../services/api';
import ReportCard from '../components/ReportCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, [page]);

  const fetchReports = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await getReports({ ...filters, page });
      setReports(response.data.results);
      setTotalPages(Math.ceil(response.data.count / 10)); // Assuming 10 items per page
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch reports');
      setLoading(false);
    }
  };

  const handleSearch = (filters) => {
    setPage(1);
    fetchReports(filters);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>Reports</h2>
      <SearchBar onSearch={handleSearch} type="report" />
      {reports.map(report => (
        <ReportCard key={report.id} report={report} />
      ))}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default Reports;