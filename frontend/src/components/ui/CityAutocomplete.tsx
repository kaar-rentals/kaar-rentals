import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Fuse from 'fuse.js';
import citiesData from '@/data/cities.json';

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Select city",
  label = "City",
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);
  const [filteredCities, setFilteredCities] = useState<string[]>(citiesData);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Initialize Fuse.js for fuzzy search
  const fuse = new Fuse(citiesData, {
    threshold: 0.3,
    includeScore: true,
  });

  // Filter cities based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCities(citiesData); // Show all cities when empty
    } else {
      const results = fuse.search(searchQuery);
      setFilteredCities(results.map(result => result.item)); // Show all matching results
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

  // Handle city selection
  const handleCitySelect = (city: string) => {
    setSearchQuery(city);
    onChange(city);
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
          prev < filteredCities.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCities.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredCities.length) {
          handleCitySelect(filteredCities[selectedIndex]);
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
      <Label htmlFor="city-autocomplete">{label}</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id="city-autocomplete"
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

      {isOpen && filteredCities.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-auto"
        >
          {filteredCities.map((city, index) => (
            <div
              key={city}
              className={`px-4 py-2 cursor-pointer text-sm transition-colors ${
                index === selectedIndex
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-50'
              } ${
                city.toLowerCase() === searchQuery.toLowerCase()
                  ? 'bg-green-50 text-green-600'
                  : ''
              }`}
              onClick={() => handleCitySelect(city)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{city}</span>
                </div>
                {city.toLowerCase() === searchQuery.toLowerCase() && (
                  <Check className="h-4 w-4" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && filteredCities.length === 0 && searchQuery.trim() !== '' && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="px-4 py-2 text-sm text-gray-500">
            No cities found for "{searchQuery}"
          </div>
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;
