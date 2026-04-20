let ioInstance = null;

// Global densities state
let densities = {
    "A": 20,
    "B": 70,
    "C": 40,
    "D": 90
};

// History for AI model (Moving Average)
// We will store the last 5 readings for each zone
const history = {
    "A": [20],
    "B": [70],
    "C": [40],
    "D": [90]
};

const MAX_HISTORY = 5;
const ALERT_THRESHOLD = 80;

const init = (io) => {
    ioInstance = io;

    // Update every 3 seconds
    setInterval(() => {
        const updatedZones = ["A", "B", "C", "D"];
        
        updatedZones.forEach(zone => {
            // Generate new density
            const newDensity = Math.floor(Math.random() * 100);
            densities[zone] = newDensity;

            // Update history for moving average
            history[zone].push(newDensity);
            if (history[zone].length > MAX_HISTORY) {
                history[zone].shift(); // Remove oldest
            }

            // Check for alerts
            if (newDensity > ALERT_THRESHOLD) {
                if (ioInstance) {
                    ioInstance.emit('alert-update', {
                        zone,
                        density: newDensity,
                        message: `High density alert in Zone ${zone} (${newDensity}%)`
                    });
                }
            }
        });

        // Emit heatmap data globally to connected clients
        if (ioInstance) {
            ioInstance.emit('heatmap-update', getHeatmapData());
        }
    }, 3000);
};

const getDensities = () => densities;

const getHeatmapData = () => {
    return ["A", "B", "C", "D"].map(zone => {
        const waitData = getWaitTime(zone);
        return {
            zone: zone,
            density: densities[zone],
            predictedDensity: waitData ? waitData.predicted_density : densities[zone],
            waitTime: waitData ? waitData.estimated_wait_time_minutes : 0
        };
    });
};

/**
 * Predicts the next density using a Simple Moving Average (SMA).
 * It averages the stored history of variations.
 */
const predictNextDensity = (zone) => {
    const h = history[zone];
    if (!h || h.length === 0) return densities[zone] || 0;
    
    const sum = h.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / h.length);
};

/**
 * Calculates estimated wait time for a given zone based on current and predicted density.
 * Simple formula: base factor (0.5 mins per density unit) + predicted weight.
 */
const getWaitTime = (zone) => {
    if (densities[zone] === undefined) return null;
    
    const current = densities[zone];
    const predicted = predictNextDensity(zone);
    
    // Formula: Wait time in minutes
    // e.g. 50% density -> 50 * 0.1 = 5 mins current factor
    // Add predictive weight: If trend is rising faster, it adds to the queues.
    const waitTimeMinutes = (current * 0.1) + (predicted * 0.05);
    
    return {
        zone,
        current_density: current,
        predicted_density: predicted,
        estimated_wait_time_minutes: Math.max(1, Math.round(waitTimeMinutes))
    };
};

module.exports = {
    init,
    getDensities,
    getHeatmapData,
    getWaitTime,
    predictNextDensity
};
