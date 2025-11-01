"use client"

import { authAPI, companyDetails } from "@/lib/api"
import { Building2, LogOut, Moon, Sun, Settings, User, Bell } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import useSWR from "swr"

export default function Topbar() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState('light')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Effect 1: Load theme from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme')
      setTheme(savedTheme === 'dark' ? 'dark' : 'light')
    }
  }, [])

  // Effect 2: Apply theme to document and save to localStorage whenever theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else { 
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // Effect 3: Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  async function logout() {
    try {
      setLoading(true)
      await fetch("/api/auth/logout", { method: "POST" })
      router.replace("/login")
    } finally {
      setLoading(false)
    }
  }

  const { data, error, isLoading } = useSWR("/auth/companyin", () => authAPI.companyIn().then(res => res.data.data))

  return (
    <header className="w-full border-b backdrop-blur-md border-white/20 shadow-2xl text-white dark:bg-gray-900/10 dark:border-gray-700 py-2">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image 
            src="/siteLedget_logo.png" 
            alt="logo" 
            width={50} 
            height={50} 
            className="scale-200"  
            priority 
          />
        </div>
        

          {/* Settings Dropdown */}
          <div className="relative  " ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-white transition-all duration-200 backdrop-blur-sm cursor-pointer hover:bg-white/10 rounded-lg"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-gray-800 dark:bg-gray-800 rounded-lg shadow-lg border border-gray-600 dark:border-gray-700 py-2 !z-[999]">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-700 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    {data ? (
                      <div className="bg-blue-500 w-8 h-8 rounded-full text-center flex justify-center items-center">
                        <span className="text-lg font-extrabold text-white">
                          {data?.name?.trim()[0] || 'U'}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-gray-500 w-8 h-8 rounded-full text-center animate-pulse" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white dark:text-white truncate">
                        {data?.name || 'Loading...'}
                      </p>
                      <p className="text-xs text-white dark:text-gray-400 truncate">
                        {data?.email || 'Company'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dropdown Items */}
                <div className="py-1">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-white dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </div>

                {/* Logout Section */}
                <div className="border-t border-gray-700 dark:border-gray-600 pt-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      logout()
                    }}
                    disabled={loading}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {loading ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar (Fallback - visible when dropdown is not suitable) */}
          {/* {data && (
            <div className="bg-blue-500 w-8 h-8 rounded-full text-center flex justify-center items-center">
              <span className="text-lg font-extrabold text-white">
                {data?.name?.trim()[0] || 'U'}
              </span>
            </div>
          )}
          {isLoading && (
            <div className="bg-gray-500 w-8 h-8 rounded-full text-center animate-pulse" />
          )} */}
        </div>
    </header>
  )
}