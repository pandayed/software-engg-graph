import { useState, useEffect, useRef, useCallback } from "react";
import type { Node } from "../types.ts";
import Markdown from "./Markdown.tsx";
import { validateNode } from "../utils/validation.ts";

interface NodeDrawerProps {
  node: Node | null;
  nodes: Node[];
  onClose: () => void;
  onNodeClick: (nodeId: string) => void;
  onSave: (node: Node) => void;
  isAddMode?: boolean;
  onAdd?: (node: Node) => void;
}

const DRAWER_WIDTH_KEY = "drawer-width";
const DEFAULT_WIDTH = 450;

export default function NodeDrawer({ node, nodes, onClose, onNodeClick, onSave, isAddMode = false, onAdd }: NodeDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<Node | null>(null);
  const [prerequisitesText, setPrerequisitesText] = useState("");
  const [nextText, setNextText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [prereqOpen, setPrereqOpen] = useState(false);
  const [nextOpen, setNextOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(() => {
    const saved = localStorage.getItem(DRAWER_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const [isDragging, setIsDragging] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAddMode) {
      setFormData({ id: "", title: "", text: "", prerequisites: [], next: [], directoryPath: "" });
      setPrerequisitesText("");
      setNextText("");
      setIsEditing(true);
      setShowPreview(false);
      setError(null);
      setPrereqOpen(true);
      setNextOpen(true);
    } else if (node) {
      setFormData({ ...node });
      setPrerequisitesText(node.prerequisites.join(", "));
      setNextText(node.next.join(", "));
      setIsEditing(false);
      setShowPreview(false);
      setError(null);
      setPrereqOpen(false);
      setNextOpen(false);
    }
  }, [node, isAddMode]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newWidth = window.innerWidth - e.clientX;
    const clampedWidth = Math.max(320, Math.min(newWidth, window.innerWidth * 0.8));
    setDrawerWidth(clampedWidth);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem(DRAWER_WIDTH_KEY, drawerWidth.toString());
    }
  }, [isDragging, drawerWidth]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isOpen = (node !== null && formData !== null) || isAddMode;

  const displayNode = node || { id: "", title: "", text: "", prerequisites: [], next: [], directoryPath: "" };
  const displayFormData = formData || { id: "", title: "", text: "", prerequisites: [], next: [], directoryPath: "" };

  const handleEdit = () => {
    setIsEditing(true);
    setShowPreview(false);
  };

  const handleCancel = () => {
    if (isAddMode) {
      onClose();
      return;
    }
    if (node) {
      setFormData({ ...node });
      setPrerequisitesText(node.prerequisites.join(", "));
      setNextText(node.next.join(", "));
    }
    setIsEditing(false);
    setShowPreview(false);
    setError(null);
  };

  const handleSave = () => {
    if (!formData) return;

    const prerequisites = prerequisitesText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const next = nextText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const nodeToSave: Node = {
      id: formData.id,
      title: formData.title,
      text: formData.text,
      prerequisites,
      next,
      directoryPath: formData.directoryPath,
    };

    const validationError = validateNode(nodeToSave, nodes, !isAddMode);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (isAddMode && onAdd) {
      onAdd(nodeToSave);
    } else {
      onSave(nodeToSave);
    }
    setIsEditing(false);
    setError(null);
    onClose();
  };

  const renderAccordion = (
    title: string,
    isOpenState: boolean,
    toggleOpen: () => void,
    content: React.ReactNode,
    position: "top" | "bottom" = "top"
  ) => (
    <div className={`accordion accordion-${position}`}>
      {position === "bottom" && (
        <div className={`accordion-content ${isOpenState ? "open" : ""}`}>
          {content}
        </div>
      )}
      <button className="accordion-header" onClick={toggleOpen}>
        <span>{title}</span>
        <svg
          className={`accordion-icon ${isOpenState ? "open" : ""}`}
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {position === "top" && (
        <div className={`accordion-content ${isOpenState ? "open" : ""}`}>
          {content}
        </div>
      )}
    </div>
  );

  const renderPrerequisites = () => {
    if (isEditing) {
      return (
        <>
          <input
            type="text"
            value={prerequisitesText}
            onChange={(e) => setPrerequisitesText(e.target.value)}
            placeholder="Comma-separated node IDs"
          />
          <small>Comma-separated list of prerequisite node IDs</small>
        </>
      );
    }
    if (displayNode.prerequisites.length === 0) {
      return <span className="empty">None</span>;
    }
    return (
      <ul>
        {displayNode.prerequisites.map((prereqId) => {
          const prereq = nodes.find((n) => n.id === prereqId);
          return (
            <li key={prereqId}>
              {prereq ? (
                <button className="link-btn" onClick={() => onNodeClick(prereqId)}>
                  {prereq.title}
                </button>
              ) : (
                <span>{prereqId}</span>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  const renderNextTopics = () => {
    if (isEditing) {
      return (
        <>
          <input
            type="text"
            value={nextText}
            onChange={(e) => setNextText(e.target.value)}
            placeholder="Comma-separated node IDs"
          />
          <small>Comma-separated list of next topic node IDs</small>
        </>
      );
    }
    if (displayNode.next.length === 0) {
      return <span className="empty">None</span>;
    }
    return (
      <ul>
        {displayNode.next.map((nextId) => {
          const nextNode = nodes.find((n) => n.id === nextId);
          return (
            <li key={nextId}>
              {nextNode ? (
                <button className="link-btn" onClick={() => onNodeClick(nextId)}>
                  {nextNode.title}
                </button>
              ) : (
                <span>{nextId}</span>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className={`drawer-overlay ${isOpen ? "open" : ""}`} onClick={handleOverlayClick}>
      <div
        ref={drawerRef}
        className="drawer"
        style={{ "--drawer-width": `${drawerWidth}px` } as React.CSSProperties}
      >
        <div
          className={`drawer-resize-handle ${isDragging ? "dragging" : ""}`}
          onMouseDown={handleResizeStart}
        />
        <div className="drawer-header">
          <div className="drawer-title-section">
            {isEditing ? (
              <>
                <input
                  type="text"
                  className="drawer-title-input"
                  value={displayFormData.title}
                  onChange={(e) => setFormData({ ...displayFormData, title: e.target.value })}
                  placeholder="Node Title"
                />
                {isAddMode && (
                  <input
                    type="text"
                    className="drawer-id-input"
                    value={displayFormData.id}
                    onChange={(e) => setFormData({ ...displayFormData, id: e.target.value })}
                    placeholder="node-id (kebab-case)"
                  />
                )}
              </>
            ) : (
              <h2>{displayNode.title}</h2>
            )}
            {!isAddMode && <span className="drawer-id">{displayNode.id}</span>}
          </div>
          <button className="drawer-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && <div className="drawer-error">{error}</div>}

        <div className="drawer-content">
          {renderAccordion(
            `Prerequisites (${displayNode.prerequisites.length})`,
            prereqOpen || isEditing,
            () => !isEditing && setPrereqOpen(!prereqOpen),
            renderPrerequisites(),
            "top"
          )}

          <div className="drawer-main-content">
            {isEditing ? (
              <>
                <div className="text-field-header">
                  <label>Content (Markdown)</label>
                  <button
                    type="button"
                    className="btn btn-small"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? "Edit" : "Preview"}
                  </button>
                </div>
                {showPreview ? (
                  <div className="markdown-preview">
                    <Markdown content={displayFormData.text} />
                  </div>
                ) : (
                  <textarea
                    value={displayFormData.text}
                    onChange={(e) => setFormData({ ...displayFormData, text: e.target.value })}
                    rows={12}
                    placeholder="Write in Markdown format..."
                  />
                )}
              </>
            ) : (
              <Markdown content={displayNode.text} />
            )}
          </div>

          {renderAccordion(
            `Next Topics (${displayNode.next.length})`,
            nextOpen || isEditing,
            () => !isEditing && setNextOpen(!nextOpen),
            renderNextTopics(),
            "bottom"
          )}
        </div>

        <div className="drawer-footer">
          {isEditing ? (
            <>
              <button className="btn btn-primary" onClick={handleSave}>
                {isAddMode ? "Add Node" : "Save"}
              </button>
              <button className="btn" onClick={handleCancel}>
                Cancel
              </button>
            </>
          ) : (
            <button className="btn btn-secondary" onClick={handleEdit}>
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

