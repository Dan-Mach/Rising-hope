// src/pages/Inventory.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '../api/inventoryService';
import Modal from '../components/common/Modal';
import './Inventory.css';

function Inventory() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // ... (other state variables) ...
  const [newMed, setNewMed] = useState({ name: '', quantity: 0, price: 0.00 });
  const [formError, setFormError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [editingMed, setEditingMed] = useState(null);
  const [editFormError, setEditFormError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null); 
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalMedicines, setTotalMedicines] = useState(0);
  const [sortOrder, setSortOrder] = useState('name'); 

  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getAllMedicines(currentPage, pageSize, sortOrder);
      
      const medicineData = response.data.results || response.data || [];
      const totalCount = response.data.count || response.data.length || 0;
      
      setMedicines(medicineData);
      setTotalMedicines(totalCount);
      setError(null);
    } catch (err) {
      setError('Failed to fetch inventory. Your session may be expired.', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortOrder]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  // ... (handleFormChange, handleSubmit, etc. remain the same) ...
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewMed(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    try {
      const response = await inventoryService.createMedicine(newMed);
      setNewMed({ name: '', quantity: 0, price: 0.00 });
      setSuccessMessage(`Medicine "${response.data.name}" added successfully.`);
      fetchMedicines();
      setIsAddModalOpen(false); 
    } catch (err) {
      setFormError('Failed to create medicine. Check details or name duplication.', err);
    }
  };

  const handleDeleteRequest = (med) => {
    setDeleteConfirmation(med);
  };
  
  const handleConfirmedDelete = async () => {
    if (!deleteConfirmation) return;
    const id = deleteConfirmation.id;
    setDeleteConfirmation(null);
    setError(null);
    setSuccessMessage(null);
    try {
      await inventoryService.deleteMedicine(id);
      setSuccessMessage(`Medicine (ID: ${id}) deleted successfully.`);
      fetchMedicines();
    } catch (err) {
      setError('Failed to delete medicine.', err);
    }
  };

  const handleEditClick = (med) => {
    setEditingMed(med);
    setIsEditModalOpen(true);
    setEditFormError(null);
    setError(null);
    setSuccessMessage(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditingMed(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingMed) return;
    setEditFormError(null);
    setSuccessMessage(null);
    try {
      const { id, name, quantity, price } = editingMed;
      const dataToUpdate = { name, quantity, price };
      const response = await inventoryService.updateMedicine(id, dataToUpdate);
      setIsEditModalOpen(false);
      setEditingMed(null);
      setSuccessMessage(`Medicine "${response.data.name}" updated successfully.`);
      fetchMedicines();
    } catch (err) {
      setEditFormError('Failed to update medicine. Check the input values.', err);
    }
  };

  const totalPages = Math.ceil(totalMedicines / pageSize);
  const handlePageSizeChange = (e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); };
  const handleSortChange = (e) => { setSortOrder(e.target.value); setCurrentPage(1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  if (loading && medicines.length === 0) {
    return <div className="inventory-page"><h2>Loading inventory...</h2></div>;
  }
  
  return (
    <div className="inventory-page">
      <h2> Products</h2>

      {error && <p className="page-error">Error: {error}</p>}
      {successMessage && <p className="page-success">{successMessage}</p>}

      <div className="inventory-header">
        <button onClick={fetchMedicines} className="edit-btn" style={{ marginRight: '10px' }}>
           ↻ Refresh List
        </button>
        <button onClick={() => setIsAddModalOpen(true)} className="submit-btn">
          + Add New Medicine
        </button>
      </div>

      <div className="inventory-list-container">
        {/* ... (Pagination and Table remain the same) ... */}
        <div className="pagination-controls">
          <div className="form-group sort-controls">
            <label htmlFor="sortOrder">Sort by:</label>
            <select id="sortOrder" value={sortOrder} onChange={handleSortChange}>
              <option value="name">Name (A-Z)</option>
              <option value="-name">Name (Z-A)</option>
              <option value="-date_added">Date Added (Newest)</option>
              <option value="-price">Price (High-Low)</option>
              <option value="price">Price (Low-High)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="pageSize">Items per page:</label>
            <select id="pageSize" value={pageSize} onChange={handlePageSizeChange}>
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <span className="page-info">
            {totalPages > 1 ? `Page ${currentPage} of ${totalPages} | ` : ''}
            {totalMedicines} 
          </span>
          <div className="pagination-buttons">
            <button onClick={handlePrevPage} disabled={currentPage === 1} className="pagination-btn">
              &larr; Previous
            </button>
            <button onClick={handleNextPage} disabled={currentPage === totalPages || totalMedicines === 0} className="pagination-btn">
              Next &rarr;
            </button>
          </div>
        </div>

        <table className="inventory-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Date Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="5">Loading...</td>
              </tr>
            )}
            {!loading && medicines.length > 0 ? (
              medicines.map((med) => (
                <tr key={med.id}>
                  <td>{med.name}</td>
                  <td className={med.quantity < 10 ? 'low-stock' : ''}>
                    {med.quantity}
                    {med.quantity < 10 && ' (Low Stock!)'}
                  </td>
                  <td>${parseFloat(med.price).toFixed(2)}</td>
                  <td>
                    {med.date_added ? new Date(med.date_added).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleEditClick(med)} className="edit-btn">Edit</button>
                      <button onClick={() => handleDeleteRequest(med)} className="delete-btn">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              !loading && <tr>
                <td colSpan="5">No medicines found in inventory.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ... (Modals remain the same) ... */}
      {isEditModalOpen && editingMed && (
        <Modal 
            onClose={() => setIsEditModalOpen(false)} 
            title={`Edit ${editingMed.name}`}
        >
          <form onSubmit={handleUpdateSubmit} className="edit-form">
            <div className="form-group">
              <label>Name</label>
              <input type="text" name="name" value={editingMed.name} onChange={handleEditFormChange} required />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" name="quantity" min="0" value={editingMed.quantity} onChange={handleEditFormChange} required />
            </div>
            <div className="form-group">
              <label>Price ($)</label>
              <input type="number" name="price" step="0.01" min="0" value={editingMed.price} onChange={handleEditFormChange} required />
            </div>
            <button type="submit" className="submit-btn">Save Changes</button>
            {editFormError && <p className="form-error">{editFormError}</p>}
          </form>
        </Modal>
      )}
      {deleteConfirmation && (
        <Modal 
            onClose={() => setDeleteConfirmation(null)} 
            title="Confirm Deletion"
        >
          <p className="p-4 text-center">Are you sure you want to delete <strong>{deleteConfirmation.name}</strong> from stock? This action cannot be undone.</p>
          <div className="flex justify-center gap-4 p-4 border-t">
            <button 
                onClick={handleConfirmedDelete} 
                className="delete-btn"
            >
                Yes, Delete
            </button>
            <button 
                onClick={() => setDeleteConfirmation(null)} 
                className="edit-btn"
            >
                Cancel
            </button>
          </div>
        </Modal>
      )}

      {isAddModalOpen && (
        <Modal 
            onClose={() => setIsAddModalOpen(false)} 
            title="Add New Medicine to Stock"
        >
          <div className="add-medicine-form-modal"> 
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={newMed.name} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" name="quantity" min="0" value={newMed.quantity} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Price ($)</label>
                <input type="number" name="price" step="0.01" min="0" value={newMed.price} onChange={handleFormChange} required />
              </div>
              <button type="submit" className="submit-btn">Add to Stock</button>
              {formError && <p className="form-error">{formError}</p>}
            </form>
          </div>
        </Modal>
      )}

    </div>
  );
}

export default Inventory;