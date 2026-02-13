import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { Node } from "../types.ts";
import NodeDrawer from "../components/NodeDrawer.tsx";
import Header from "../components/Header.tsx";
import Grid from "../components/Grid.tsx";
import { calculateDagreLayout, type NodePosition } from "../utils/forceLayout.ts";
import { computeViews, computeViewBounds, type ViewBounds } from "../utils/views.ts";

interface NodeListProps {
  nodes: Node[];
  onSaveNode: (node: Node) => void;
  onAddNode: (node: Node) => void;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

export default function NodeList({ nodes, onSaveNode, onAddNode }: NodeListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<NodePosition[]>([]);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [shouldAutoFit, setShouldAutoFit] = useState(false);
  const [showGrid, setShowGrid] = useState(() => {
    const saved = localStorage.getItem("showGrid");
    return saved !== null ? saved === "true" : true;
  });
  const [gridDensity, setGridDensity] = useState(() => {
    const saved = localStorage.getItem("gridDensity");
    return saved !== null ? parseInt(saved, 10) : 40;
  });

  useEffect(() => {
    if (nodes.length === 0) {
      setPositions([]);
      return;
    }

    const newPositions = calculateDagreLayout(nodes);
    setPositions(newPositions);
    setShouldAutoFit(true);
  }, [nodes]);

  const views = useMemo(() => computeViews(nodes), [nodes]);
  const viewBounds: ViewBounds[] = useMemo(
    () => computeViewBounds(views, positions),
    [views, positions]
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(transform.scale * delta, 0.1), 5);

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;

    const newX = mouseX - (mouseX - transform.x) * (newScale / transform.scale);
    const newY = mouseY - (mouseY - transform.y) * (newScale / transform.scale);

    setTransform({ x: newX, y: newY, scale: newScale });
  }, [transform]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('graph-canvas')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  }, [transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    }));
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const getPosition = (id: string) => positions.find((p) => p.id === id);

  const getConnectedNodeIds = (nodeId: string): Set<string> => {
    const pathNodes = new Set<string>();
    pathNodes.add(nodeId);

    const findPredecessors = (currentId: string): string[] => {
      const predecessors: string[] = [];
      nodes.forEach((n) => {
        if (n.next.includes(currentId)) {
          predecessors.push(n.id);
        }
      });
      return predecessors;
    };

    const traverseUp = (currentId: string) => {
      const predecessors = findPredecessors(currentId);
      predecessors.forEach((predId) => {
        if (!pathNodes.has(predId)) {
          pathNodes.add(predId);
          traverseUp(predId);
        }
      });
    };

    traverseUp(nodeId);
    return pathNodes;
  };

  const getStartingNodeIds = (nodeId: string): Set<string> => {
    const visited = new Set<string>();
    const startingNodes = new Set<string>();

    const findPredecessors = (currentId: string): string[] => {
      const predecessors: string[] = [];
      nodes.forEach((n) => {
        if (n.next.includes(currentId)) {
          predecessors.push(n.id);
        }
      });
      return predecessors;
    };

    const traverse = (currentId: string) => {
      if (visited.has(currentId)) return;
      visited.add(currentId);

      const predecessors = findPredecessors(currentId);
      if (predecessors.length === 0) {
        startingNodes.add(currentId);
      } else {
        predecessors.forEach((predId) => traverse(predId));
      }
    };

    traverse(nodeId);
    startingNodes.delete(nodeId);
    return startingNodes;
  };

  const getConnections = () => {
    const connections: { from: NodePosition; to: NodePosition; fromId: string; toId: string }[] = [];
    nodes.forEach((node) => {
      const fromPos = getPosition(node.id);
      if (!fromPos) return;

      node.next.forEach((nextId) => {
        const toPos = getPosition(nextId);
        if (toPos) {
          connections.push({ from: fromPos, to: toPos, fromId: node.id, toId: nextId });
        }
      });
    });
    return connections;
  };

  const connectedNodes = hoveredNodeId ? getConnectedNodeIds(hoveredNodeId) : null;
  const startingNodes = hoveredNodeId ? getStartingNodeIds(hoveredNodeId) : null;

  const zoomPresets: { label: string; value: "auto" | number }[] = [
    { label: "Auto", value: "auto" },
    { label: "50%", value: 0.5 },
    { label: "75%", value: 0.75 },
    { label: "100%", value: 1 },
    { label: "125%", value: 1.25 },
    { label: "150%", value: 1.5 },
    { label: "200%", value: 2 },
  ];

  const zoomIn = () => {
    setTransform(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 5) }));
  };

  const zoomOut = () => {
    setTransform(prev => ({ ...prev, scale: Math.max(prev.scale * 0.8, 0.1) }));
  };

  const fitAllNodes = useCallback(() => {
    if (positions.length === 0) return;

    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const nodeRadius = 50;
    const minX = Math.min(...positions.map((p) => p.x)) - nodeRadius;
    const maxX = Math.max(...positions.map((p) => p.x)) + nodeRadius;
    const minY = Math.min(...positions.map((p) => p.y)) - nodeRadius;
    const maxY = Math.max(...positions.map((p) => p.y)) + nodeRadius;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    const padding = 80;
    const scaleX = (containerWidth - padding * 2) / contentWidth;
    const scaleY = (containerHeight - padding * 2) / contentHeight;
    const newScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.1), 2);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setTransform({
      x: -centerX * newScale,
      y: -centerY * newScale,
      scale: newScale,
    });
  }, [positions]);

  useEffect(() => {
    if (shouldAutoFit && positions.length > 0) {
      fitAllNodes();
      setShouldAutoFit(false);
    }
  }, [shouldAutoFit, positions, fitAllNodes]);

  const handleZoomPreset = (value: "auto" | number) => {
    if (value === "auto") {
      fitAllNodes();
    } else {
      setTransform(prev => ({ ...prev, scale: value }));
    }
  };

  const handleToggleGrid = () => {
    setShowGrid(prev => {
      const newValue = !prev;
      localStorage.setItem("showGrid", String(newValue));
      return newValue;
    });
  };

  const handleGridDensityChange = (density: number) => {
    setGridDensity(density);
    localStorage.setItem("gridDensity", String(density));
  };

  const getZoomLabel = () => {
    const percentage = Math.round(transform.scale * 100);
    const preset = zoomPresets.find(p => p.value === transform.scale);
    if (preset && typeof preset.value === "number") {
      return preset.label;
    }
    if (transform.scale === 1 && transform.x === 0 && transform.y === 0) {
      return "Auto";
    }
    return `${percentage}%`;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = nodes.find(
      (n) =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (found) {
      setSelectedNodeId(found.id);
      setSearchQuery("");
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setIsAddMode(false);
    setSelectedNodeId(nodeId);
  };

  const handleCloseDrawer = () => {
    setSelectedNodeId(null);
    setIsAddMode(false);
  };

  const handleAddNodeClick = () => {
    setSelectedNodeId(null);
    setIsAddMode(true);
  };

  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) || null : null;

  const filteredNodes = searchQuery
    ? nodes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const searchResultIds = new Set(filteredNodes.map((n) => n.id));

  useEffect(() => {
    if (filteredNodes.length === 0 || positions.length === 0) return;

    const matchingPositions = positions.filter((p) => searchResultIds.has(p.id));
    if (matchingPositions.length === 0) return;

    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const minX = Math.min(...matchingPositions.map((p) => p.x));
    const maxX = Math.max(...matchingPositions.map((p) => p.x));
    const minY = Math.min(...matchingPositions.map((p) => p.y));
    const maxY = Math.max(...matchingPositions.map((p) => p.y));

    const padding = 100;
    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;

    const scaleX = containerWidth / contentWidth;
    const scaleY = containerHeight / contentHeight;
    const newScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.3), 2);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setTransform({
      x: -centerX * newScale,
      y: -centerY * newScale,
      scale: newScale,
    });
  }, [searchQuery, filteredNodes.length, positions]);

  return (
    <div className="graph-page">
      <div
        className="graph-container"
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Grid show={showGrid} density={gridDensity} transform={transform} />
        <div
          className="graph-canvas"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          }}
        >
          <svg className="graph-lines">
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="10"
                markerHeight="10"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#666" />
              </marker>
              <marker
                id="arrow-highlighted"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="10"
                markerHeight="10"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#888" />
              </marker>
              <marker
                id="arrow-dimmed"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="10"
                markerHeight="10"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#666" fillOpacity="0.15" />
              </marker>
            </defs>
            {viewBounds.map((view) => (
              <g key={view.id} className="view-group">
                <circle
                  cx={view.cx}
                  cy={view.cy}
                  r={view.radius}
                  className={`view-circle depth-${view.depth}`}
                />
                <text
                  x={view.cx}
                  y={view.cy - view.radius - 10}
                  className="view-label"
                  textAnchor="middle"
                >
                  {view.name}
                </text>
              </g>
            ))}
            {getConnections().map((conn, idx) => {
              const isHighlighted = connectedNodes &&
                (connectedNodes.has(conn.fromId) && connectedNodes.has(conn.toId));
              const isHoverDimmed = connectedNodes && !isHighlighted;
              const isSearchDimmed = searchQuery &&
                !(searchResultIds.has(conn.fromId) && searchResultIds.has(conn.toId));
              const isDimmed = isHoverDimmed || isSearchDimmed;
              const midX = (conn.from.x + conn.to.x) / 2;
              const midY = (conn.from.y + conn.to.y) / 2;
              const markerId = isDimmed ? "arrow-dimmed" : isHighlighted ? "arrow-highlighted" : "arrow";
              return (
                <g key={idx}>
                  <line
                    x1={conn.from.x}
                    y1={conn.from.y}
                    x2={conn.to.x}
                    y2={conn.to.y}
                    className={`graph-line ${isHighlighted ? "highlighted" : ""} ${isDimmed ? "dimmed" : ""}`}
                  />
                  <line
                    x1={conn.from.x}
                    y1={conn.from.y}
                    x2={midX}
                    y2={midY}
                    stroke="transparent"
                    strokeWidth="1"
                    markerEnd={`url(#${markerId})`}
                  />
                </g>
              );
            })}
          </svg>

          {nodes.map((node) => {
            const pos = getPosition(node.id);
            if (!pos) return null;
            const isConnected = connectedNodes ? connectedNodes.has(node.id) : true;
            const isSearchResult = searchResultIds.has(node.id);
            const isSearchDimmed = searchQuery && !isSearchResult;
            const isStartingNode = startingNodes ? startingNodes.has(node.id) : false;
            return (
              <button
                key={node.id}
                className={`graph-node ${!isConnected || isSearchDimmed ? "dimmed" : ""} ${hoveredNodeId === node.id ? "hovered" : ""} ${isSearchResult ? "search-result" : ""} ${isStartingNode ? "starting-node" : ""}`}
                onClick={() => handleNodeClick(node.id)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                style={{
                  left: pos.x,
                  top: pos.y,
                }}
              >
                {node.title}
              </button>
            );
          })}
        </div>
      </div>

      <Header
        zoomLabel={getZoomLabel()}
        zoomPresets={zoomPresets}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onZoomPreset={handleZoomPreset}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        filteredNodes={filteredNodes}
        onNodeClick={handleNodeClick}
        onAddNodeClick={handleAddNodeClick}
        showGrid={showGrid}
        onToggleGrid={handleToggleGrid}
        gridDensity={gridDensity}
        onGridDensityChange={handleGridDensityChange}
      />

      <NodeDrawer
        node={selectedNode}
        nodes={nodes}
        onClose={handleCloseDrawer}
        onNodeClick={handleNodeClick}
        onSave={onSaveNode}
        isAddMode={isAddMode}
        onAdd={onAddNode}
      />
    </div>
  );
}

