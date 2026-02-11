import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import type { Node } from "./types.ts";
import { loadNodes } from "./utils/yaml.ts";
import NodeList from "./pages/NodeList.tsx";
import NodeDetail from "./pages/NodeDetail.tsx";
import EditorMode from "./pages/EditorMode.tsx";
import "./App.css";

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNodes()
      .then((data) => {
        setNodes(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleSaveNode = (node: Node) => {
    setNodes((prev) => prev.map((n) => (n.id === node.id ? node : n)));
  };

  const handleAddNode = (node: Node) => {
    setNodes((prev) => [...prev, node]);
  };

  if (loading) {
    return <div className="loading">Loading nodes...</div>;
  }

  if (error) {
    return <div className="error">Error loading nodes: {error}</div>;
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<NodeList nodes={nodes} onSaveNode={handleSaveNode} onAddNode={handleAddNode} />} />
          <Route path="/node/:id" element={<NodeDetail nodes={nodes} />} />
          <Route
            path="/editor"
            element={<EditorMode nodes={nodes} onSave={handleAddNode} />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
