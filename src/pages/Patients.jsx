// src/pages/Patients.jsx
import React, { useState, useEffect } from 'react';
import { patientService } from '../api/patientService';
import Modal from '../components/common/Modal';
import './Patients.css';

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const [newPatient, setNewPatient] = useState({
    first_name: '', second_name: '', age: '', gender: 'Male'
  });
  const [formError, setFormError] = useState(null);
  
  const [deleteConfirmation, setDeleteConfirmation] = useState(null); 
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPatients, setTotalPatients] = useState(0);
  const [sortOrder, setSortOrder] = useState('name__first_name'); 

  // Defined outside useEffect for reuse
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientService.getAllPatients(currentPage, pageSize, sortOrder);
      setPatients(response.data.results || response.data || []);
      setTotalPatients(response.data.count || 0);
      setError(null);
    } catch (err) {
      setError('Failed to fetch patients. Your session may be expired.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [currentPage, pageSize, sortOrder]);

  // ... (handleFormChange, handleSubmit, handleDeleteRequest, handleConfirmedDelete remain the same) ...
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewPatient(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const payload = {
      name: {
        first_name: newPatient.first_name,
        second_name: newPatient.second_name,
        age: newPatient.age,
        gender: newPatient.gender
      }
    };

    try {
      await patientService.createPatient(payload);
      setNewPatient({ first_name: '', second_name: '', age: '', gender: 'Male' });
      setSuccessMessage(`Patient registered successfully.`);
      setIsAddModalOpen(false); 
      fetchPatients();
    } catch (err) {
      setFormError('Failed to create patient. Check the details.');
    }
  };

  const handleDeleteRequest = (patient) => {
    setDeleteConfirmation(patient);
  };
  
  const handleConfirmedDelete = async () => {
    if (!deleteConfirmation) return;
    const id = deleteConfirmation.id;
    setDeleteConfirmation(null);
    setError(null);
    setSuccessMessage(null);

    try {
      await patientService.deletePatient(id);
      setSuccessMessage(`Patient deleted successfully.`);
      fetchPatients();
    } catch (err) {
      setError('Failed to delete patient record.');
    }
  };

  const totalPages = Math.ceil(totalPatients / pageSize);
  const handlePageSizeChange = (e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); };
  const handleSortChange = (e) => { setSortOrder(e.target.value); setCurrentPage(1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  return (
    <div className="patients-page">
      <h2>👤 Patient Record Management</h2>
      
      {error && <p className="page-error">Error: {error}</p>}
      {successMessage && <p className="page-success">{successMessage}</p>}

      <div className="patient-header">
        <button onClick={fetchPatients} className="edit-btn" style={{ marginRight: '10px' }}>
           ↻ Refresh List
        </button>
        <button onClick={() => setIsAddModalOpen(true)} className="submit-btn">
          + Register New Patient
        </button>
      </div>

      <div className="patient-list-container">
        {/* ... Pagination Controls ... */}
        <div className="pagination-controls">
          <div className="form-group sort-controls">
            <label htmlFor="sortOrder">Sort by:</label>
            <select id="sortOrder" value={sortOrder} onChange={handleSortChange}>
              <option value="name__first_name">Name (A-Z)</option>
              <option value="-name__first_name">Name (Z-A)</option>
              <option value="-register_date">Date Registered (Newest)</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="pageSize">Items per page:</label>
            <select id="pageSize" value={pageSize} onChange={handlePageSizeChange}>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <span className="page-info">
            {totalPages > 1 ? `Page ${currentPage} of ${totalPages} | ` : ''}
            {totalPatients} total patients
          </span>
          <div className="pagination-buttons">
            <button onClick={handlePrevPage} disabled={currentPage === 1} className="pagination-btn">&larr; Previous</button>
            <button onClick={handleNextPage} disabled={currentPage === totalPages} className="pagination-btn">Next &rarr;</button>
          </div>
        </div>

        <table className="patients-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Registered On</th>
              <th>Actions</th> 
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="6">Loading patients...</td></tr>}
            {!loading && patients.length === 0 && <tr><td colSpan="6">No records found.</td></tr>}
            {!loading && patients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.id}</td>
                <td>{patient.name?.first_name} {patient.name?.second_name}</td>
                <td>{patient.name?.age || 'N/A'}</td>
                <td>{patient.name?.gender || 'N/A'}</td>
                <td>{new Date(patient.register_date).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleDeleteRequest(patient)} className="delete-btn">Delete Record</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* ... Modals (Delete & Add) remain the same ... */}
      {deleteConfirmation && (
        <Modal onClose={() => setDeleteConfirmation(null)} title="Confirm Deletion">
          <p className="p-4 text-center">Delete record for <strong>{deleteConfirmation.name?.first_name}</strong>?</p>
          <div className="flex justify-center gap-4 p-4 border-t">
            <button onClick={handleConfirmedDelete} className="delete-btn">Yes, Delete Record</button>
            <button onClick={() => setDeleteConfirmation(null)} className="edit-btn">Cancel</button>
          </div>
        </Modal>
      )}

      {isAddModalOpen && (
        <Modal onClose={() => setIsAddModalOpen(false)} title="Register New Patient">
          <div className="add-patient-form-modal">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>First Name*</label>
                <input type="text" name="first_name" value={newPatient.first_name} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Second Name</label>
                <input type="text" name="second_name" value={newPatient.second_name} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input type="number" name="age" value={newPatient.age} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={newPatient.gender} onChange={handleFormChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button type="submit" className="submit-btn">Register Patient</button>
              {formError && <p className="form-error">{formError}</p>}
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Patients;