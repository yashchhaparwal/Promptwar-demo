// Graph Definition
const graph = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": ["D"],
    "D": []
};

/**
 * Finds shortest path using Dijkstra
 * @param {string} from Node
 * @param {string} to Node
 * @param {object} densities Dictionary of densities { "A": 50, ... }
 */
const findShortestPath = (from, to, densities) => {
    if (!from || !to || !graph[from] || Object.keys(graph).indexOf(to) === -1) {
        throw new Error("Invalid nodes");
    }

    // Dijkstra initialization
    const distances = { A: Infinity, B: Infinity, C: Infinity, D: Infinity };
    const previous = { A: null, B: null, C: null, D: null };
    const unvisited = new Set(["A", "B", "C", "D"]);
    
    distances[from] = 0; // Starting node cost is 0

    while (unvisited.size > 0) {
        // Find node with min distance
        let current = null;
        for (let node of unvisited) {
            if (current === null || distances[node] < distances[current]) {
                current = node;
            }
        }

        if (distances[current] === Infinity || current === to) break;

        unvisited.delete(current);

        for (let neighbor of graph[current] || []) {
            if (unvisited.has(neighbor)) {
                // Cost = transition cost (density of the neighbor)
                let alt = distances[current] + densities[neighbor];
                if (alt < distances[neighbor]) {
                    distances[neighbor] = alt;
                    previous[neighbor] = current;
                }
            }
        }
    }

    if (distances[to] === Infinity) {
        if (from === to) {
            return { path: [from], total_cost: 0 };
        }
        throw new Error("No path found");
    }

    // Reconstruct path
    const path = [];
    let curr = to;
    while (curr) {
        path.unshift(curr);
        curr = previous[curr];
    }

    return { path, total_cost: distances[to] };
};

module.exports = {
    findShortestPath,
    graph
};
