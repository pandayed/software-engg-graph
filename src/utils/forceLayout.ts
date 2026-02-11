import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type Simulation,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import type { Node } from "../types";

export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

interface SimNode extends SimulationNodeDatum {
  id: string;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  source: string | SimNode;
  target: string | SimNode;
}

export function calculateForceLayout(
  nodes: Node[],
  onTick: (positions: NodePosition[]) => void,
  onEnd: (positions: NodePosition[]) => void
): Simulation<SimNode, SimLink> {
  if (nodes.length === 0) {
    onEnd([]);
    return forceSimulation<SimNode>([]);
  }

  const simNodes: SimNode[] = nodes.map((node) => ({
    id: node.id,
    x: Math.random() * 600 - 300,
    y: Math.random() * 600 - 300,
  }));

  const simLinks: SimLink[] = [];
  nodes.forEach((node) => {
    node.next.forEach((nextId) => {
      if (nodes.some((n) => n.id === nextId)) {
        simLinks.push({ source: node.id, target: nextId });
      }
    });
  });

  const nodeRadius = 60;
  const simulation = forceSimulation<SimNode>(simNodes)
    .force(
      "link",
      forceLink<SimNode, SimLink>(simLinks)
        .id((d) => d.id)
        .distance(200)
        .strength(0.5)
    )
    .force("charge", forceManyBody().strength(-800))
    .force("center", forceCenter(0, 0))
    .force("collide", forceCollide(nodeRadius + 20))
    .alphaDecay(0.02);

  const getPositions = (): NodePosition[] =>
    simNodes.map((node) => ({
      id: node.id,
      x: node.x ?? 0,
      y: node.y ?? 0,
    }));

  simulation.on("tick", () => {
    onTick(getPositions());
  });

  simulation.on("end", () => {
    onEnd(getPositions());
  });

  return simulation;
}

