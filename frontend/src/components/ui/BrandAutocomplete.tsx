import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Fuse from 'fuse.js';
import brandsData from '@/data/brands.json';

interface BrandAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

const BrandAutocomplete: React.FC<BrandAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Select brand",
  label = "Brand",
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);
  const [filteredBrands, setFilteredBrands] = useState<string[]>(brandsData);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Initialize Fuse.js for fuzzy search
  const fuse = new Fuse(brandsData, {
    threshold: 0.3,
    includeScore: true,
  });

  // Filter brands based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBrands(brandsData.slice(0, 10)); // Show first 10 brands when empty
    } else {
      const results = fuse.search(searchQuery);
      setFilteredBrands(results.map(result => result.item).slice(0, 10));
    }
    setSelectedIndex(-1);
  }, [searchQuery]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsOpen(true);
    onChange(query);
  };

  // Handle brand selection
  const handleBrandSelect = (brand: string) => {
    setSearchQuery(brand);
    onChange(brand);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
        setSelectedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredBrands.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredBrands.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredBrands.length) {
          handleBrandSelect(filteredBrands[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="relative">
      <Label htmlFor="brand-autocomplete">{label}</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id="brand-autocomplete"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          className="pr-10"
          autoComplete="off"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Button>
      </div>

      {isOpen && filteredBrands.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredBrands.map((brand, index) => (
            <div
              key={brand}
              className={`px-4 py-2 cursor-pointer text-sm transition-colors ${
                index === selectedIndex
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-50'
              } ${
                brand.toLowerCase() === searchQuery.toLowerCase()
                  ? 'bg-green-50 text-green-600'
                  : ''
              }`}
              onClick={() => handleBrandSelect(brand)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-center justify-between">
                <span>{brand}</span>
                {brand.toLowerCase() === searchQuery.toLowerCase() && (
                  <Check className="h-4 w-4" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && filteredBrands.length === 0 && searchQuery.trim() !== '' && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="px-4 py-2 text-sm text-gray-500">
            No brands found for "{searchQuery}"
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandAutocomplete;
