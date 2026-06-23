// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { patientService } from '../api/patientService';
import { userService } from '../api/userService';
import { inventoryService } from '../api/inventoryService';
import { prescriptionService } from '../api/prescriptionService';
import { visitService } from '../api/visitService';
import { wardService } from '../api/wardService';
import { labService } from '../api/labService';
import { accountService } from '../api/accountService';
import { useAuth } from '../hooks/useAuth'; 
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';

// 1. NURSE DASHBOARD
const NurseDashboard = ({ stats, loading }) => (
  <div className="dashboard-lists">
    <div className="dashboard-list-card">
      <h3>Ward Overview</h3>
      <p className="text-gray-600 mb-4">Monitor admitted patients and nursing rounds.</p>
      <div className="stat-card-container">
        <div className="stat-card" style={{ borderLeftColor: '#10b981', minWidth: 'auto' }}>
          <h3>Admitted Patients</h3>
          <p className="stat-number">{loading ? '...' : stats.admittedPatients}</p>
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
        <Link to="/ward" className="submit-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
          Go to Ward Dashboard &rarr;
        </Link>
      </div>
    </div>
    
    <div className="dashboard-list-card">
      <h3>Quick Actions</h3>
      <ul className="dashboard-list">
        <li><Link to="/triage-queue">Triage Queue (New Admissions)</Link></li>
        <li><Link to="/ward">Log Vitals / Rounds</Link></li>
      </ul>
    </div>
  </div>
);

// 2. LAB TECH DASHBOARD
const LabTechDashboard = ({ stats, loading }) => (
  <div className="dashboard-lists">
    <div className="dashboard-list-card">
      <h3>Laboratory Queue</h3>
      <p className="text-gray-600 mb-4">Pending tests requiring analysis.</p>
      <div className="stat-card-container">
        <div className="stat-card" style={{ borderLeftColor: '#8b5cf6', minWidth: 'auto' }}>
          <h3>Pending Requests</h3>
          <p className="stat-number">{loading ? '...' : stats.pendingTests}</p>
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
        <Link to="/lab" className="submit-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
          Open Lab Interface &rarr;
        </Link>
      </div>
    </div>
  </div>
);

//3. ACCOUNTANT DASHBOARD 
const AccountantDashboard = ({ stats, loading }) => (
  <div className="dashboard-lists">
    <div className="dashboard-list-card">
      <h3>Accounts & Billing</h3>
      <p className="text-gray-600 mb-4">Outstanding invoices and payment processing.</p>
      <div className="stat-card-container">
        <div className="stat-card" style={{ borderLeftColor: '#f59e0b', minWidth: 'auto' }}>
          <h3>Unpaid Invoices</h3>
          <p className="stat-number">{loading ? '...' : stats.pendingInvoices}</p>
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
        <Link to="/accounts" className="submit-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
          Go to Billing &rarr;
        </Link>
      </div>
    </div>
  </div>
);

//4. DOCTOR  DASHBOARDS 
const DoctorDashboard = ({ stats, loading }) => (
  <div className="dashboard-lists">
    <div className="dashboard-list-card">
      <h3>Your Action Center</h3>
      <p className="text-gray-600 mb-4">Focus on the current patient flow and consultation needs.</p>
      
      <div style={{ marginTop: '20px' }}>
        <Link to="/triage-queue" className="submit-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
          Go to Patient Queue &rarr;
        </Link>stats
      </div>
    </div>
    
    <div className="dashboard-list-card">
      <h3>Quick Links</h3>
      <ul className="dashboard-list">
        <li>
            <Link to="/triage-queue">Start New Consultation</Link>
        </li>
        <li>
            <Link to="/reports">View Consultation Reports</Link>
        </li>
        <li>
            <Link to="/ward">View Admitted Patients</Link>
        </li>
      </ul>
    </div>
  </div>
);

//5. CHEMIST DASHBOARD
const ChemistDashboard = ({ stats, loading }) => (
  <div className="dashboard-lists">
    <div className="dashboard-list-card">
      <h3>Pharmacy Queue</h3>
      <p className="text-gray-600 mb-4">Immediate tasks for dispensing prescriptions.</p>
      <div className="stat-card-container">
        <div className="stat-card" style={{ borderLeftColor: '#f59e0b', minWidth: 'auto' }}>
          <h3>Pending Payment</h3>
          <p className="stat-number">{loading ? '...' : stats.pendingPayment}</p>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#10b981', minWidth: 'auto' }}>
          <h3>Ready to Dispense</h3>
          <p className="stat-number">{loading ? '...' : stats.paidPrescriptions}</p>
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
        <Link to="/dispense" className="submit-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
          Go to Dispense Module &rarr;
        </Link>
      </div>
    </div>
  </div>
);

