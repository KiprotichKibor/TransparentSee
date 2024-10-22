import React, { useState } from 'react';
import { createContribution } from '../services/api';
import '../styles/components/ContributionForm.css';

const ContributionForm = ({ investigationId, onContributionSubmit }) => {
  const [content, setContent] = useState('');
  const [contributionType, setContributionType] = useState('comment');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!content.trim() && !file) {
      setError('Please provide either a comment or evidence.');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('contribution_type', contributionType);
      if (file) {
        formData.append('evidence_file', file);
      }

      const response = await createContribution(investigationId, formData);
      setContent('');
      setFile(null);
      setIsSubmitting(false);
      if (onContributionSubmit) {
        onContributionSubmit(response.data);
      }
    } catch (err) {
      setError('Failed to submit contribution. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contribution-form">
      <h3>Add Contribution</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="contributionType">Contribution Type</label>
          <select
            id="contributionType"
            value={contributionType}
            onChange={(e) => setContributionType(e.target.value)}
            className="form-control"
          >
            <option value="comment">Comment</option>
            <option value="evidence">Evidence</option>
            <option value="verification">Verification</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="form-control"
            rows="4"
            placeholder="Enter your contribution here..."
          ></textarea>
        </div>
        {contributionType === 'evidence' && (
          <div className="form-group">
            <label htmlFor="file">Upload Evidence</label>
            <input
              type="file"
              id="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="form-control-file"
            />
          </div>
        )}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Contribution'}
        </button>
      </form>
    </div>
  );
};

export default ContributionForm;