import { useParams, Link, useNavigate } from "react-router-dom";
import type { Node } from "../types.ts";
import Markdown from "../components/Markdown.tsx";

interface NodeDetailProps {
  nodes: Node[];
}

export default function NodeDetail({ nodes }: NodeDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const node = nodes.find((n) => n.id === id);

  if (!node) {
    return (
      <div className="page">
        <h1>Node not found</h1>
        <Link to="/" className="btn">Back to List</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="header">
        <h1>{node.title}</h1>
        <div>
          <button onClick={() => navigate(`/editor?id=${node.id}`)} className="btn btn-secondary">
            Edit
          </button>
          <Link to="/" className="btn">Back to List</Link>
        </div>
      </div>

      <div className="node-detail">
        <div className="detail-section">
          <label>ID:</label>
          <span>{node.id}</span>
        </div>

        <div className="detail-section">
          <Markdown content={node.text} />
        </div>

        <div className="detail-section">
          <label>Prerequisites:</label>
          {node.prerequisites.length === 0 ? (
            <span className="empty">None</span>
          ) : (
            <ul>
              {node.prerequisites.map((prereqId) => {
                const prereq = nodes.find((n) => n.id === prereqId);
                return (
                  <li key={prereqId}>
                    {prereq ? (
                      <Link to={`/node/${prereqId}`}>{prereq.title}</Link>
                    ) : (
                      <span>{prereqId}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="detail-section">
          <label>Next Topics:</label>
          {node.next.length === 0 ? (
            <span className="empty">None</span>
          ) : (
            <ul>
              {node.next.map((nextId) => {
                const nextNode = nodes.find((n) => n.id === nextId);
                return (
                  <li key={nextId}>
                    {nextNode ? (
                      <Link to={`/node/${nextId}`}>{nextNode.title}</Link>
                    ) : (
                      <span>{nextId}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

