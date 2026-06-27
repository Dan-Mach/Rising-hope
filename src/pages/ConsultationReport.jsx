// src/pages/ConsultationReport.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { visitService } from '../api/visitService';
import { labService } from '../api/labService'; // <--- Import Lab Service
import Button from '../components/common/Button'; // Imported the unified Button component
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
        setError('Failed to load visit details.');
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
    try {
      setLoading(true);
      // 1. Update Consultation notes and complaint
      await visitService.updateVisit(visitId, {
        consultation_notes: notes,
        chief_complaint: complaint,
        status: 'COMPLETE' 
      });

      // 2. Submit Lab Orders if any selected
      if (selectedTests.length > 0) {
         await labService.createLabOrders({
             visit: visitId,
             tests: selectedTests
         });
      }

      // Navigate to prescription view or dashboard
      navigate(`/prescriptions/new?visitId=${visitId}&notes=${encodeURIComponent(pharmacyNotes)}`);
    } catch (err) {
      setError('Failed to finalize consultation records.', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !visit) return <p>Loading consultation window...</p>;
  if (error) return <p className="page-error">{error}</p>;

  return (
    <div className="consultation-report-page">
      <h2>Doctor Consultation Window</h2>
      {visit && (
        <div className="patient-summary-banner" style={{ background: 'var(--bg-light)', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
            <p>Patient: <strong>{visit.patient_name}</strong> | Age: {visit.patient_age} | Gender: {visit.patient_gender}</p>
            <p>Triage Vitals: BP: {visit.bp || 'N/A'} | Temp: {visit.temperature ? `${visit.temperature}°C` : 'N/A'} | Weight: {visit.weight ? `${visit.weight}kg` : 'N/A'}</p>
        </div>
      )}

      <div className="report-section">
        <h3>1. Chief Complaint</h3>
        <input 
          type="text" 
          className="report-input-field"
          value={complaint} 
          onChange={(e) => setComplaint(e.target.value)} 
          placeholder="What is bringing the patient in today?"
          style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
        />
      </div>

      <div className="report-section" style={{ marginTop: '20px' }}>
        <h3>2. Detailed Clinical Assessment & Diagnosis Notes</h3>
        <textarea 
          className="report-textarea" 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          placeholder="Enter physical examination results, system reviews, assessment benchmarks, and differential diagnosis..."
        />
      </div>

      {/* --- Lab Ordering --- */}
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

      {/* Swapped standard HTML <button> out for the standard <Button /> component */}
      <Button onClick={handleSaveAndPrescribe} variant="submit" style={{marginTop: '20px'}}>
        Save & Proceed to Pharmacy &rarr;
      </Button>
    </div>
  );
}

export default ConsultationReport;