// src/pages/Patients.jsx
import React, { useState, useEffect } from 'react';
import { patientService } from '../api/patientService';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button'; // Assuming unified shared Button is used
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

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientService.getAllPatients(currentPage, pageSize, sortOrder);
      setPatients(response.data.results || response.data || []);
      setTotalPatients(response.data.count || 0);
      setError(null);
    } catch {
      setError('Failed to fetch patients. Your session may be expired.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [currentPage, pageSize, sortOrder]);

  const handleFormChange = (e) => {
    setNewPatient({
      ...newPatient,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      await patientService.createPatient(newPatient);
      setSuccessMessage(`Patient "${newPatient.first_name}" registered successfully.`);
      setIsAddModalOpen(false);
      setNewPatient({ first_name: '', second_name: '', age: '', gender: 'Male' });
      fetchPatients();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to create patient record.');
    }
  };

  const handleDeleteClick = (patient) => {
    setDeleteConfirmation(patient);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    try {
      await patientService.deletePatient(deleteConfirmation.id);
      setSuccessMessage('Patient record deleted successfully.');
      setDeleteConfirmation(null);
      fetchPatients();
    } catch {
      setError('Failed to delete patient record.');
    }
  };

  const totalPages = Math.ceil(totalPatients / pageSize);

  return (
    <div className="patient-page">
      {/* Sleek Horizontal Header Section */}
      <div className="patient-header-row">
        <h2>Patient Registry</h2>
        <Button onClick={() => setIsAddModalOpen(true)} variant="submit">
          + Register New Patient
        </Button>
      </div>

      {successMessage && <p className="page-success">{successMessage}</p>}
      {error && <p className="page-error">{error}</p>}

      <div className="patient-list-container">
        <table className="patient-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Full Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              /* Skeleton Placeholder Rows */
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="skeleton-row">
                  <td><div className="skeleton-block skeleton-text" style={{ width: '50px' }}></div></td>
                  <td><div className="skeleton-block skeleton-text" style={{ width: '150px' }}></div></td>
                  <td><div className="skeleton-block skeleton-text" style={{ width: '40px' }}></div></td>
                  <td><div className="skeleton-block skeleton-text" style={{ width: '60px' }}></div></td>
                  <td><div className="skeleton-block skeleton-btn" style={{ width: '140px' }}></div></td>
                </tr>
              ))
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No patients registered yet.</td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.id.toString().slice(-4)}</td>
                  <td>
                    <strong>
                      {patient.name?.first_name || patient.first_name} {patient.name?.second_name || patient.second_name || ''}
                    </strong>
                  </td>
                  <td>{patient.name?.age || patient.age || 'N/A'}</td>
                  <td>
                    <span className="gender-badge">
                      {patient.name?.gender || patient.gender}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button variant="edit" onClick={() => alert('Edit function placeholder')} style={{ padding: '4px 8px', fontSize: '0.85rem' }}>
                        Edit Profile
                      </Button>
                      <Button variant="delete" onClick={() => handleDeleteClick(patient)} style={{ padding: '4px 8px', fontSize: '0.85rem' }}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && totalPages > 1 && (
          <div className="pagination-controls" style={{ marginTop: '20px', display: 'flex', gap: '5px', alignItems: 'center' }}>
            <Button 
              variant="edit"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              &larr; Previous
            </Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button 
              variant="edit"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
            >
              Next &rarr;
            </Button>
          </div>
        )}
      </div>

      {deleteConfirmation && (
        <Modal onClose={() => setDeleteConfirmation(null)}>
          <div style={{ padding: '10px' }}>
            <h3>Confirm Patient Record Deletion</h3>
            <p style={{ margin: '15px 0' }}>
              Are you sure you want to permanently delete the health records for{' '}
              <strong>{deleteConfirmation.first_name}</strong>? This action cannot be reversed.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button onClick={confirmDelete} variant="delete">
                Yes, Delete
              </Button>
              <Button onClick={() => setDeleteConfirmation(null)} variant="edit">
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {isAddModalOpen && (
        <Modal onClose={() => setIsAddModalOpen(false)}>
          <div className="add-patient-form-modal">
            <h3>Register New Patient</h3>
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
              
              {formError && <p className="form-error span-two">{formError}</p>}

              <Button type="submit" variant="submit" className="span-two" style={{ marginTop: '10px' }}>
                Register Patient
              </Button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Patients;