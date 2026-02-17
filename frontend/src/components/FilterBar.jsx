import React, { useState } from "react";
import citiesData from "@/data/cities.json";

export default function FilterBar({ onApply }) {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  function apply() {
    const q = {};
    if (search) q.search = search;
    if (city) q.city = city;
    if (category) q.category = category;
    if (minPrice) q.minPrice = minPrice;
    if (maxPrice) q.maxPrice = maxPrice;
    onApply(q);
  }

  return (
    <div style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "1rem",
      padding: "1rem",
      backgroundColor: "#f9fafb",
      borderRadius: "8px",
      marginBottom: "1rem"
    }}>
      <input 
        placeholder="Search brand or model" 
        value={search} 
        onChange={e=>setSearch(e.target.value)} 
        onKeyDown={e=> e.key==='Enter' && apply()}
        style={{
          padding: "0.5rem",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          flex: "1",
          minWidth: "200px"
        }}
      />
      <select 
        value={city} 
        onChange={e=>setCity(e.target.value)}
        style={{
          padding: "0.5rem",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          backgroundColor: "white"
        }}
      >
        <option value="">All cities</option>
        {citiesData.map((cityName) => (
          <option key={cityName} value={cityName}>{cityName}</option>
        ))}
      </select>
      <select 
        value={category} 
        onChange={e=>setCategory(e.target.value)}
        style={{
          padding: "0.5rem",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          backgroundColor: "white"
        }}
      >
        <option value="">All types</option>
        <option>Sedan</option>
        <option>SUV</option>
        <option>Hatchback</option>
      </select>
      <input 
        placeholder="Min PKR/day" 
        value={minPrice} 
        onChange={e=>setMinPrice(e.target.value)}
        style={{
          padding: "0.5rem",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          width: "120px"
        }}
      />
      <input 
        placeholder="Max PKR/day" 
        value={maxPrice} 
        onChange={e=>setMaxPrice(e.target.value)}
        style={{
          padding: "0.5rem",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          width: "120px"
        }}
      />
      <button 
        onClick={apply}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "500"
        }}
      >
        Apply
      </button>
    </div>
  );
}


