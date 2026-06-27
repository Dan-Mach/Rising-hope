// src/pages/Staff.jsx
// ... (Imports remain the same) ...
import React, { useState, useEffect } from 'react';
import { userService } from '../api/userService';
import Modal from '../components/common/Modal';
import './Staff.css';

function Staff() {
  // ... (State variables remain the same) ...
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ setError] = useState(null);
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

  const fetchStaff = async () => {
     try {
      setLoading(true);
      const response = await userService.getAllEmployees(currentPage, pageSize, sortOrder);
      setEmployees(response.data.results || []);
      setTotalEmployees(response.data.count || 0);
      setError(null);
    } catch  {
      setError('Failed to fetch staff.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchStaff();
  }, [currentPage, pageSize, sortOrder]);

  // ... (handleFormChange, handleSubmit, etc. remain the same) ...
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    
    const payload = {
      user: {
        username: newEmployee.username,
        password: newEmployee.password,
        employee_type: newEmployee.employee_type,
        name: {
            first_name: newEmployee.first_name,
            second_name: newEmployee.second_name,
            age: newEmployee.age,
            gender: newEmployee.gender,
            phone_number: newEmployee.phone_number
        }
      },
      email: newEmployee.email || `${newEmployee.username}@pharmacy.com`
    };

    try {
      await userService.createEmployee(payload);
      setNewEmployee({
        username: '', password: '', first_name: '', second_name: '',
        age: '', gender: 'Male', phone_number: '', employee_type: 'DOCTOR', email: ''
      });
      setSuccessMessage(`Employee added successfully.`);
      setIsAddModalOpen(false);
      fetchStaff();
    } catch  {
      setFormError('Failed to create employee. Username may be taken.');
    }
  };
  
  const handleDeleteRequest = (emp) => setDeleteConfirmation(emp);
  
  const totalPages = Math.ceil(totalEmployees / pageSize);
  const handlePageSizeChange = (e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); };
  const handleSortChange = (e) => { setSortOrder(e.target.value); setCurrentPage(1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  return (
    <div className="staff-page">
      <h2> Staff Management</h2>
      {successMessage && <p className="page-success">{successMessage}</p>}

      <div className="staff-header">
        <button onClick={fetchStaff} className="edit-btn" style={{ marginRight: '10px' }}>
           ↻ Refresh List
        </button>
        <button onClick={() => setIsAddModalOpen(true)} className="submit-btn">
          + Add New Employee
        </button>
      </div>

      {/* ... (Table and Modals remain the same) ... */}
      <div className="staff-list-container">
        {/* Pagination and Table Code... */}
        <div className="pagination-controls">
          <div className="form-group sort-controls">
            <label htmlFor="sortOrder">Sort by:</label>
            <select id="sortOrder" value={sortOrder} onChange={handleSortChange}>
              <option value="user__name__first_name">Name (A-Z)</option>
              <option value="-user__name__first_name">Name (Z-A)</option>
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
            {totalEmployees} total staff
          </span>
          <div className="pagination-buttons">
            <button onClick={handlePrevPage} disabled={currentPage === 1} className="pagination-btn">&larr; Previous</button>
            <button onClick={handleNextPage} disabled={currentPage === totalPages} className="pagination-btn">Next &rarr;</button>
          </div>
        </div>
        
        <table className="staff-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Age/Gender</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.user?.name?.first_name} {emp.user?.name?.second_name}</td>
                <td>
                    <span className={`role-${emp.user?.employee_type}`}>
                        {emp.user?.employee_type?.replace('_', ' ')}
                    </span>
                </td>
                <td>{emp.user?.name?.phone_number || 'N/A'}</td>
                <td>
                  {emp.user?.name?.age ? `${emp.user.name.age} yrs` : ''} 
                  {emp.user?.name?.gender ? ` / ${emp.user.name.gender}` : ''}
                </td>
                <td>
                  <button onClick={() => handleDeleteRequest(emp)} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <Modal onClose={() => setIsAddModalOpen(false)} title="Add New Employee Account">
          <div className="add-employee-form-modal">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username*</label>
                <input type="text" name="username" value={newEmployee.username} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Password*</label>
                <input type="password" name="password" value={newEmployee.password} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Role*</label>
                <select name="employee_type" value={newEmployee.employee_type} onChange={handleFormChange}>
                  <option value="DOCTOR">Doctor</option>
                  <option value="NURSE">Nurse (General)</option>
                  <option value="TRIAGE">Triage Nurse</option>
                  <option value="CHEMIST">Pharmacist</option>
                  <option value="LAB_TECH">Lab Technician</option>
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="STORE_MANAGER">Store Manager</option>
                  <option value="ADMIN">Admin / ICT</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="first_name" value={newEmployee.first_name} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label>Second Name</label>
                <input type="text" name="second_name" value={newEmployee.second_name} onChange={handleFormChange} />
              </div>
              
              <div className="form-group">
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

              <button type="submit" className="submit-btn">Add Employee</button>
              {formError && <p className="form-error">{formError}</p>}
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Staff;