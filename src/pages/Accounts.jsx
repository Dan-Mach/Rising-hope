// src/pages/Accounts.jsx
import React, { useState, useEffect } from 'react';
import { accountService } from '../api/accountService';
import Modal from '../components/common/Modal';
import './Accounts.css';

function Accounts() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [filterStatus, setFilterStatus] = useState(''); // '' = All, 'PENDING', 'PAID'

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'CASH',
    reference_number: ''
  });

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, pageSize, filterStatus]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await accountService.getAllInvoices(currentPage, pageSize, '-issued_at', filterStatus);
      setInvoices(res.data.results || []);
      setTotalInvoices(res.data.count || 0);
      setError(null);
    } catch (err) {
      setError('Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = (invoice) => {
    setSelectedInvoice(invoice);
    // Default to the remaining balance
    setPaymentData({ 
      amount: invoice.balance, 
      method: 'CASH', 
      reference_number: '' 
    });
    setIsPaymentModalOpen(true);
    setSuccess(null);
    setError(null);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      await accountService.recordPayment(selectedInvoice.id, paymentData);
      setSuccess(`Payment of ${paymentData.amount} recorded successfully.`);
      setIsPaymentModalOpen(false);
      fetchInvoices(); // Refresh list
    } catch (err) {
      alert('Payment Failed: ' + (err.response?.data?.detail || 'Check values'));
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(totalInvoices / pageSize);
  const handleNext = () => currentPage < totalPages && setCurrentPage(curr => curr + 1);
  const handlePrev = () => currentPage > 1 && setCurrentPage(curr => curr - 1);

  return (
    <div className="accounts-page">
      <h2>💰 Accounts & Billing</h2>
      
      {success && <p className="page-success">{success}</p>}
      {error && <p className="page-error">{error}</p>}

      <div className="accounts-list-container">
        {/* Controls */}
        <div className="pagination-controls">
          <div className="form-group">
            <label>Filter Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="PARTIAL">Partial</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
          <span className="page-info">
            {totalInvoices} Invoices Found | Page {currentPage} of {totalPages || 1}
          </span>
          <div className="pagination-buttons">
            <button onClick={handlePrev} disabled={currentPage === 1} className="pagination-btn">&larr;</button>
            <button onClick={handleNext} disabled={currentPage === totalPages} className="pagination-btn">&rarr;</button>
          </div>
        </div>

        {/* Invoice Table */}
        <table className="accounts-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Patient</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="8">Loading accounts...</td></tr>}
            {!loading && invoices.length === 0 && <tr><td colSpan="8">No invoices found.</td></tr>}
            
            {invoices.map(inv => (
              <tr key={inv.id} className={`row-${inv.status}`}>
                <td>#{inv.id}</td>
                <td>{inv.patient_name}</td>
                <td><strong>{inv.total_amount}</strong></td>
                <td className="text-success">{inv.paid_amount}</td>
                <td className="text-danger">{inv.balance}</td>
                <td><span className={`status-badge status-${inv.status}`}>{inv.status}</span></td>
                <td>{new Date(inv.issued_at).toLocaleDateString()}</td>
                <td>
                  {inv.status !== 'PAID' && (
                    <button onClick={() => handleOpenPayment(inv)} className="pay-btn">
                      Receive Payment
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Receive Payment Modal */}
      {isPaymentModalOpen && selectedInvoice && (
        <Modal onClose={() => setIsPaymentModalOpen(false)} title={`Receive Payment: Invoice #${selectedInvoice.id}`}>
          <div className="payment-modal-content">
            <p><strong>Patient:</strong> {selectedInvoice.patient_name}</p>
            <p><strong>Outstanding Balance:</strong> <span className="text-danger">{selectedInvoice.balance}</span></p>
            
            <form onSubmit={handlePaymentSubmit}>
              <div className="form-group">
                <label>Amount to Pay</label>
                <input 
                  type="number" 
                  step="0.01"
                  max={selectedInvoice.balance} // Prevent overpayment
                  value={paymentData.amount}
                  onChange={e => setPaymentData({...paymentData, amount: e.target.value})}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Payment Method</label>
                <select 
                  value={paymentData.method}
                  onChange={e => setPaymentData({...paymentData, method: e.target.value})}
                >
                  <option value="CASH">Cash</option>
                  <option value="MPESA">M-Pesa</option>
                  <option value="CARD">Card</option>
                  <option value="INSURANCE">Insurance</option>
                </select>
              </div>

              <div className="form-group">
                <label>Reference No. (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. M-Pesa Code"
                  value={paymentData.reference_number}
                  onChange={e => setPaymentData({...paymentData, reference_number: e.target.value})}
                />
              </div>

              <button type="submit" className="submit-btn" style={{marginTop: '15px', width: '100%'}}>
                Confirm Payment
              </button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Accounts;