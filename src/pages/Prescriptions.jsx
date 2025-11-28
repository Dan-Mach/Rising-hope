// src/pages/Prescriptions.jsx
import React, { useState, useEffect } from 'react';
import { prescriptionService } from '../api/prescriptionService';
import { visitService } from '../api/visitService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Modal from '../components/common/Modal'; 
import './Prescriptions.css';

function Prescriptions() {
  const [myPrescriptions, setMyPrescriptions] = useState([]);
  const [loadingForm, setLoadingForm] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); 

  const [currentVisit, setCurrentVisit] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historySortOrder, setHistorySortOrder] = useState('-date_prescribed');

  useEffect(() => {
    const loadFormData = async () => {
      setError(null);
      const visitIdFromUrl = searchParams.get('visit_id');

      if (!visitIdFromUrl) {
        setLoadingForm(false);
        return; 
      }

      try {
        setLoadingForm(true);
        const visitRes = await visitService.getVisitById(visitIdFromUrl);
        setCurrentVisit(visitRes.data);
      } catch (err) {
        setError('Failed to load consultation data.');
        if (err.response?.status === 404) {
          setError('Visit not found. Redirecting...');
          navigate('/triage-queue');
        }
      } finally {
        setLoadingForm(false);
      }
    };
    loadFormData();
  }, [searchParams, navigate]);

  // Define reusable fetch function
  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const presRes = await prescriptionService.getAllPrescriptions(
        historyCurrentPage, 
        historyPageSize, 
        historySortOrder
      );
      setMyPrescriptions(presRes.data.results || []);
      setHistoryTotal(presRes.data.count || 0);
    } catch (err) {
      if (!currentVisit && !error) setError('Failed to load prescription history.');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [historyCurrentPage, historyPageSize, historySortOrder]);

  const handleReviewClick = (e) => {
    e.preventDefault();
    setError(null);
    if (!currentVisit) {
      setError('Error: No active visit found.');
      return;
    }
    setIsReviewOpen(true); 
  };

  const handleConfirmSend = async () => {
    const finalPrescription = {
      visit: currentVisit.id, 
      items: [] 
    };

    try {
      await prescriptionService.createPrescription(finalPrescription);
      setIsReviewOpen(false); 
      navigate('/triage-queue'); 
    } catch (err) {
      setIsReviewOpen(false);
      setError('Failed to send to pharmacy. Please check your permissions.');
    }
  };
  
  const totalHistoryPages = Math.ceil(historyTotal / historyPageSize);
  const handleHistoryPageSizeChange = (e) => { setHistoryPageSize(Number(e.target.value)); setHistoryCurrentPage(1); };
  const handleHistorySortChange = (e) => { setHistorySortOrder(e.target.value); setHistoryCurrentPage(1); };
  const handleHistoryNextPage = () => { if (historyCurrentPage < totalHistoryPages) setHistoryCurrentPage(historyCurrentPage + 1); };
  const handleHistoryPrevPage = () => { if (historyCurrentPage > 1) setHistoryCurrentPage(historyCurrentPage - 1); };
  
  if (loadingForm && searchParams.get('visit_id')) return <h2>Loading consultation data...</h2>;

  return (
    <div className="prescription-page">
      {currentVisit ? (
        <>
          <div className="prescription-patient-header">
            <h2> Prescription Authorization</h2>
            <p><strong>Patient:</strong> {currentVisit.patient_name}</p>
            <p><strong>Complaint:</strong> {currentVisit.chief_complaint}</p>
          </div>
          
          {error && <p className="page-error">{error}</p>}

          <div className="form-section" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
              Click below to review and authorize this prescription request.
            </p>
            <button onClick={handleReviewClick} className="submit-btn submit-prescription-btn">
              Review & Authorize &rarr;
            </button>
          </div>
        </>
      ) : (
        <div className="prescription-patient-header" style={{ borderLeftColor: 'var(--text-muted)' }}>
            <h2>My Prescriptions</h2>
            <p>View your past prescription records.</p>
        </div>
      )}


      {/* --- Review Modal --- */}
      {isReviewOpen && currentVisit && (
        <Modal onClose={() => setIsReviewOpen(false)} title="Review Prescription">
          <div className="review-modal-content">
             <p className="review-label">Patient:</p>
             <p className="review-value">{currentVisit.patient_name}</p>

             <p className="review-label">Notes for Chemist:</p>
             <div className="review-notes-box">
               {currentVisit.pharmacy_notes || "No notes provided."}
             </div>

             <p className="review-warning">
               Are you sure you want to send this to the pharmacy? 
               The chemist will add medicines based on your notes.
             </p>

             <div className="modal-actions">
                <button onClick={() => setIsReviewOpen(false)} className="delete-btn" style={{marginRight: '10px'}}>
                  Cancel
                </button>
                <button onClick={handleConfirmSend} className="submit-btn">
                  Confirm & Send
                </button>
             </div>
          </div>
        </Modal>
      )}

      {/* --- History List --- */}
      <div className="form-section list-section">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h3>My Prescription History</h3>
            <button onClick={fetchHistory} className="add-item-btn" style={{marginBottom: '10px'}}>
                ↻ Refresh
            </button>
        </div>
        
        <div className="prescription-list-container">
             <div className="pagination-controls">
            <div className="form-group sort-controls">
              <label htmlFor="historySortOrder">Sort by:</label>
              <select id="historySortOrder" value={historySortOrder} onChange={handleHistorySortChange}>
                <option value="-date_prescribed">Date (Newest)</option>
                <option value="date_prescribed">Date (Oldest)</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="historyPageSize">Show:</label>
              <select id="historyPageSize" value={historyPageSize} onChange={handleHistoryPageSizeChange}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <span className="page-info">
              {totalHistoryPages > 1 ? `Page ${historyCurrentPage} of ${totalHistoryPages} | ` : ''}
              {historyTotal} total
            </span>
            <div className="pagination-buttons">
              <button onClick={handleHistoryPrevPage} disabled={historyCurrentPage === 1} className="pagination-btn">
                &larr; Previous
              </button>
              <button onClick={handleHistoryNextPage} disabled={historyCurrentPage === totalHistoryPages || historyTotal === 0} className="pagination-btn">
                Next &rarr;
              </button>
            </div>
          </div>

          <table className="history-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!loadingHistory && myPrescriptions.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.patient_name}</td>
                  <td>{new Date(p.date_prescribed).toLocaleDateString()}</td>
                  <td><span className={`status-badge status-${p.status}`}>{p.status}</span></td>
                </tr>
              ))}
              {loadingHistory && <tr><td colSpan="4">Loading history...</td></tr>}
              {!loadingHistory && myPrescriptions.length === 0 && <tr><td colSpan="4">No prescriptions found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Prescriptions;