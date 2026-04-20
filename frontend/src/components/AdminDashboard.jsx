import { useState, useEffect } from 'react';
import './AdminDashboard.css';

function AdminDashboard({ socket, heatmapData }) {
    const [alerts, setAlerts] = useState([]);
    const [notification, setNotification] = useState('');

    useEffect(() => {
        if (!socket) return;

        socket.on('alert-update', (alertData) => {
            setAlerts(prev => {
                // Prevent duplicate alerts from spamming too fast
                const exists = prev.find(a => a.zone === alertData.zone && a.density === alertData.density);
                if (exists) return prev;
                return [alertData, ...prev].slice(0, 5); // Keep last 5
            });
        });

        return () => {
            socket.off('alert-update');
        };
    }, [socket]);

    const sendNotification = (e) => {
        e.preventDefault();
        if (notification.trim()) {
            // Emitting to backend not yet handled, but we can mock it here
            // socket.emit('admin-notification', notification);
            alert(`Notification sent: ${notification}`);
            setNotification('');
        }
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <h2>Admin Control Center</h2>
            </header>

            <main className="admin-grid">
                <section className="admin-card stats-card">
                    <h3>Live Density Status</h3>
                    <div className="density-grid">
                        {heatmapData.map((d, i) => (
                            <div key={i} className={`density-item ${d.density > 80 ? 'critical' : d.density > 50 ? 'warning' : 'optimal'}`}>
                                <span className="zone">Zone {d.zone}</span>
                                <span className="value">{d.density}%</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="admin-card alert-card">
                    <h3>Recent Alerts</h3>
                    {alerts.length === 0 ? (
                        <p className="no-alerts">No active alerts.</p>
                    ) : (
                        <ul className="alert-list">
                            {alerts.map((a, i) => (
                                <li key={i} className="alert-item">
                                    <span className="alert-icon">⚠️</span>
                                    {a.message}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="admin-card action-card">
                    <h3>Broadcast Notification</h3>
                    <form onSubmit={sendNotification} className="notify-form">
                        <textarea
                            value={notification}
                            onChange={(e) => setNotification(e.target.value)}
                            placeholder="Enter message for all users..."
                            rows="4"
                        ></textarea>
                        <button type="submit" className="btn-primary">Send to Stadium</button>
                    </form>
                </section>
            </main>
        </div>
    );
}

export default AdminDashboard;
