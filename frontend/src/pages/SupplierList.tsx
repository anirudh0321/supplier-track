import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../api';

const accent = "#4f8cff";
const accentLight = "#e3f0ff";
const accentDark = "#1a237e";
const bg = "#f8faff";

const SupplierList: React.FC = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newOpening, setNewOpening] = useState('');
  const [addError, setAddError] = useState('');

  const fetchSuppliers = () => {
    setLoading(true);
    fetch(`${API_BASE}/suppliers`)
      .then(res => res.json())
      .then(data => {
        setSuppliers(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!newName.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        setAddError(err.error || 'Error adding supplier');
        return;
      }
      setNewName('');
      setNewOpening('');
      setShowAdd(false);
      fetchSuppliers();
    } catch (err) {
      setAddError('Network error');
    }
  };

  return (
    <div style={{
      maxWidth: 900,
      margin: "2rem auto",
      background: bg,
      borderRadius: 16,
      boxShadow: "0 4px 24px #4f8cff22",
      padding: "2rem 1rem",
      color: accentDark,
      fontFamily: "Inter, system-ui, sans-serif"
    }}>
      <style>{`
        @media (max-width: 600px) {
          .supplier-header {
            flex-direction: column;
            align-items: stretch !important;
            gap: 1rem;
          }
          .supplier-table-wrap {
            overflow-x: auto;
          }
          .supplier-table th, .supplier-table td {
            font-size: 15px !important;
            padding: 10px 6px !important;
          }
        }
      `}</style>
      <div className="supplier-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, gap: 24 }}>
        <h1 style={{ color: accentDark, fontWeight: 800, fontSize: 32, letterSpacing: -1, margin: 0 }}>Supplier List</h1>
        <button
          onClick={() => setShowAdd((v) => !v)}
          style={{
            background: accent,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "12px 28px",
            fontWeight: 700,
            fontSize: 18,
            cursor: "pointer",
            boxShadow: "0 2px 8px #4f8cff33",
            transition: "background 0.2s",
            width: "100%",
            maxWidth: 220
          }}
        >
          + Add Supplier
        </button>
      </div>
      {showAdd && (
        <form onSubmit={handleAddSupplier} style={{ background: accentLight, padding: 20, borderRadius: 10, marginBottom: 32, display: 'flex', gap: 16, alignItems: 'center', boxShadow: '0 2px 8px #4f8cff11', color: accentDark, flexWrap: 'wrap' }}>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Supplier Name"
            style={{ flex: 2, padding: 12, borderRadius: 6, border: '1px solid #b3d1ff', fontSize: 16, color: accentDark, background: '#fff', minWidth: 0 }}
            required
          />
          <input
            type="number"
            value={newOpening}
            onChange={e => setNewOpening(e.target.value)}
            placeholder="Opening Balance (not used)"
            style={{ flex: 1, padding: 12, borderRadius: 6, border: '1px solid #b3d1ff', fontSize: 16, color: accentDark, background: '#fff', minWidth: 0 }}
            disabled
          />
          <button type="submit" style={{ background: accent, color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #4f8cff22', width: '100%', maxWidth: 120 }}>Add</button>
          {addError && <span style={{ color: 'red', marginLeft: 12 }}>{addError}</span>}
        </form>
      )}
      <div className="supplier-table-wrap" style={{ width: '100%', overflowX: 'auto' }}>
        <table className="supplier-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px #4f8cff11', color: accentDark, border: '1px solid #b3d1ff', minWidth: 350 }}>
          <thead>
            <tr style={{ background: accentLight }}>
              <th style={{ borderBottom: '2px solid #b3d1ff', padding: '14px 10px', color: accentDark, fontWeight: 700, fontSize: 18 }}>Name</th>
              <th style={{ borderBottom: '2px solid #b3d1ff', padding: '14px 10px', color: accentDark, fontWeight: 700, fontSize: 18 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={2} style={{ textAlign: 'center', color: accentDark, padding: 24 }}>Loading...</td></tr>
            ) : suppliers.length === 0 ? (
              <tr><td colSpan={2} style={{ textAlign: 'center', color: accentDark, padding: 24 }}>No suppliers found.</td></tr>
            ) : suppliers.map((name, idx) => (
              <tr
                key={name}
                style={{ cursor: 'pointer', background: idx % 2 === 0 ? '#f8faff' : '#e3f0ff', transition: 'background 0.2s', color: accentDark }}
                onClick={() => navigate(`/supplier/${encodeURIComponent(name)}`)}
                onMouseOver={e => (e.currentTarget.style.background = accentLight)}
                onMouseOut={e => (e.currentTarget.style.background = idx % 2 === 0 ? '#f8faff' : '#e3f0ff')}
              >
                <td style={{ padding: '14px 10px', borderBottom: '1px solid #e3f0ff', color: accentDark, fontWeight: 500, fontSize: 16 }}>{name}</td>
                <td style={{ padding: '14px 10px', borderBottom: '1px solid #e3f0ff', color: accentDark, fontWeight: 500, fontSize: 16 }}>View</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplierList; 