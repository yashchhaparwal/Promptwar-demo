import { useState, useEffect } from 'react';
import './Heatmap.css';

const API_BASE = "";

function Heatmap({ heatmapData, socket }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 8. Ensure Component Updates: Use useEffect to fetch data on mount
  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        // 1. Correct API Fetch
        const res = await fetch(`${API_BASE}/heatmap`);
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        // 1. Convert response using: await res.json()
        const fetchedData = await res.json();
        
        // 7. Debugging: Add console.log(data) after fetch
        console.log("Heatmap data fetched:", fetchedData);

        // 2. State Management
        setData(fetchedData);
        setLoading(false);
      } catch (err) {
        // 6. Error Handling: add try/catch in fetch, log errors
        console.error("Error fetching heatmap:", err);
        setLoading(false);
      }
    };

    fetchHeatmapData();

    // 8. Optional polling (set to 3 seconds to keep it live if socket fails)
    const intervalId = setInterval(fetchHeatmapData, 3000);

    // If socket is passed from App.jsx, we can also bind real-time syncs
    if (socket) {
      const handleSocketUpdate = (socketData) => {
        console.log("Socket update received:", socketData);
        setData(socketData);
        setLoading(false);
      };
      socket.on('heatmap-update', handleSocketUpdate);
      
      return () => {
        clearInterval(intervalId);
        socket.off('heatmap-update', handleSocketUpdate);
      };
    }

    return () => clearInterval(intervalId);
  }, [socket]);

  const getDensityColorClass = (density) => {
    if (density < 30) return 'density-low';
    if (density <= 70) return 'density-medium';
    return 'density-high';
  };

  // 3. Loading Logic Fix: Use if (loading)
  if (loading) {
    return (
      <section className="heatmap-section">
        <div className="section-header">
          <h2 className="section-title">Live Crowd Heatmap</h2>
        </div>
        <div className="status-card heatmap-card glass-panel">
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="heatmap-section">
      <div className="section-header">
        <h2 className="section-title">Live Crowd Heatmap</h2>
        <div className="pulse-indicator">
          <span className="pulse-ring"></span>
          <span className="pulse-text">Live Sync</span>
        </div>
      </div>
      
      <div className="status-card heatmap-card glass-panel">
        <div className="heatmap-grid">
          {/* 4. Safe Rendering: Ensure data is an array before mapping */}
          {Array.isArray(data) && data.map((zoneData, index) => (
            <div 
              key={index} 
              className={`heatmap-zone ${getDensityColorClass(zoneData.density)}`}
            >
              <div className="zone-name">Zone {zoneData.zone}</div>
              
              <div className="zone-metrics">
                <div className="metric-primary">
                  <span className="metric-label">Density</span>
                  {/* 5. Handle Updated API Structure */}
                  <div className="zone-density">{zoneData.density || 0}%</div>
                </div>
                
                <div className="metric-secondary">
                  <div className="detail-row tooltip">
                    <span className="detail-icon">⏱️</span>
                    <span>{zoneData.waitTime || 0}m wait</span>
                    <span className="tooltiptext">Predicted Wait Time using AI</span>
                  </div>
                  <div className="detail-row tooltip">
                    <span className="detail-icon">🤖</span>
                    <span>{zoneData.predictedDensity || 0}% pdty</span>
                    <span className="tooltiptext">AI Density Prediction</span>
                  </div>
                </div>
              </div>
              
              <div className="density-fill" style={{ height: `${zoneData.density || 0}%` }}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Heatmap;
