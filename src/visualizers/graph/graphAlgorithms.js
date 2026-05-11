export const PRESET_GRAPHS = {
  simple: {
    name: 'Simple Graph',
    nodes: [
      { id: 'A', x: 320, y: 80 },
      { id: 'B', x: 160, y: 220 },
      { id: 'C', x: 480, y: 220 },
      { id: 'D', x: 80, y: 370 },
      { id: 'E', x: 320, y: 370 },
      { id: 'F', x: 520, y: 370 },
    ],
    edges: [
      { from: 'A', to: 'B', weight: 4 },
      { from: 'A', to: 'C', weight: 2 },
      { from: 'B', to: 'D', weight: 5 },
      { from: 'B', to: 'E', weight: 3 },
      { from: 'C', to: 'E', weight: 1 },
      { from: 'C', to: 'F', weight: 6 },
      { from: 'D', to: 'E', weight: 2 },
      { from: 'E', to: 'F', weight: 4 },
    ]
  }
}

function buildAdjList(graph) {
  const adj = {}
  graph.nodes.forEach(n => { adj[n.id] = [] })
  graph.edges.forEach(e => {
    adj[e.from].push({ id: e.to, weight: e.weight })
    adj[e.to].push({ id: e.from, weight: e.weight })
  })
  return adj
}

function makeStep(graph, visited, current, frontier, pathEdges, distances, queueState, stackState, info) {
  return {
    nodes: graph.nodes,
    edges: graph.edges,
    visited: new Set(visited),
    current,
    frontier: [...frontier],
    path: [...pathEdges],
    distances: { ...distances },
    queue: [...queueState],
    stack: [...stackState],
    info,
  }
}

export function bfs(graph, startId) {
  const steps = []
  const adj = buildAdjList(graph)
  const visited = new Set()
  const pathEdges = []
  const queue = [startId]
  visited.add(startId)

  steps.push(makeStep(graph, visited, null, [startId], pathEdges, {}, [startId], [],
    `BFS: Starting at node ${startId}. Enqueue ${startId}`))

  while (queue.length > 0) {
    const current = queue.shift()
    steps.push(makeStep(graph, visited, current, queue, pathEdges, {}, [...queue], [],
      `Dequeue ${current} — visiting and exploring its neighbors`))

    const neighbors = adj[current] || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id)
        queue.push(neighbor.id)
        pathEdges.push({ from: current, to: neighbor.id })
        steps.push(makeStep(graph, visited, current, queue, pathEdges, {}, [...queue], [],
          `Discovered ${neighbor.id} from ${current} — enqueue ${neighbor.id}`))
      } else {
        steps.push(makeStep(graph, visited, current, queue, pathEdges, {}, [...queue], [],
          `${neighbor.id} already visited — skip`))
      }
    }
  }

  steps.push(makeStep(graph, visited, null, [], pathEdges, {}, [], [],
    `✓ BFS complete — visited ${visited.size} nodes: ${[...visited].join(' → ')}`))
  return steps
}

export function dfs(graph, startId) {
  const steps = []
  const adj = buildAdjList(graph)
  const visited = new Set()
  const pathEdges = []
  const stackTrace = []

  steps.push(makeStep(graph, visited, null, [], pathEdges, {}, [], [startId],
    `DFS: Starting at node ${startId}`))

  function explore(nodeId) {
    visited.add(nodeId)
    stackTrace.push(nodeId)
    steps.push(makeStep(graph, visited, nodeId, [], pathEdges, {}, [], [...stackTrace],
      `Visit ${nodeId} (stack: [${stackTrace.join(', ')}])`))

    const neighbors = adj[nodeId] || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.id)) {
        pathEdges.push({ from: nodeId, to: neighbor.id })
        steps.push(makeStep(graph, visited, nodeId, [], pathEdges, {}, [], [...stackTrace],
          `Explore edge ${nodeId} → ${neighbor.id}`))
        explore(neighbor.id)
      } else {
        steps.push(makeStep(graph, visited, nodeId, [], pathEdges, {}, [], [...stackTrace],
          `${neighbor.id} already visited — backtrack`))
      }
    }
    stackTrace.pop()
    steps.push(makeStep(graph, visited, null, [], pathEdges, {}, [], [...stackTrace],
      `Backtrack from ${nodeId}${stackTrace.length > 0 ? ` → return to ${stackTrace[stackTrace.length - 1]}` : ''}`))
  }

  explore(startId)

  steps.push(makeStep(graph, visited, null, [], pathEdges, {}, [], [],
    `✓ DFS complete — visited ${visited.size} nodes`))
  return steps
}

export function dijkstra(graph, startId) {
  const steps = []
  const adj = buildAdjList(graph)
  const distances = {}
  const visited = new Set()
  const pathEdges = []
  const prev = {}

  graph.nodes.forEach(n => { distances[n.id] = Infinity })
  distances[startId] = 0

  const distDisplay = {}
  graph.nodes.forEach(n => { distDisplay[n.id] = distances[n.id] === Infinity ? '∞' : distances[n.id] })

  steps.push(makeStep(graph, visited, null, [], pathEdges, { ...distances }, [], [],
    `Dijkstra: Initialize distances — ${startId}=0, all others=∞`))

  // Simple priority queue using array
  const unvisited = new Set(graph.nodes.map(n => n.id))

  while (unvisited.size > 0) {
    // Find unvisited node with minimum distance
    let current = null
    let minDist = Infinity
    for (const id of unvisited) {
      if (distances[id] < minDist) {
        minDist = distances[id]
        current = id
      }
    }

    if (current === null || distances[current] === Infinity) {
      steps.push(makeStep(graph, visited, null, [], pathEdges, { ...distances }, [], [],
        'Remaining nodes are unreachable — done'))
      break
    }

    unvisited.delete(current)
    visited.add(current)

    steps.push(makeStep(graph, visited, current, [...unvisited], pathEdges, { ...distances }, [], [],
      `Processing ${current} (dist=${distances[current]}) — relax all neighbors`))

    const neighbors = adj[current] || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.id)) {
        const newDist = distances[current] + neighbor.weight
        steps.push(makeStep(graph, visited, current, [...unvisited], pathEdges, { ...distances }, [], [],
          `Edge ${current}→${neighbor.id}: ${distances[current]} + ${neighbor.weight} = ${newDist} ${newDist < distances[neighbor.id] ? '< ' + (distances[neighbor.id] === Infinity ? '∞' : distances[neighbor.id]) + ' ✓ update' : '≥ ' + distances[neighbor.id] + ' — no update'}`))

        if (newDist < distances[neighbor.id]) {
          distances[neighbor.id] = newDist
          prev[neighbor.id] = current
          pathEdges.push({ from: current, to: neighbor.id })
          steps.push(makeStep(graph, visited, current, [...unvisited], pathEdges, { ...distances }, [], [],
            `Updated dist[${neighbor.id}] = ${newDist}`))
        }
      }
    }
  }

  steps.push(makeStep(graph, visited, null, [], pathEdges, { ...distances }, [], [],
    `✓ Dijkstra complete! Shortest distances from ${startId}: ${Object.entries(distances).map(([k, v]) => `${k}=${v === Infinity ? '∞' : v}`).join(', ')}`))
  return steps
}

export function generateGraphSteps(algorithm, graph, startId) {
  switch (algorithm) {
    case 'bfs': return bfs(graph, startId)
    case 'dfs': return dfs(graph, startId)
    case 'dijkstra': return dijkstra(graph, startId)
    default: return bfs(graph, startId)
  }
}
