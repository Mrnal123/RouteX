import { RoutingGraph, GraphNode } from "./graph";

export interface AStarResult {
  path: string[];
  totalCost: number;
  visitedCount: number;
  winningPathCosts: { nodeId: string; g: number; h: number; f: number }[];
}

// Simple priority queue suitable for small demographic data sets
class PriorityQueue<T> {
  private elements: { item: T; priority: number }[] = [];

  enqueue(item: T, priority: number) {
    this.elements.push({ item, priority });
    this.elements.sort((a, b) => a.priority - b.priority); // Greedy sorting
  }

  dequeue(): T | undefined {
    return this.elements.shift()?.item;
  }

  isEmpty(): boolean {
    return this.elements.length === 0;
  }
}

export function runAStar(
  graph: RoutingGraph,
  startId: string,
  goalId: string,
  heuristic: (a: GraphNode, b: GraphNode) => number
): AStarResult {
  let visitedCount = 0;
  
  if (!graph.nodes.has(startId) || !graph.nodes.has(goalId)) {
    return { path: [], totalCost: 0, visitedCount, winningPathCosts: [] };
  }

  const goalNode = graph.nodes.get(goalId)!;

  const frontier = new PriorityQueue<string>();
  frontier.enqueue(startId, 0);

  const cameFrom: Map<string, string | null> = new Map();
  cameFrom.set(startId, null);

  const costSoFar: Map<string, number> = new Map();
  costSoFar.set(startId, 0);

  while (!frontier.isEmpty()) {
    const currentId = frontier.dequeue()!;
    visitedCount++;

    if (currentId === goalId) {
      break;
    }

    const neighbors = graph.getNeighbors(currentId);
    for (const edge of neighbors) {
      const nextId = edge.to;
      const newCost = costSoFar.get(currentId)! + edge.weight;

      if (!costSoFar.has(nextId) || newCost < costSoFar.get(nextId)!) {
        costSoFar.set(nextId, newCost);
        
        const nextNode = graph.nodes.get(nextId)!;
        const priority = newCost + heuristic(nextNode, goalNode);
        
        frontier.enqueue(nextId, priority);
        cameFrom.set(nextId, currentId);
      }
    }
  }

  // Path reconstruction
  if (!cameFrom.has(goalId)) {
    // If the goal was completely unreachable
    return { path: [], totalCost: Infinity, visitedCount, winningPathCosts: [] };
  }

  const path: string[] = [];
  let current: string | null = goalId;

  while (current !== null) {
    path.push(current);
    current = cameFrom.get(current) || null;
  }

  const finalPath = path.reverse(); // Reverse to put start block at [0]
  const winningPathCosts = finalPath.map((nodeId) => {
    const g = costSoFar.get(nodeId) ?? Infinity;
    const node = graph.nodes.get(nodeId);
    const h = node ? heuristic(node, goalNode) : 0;
    const f = g + h;
    return { nodeId, g, h, f };
  });

  return {
    path: finalPath,
    totalCost: costSoFar.get(goalId) || 0,
    visitedCount,
    winningPathCosts,
  };
}
