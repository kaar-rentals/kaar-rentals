import React, { useState, useEffect } from "react";
import citiesData from "@/data/cities.json";

const inputClassName =
  "px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500";

const selectClassName =
  "px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100";

export default function FilterBar({
  onApply,
  initialFilters = {},
  activeCategory,
}) {
  const [search, setSearch] = useState(initialFilters.search || "");
  const [city, setCity] = useState(initialFilters.city || "");
  const [category, setCategory] = useState(initialFilters.category || "");
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || "");

  useEffect(() => {
    setSearch(initialFilters.search || "");
    setCity(initialFilters.city || "");
    setCategory(initialFilters.category || activeCategory || "");
    setMinPrice(initialFilters.minPrice || "");
    setMaxPrice(initialFilters.maxPrice || "");
  }, [
    initialFilters.search,
    initialFilters.city,
    initialFilters.category,
    initialFilters.minPrice,
    initialFilters.maxPrice,
    activeCategory,
  ]);

  function buildQuery() {
    const q = {};
    if (search) q.search = search;
    if (city) q.city = city;
    if (category) q.category = category;
    if (minPrice) q.minPrice = minPrice;
    if (maxPrice) q.maxPrice = maxPrice;
    return q;
  }

  function apply() {
    onApply(buildQuery());
  }

  const categorySelectClass =
    activeCategory && category === activeCategory
      ? `${selectClassName} border-primary ring-2 ring-primary/30 bg-primary/5 dark:bg-primary/10 dark:border-primary`
      : selectClassName;

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-muted/60 dark:bg-zinc-900/80 border border-border dark:border-zinc-800 rounded-lg mb-4">
      <input
        type="search"
        placeholder="Search brand or model"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && apply()}
        className={`${inputClassName} flex-1 min-w-[200px]`}
        aria-label="Search brand or model"
      />
      <select
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className={selectClassName}
        aria-label="Filter by city"
      >
        <option value="">All cities</option>
        {citiesData.map((cityName) => (
          <option key={cityName} value={cityName}>
            {cityName}
          </option>
        ))}
      </select>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        aria-label="Vehicle category"
        className={categorySelectClass}
      >
        <option value="">All types</option>
        <option value="Sedan">Sedan</option>
        <option value="SUV">SUV</option>
        <option value="Hatchback">Hatchback</option>
      </select>
      <input
        type="number"
        placeholder="Min PKR/day"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        className={`${inputClassName} w-[120px]`}
        aria-label="Minimum price per day"
      />
      <input
        type="number"
        placeholder="Max PKR/day"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        className={`${inputClassName} w-[120px]`}
        aria-label="Maximum price per day"
      />
      <button
        type="button"
        onClick={apply}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors dark:focus:ring-offset-zinc-950"
      >
        Apply
      </button>
    </div>
  );
}
