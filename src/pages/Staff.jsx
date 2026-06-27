// src/pages/Staff.jsx
import React, { useState, useEffect } from 'react';
import { userService } from '../api/userService';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button'; 
import './Staff.css';

function Staff() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [newEmployee, setNewEmployee] = useState({
    username: '', password: '', first_name: '', second_name: '',
    age: '', gender: 'Male', phone_number: '', employee_type: 'DOCTOR', email: ''
  });
  const [formError, setFormError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [sortOrder, setSortOrder] = useState('user__name__first_name'); 

  useEffect(() => {
    fetchStaff();
  }, [currentPage, pageSize, sortOrder]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllEmployees(currentPage, pageSize, sortOrder);
      setEmployees(response.data.results || []);
      setTotalEmployees(response.data.count || 0);
      setError(null);
    } catch (err) {
      setError('Failed to fetch system employees registry records.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setNewEmployee({
      ...newEmployee,
      [e.target.name]: e.target.value
    });
  };

  const handleAddEmployeeSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      await userService.createEmployee(newEmployee);
      setSuccessMessage(`Employee account "${newEmployee.username}" provisioned successfully.`);
      setIsAddModalOpen(false);
      setNewEmployee({
        username: '', password: '', first_name: '', second_name: '',
        age: '', gender: 'Male', phone_number: '', employee_type: 'DOCTOR', email: ''
      });
      fetchStaff();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Validation failed. Check your inputs.');
    }
  };

  const handleDeleteClick = (employee) => {
    setDeleteConfirmation(employee);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    try {
      await userService.deleteEmployee(deleteConfirmation.id);
      setSuccessMessage('Employee record deactivated successfully.');
      setDeleteConfirmation(null);
      fetchStaff();
    } catch (err) {
      setError('Failed to terminate target user credentials profile.');
    }
  };

  const totalPages = Math.ceil(totalEmployees / pageSize);

  return (
    <div className="staff-page">
      <div className="staff-header-row">
        <h2>Staff Management</h2>
        <Button onClick={() => setIsAddModalOpen(true)} variant="submit">
          + Add New Employee
        </Button>
      </div>

      {successMessage && <p className="page-success">{successMessage}</p>}
      {error && <p className="page-error">{error}</p>}

      {loading ? (
        <p>Loading staff directories...</p>
      ) : (
        <div className="staff-list-container">
          <table className="staff-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Role Designation</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No active team members registered.</td>
                </tr>
              ) : (
                employees.map((emp) => {
                  // Fallback fallback selector to catch employee_type regardless of API nesting structures
                  const activeRole = emp.employee_type || emp.user?.employee_type || 'STAFF';

                  return (
                    <tr key={emp.id}>
                      <td>{emp.user?.username || 'unknown'}</td>
                      <td>
                        <strong>
                          {emp.user?.name?.first_name} {emp.user?.name?.second_name || ''}
                        </strong>
                      </td>
                      <td>
                        {/* Renders the verified fallback designation role text string safely */}
                        <span className="role-badge">
                          {activeRole.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{emp.user?.name?.phone_number || 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button variant="delete" onClick={() => handleDeleteClick(emp)} style={{ padding: '4px 8px', fontSize: '0.85rem' }}>
                            Deactivate
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
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
      )}

      {deleteConfirmation && (
        <Modal onClose={() => setDeleteConfirmation(null)}>
          <div style={{ padding: '10px' }}>
            <h3>Confirm Credential Deactivation</h3>
            <p style={{ margin: '15px 0' }}>
              Are you sure you want to completely suspend clinical platform access permissions for{' '}
              <strong>{deleteConfirmation.user?.username}</strong>? This workflow cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button onClick={confirmDelete} variant="delete">
                Yes, Deactivate
              </Button>
              <Button onClick={() => setDeleteConfirmation(null)} variant="edit">
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Employee Overlay Modal */}
      {isAddModalOpen && (
        <Modal onClose={() => setIsAddModalOpen(false)}>
          <div className="add-employee-form-modal">
            <h3>Add New Employee Entry</h3>
            <form onSubmit={handleAddEmployeeSubmit}>
              <div className="form-group">
                <label>System Username</label>
                <input type="text" name="username" value={newEmployee.username} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Access Password</label>
                <input type="password" name="password" value={newEmployee.password} onChange={handleFormChange} required />
              </div>
              <div className="form-group span-two">
                <label>Email Address</label>
                <input type="email" name="email" value={newEmployee.email} onChange={handleFormChange} required />
              </div>
              <div className="form-group span-two">
                <label>Role / Operational Designation</label>
                <select name="employee_type" value={newEmployee.employee_type} onChange={handleFormChange}>
                  <option value="DOCTOR">Doctor</option>
                  <option value="NURSE">Nurse</option>
                  <option value="CHEMIST">Pharmacist / Chemist</option>
                  <option value="LAB_TECH">Lab Technician</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="RECEPTIONIST">Reception / Triage</option>
                  <option value="STORE_MANAGER">Store Manager</option>
                </select>
              </div>
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="first_name" value={newEmployee.first_name} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Second Name</label>
                <input type="text" name="second_name" value={newEmployee.second_name} onChange={handleFormChange} />
              </div>
              <div className="form-group span-two">
                <label>Phone Number</label>
                <input type="text" name="phone_number" value={newEmployee.phone_number} onChange={handleFormChange} placeholder="e.g. 0712345678" />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input type="number" name="age" value={newEmployee.age} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={newEmployee.gender} onChange={handleFormChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Action Error message row spanning full width if it triggers */}
              {formError && <p className="form-error span-two">{formError}</p>}

              <Button type="submit" variant="submit" className="span-two" style={{ marginTop: '10px' }}>
                Add Employee
              </Button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Staff;