const densityService = require('../services/densityService');
const pathfindingService = require('../services/pathfindingService');

const getStatus = (req, res) => {
    res.json({
        message: "System Running (Real-time Enabled)",
        crowd_level: "Dynamic"
    });
};

const getHeatmap = (req, res) => {
    res.json(densityService.getHeatmapData());
};

const getWaitTime = (req, res) => {
    const { zone } = req.query;
    
    if (!zone || densityService.getDensities()[zone] === undefined) {
        return res.status(400).json({ error: "Invalid or missing zone parameter. Valid zones: A, B, C, D" });
    }
    
    const waitData = densityService.getWaitTime(zone);
    res.json(waitData);
};

const getPath = (req, res) => {
    const { from, to } = req.query;

    try {
        const result = pathfindingService.findShortestPath(from, to, densityService.getDensities());
        res.json(result);
    } catch (err) {
        if (err.message === "Invalid nodes") {
            return res.status(400).json({ error: err.message });
        }
        if (err.message === "No path found") {
            return res.json({ error: err.message });
        }
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    getStatus,
    getHeatmap,
    getWaitTime,
    getPath
};
