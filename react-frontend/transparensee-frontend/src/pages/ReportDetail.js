import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getReport } from '../services/api';

const ReportDetail = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getReport(id);
        setReport(data);
      } catch (err) {
        console.error('Failed to fetch report:', err);
        setError('Failed to fetch report details');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!report) return <div>No report found</div>;

  return (
    <div className='container mt-4'>
      <h2>{report.title}</h2>
      <p><strong>Region:</strong> {report?.region?.name || 'N/A'}</p>
      <p><strong>Status:</strong> {report.status}</p>
      <p><strong>Submitted on:</strong> {new Date(report.created_at).toLocaleDateString()}</p>
      <h3>Description</h3>
      <p>{report.description}</p>
      {report.evidence_files && report.evidence_files.length > 0 && (
        <>
          <h3>Evidence</h3>
          <ul>
            {report.evidence_files.map((file, index) => (
              <li key={index}>
                <a href={file} target="_blank" rel="noopener noreferrer">View Evidence {index + 1}</a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default ReportDetail;