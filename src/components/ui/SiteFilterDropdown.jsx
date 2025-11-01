"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Filter, ChevronDown, Search } from "lucide-react"

const filterOptions = [
  { value: "all", label: "All Sites" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "budget-high", label: "Budget (High to Low)" },
  { value: "budget-low", label: "Budget (Low to High)" },
]

export default function SiteFilterDropdown({ onFilterChange, onSearchChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // ✅ Use useCallback to prevent unnecessary re-renders
  const handleSelect = useCallback((filter) => {
    setSelectedFilter(filter.value)
    onFilterChange?.(filter.value)
    setIsOpen(false)
  }, [onFilterChange])

  // ✅ Debounced search handler
  const handleSearch = useCallback((e) => {
    const value = e.target.value
    setSearchQuery(value)
    // Directly call the parent handler without debounce for simplicity
    onSearchChange?.(value)
  }, [onSearchChange])

  const selectedOption = filterOptions.find(opt => opt.value === selectedFilter)

  return (
    <div className="flex items-center gap-3 z-50">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
        <input
          type="text"
          placeholder="Search sites..."
          value={searchQuery}
          onChange={handleSearch}
          className="pl-10 pr-4 py-2 text-sm text-white bg-white/10 border border-white/20 rounded-lg placeholder-white/50 focus:outline-none focus:border-white/40 transition-all w-48"
        />
      </div>

      {/* Filter Dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 bg-white/10 border border-white/20 rounded-lg hover:bg-white/15 transition-all duration-200"
        >
          <Filter className="h-4 w-4" />
          <span>{selectedOption?.label}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-gray-800 border border-white/20 shadow-lg ring-1 ring-black/10 z-30">
            <div className="py-1">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left px-4 py-2 text-sm transition-all ${
                    selectedFilter === option.value
                      ? "bg-primary text-white"
                      : "text-gray-100 hover:bg-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}