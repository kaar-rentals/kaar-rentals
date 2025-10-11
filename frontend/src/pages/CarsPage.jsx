import React, { useState, useEffect } from "react";
import FilterBar from "../components/FilterBar";
import ListingCard from "../components/ListingCard";

export default function CarsPage() {
  const [cars, setCars] = useState([]);
  const [query, setQuery] = useState({});
  const [page, setPage] = useState(1);
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  useEffect(() => {
    async function load() {
      const qs = new URLSearchParams({ ...query, page, limit: 12 }).toString();
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/cars?${qs}`, { headers });
      const json = await res.json();
      setCars(json.cars || []);
    }
    load();
  }, [query, page, token]);

  return (
    <div style={{ padding: "1rem", maxWidth: "1200px", margin: "0 auto" }}>
      <FilterBar onApply={q=>{ setQuery(q); setPage(1); }} />
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "1rem",
        marginTop: "2rem"
      }}>
        {cars.map(c => <ListingCard key={c._id} car={c} isAuthenticated={isAuthenticated} />)}
      </div>
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "1rem",
        marginTop: "2rem"
      }}>
        <button 
          disabled={page===1} 
          onClick={()=>setPage(p=>p-1)}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: page === 1 ? "#e5e7eb" : "#3b82f6",
            color: page === 1 ? "#9ca3af" : "white",
            border: "none",
            borderRadius: "6px",
            cursor: page === 1 ? "not-allowed" : "pointer"
          }}
        >
          Prev
        </button>
        <span style={{ fontSize: "1rem", fontWeight: "500" }}>Page {page}</span>
        <button 
          onClick={()=>setPage(p=>p+1)}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}


