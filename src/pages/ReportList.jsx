// src/pages/ReportList.jsx
import React, { useState, useEffect } from 'react';
import { visitService } from '../api/visitService';
import { useNavigate } from 'react-router-dom';
import './ReportList.css'; 

function ReportList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await visitService.getVisits('COMPLETE');
      
      const visitsWithReports = (res.data.results || res.data).filter(
        visit => visit.consultation_notes
      );

      visitsWithReports.sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));
      
      setReports(visitsWithReports);
      setError(null);
    } catch (err) {
      setError('Failed to fetch reports.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="report-list-page">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>View All Consultation Reports</h2>
        <button onClick={fetchReports} className="submit-btn" style={{padding: '8px 15px'}}>
            ↻ Refresh
        </button>
      </div>
      
      {loading && <p>Loading reports...</p>}
      {error && <p className="page-error">{error}</p>}

      <div className="report-list-container">
        {!loading && reports.length === 0 && (
          <p>No consultation reports have been written yet.</p>
        )}
        {reports.map(report => (
          <div key={report.id} className="report-card">
            <div className="report-card-header">
              <h3>{report.patient_name}</h3>
              <span>
                {new Date(report.visit_date).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </span>
            </div>
            <div className="report-card-body">
              <p><strong>Complaint:</strong> {report.chief_complaint}</p>
              <strong>Report Notes:</strong>
              <pre className="report-notes-content">
                {report.consultation_notes}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReportList;