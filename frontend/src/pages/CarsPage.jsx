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
    <div>
      <FilterBar onApply={q=>{ setQuery(q); setPage(1); }} />
      <div className="listing-grid">
        {cars.map(c => <ListingCard key={c._id} car={c} isAuthenticated={isAuthenticated} />)}
      </div>
      <div className="pagination">
        <button disabled={page===1} onClick={()=>setPage(p=>p-1)}>Prev</button>
        <span>Page {page}</span>
        <button onClick={()=>setPage(p=>p+1)}>Next</button>
      </div>
    </div>
  );
}


