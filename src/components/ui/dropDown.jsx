"use client";
import React, { useState, useRef, useEffect } from "react";

export default function CustomDropdown({
  label = "Menu",
  items = [],
  onSelect,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
// if(open){
//     console.log("hllei==============");
    
// }
  return (
    <div ref={menuRef} className="relative inline-block text-left z-50 ">
      {/* Trigger (DropdownMenuTrigger) */}
      <button
        onClick={() => setOpen(!open)}
        className="px-2 py-2 text-sm font-medium text-white rounded-lg transition-all"
      >
        {label}
      </button>

      {/* Menu (DropdownMenuContent) */}
      {open && (
        <div className="absolute right-0 mt-2 w-44 origin-top-right rounded-lg bg-gray-800 shadow-lg ring-1 ring-black/10 z-50 animate-fadeIn">
          <ul className="py-1 z-50">
            {items.map((item, index) => (
              <li key={index}>
                {/* Menu Item (DropdownMenuItem) */}
                <button
                  onClick={() => {
                    onSelect?.(item);
                    setOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm transition-all ${
                    item.danger
                      ? "text-red-400 hover:bg-red-900/50"
                      : "text-gray-100 hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
