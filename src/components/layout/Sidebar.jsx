import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Sidebar.css'; 

function Sidebar({ isCollapsed, toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Access nested 'user' object for role safely
  const role = user?.user?.employee_type;
  const username = user?.user?.username;

  // Safety Check
  if (!role) return null;

  const displayRole = role.replace('_', ' ');

  return (
    <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
         <button onClick={toggleSidebar} className="sidebar-toggle-btn" title="Toggle Sidebar">
            {isCollapsed ? '❯' : '❮'}
         </button>
      </div>

      {!isCollapsed && (
        <div className="sidebar-brand">
          <h3>{displayRole}</h3>
          <p>{username}</p>
        </div>
      )}

      <ul className="sidebar-nav">
        <li>
          <NavLink to="/" title="Dashboard">
            <span className="icon">📊</span>
            {!isCollapsed && <span className="label">Dashboard</span>}
          </NavLink>
        </li>

        {/* --- DOCTOR --- */}
        {role === 'DOCTOR' && (
          <>
            <li>
              <NavLink to="/triage-queue" title="Patient Queue">
                <span className="icon">👨‍⚕️</span>
                {!isCollapsed && <span className="label">Patient Queue</span>}
              </NavLink>
            </li>
            {/* Added Ward Link for Doctors */}
            <li>
              <NavLink to="/ward" title="In-Patient Ward">
                 <span className="icon">🛏️</span>
                 {!isCollapsed && <span className="label">In-Patient Ward</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/prescriptions" end title="My Prescriptions">
                 <span className="icon">💊</span>
                 {!isCollapsed && <span className="label">My Prescriptions</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/reports" title="View Reports">
                 <span className="icon">📑</span>
                 {!isCollapsed && <span className="label">View Reports</span>}
              </NavLink>
            </li>
          </>
        )}

        {/* --- PHARMACIST --- */}
        {role === 'CHEMIST' && (
          <li>
            <NavLink to="/dispense" title="Dispense">
              <span className="icon">💊</span>
              {!isCollapsed && <span className="label">Dispense</span>}
            </NavLink>
          </li>
        )}

        {/* --- RECEPTIONIST --- */}
        {role === 'RECEPTIONIST' && (
          <li>
            <NavLink to="/register" title="Registration">
              <span className="icon">📝</span>
              {!isCollapsed && <span className="label">Registration</span>}
            </NavLink>
          </li>
        )}

        {/* --- NURSING TEAM (Triage & General Nurse) --- */}
        {(role === 'TRIAGE' || role === 'NURSE') && (
          <>
            <li>
              <NavLink to="/register" title="Registration">
                <span className="icon">👤</span>
                {!isCollapsed && <span className="label">Registration</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/triage-queue" title="Triage Queue">
                 <span className="icon">🩺</span>
                 {!isCollapsed && <span className="label">Triage Queue</span>}
              </NavLink>
            </li>
            
            {/* Added Ward Link for Nurses (General Nurse) */}
            {role === 'NURSE' && (
              <li>
                <NavLink to="/ward" title="In-Patient Ward">
                   <span className="icon">🛏️</span>
                   {!isCollapsed && <span className="label">In-Patient Ward</span>}
                </NavLink>
              </li>
            )}
          </>
        )}

        {/* --- ACCOUNTANT --- */}
        {role === 'ACCOUNTANT' && (
          <li>
            <NavLink to="/accounts" title="Accounts & Billing">
               <span className="icon">💰</span>
               {!isCollapsed && <span className="label">Billing</span>}
            </NavLink>
          </li>
        )}

        {/* --- LAB TECH --- */}
        {role === 'LAB_TECH' && (
          <li>
            <NavLink to="/lab" title="Laboratory">
               <span className="icon">🔬</span>
               {!isCollapsed && <span className="label">Laboratory</span>}
            </NavLink>
          </li>
        )}
        
        {/* --- ADMIN --- */}
        {role === 'ADMIN' && (
          <>
            <li>
              <NavLink to="/staff" title="Staff Management">
                <span className="icon">👥</span>
                {!isCollapsed && <span className="label">Staff Management</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/patients" title="Patient Records">
                <span className="icon">📂</span>
                {!isCollapsed && <span className="label">Patient Records</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/ward" title="In-Patient Ward">
                 <span className="icon">🛏️</span>
                 {!isCollapsed && <span className="label">Ward Management</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/inventory" title="Inventory">
                 <span className="icon">📦</span>
                 {!isCollapsed && <span className="label">Inventory</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/accounts" title="Accounts">
                 <span className="icon">💰</span>
                 {!isCollapsed && <span className="label">Billing</span>}
              </NavLink>
            </li>
          </>
        )}
        
        {/* --- STORE MANAGER --- */}
        {role === 'STORE_MANAGER' && (
          <>
            <li>
              <NavLink to="/inventory" title="Inventory">
                 <span className="icon">📦</span>
                 {!isCollapsed && <span className="label">Inventory</span>}
              </NavLink>
            </li>
          </>
        )}
      </ul>
      
      <ul className="sidebar-footer">
        <li>
          <Link to="/profile" title="Edit Profile">
             <span className="icon">👤</span>
             {!isCollapsed && <span className="label">Edit Profile</span>}
          </Link>
        </li>
        <li>
          <Link to="/settings" title="Settings">
             <span className="icon">⚙️</span>
             {!isCollapsed && <span className="label">Settings</span>}
          </Link>
        </li>
        <li>
          <button onClick={handleLogout} className="logout-btn" title="Logout">
             <span className="icon">🚪</span>
             {!isCollapsed && <span className="label">Logout</span>}
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Sidebar;