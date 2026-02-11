import dagre from "dagre";
import type { Node } from "../types";

export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

export function calculateDagreLayout(nodes: Node[]): NodePosition[] {
  if (nodes.length === 0) {
    return [];
  }

  const g = new dagre.graphlib.Graph();

  g.setGraph({
    rankdir: "TB",
    nodesep: 80,
    ranksep: 120,
    marginx: 20,
    marginy: 20,
  });

  g.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 100;
  const nodeHeight = 100;

  nodes.forEach((node) => {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  nodes.forEach((node) => {
    node.next.forEach((nextId) => {
      if (nodes.some((n) => n.id === nextId)) {
        g.setEdge(node.id, nextId);
      }
    });
  });

  dagre.layout(g);

  const positions: NodePosition[] = [];
  const graphInfo = g.graph();
  const graphWidth = graphInfo.width ?? 0;
  const graphHeight = graphInfo.height ?? 0;

  nodes.forEach((node) => {
    const nodeInfo = g.node(node.id);
    if (nodeInfo) {
      positions.push({
        id: node.id,
        x: nodeInfo.x - graphWidth / 2,
        y: nodeInfo.y - graphHeight / 2,
      });
    }
  });

  return positions;
}

