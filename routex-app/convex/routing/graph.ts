export interface GraphNode {
  id: string;
  lat: number;
  lng: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
  blocked: boolean;
}

export class RoutingGraph {
  nodes: Map<string, GraphNode> = new Map();
  edges: Map<string, GraphEdge[]> = new Map();

  addNode(node: GraphNode) {
    this.nodes.set(node.id, node);
    if (!this.edges.has(node.id)) {
      this.edges.set(node.id, []);
    }
  }

  addEdge(from: string, to: string, weight: number, blocked: boolean = false) {
    // Add directed edge
    this.edges.get(from)?.push({ from, to, weight, blocked });
  }

  getNeighbors(nodeId: string): GraphEdge[] {
    // Return only active (unblocked) paths
    return this.edges.get(nodeId)?.filter(e => !e.blocked) || [];
  }
}
