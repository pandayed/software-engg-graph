import type { Node, View } from "../types";
import type { NodePosition } from "./forceLayout";

export interface ViewBounds {
  id: string;
  name: string;
  cx: number;
  cy: number;
  radius: number;
  depth: number;
}

export function computeViews(nodes: Node[]): View[] {
  const viewMap = new Map<string, View>();

  nodes.forEach((node) => {
    const pathParts = node.directoryPath.split("/").filter((p) => p.length > 0);
    
    for (let i = 0; i <= pathParts.length; i++) {
      const viewPath = pathParts.slice(0, i).join("/");
      const viewId = viewPath || "root";

      if (!viewMap.has(viewId)) {
        const name = i === 0 ? "Root" : pathParts[i - 1];
        viewMap.set(viewId, {
          id: viewId,
          name: formatViewName(name),
          nodeIds: [],
          childViewIds: [],
          parentViewId: i > 0 ? (pathParts.slice(0, i - 1).join("/") || "root") : null,
        });
      }

      if (i === pathParts.length) {
        viewMap.get(viewId)!.nodeIds.push(node.id);
      }
    }
  });

  viewMap.forEach((view) => {
    if (view.parentViewId && viewMap.has(view.parentViewId)) {
      const parent = viewMap.get(view.parentViewId)!;
      if (!parent.childViewIds.includes(view.id)) {
        parent.childViewIds.push(view.id);
      }
    }
  });

  return Array.from(viewMap.values());
}

function formatViewName(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getAllNodeIdsInView(view: View, viewMap: Map<string, View>): string[] {
  const nodeIds = [...view.nodeIds];
  
  view.childViewIds.forEach((childId) => {
    const child = viewMap.get(childId);
    if (child) {
      nodeIds.push(...getAllNodeIdsInView(child, viewMap));
    }
  });
  
  return nodeIds;
}

function getViewDepth(view: View, viewMap: Map<string, View>): number {
  let depth = 0;
  let current = view;
  while (current.parentViewId && viewMap.has(current.parentViewId)) {
    depth++;
    current = viewMap.get(current.parentViewId)!;
  }
  return depth;
}

export function computeViewBounds(
  views: View[],
  positions: NodePosition[]
): ViewBounds[] {
  const viewMap = new Map(views.map((v) => [v.id, v]));
  const positionMap = new Map(positions.map((p) => [p.id, p]));
  const bounds: ViewBounds[] = [];

  views.forEach((view) => {
    if (view.id === "root") return;

    const allNodeIds = getAllNodeIdsInView(view, viewMap);
    if (allNodeIds.length === 0) return;

    const nodePositions = allNodeIds
      .map((id) => positionMap.get(id))
      .filter((p): p is NodePosition => p !== undefined);

    if (nodePositions.length === 0) return;

    const cx = nodePositions.reduce((sum, p) => sum + p.x, 0) / nodePositions.length;
    const cy = nodePositions.reduce((sum, p) => sum + p.y, 0) / nodePositions.length;

    const maxDist = Math.max(
      ...nodePositions.map((p) => Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2))
    );

    const padding = 80;
    const radius = maxDist + padding;
    const depth = getViewDepth(view, viewMap);

    bounds.push({
      id: view.id,
      name: view.name,
      cx,
      cy,
      radius,
      depth,
    });
  });

  bounds.sort((a, b) => a.depth - b.depth);

  return bounds;
}

