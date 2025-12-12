import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function App() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/workspaces`)
      .then((r) => r.json())
      .then((data) => {
        console.log("Loaded workspaces:", data);
        setWorkspaces(data);
      })
      .catch((err) => console.error("Workspace error:", err));
  }, []);

  const loadNodes = (ws) => {
    console.log("Clicked workspace:", ws.id);
    setSelected(ws);

    fetch(`${API_BASE}/api/nodes?workspaceId=${ws.id}`)
      .then((r) => r.json())
      .then((data) => {
        console.log("Loaded nodes:", data);
        setNodes(data);
      })
      .catch((err) => console.error("Node error:", err));
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", color: "#fff", backgroundColor: "#000", minHeight: "100vh" }}>
      <h1 style={{ color: "#fff" }}>Continuum Minimal Test UI</h1>

      <h2 style={{ color: "#fff" }}>Workspaces</h2>
      <table style={{ border: "1px solid #fff", color: "#fff", borderCollapse: "collapse" }} cellPadding={6}>
        <thead>
          <tr>
            <th style={{ color: "#fff", border: "1px solid #fff", padding: "8px" }}>Tenant</th>
            <th style={{ color: "#fff", border: "1px solid #fff", padding: "8px" }}>Workspace</th>
            <th style={{ color: "#fff", border: "1px solid #fff", padding: "8px" }}>Nodes</th>
            <th style={{ color: "#fff", border: "1px solid #fff", padding: "8px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {workspaces.map((ws) => (
            <tr key={ws.id}>
              <td style={{ color: "#fff", border: "1px solid #fff", padding: "8px" }}>{ws.tenant.name}</td>
              <td style={{ color: "#fff", border: "1px solid #fff", padding: "8px" }}>{ws.name}</td>
              <td style={{ color: "#fff", border: "1px solid #fff", padding: "8px" }}>{ws._count.nodes}</td>
              <td style={{ color: "#fff", border: "1px solid #fff", padding: "8px" }}>
                <button onClick={() => loadNodes(ws)} style={{ color: "#000", backgroundColor: "#fff", padding: "6px 12px", border: "none", cursor: "pointer" }}>View Nodes</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ color: "#fff" }}>Nodes</h2>
      {!selected && <p style={{ color: "#fff" }}>No workspace selected yet.</p>}
      {selected && (
        <>
          <p style={{ color: "#fff" }}>Selected workspace: {selected.name}</p>
          {nodes.length === 0 ? (
            <p style={{ color: "#fff" }}>No nodes found.</p>
          ) : (
            <ul style={{ color: "#fff" }}>
              {nodes.map((n) => (
                <li key={n.id} style={{ color: "#fff" }}>{n.name}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
