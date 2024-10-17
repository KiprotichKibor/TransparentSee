import React from 'react';
import { Link } from 'react-router-dom';

const InvestigationCard = ({ investigation }) => {
    return (
        <div className='card mb-3'>
            <div className='card-body'>
                <h5 className='card-title'>Investigation: {investigation.report.title}</h5>
                <h6 className='card-subtitle mb-2 text-muted'>Status: {investigation.status}</h6>
                <p className='card-text'>
                    Contributions: {investigation.contributions.length} |
                    Tasks: {investigation.tasks.length}
                </p>
                <p className='card-text'>
                    <small className='text-muted'>
                        Started on: {new Date(investigation.created_at).toLocaleDateString()}
                    </small>
                </p>
                <Link to={`/investigation/${investigation.id}`} className='btn btn-primary'>
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default InvestigationCard;