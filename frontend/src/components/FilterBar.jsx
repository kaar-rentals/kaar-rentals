import React, { useState } from "react";

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
    <div className="filter-bar">
      <input placeholder="Search brand or model" value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=> e.key==='Enter' && apply()} />
      <select value={city} onChange={e=>setCity(e.target.value)}>
        <option value="">All cities</option><option>Karachi</option><option>Lahore</option><option>Islamabad</option>
      </select>
      <select value={category} onChange={e=>setCategory(e.target.value)}>
        <option value="">All types</option><option>Sedan</option><option>SUV</option><option>Hatchback</option>
      </select>
      <input placeholder="Min PKR/day" value={minPrice} onChange={e=>setMinPrice(e.target.value)} />
      <input placeholder="Max PKR/day" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} />
      <button onClick={apply}>Apply</button>
    </div>
  );
}


