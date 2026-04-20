import { useState } from 'react';
import './Navigation.css';

const API_BASE = "";

function Navigation({ heatmapData }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [pathResult, setPathResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const findPath = (e) => {
    e.preventDefault();
    if (!from || !to) return;
    
    setLoading(true);
    setError(null);
    setPathResult(null);

    fetch(`${API_BASE}/path?from=${from}&to=${to}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setPathResult(data);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const zones = ["A", "B", "C", "D"];

  return (
    <section className="nav-section">
      <h2 className="section-title">Smart Pathfinding</h2>
      
      <div className="nav-card glass-panel">
        <form onSubmit={findPath} className="nav-form">
          <div className="input-group">
            <label>Current Location</label>
            <select value={from} onChange={e => setFrom(e.target.value)} required>
              <option value="" disabled>Select Zone</option>
              {zones.map(z => <option key={z} value={z}>Zone {z}</option>)}
            </select>
          </div>
          
          <div className="icon-connector">→</div>
          
          <div className="input-group">
            <label>Destination</label>
            <select value={to} onChange={e => setTo(e.target.value)} required>
              <option value="" disabled>Select Zone</option>
              {zones.map(z => <option key={z} value={z}>Zone {z}</option>)}
            </select>
          </div>
          
          <button type="submit" className="btn-navigate" disabled={loading || !from || !to}>
            {loading ? 'Calculating...' : 'Find Route'}
          </button>
        </form>

        {error && <div className="error-message">Error: {error}</div>}

        {pathResult && (
          <div className="route-result">
            <div className="route-header">
              <h3>Optimal Route Found</h3>
              <div className="total-cost">Cost: {pathResult.total_cost}</div>
            </div>
            
            <div className="path-visualizer">
              {pathResult.path.map((node, i) => (
                <div key={i} className="path-node-container">
                  <div className="path-node">
                    {node}
                  </div>
                  {i < pathResult.path.length - 1 && <div className="path-line"></div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Navigation;
