// src/pages/ConsultationReport.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { visitService } from '../api/visitService';
import { labService } from '../api/labService'; // <--- Import Lab Service
import './ConsultationReport.css'; 

function ConsultationReport() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const [visit, setVisit] = useState(null);
  
  // Form Data
  const [notes, setNotes] = useState('');
  const [complaint, setComplaint] = useState(''); 
  const [pharmacyNotes, setPharmacyNotes] = useState(''); 
  
  // Lab Data
  const [availableTests, setAvailableTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]); // Array of test IDs

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const visitRes = await visitService.getVisitById(visitId);
        setVisit(visitRes.data);
        setNotes(visitRes.data.consultation_notes || ''); 
        setComplaint(visitRes.data.chief_complaint || ''); 
        
        // Fetch Lab Tests
        const labRes = await labService.getAvailableTests();
        setAvailableTests(labRes.data.results || labRes.data || []);
        
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [visitId]);

  const handleTestSelection = (e) => {
    const testId = parseInt(e.target.value);
    if (e.target.checked) {
        setSelectedTests([...selectedTests, testId]);
    } else {
        setSelectedTests(selectedTests.filter(id => id !== testId));
    }
  };

  const handleSaveAndPrescribe = async () => {
    setError(null);
    try {
      await visitService.saveConsultationReport(visitId, {
        chief_complaint: complaint,
        consultation_notes: notes,
        pharmacy_notes: pharmacyNotes 
      });

      if (selectedTests.length > 0) {
        // We create them sequentially or Promise.all
        const labPromises = selectedTests.map(testId => 
            labService.createTestRequest({
                visit: visitId,
                patient: visit.patient,
                test: testId
            })
        );
        await Promise.all(labPromises);
      }
      
      navigate(`/prescriptions?visit_id=${visitId}`);
      
    } catch (err) {
      console.error(err);
      setError('Failed to save. Please try again.');
    }
  };

  if (loading) return <h2>Loading...</h2>;

  return (
    <div className="report-page">
      <div className="report-patient-header">
        <h2>Consultation Report</h2>
        {visit && <p><strong>Patient:</strong> {visit.patient_name}</p>}
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="report-section">
        <h3>1. History & Symptoms</h3>
        <textarea className="report-textarea" value={complaint} onChange={(e) => setComplaint(e.target.value)} />
      </div>

      <div className="report-section" style={{ marginTop: '20px' }}>
        <h3>2. Examination Notes</h3>
        <textarea className="report-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      {/* --- NEW: Lab Test Ordering --- */}
      <div className="report-section" style={{ marginTop: '20px' }}>
        <h3>3. Order Lab Tests (Optional)</h3>
        <div className="lab-test-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {availableTests.length === 0 && <p className="text-muted">No lab tests available in catalog.</p>}
            {availableTests.map(test => (
                <label key={test.id} className="lab-checkbox-label" style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px'}}>
                    <input 
                        type="checkbox" 
                        value={test.id} 
                        checked={selectedTests.includes(test.id)}
                        onChange={handleTestSelection}
                    />
                    <span>{test.name} (${test.price})</span>
                </label>
            ))}
        </div>
      </div>
      
      <div className="report-section" style={{ marginTop: '20px' }}>
        <h3>4. Pharmacy Notes</h3>
        <textarea className="report-textarea" value={pharmacyNotes} onChange={(e) => setPharmacyNotes(e.target.value)} style={{ minHeight: '100px' }} />
      </div>

      <button onClick={handleSaveAndPrescribe} className="submit-btn" style={{marginTop: '20px'}}>
        Save & Proceed to Pharmacy &rarr;
      </button>
    </div>
  );
}

export default ConsultationReport;