// 6. TRIAGE / RECEPTION DASHBOARD 
const TriageDashboard = ({ stats, loading }) => (
  <div className="dashboard-lists">
    <div className="dashboard-list-card">
      <h3>Patient Check-in Status</h3>
      <p className="text-gray-600 mb-4">View the current status of the intake process.</p>
      <div className="stat-card-container">
        <div className="stat-card" style={{ borderLeftColor: '#3b82f6', minWidth: 'auto' }}>
          <h3>Total Visits Today</h3>
          <p className="stat-number">{loading ? '...' : stats.visitsToday}</p>
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
        <Link to="/register" className="submit-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
          Register New Patient &rarr;
        </Link>
      </div>

    </div>
    <div className="dashboard-list-card">
      <h3>Queue Overview</h3>
      <ul className="dashboard-list">
        <li><Link to="/triage-queue">View Full Queue Details</Link></li>
        <li>Patients Waiting for Doctor: {loading ? '...' : stats.waitingPatients}</li>
      </ul>
    </div>
  </div>
);

// 7. STORE MANAGER DASHBOARD
const StoreManagerDashboard = ({ stats, lowStockMeds, loading }) => (
  <div className="dashboard-lists">
    <div className="dashboard-list-card">
      <h3>Critical Stock Alerts</h3>
      <p className="text-gray-600 mb-4">Immediate attention required for low inventory items.</p>
      <div className="stat-card-container">
        <div className="stat-card low-stock-card" style={{ borderLeftColor: '#ef4444', minWidth: 'auto' }}>
          <h3>Items Below 10 Units</h3>
          <p className="stat-number">{loading ? '...' : lowStockMeds.length}</p>
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
        <Link to="/inventory" className="submit-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
          Manage Inventory &rarr;
        </Link>
      </div>
    </div>
    <div className={`dashboard-list-card ${lowStockMeds.length > 0 ? 'low-stock-card' : ''}`}>
      <h3>Low Stock List</h3>
      <ul className="dashboard-list">
        {lowStockMeds.length > 0 ? (
          lowStockMeds.map(m => (
            <li key={m.id}>
              <span>{m.name}</span>
              <span className="list-meta low-stock">{m.quantity} left</span>
            </li>
          ))
        ) : (
          <li className="text-center p-4 text-gray-500">All medicines are well-stocked.</li>
        )}
      </ul>
    </div>
  </div>
);

