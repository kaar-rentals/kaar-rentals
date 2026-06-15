import React, { useState, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

const inputClassName =
  "w-full min-h-11 px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500";

const selectClassName =
  "w-full min-h-11 px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100";

function FilterFields({
  search,
  setSearch,
  city,
  setCity,
  category,
  setCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  activeCategory,
  categorySelectClass,
  onEnterApply,
  idPrefix = "",
}) {
  return (
    <>
      <div className="space-y-1.5">
        <label
          htmlFor={`${idPrefix}search`}
          className="text-sm font-medium text-foreground"
        >
          Search
        </label>
        <input
          id={`${idPrefix}search`}
          type="search"
          placeholder="Brand or model"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onEnterApply?.()}
          className={inputClassName}
          aria-label="Search brand or model"
        />
      </div>

      <div className="space-y-1.5">
        <CityAutocomplete
          value={city}
          onChange={setCity}
          label="City"
          placeholder="All cities"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={`${idPrefix}category`}
          className="text-sm font-medium text-foreground"
        >
          Vehicle type
        </label>
        <select
          id={`${idPrefix}category`}
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
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label
            htmlFor={`${idPrefix}minPrice`}
            className="text-sm font-medium text-foreground"
          >
            Min price
          </label>
          <input
            id={`${idPrefix}minPrice`}
            type="number"
            placeholder="Min PKR/day"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className={inputClassName}
            aria-label="Minimum price per day"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor={`${idPrefix}maxPrice`}
            className="text-sm font-medium text-foreground"
          >
            Max price
          </label>
          <input
            id={`${idPrefix}maxPrice`}
            type="number"
            placeholder="Max PKR/day"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className={inputClassName}
            aria-label="Maximum price per day"
          />
        </div>
      </div>
    </>
  );
}

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
  const [mobileOpen, setMobileOpen] = useState(false);

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

  function applyAndClose() {
    apply();
    setMobileOpen(false);
  }

  function clearFilters() {
    setSearch("");
    setCity("");
    setCategory(activeCategory || "");
    setMinPrice("");
    setMaxPrice("");
    onApply(activeCategory ? { category: activeCategory } : {});
    setMobileOpen(false);
  }

  const activeFilterCount = [city, category, minPrice, maxPrice].filter(
    Boolean
  ).length;

  const categorySelectClass =
    activeCategory && category === activeCategory
      ? `${selectClassName} border-primary ring-2 ring-primary/30 bg-primary/5 dark:bg-primary/10 dark:border-primary`
      : selectClassName;

  const fieldProps = {
    search,
    setSearch,
    city,
    setCity,
    category,
    setCategory,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    activeCategory,
    categorySelectClass,
  };

  return (
    <>
      {/* Mobile: quick search + filters sheet */}
      <div className="md:hidden space-y-3 p-3 bg-muted/60 dark:bg-zinc-900/80 border border-border dark:border-zinc-800 rounded-lg">
        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Search brand or model"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            className={`${inputClassName} flex-1`}
            aria-label="Search brand or model"
          />
          <Button
            type="button"
            onClick={apply}
            className="min-h-11 px-4 shrink-0"
          >
            Search
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setMobileOpen(true)}
          className="w-full min-h-11 justify-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 rounded-full bg-primary text-primary-foreground text-xs px-2 py-0.5">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Desktop: inline filters */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 p-4 bg-muted/60 dark:bg-zinc-900/80 border border-border dark:border-zinc-800 rounded-lg items-end">
        <input
          type="search"
          placeholder="Search brand or model"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          className={inputClassName}
          aria-label="Search brand or model"
        />
        <div className="xl:col-span-1">
          <CityAutocomplete
            value={city}
            onChange={setCity}
            label="City"
            placeholder="All cities"
          />
        </div>
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
          className={inputClassName}
          aria-label="Minimum price per day"
        />
        <input
          type="number"
          placeholder="Max PKR/day"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className={inputClassName}
          aria-label="Maximum price per day"
        />
        <Button type="button" onClick={apply} className="min-h-11 w-full">
          Apply
        </Button>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl max-h-[88vh] overflow-y-auto pb-8"
        >
          <SheetHeader className="text-left pb-2">
            <SheetTitle>Filter vehicles</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 py-2">
            <FilterFields
              {...fieldProps}
              idPrefix="mobile-"
              onEnterApply={applyAndClose}
            />
          </div>

          <SheetFooter className="flex-col gap-2 sm:flex-col pt-4">
            <Button
              type="button"
              onClick={applyAndClose}
              className="w-full min-h-11"
            >
              Show results
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              className="w-full min-h-11 gap-2"
            >
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
