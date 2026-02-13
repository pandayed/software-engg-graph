import type { Node } from "../types";

export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

interface ViewNode {
  viewPath: string;
  nodes: Node[];
  children: Map<string, ViewNode>;
}

function buildViewTree(nodes: Node[]): ViewNode {
  const root: ViewNode = { viewPath: "", nodes: [], children: new Map() };

  nodes.forEach((node) => {
    const parts = node.directoryPath.split("/").filter((p) => p.length > 0);
    let current = root;

    for (const part of parts) {
      if (!current.children.has(part)) {
        current.children.set(part, {
          viewPath: current.viewPath ? `${current.viewPath}/${part}` : part,
          nodes: [],
          children: new Map(),
        });
      }
      current = current.children.get(part)!;
    }

    current.nodes.push(node);
  });

  return root;
}

function getBounds(positions: NodePosition[]): { minX: number; maxX: number; minY: number; maxY: number; width: number; height: number; radius: number } {
  if (positions.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0, radius: 0 };
  }
  const padding = 80;
  const minX = Math.min(...positions.map((p) => p.x)) - padding;
  const maxX = Math.max(...positions.map((p) => p.x)) + padding;
  const minY = Math.min(...positions.map((p) => p.y)) - padding;
  const maxY = Math.max(...positions.map((p) => p.y)) + padding;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const radius = Math.max(...positions.map((p) => Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2))) + padding;
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY, radius };
}

function layoutNodesRadially(nodes: Node[], centerX: number, centerY: number, radius: number): NodePosition[] {
  if (nodes.length === 0) return [];
  if (nodes.length === 1) {
    return [{ id: nodes[0].id, x: centerX, y: centerY }];
  }

  return nodes.map((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length - Math.PI / 2;
    return {
      id: node.id,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
}

function layoutViewNode(viewNode: ViewNode, depth: number = 0): NodePosition[] {
  const childResults: { positions: NodePosition[]; bounds: ReturnType<typeof getBounds> }[] = [];

  viewNode.children.forEach((child) => {
    const positions = layoutViewNode(child, depth + 1);
    if (positions.length > 0) {
      childResults.push({ positions, bounds: getBounds(positions) });
    }
  });

  const directNodeCount = viewNode.nodes.length;
  const childCount = childResults.length;
  const totalItems = directNodeCount + childCount;

  if (totalItems === 0) {
    return [];
  }

  const baseRadius = 200;
  const radiusPerItem = 80;
  const minChildSpacing = 250;

  if (childCount === 0) {
    const radius = directNodeCount <= 1 ? 0 : baseRadius + radiusPerItem * Math.max(0, directNodeCount - 4);
    return layoutNodesRadially(viewNode.nodes, 0, 0, radius);
  }

  const maxChildRadius = Math.max(...childResults.map((c) => c.bounds.radius), 100);
  const childOrbitRadius = maxChildRadius + minChildSpacing + (childCount > 2 ? radiusPerItem * childCount : 0);

  const arrangedPositions: NodePosition[] = [];

  childResults.forEach((child, index) => {
    const angle = (2 * Math.PI * index) / childCount - Math.PI / 2;
    const childCenterX = childOrbitRadius * Math.cos(angle);
    const childCenterY = childOrbitRadius * Math.sin(angle);

    const currentCenterX = (child.bounds.minX + child.bounds.maxX) / 2;
    const currentCenterY = (child.bounds.minY + child.bounds.maxY) / 2;
    const offsetX = childCenterX - currentCenterX;
    const offsetY = childCenterY - currentCenterY;

    child.positions.forEach((pos) => {
      arrangedPositions.push({
        id: pos.id,
        x: pos.x + offsetX,
        y: pos.y + offsetY,
      });
    });
  });

  if (directNodeCount > 0) {
    const directRadius = directNodeCount <= 1 ? 0 : 120 + radiusPerItem * Math.max(0, directNodeCount - 3);
    const directPositions = layoutNodesRadially(viewNode.nodes, 0, 0, directRadius);
    arrangedPositions.push(...directPositions);
  }

  return arrangedPositions;
}

export function calculateDagreLayout(nodes: Node[]): NodePosition[] {
  if (nodes.length === 0) {
    return [];
  }

  const viewTree = buildViewTree(nodes);
  const positions = layoutViewNode(viewTree, 0);

  const bounds = getBounds(positions);
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;

  return positions.map((pos) => ({
    id: pos.id,
    x: pos.x - centerX,
    y: pos.y - centerY,
  }));
}

