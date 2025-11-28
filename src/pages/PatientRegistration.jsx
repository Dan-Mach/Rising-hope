import React, { useState, useEffect } from 'react';
import { patientService } from '../api/patientService';
import { visitService } from '../api/visitService';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/common/Modal'; 
import './PatientRegistration.css';

function PatientRegistration() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [formError, setFormError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [newPatientData, setNewPatientData] = useState({
    first_name: '', second_name: '', age: '', gender: 'Male',phone_number: ''
  });

  // ... Pagination state omitted for brevity ...

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const search = async () => {
      // Backend should handle ?search=... by looking into name__first_name
      const res = await patientService.searchPatients(searchQuery);
      setSearchResults(res.data.results || res.data);
    };
    const timerId = setTimeout(() => search(), 300);
    return () => clearTimeout(timerId);
  }, [searchQuery]);

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    
    // ⚠️ CRITICAL: Structure payload for nested Name
    const dataToSend = {
      name: {
        first_name: newPatientData.first_name,
        second_name: newPatientData.second_name,
        age: newPatientData.age || null,
        gender: newPatientData.gender,
        phone_number: newPatientData.phone_number
      }
    };

    try {
      const res = await patientService.createPatient(dataToSend);
      setIsAddModalOpen(false); 
      setNewPatientData({ first_name: '', second_name: '', age: '', gender: 'Male', phone_number }); 
      navigate(`/triage-assessment/${res.data.id}`); 
    } catch (err) {
      setFormError('Failed to create new patient.');
    }
  };

  const handleNewPatientChange = (e) => {
    const { name, value } = e.target;
    setNewPatientData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="registration-page">
      <div className="registration-form-container">
        <h2>Patient Check-in</h2>
        
        <div className="form-section">
          <h3>Find Existing Patient</h3>
          <div className="search-wrapper">
            <input 
              type="text"
              placeholder="Search by first name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            <ul className="search-results">
              {searchResults.map(p => (
                <li key={p.id} onClick={() => navigate(`/triage-assessment/${p.id}`)}>
                  {/* ⚠️ CRITICAL: Access nested Name */}
                  <span>{p.name?.first_name} {p.name?.second_name} (Age: {p.name?.age})</span>
                  <button type="button" className="submit-btn-small">Send to Triage</button>
                </li>
              ))}
            </ul>
          </div>
          
          <button onClick={() => setIsAddModalOpen(true)} className="toggle-view-btn">
            Register New Patient &rarr;
          </button>
        </div>
      </div>

      {isAddModalOpen && (
        <Modal onClose={() => setIsAddModalOpen(false)} title="Register New Patient">
          <div className="add-patient-form-modal">
            <form onSubmit={handleCreatePatient}>
              <div className="form-group">
                <label>First Name*</label>
                <input type="text" name="first_name" value={newPatientData.first_name} onChange={handleNewPatientChange} required />
              </div>
              <div className="form-group">
                <label>Second Name</label>
                <input type="text" name="second_name" value={newPatientData.second_name} onChange={handleNewPatientChange} />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input type="number" name="age" value={newPatientData.age} onChange={handleNewPatientChange} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={newPatientData.gender} onChange={handleNewPatientChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label> Phone Number</label>
                <input type="number" name="phone_number" value={newPatientData.phone_number} onChange={handleNewPatientChange} />
              </div>
              <button type="submit" className="submit-btn">Create & Send to Triage</button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default PatientRegistration;