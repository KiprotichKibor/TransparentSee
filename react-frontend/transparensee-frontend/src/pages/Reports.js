import React, { useState, useEffect, useCallback } from 'react';
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
  const [filters, setFilters] = useState({});

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getReports({ ...filters, page });
      if (response.data && response.data.results) {
        setReports(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10));
      } else {
        setReports([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>Reports</h2>
      <SearchBar onSearch={handleSearch} type="report" />
      {reports && reports.length > 0 ? (
        reports.map(report => (
          <ReportCard key={report.id} report={report} />
        ))
      ) : (
        <p>No reports found.</p>
      )}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default Reports;