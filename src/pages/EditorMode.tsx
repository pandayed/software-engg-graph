import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Node } from "../types.ts";
import { validateNode } from "../utils/validation.ts";
import Markdown from "../components/Markdown.tsx";

interface EditorModeProps {
  nodes: Node[];
  onSave: (node: Node) => void;
}

export default function EditorMode({ nodes, onSave }: EditorModeProps) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Node>({
    id: "",
    title: "",
    text: "",
    prerequisites: [],
    next: [],
  });

  const [prerequisitesText, setPrerequisitesText] = useState("");
  const [nextText, setNextText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const prerequisites = prerequisitesText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const next = nextText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const nodeToSave: Node = {
      ...formData,
      prerequisites,
      next,
    };

    const validationError = validateNode(nodeToSave, nodes, false);
    if (validationError) {
      setError(validationError);
      return;
    }

    onSave(nodeToSave);
    navigate("/");
  };

  return (
    <div className="page">
      <div className="header">
        <h1>Add New Node</h1>
        <button onClick={() => navigate("/")} className="btn">Cancel</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-group">
          <label htmlFor="id">ID *</label>
          <input
            type="text"
            id="id"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}

            required
          />
          <small>Must be kebab-case (e.g., my-node-id)</small>
        </div>

        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <div className="text-field-header">
            <label htmlFor="text">Text * (Markdown)</label>
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
              <Markdown content={formData.text} />
            </div>
          ) : (
            <textarea
              id="text"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              rows={12}
              required
              placeholder="Write in Markdown format..."
            />
          )}
          <small>Supports Markdown formatting</small>
        </div>

        <div className="form-group">
          <label htmlFor="prerequisites">Prerequisites</label>
          <input
            type="text"
            id="prerequisites"
            value={prerequisitesText}
            onChange={(e) => setPrerequisitesText(e.target.value)}
            placeholder="Comma-separated node IDs"
          />
          <small>Comma-separated list of prerequisite node IDs</small>
        </div>

        <div className="form-group">
          <label htmlFor="next">Next Topics</label>
          <input
            type="text"
            id="next"
            value={nextText}
            onChange={(e) => setNextText(e.target.value)}
            placeholder="Comma-separated node IDs"
          />
          <small>Comma-separated list of next topic node IDs</small>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Add Node
          </button>
          <button type="button" onClick={() => navigate("/")} className="btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

