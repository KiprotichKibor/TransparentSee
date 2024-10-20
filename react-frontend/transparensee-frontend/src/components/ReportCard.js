import React from 'react';
import { Link } from 'react-router-dom';
import { startInvestigation } from '../services/api';

const ReportCard = ({ report, onInvestigationStart }) => {
    const handleStartInvestigation = async () => {
        try {
            const response = await startInvestigation(report.id);
            if (onInvestigationStart) {
                onInvestigationStart(response.data);
            }
        } catch (error) {
            console.error('Failed to start investigation:', error);
        }
    };

    return (
        <div className='card mb-3'>
          <div className='card-body'>
            <h5 className='card-title'>{report.title}</h5>
            <h6 className='card-subtitle mb-2 text-muted'>Region: {report.region.name}</h6>
            <p className='card-text'>{report.description}</p>
            <p className='card-text'>
              <small className='text-muted'>
                Status: {report.status} | Submitted on: {new Date(report.created_at).toLocaleDateString()}
              </small>
            </p>
            {!report.investigation && (
              <button className="btn btn-primary" onClick={handleStartInvestigation}>
                Start Investigation
              </button>
            )}
            {report.investigation && (
              <Link to={`/investigation/${report.investigation.id}`} className='btn btn-primary'>
                View Investigation
              </Link>
            )}
          </div>
        </div>
    );
};
    

export default ReportCard;