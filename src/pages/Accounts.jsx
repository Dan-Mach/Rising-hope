// src/pages/Accounts.jsx
import React, { useState, useEffect } from 'react';
import { accountService } from '../api/accountService';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button'; // Reusable component imported here
import './Accounts.css';

function Accounts() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
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
      setError('Failed to load accounts invoices.', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentData({
      amount: invoice.balance, // Default to full outstanding balance
      method: 'CASH',
      reference_number: ''
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);
      await accountService.createPayment(selectedInvoice.id, {
        amount: parseFloat(paymentData.amount),
        method: paymentData.method,
        reference_number: paymentData.reference_number
      });
      setSuccess(`Payment recorded successfully for Invoice #${selectedInvoice.id}`);
      setIsPaymentModalOpen(false);
      fetchInvoices(); // Refresh values
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process payment.');
    }
  };

  const totalPages = Math.ceil(totalInvoices / pageSize);

  return (
    <div className="accounts-page">
      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>Billing & Accounts Management</h2>
        {/* Changed Refresh Button */}
        <Button onClick={fetchInvoices} variant="edit" style={{padding: '8px 15px'}}>
          ↻ Refresh
        </Button>
      </div>

      {error && <p className="page-error">{error}</p>}
      {success && <p className="page-success">{success}</p>}

      {/* Filter Tabs */}
      <div className="filter-tabs" style={{marginBottom: '20px', display: 'flex', gap: '10px'}}>
        <Button 
          variant={filterStatus === '' ? 'submit' : 'edit'} 
          onClick={() => { setFilterStatus(''); setCurrentPage(1); }}
        >
          All Invoices
        </Button>
        <Button 
          variant={filterStatus === 'PENDING' ? 'submit' : 'edit'} 
          onClick={() => { setFilterStatus('PENDING'); setCurrentPage(1); }}
        >
          Unpaid / Pending
        </Button>
        <Button 
          variant={filterStatus === 'PAID' ? 'submit' : 'edit'} 
          onClick={() => { setFilterStatus('PAID'); setCurrentPage(1); }}
        >
          Fully Paid
        </Button>
      </div>

      {loading ? (
        <p>Loading billing ledger records...</p>
      ) : (
        <>
          <div className="table-responsive">
            <table className="accounts-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Patient Name</th>
                  <th>Total Cost</th>
                  <th>Amount Paid</th>
                  <th>Outstanding Balance</th>
                  <th>Status</th>
                  <th>Issued Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{textAlign: 'center', padding: '20px'}}>No billing ledger invoices found.</td>
                  </tr>
                ) : (
                  invoices.map(invoice => (
                    <tr key={invoice.id}>
                      <td>#{invoice.id}</td>
                      <td><strong>{invoice.patient_name || 'Walk-in Patient'}</strong></td>
                      <td>${parseFloat(invoice.total_amount).toFixed(2)}</td>
                      <td>${parseFloat(invoice.amount_paid).toFixed(2)}</td>
                      <td style={{color: parseFloat(invoice.balance) > 0 ? 'var(--danger)' : 'inherit'}}>
                        ${parseFloat(invoice.balance).toFixed(2)}
                      </td>
                      <td>
                        <span className={`status-badge ${invoice.status.toLowerCase()}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td>{new Date(invoice.issued_at).toLocaleString()}</td>
                      <td>
                        {invoice.status !== 'PAID' ? (
                          /* Changed Collect Payment Button */
                          <Button variant="submit" onClick={() => handleOpenPayment(invoice)} style={{padding: '5px 10px', fontSize: '0.85rem'}}>
                            Collect Payment
                          </Button>
                        ) : (
                          <span style={{color: 'green', fontSize: '0.9rem'}}>✓ Settled</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination" style={{marginTop: '20px', display: 'flex', gap: '5px', justifyContent: 'center', alignItems: 'center'}}>
              {/* Changed Previous Button */}
              <Button 
                variant="edit"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{opacity: currentPage === 1 ? 0.5 : 1}}
              >
                &larr; Prev
              </Button>
              
              <span>Page {currentPage} of {totalPages}</span>
              
              {/* Changed Next Button */}
              <Button 
                variant="edit"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{opacity: currentPage === totalPages ? 0.5 : 1}}
              >
                Next &rarr;
              </Button>
            </div>
          )}
        </>
      )}

      {/* Payment Processing Modal Overlay */}
      {isPaymentModalOpen && selectedInvoice && (
        <Modal onClose={() => setIsPaymentModalOpen(false)}>
          <div className="payment-modal-form">
            <h3>Record Payment for Invoice #{selectedInvoice.id}</h3>
            <p style={{marginBottom: '15px'}}>Patient: <strong>{selectedInvoice.patient_name}</strong></p>
            
            <form onSubmit={handlePaymentSubmit}>
              <div className="form-group">
                <label>Amount to Pay ($)</label>
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
              
              {/* Changed Modal Submit Form Button */}
              <Button type="submit" variant="submit" style={{marginTop: '15px', width: '100%'}}>
                Confirm Payment
              </Button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Accounts;