function Dashboard() {
  const { user } = useAuth();
  //const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    patients: 0,
    staff: 0,
    medicines: 0,
    waitingPatients: 0,
    visitsToday: 0,
    pendingPayment: 0,
    paidPrescriptions: 0,
    admittedPatients: 0,
    pendingTests: 0,
    pendingInvoices: 0
  });
  
  const [recentPatients, setRecentPatients] = useState([]);
  const [lowStockMeds, setLowStockMeds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Global error

  const role = user?.user?.employee_type;
  const isAdminOrStoreManager = role === 'ADMIN' || role === 'STORE_MANAGER';

  useEffect(() => {
    if (!role) return;

    const loadAsyncData = async () => {
      setLoading(true);

      const updateStat = (key, value) => {
        setStats(prev => ({ ...prev, [key]: value }));
      };

      const promises = [];

      // 1. DOCTOR Stats
      if (role === 'DOCTOR') {
        promises.push(
          visitService.getVisits(1, 1, '', 'PENDING')
            .then(res => updateStat('waitingPatients', res.data.count || 0))
            .catch(err => console.warn("Failed to load waiting patients", err))
        );
      }

      // 2. TRIAGE / RECEPTION Stats
      if (role === 'TRIAGE' || role === 'RECEPTIONIST') {
        promises.push(
          visitService.getVisits(1, 1, '', '')
            .then(res => updateStat('visitsToday', res.data.count || 0))
            .catch(err => console.warn("Failed to load visits", err))
        );
      }

      // 3. CHEMIST Stats
      if (role === 'CHEMIST') {
        promises.push(
          prescriptionService.getAllPrescriptions()
            .then(res => {
                const all = res.data.results || res.data || [];
                updateStat('pendingPayment', all.filter(p => p.status === 'PENDING').length);
                updateStat('paidPrescriptions', all.filter(p => p.status === 'PAID').length);
            })
            .catch(err => console.warn("Failed to load prescriptions", err))
        );
      }

      // 4. NURSE Stats
      if (role === 'NURSE') {
        promises.push(
          wardService.getAdmittedPatients(1, 1)
            .then(res => updateStat('admittedPatients', res.data.count || 0))
            .catch(err => console.warn("Failed to load ward stats", err))
        );
      }

      // 5. LAB TECH Stats
      if (role === 'LAB_TECH') {
        promises.push(
          labService.getTestRequests(1, 1, 'REQUESTED')
            .then(res => updateStat('pendingTests', res.data.count || 0))
            .catch(err => console.warn("Failed to load lab stats", err))
        );
      }

      // 6. ACCOUNTANT Stats
      if (role === 'ACCOUNTANT') {
        promises.push(
          accountService.getAllInvoices(1, 1, '', 'PENDING')
            .then(res => updateStat('pendingInvoices', res.data.count || 0))
            .catch(err => console.warn("Failed to load invoices", err))
        );
      }

      // 7. ADMIN / MANAGER Stats 
      if (isAdminOrStoreManager) {
        // Inventory
        promises.push(
            inventoryService.getAllMedicines()
            .then(res => {
                const meds = res.data.results || res.data || [];
                updateStat('medicines', meds.length);
                setLowStockMeds(meds.filter(m => m.quantity < 10));
            })
            .catch(err => console.warn("Inventory fetch failed", err))
        );

        if (role === 'ADMIN') {
            // Patients
            promises.push(
                patientService.getAllPatients()
                .then(res => {
                    const pts = res.data.results || res.data || [];
                    updateStat('patients', pts.length);
                    setRecentPatients(pts.slice(0, 5));
                })
                .catch(err => console.warn("Patients fetch failed", err))
            );
            
            // Staff
            promises.push(
                userService.getAllEmployees()
                .then(res => updateStat('staff', res.data.results ? res.data.results.length : (res.data.length || 0)))
                .catch(err => console.warn("Staff fetch failed", err))
            );
        }
      }

      await Promise.allSettled(promises);
      setLoading(false);
    };

    loadAsyncData();
  }, [role]);
  

  const renderDashboardContent = () => {
    if (loading) return <h2>Loading {role.replace('_', ' ')} Dashboard...</h2>;
    
    switch (role) {
      case 'DOCTOR': return <DoctorDashboard stats={stats} loading={loading} />;
      case 'CHEMIST': return <ChemistDashboard stats={stats} loading={loading} />;
      case 'TRIAGE': return <TriageDashboard stats={stats} loading={loading} />;
      case 'RECEPTIONIST': return <TriageDashboard stats={stats} loading={loading} />;
      case 'NURSE': return <NurseDashboard stats={stats} loading={loading} />;
      case 'LAB TECH': return <LabTechDashboard stats={stats} loading={loading} />;
      case 'ACCOUNTANT': return <AccountantDashboard stats={stats} loading={loading} />;
      case 'STORE_MANAGER': return <StoreManagerDashboard stats={stats} lowStockMeds={lowStockMeds} loading={loading} />;
      case 'ADMIN':
        return (
          <>
            <div className="stat-card-container">
              <div className="stat-card">
                <h3>Total Patient Records</h3>
                <p className="stat-number">{stats.patients}</p>
              </div>
              <div className="stat-card" >
                <h3>Total Active Staff</h3>
                <p className="stat-number">{stats.staff}</p>
              </div>
              <div className="stat-card">
                <h3>Medicine Stock Types</h3>
                <p className="stat-number">{stats.medicines}</p>
              </div>
            </div>

            <div className="dashboard-lists">
              <div className="dashboard-list-card">
                <h3>Recent Patient Registrations</h3>
                <ul className="dashboard-list">
                  {recentPatients.length > 0 ? (
                    recentPatients.map(p => (
                      <li key={p.id}>
                        <span>{p.name?.first_name} {p.name?.second_name}</span>
                        <span className="list-meta">Registered: {new Date(p.register_date).toLocaleDateString()}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-center p-4 text-gray-500">No recent patient activity.</li>
                  )}
                </ul>
              </div>

              <div className={`dashboard-list-card ${lowStockMeds.length > 0 ? 'low-stock-card' : ''}`}>
                <h3>Stock Alert: Low Inventory</h3>
                <ul className="dashboard-list">
                  {lowStockMeds.length > 0 ? (
                    lowStockMeds.map(m => (
                      <li key={m.id}>
                        <span>{m.name}</span>
                        <span className="list-meta low-stock">{m.quantity} left</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-center p-4 text-gray-500">All medicines are well-stocked.</li>
                  )}
                </ul>
              </div>
            </div>
          </>
        );
      default: return <h2>Welcome, {user.user?.username}! Select a link in the navigation bar to begin.</h2>;
    }
  };

  return (
    <div className="dashboard-page">
      <h2>{role ? `${role.replace('_', ' ')} Dashboard` : 'Dashboard'}</h2>
      {error && <p className="page-error">{error}</p>}
      {renderDashboardContent()}
    </div>
  );
}

export default Dashboard;