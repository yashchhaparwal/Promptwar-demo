import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import Heatmap from './components/Heatmap';
import Navigation from './components/Navigation';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

const API_BASE = "";

// Initialize socket outside component to avoid reconnects on render
const socket = io();

function App() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    // Fetch initial status
    fetch(`${API_BASE}/status`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching status:", err);
        setError(err.message);
        setLoading(false);
      });

    // Listen to real-time heatmap updates
    socket.on('heatmap-update', (data) => {
      setHeatmapData(data);
    });

    return () => {
      socket.off('heatmap-update');
    };
  }, []);

  return (
    <Router>
      <div className="dashboard-container">
        <header className="dashboard-header glass-panel">
          <div className="header-content">
            <h1>Smart Stadium <span className="highlight">Live</span></h1>
            <nav className="main-nav">
              <Link to="/" className="nav-link">User View</Link>
              <Link to="/admin" className="nav-link admin-link">Admin Center</Link>
            </nav>
          </div>
        </header>
        
        <Routes>
          {/* USER DASHBOARD ROUTE */}
          <Route path="/" element={
            <main className="dashboard-content">
              <div className="dashboard-grid">
                <section className="status-section">
                  <h2 className="section-title">System Status</h2>
                  
                  <div className="status-card glass-panel">
                    {loading && <div className="spinner"></div>}
                    
                    {error && (
                      <div className="error-alert">
                        <span className="icon">❌</span>
                        <div>
                          <p className="error-title">Connection Lost</p>
                          <p className="sub-text">Could not communicate with the backend server.</p>
                        </div>
                      </div>
                    )}
                    
                    {status && (
                      <div className="status-data">
                        <div className="data-row">
                          <span className="label">Status:</span>
                          <span className="value status-running">
                            <span className="live-dot"></span> {status.message}
                          </span>
                        </div>
                        <div className="data-row">
                          <span className="label">Connection:</span>
                          <span className="value status-socket">Real-time Secured</span>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <Navigation heatmapData={heatmapData} />
                <Heatmap heatmapData={heatmapData} socket={socket} />
              </div>
            </main>
          } />

          {/* ADMIN DASHBOARD ROUTE */}
          <Route path="/admin" element={
            <AdminDashboard socket={socket} heatmapData={heatmapData} />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
