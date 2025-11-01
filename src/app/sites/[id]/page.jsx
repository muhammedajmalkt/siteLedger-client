"use client"

import useSWR from "swr"
import Link from "next/link"
import Topbar from "@/components/TopBar"
import SpendingFormModal from "@/components/SpendingFormModal"
import FundFormModal from "@/components/FundFormModal"
import ConfirmationModal from "@/components/ConfirmationModal"
import { sitesAPI, fundsAPI, spendingsAPI } from "@/lib/api"
import React, { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { Plus, MoreVertical, Edit, Trash2, Archive, Search, Filter, ChevronDown } from "lucide-react"
import CustomDropdown from "@/components/ui/dropDown"
import {  formatNumber, sum } from "@/lib/utils"

export default function SiteDetail({ params }) {
  const [mounted, setMounted] = useState(false)
  const [isSpendingModalOpen, setIsSpendingModalOpen] = useState(false)
  const [isFundModalOpen, setIsFundModalOpen] = useState(false)
  const [editingSpending, setEditingSpending] = useState(null)
  const [editingFund, setEditingFund] = useState(null)
  
  // Search and filter states
  const [fundSearch, setFundSearch] = useState("")
  const [fundFilter, setFundFilter] = useState("all")
  const [spendingSearch, setSpendingSearch] = useState("")
  const [spendingFilter, setSpendingFilter] = useState("all")
  
  // Confirmation modal states
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: '', 
    data: null,
    isLoading: false
  })
  
  useEffect(() => setMounted(true), [])
  
  const { id } = useParams() 
  
  // Fetch site data
  const { data: siteData, error: siteError, mutate: mutateSite } = useSWR( id ? `/sites/${id}` : null, () => sitesAPI.get(id).then(res => res.data) );

  // Fetch funds data
  const { data: fundsData, error: fundsError, mutate: mutateFunds } = useSWR( id ? `/funds/${id}` : null, () => fundsAPI.list(id).then(res => {
      if (Array.isArray(res?.data?.data?.funds)) {
        return res.data.data.funds
      }
      if (Array.isArray(res.data)) {
        return res.data
      }
      if (Array.isArray(res.data?.funds)) {
        return res.data.funds
      }
      if (Array.isArray(res.data?.data)) {
        return res.data.data
      }
      return []
    })
  );

  // Fetch spendings data
  const { data: spendingsData, error: spendingsError, mutate: mutateSpendings } = useSWR( id ? `/spendings/${id}` : null, () => spendingsAPI.list(id).then(res => {
      if (Array.isArray(res?.data?.data?.spendings)) {
        return res?.data?.data?.spendings
      }
      return []
    })
  );

  // Safely extract data
  const site = siteData?.data || siteData
  const funds = Array.isArray(fundsData) ? fundsData : []
  const spendings = Array.isArray(spendingsData) ? spendingsData : []

  // Filter and search funds
  const filteredFunds = useMemo(() => {
    let filtered = funds
    
    // Apply search
    if (fundSearch.trim()) {
      const query = fundSearch.toLowerCase().trim()
      filtered = filtered.filter(fund => 
        fund.title?.toLowerCase().includes(query) ||
        fund.description?.toLowerCase().includes(query)
      )
    }
    
    // Apply filter
    switch (fundFilter) {
      case "title-asc":
        return [...filtered].sort((a, b) => a.title?.localeCompare(b.title))
      case "title-desc":
        return [...filtered].sort((a, b) => b.title?.localeCompare(a.title))
      case "amount-high":
        return [...filtered].sort((a, b) => (b.amount || 0) - (a.amount || 0))
      case "amount-low":
        return [...filtered].sort((a, b) => (a.amount || 0) - (b.amount || 0))
      case "recent":
        return [...filtered].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
      case "oldest":
        return [...filtered].sort((a, b) => new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0))
      default:
        return filtered
    }
  }, [funds, fundSearch, fundFilter])

  // Filter and search spendings
  const filteredSpendings = useMemo(() => {
    let filtered = spendings
    
    // Apply search
    if (spendingSearch.trim()) {
      const query = spendingSearch.toLowerCase().trim()
      filtered = filtered.filter(spending => 
        spending.title?.toLowerCase().includes(query) ||
        spending.description?.toLowerCase().includes(query)
      )
    }
    
    // Apply filter
    switch (spendingFilter) {
      case "title-asc":
        return [...filtered].sort((a, b) => a.title?.localeCompare(b.title))
      case "title-desc":
        return [...filtered].sort((a, b) => b.title?.localeCompare(a.title))
      case "amount-high":
        return [...filtered].sort((a, b) => (b.amount || 0) - (a.amount || 0))
      case "amount-low":
        return [...filtered].sort((a, b) => (a.amount || 0) - (b.amount || 0))
      case "recent":
        return [...filtered].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
      case "oldest":
        return [...filtered].sort((a, b) => new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0))
      default:
        return filtered
    }
  }, [spendings, spendingSearch, spendingFilter])

  // Calculate current balance safely
  const totalFunds = sum(funds.map((f) => f?.amount || 0))
  const totalSpendings = sum(spendings.map((s) => s?.amount || 0))
  const currentBalance = totalFunds - totalSpendings

  // Open confirmation modal functions
  const openSoftDeleteSpending = (spending) => {
    setConfirmationModal({
      isOpen: true,
      type: 'softDeleteSpending',
      data: spending,
      isLoading: false
    })
  }

  const openHardDeleteSpending = (spending) => {
    setConfirmationModal({
      isOpen: true,
      type: 'hardDeleteSpending',
      data: spending,
      isLoading: false
    })
  }

  const openSoftDeleteFund = (fund) => {
    setConfirmationModal({
      isOpen: true,
      type: 'softDeleteFund',
      data: fund,
      isLoading: false
    })
  }

  const openHardDeleteFund = (fund) => {
    setConfirmationModal({
      isOpen: true,
      type: 'hardDeleteFund',
      data: fund,
      isLoading: false
    })
  }

  // Handle confirmation
  const handleConfirm = async () => {
    setConfirmationModal(prev => ({ ...prev, isLoading: true }))

    try {
      switch (confirmationModal.type) {
        case 'softDeleteSpending':
          await spendingsAPI.softDelete(id, confirmationModal.data.id)
          mutateSpendings()
          mutateSite()
          break
        case 'hardDeleteSpending':
          await spendingsAPI.hardDelete(id, confirmationModal.data.id)
          mutateSpendings()
          mutateSite()
          break
        case 'softDeleteFund':
          await fundsAPI.softDelete(id, confirmationModal.data.id)
          mutateFunds()
          mutateSite()
          break
        case 'hardDeleteFund':
          await fundsAPI.hardDelete(id, confirmationModal.data.id)
          mutateFunds()
          mutateSite()
          break
        default:
          break
      }
      
      // Close confirmation modal
      setConfirmationModal({
        isOpen: false,
        type: '',
        data: null,
        isLoading: false
      })
    } catch (err) {
      console.error("Delete operation failed:", err)
      setConfirmationModal(prev => ({ ...prev, isLoading: false }))
    }
  }

  // Close confirmation modal
  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      type: '',
      data: null,
      isLoading: false
    })
  }

  // Get confirmation modal config based on type
  const getConfirmationConfig = () => {
    const item = confirmationModal.data
    const itemName = item?.title || item?.name || "this item"
    
    switch (confirmationModal.type) {
      case 'softDeleteSpending':
        return {
          title: "Archive Spending",
          message: `Are you sure you want to archive "${itemName}"? This action can be undone.`,
          confirmText: "Archive",
          type: 'warning'
        }
      case 'hardDeleteSpending':
        return {
          title: "Delete Spending Permanently",
          message: `Are you sure you want to permanently delete "${itemName}"? This action cannot be undone.`,
          confirmText: "Delete Permanently",
          type: 'danger'
        }
      case 'softDeleteFund':
        return {
          title: "Archive Fund",
          message: `Are you sure you want to archive "${itemName}"? This action can be undone.`,
          confirmText: "Archive",
          type: 'warning'
        }
      case 'hardDeleteFund':
        return {
          title: "Delete Fund Permanently",
          message: `Are you sure you want to permanently delete "${itemName}"? This action cannot be undone.`,
          confirmText: "Delete Permanently",
          type: 'danger'
        }
      default:
        return {
          title: "Confirm Action",
          message: "Are you sure you want to proceed?",
          confirmText: "Confirm",
          type: 'warning'
        }
    }
  }

  // Fund Actions
  const handleEditFund = (fund) => {
    setEditingFund(fund)
    setTimeout(() => {
      setIsFundModalOpen(true)
    }, 100)
  }

  // Spending Actions
  const handleEditSpending = (spending) => {
    setEditingSpending(spending)
    setTimeout(() => {
      setIsSpendingModalOpen(true)
    }, 100)
  }

  // Reset editing states when modals close
  const handleFundModalClose = () => {
    setIsFundModalOpen(false)
    setTimeout(() => {
      setEditingFund(null)
    }, 300)
  }

  const handleSpendingModalClose = () => {
    setIsSpendingModalOpen(false)
    setTimeout(() => {
      setEditingSpending(null)
    }, 300)
  }

  const confirmationConfig = getConfirmationConfig()

  return (
    <main className="bg-gradient-to-br to-slate-700 from-black via-gray-950">
      <div className="mx-auto max-w-5xl">
        <section className="px-4 py-6 min-h-screen">
          <Link href="/" className="text-sm text-primary underline underline-offset-2">
            &larr; Back to Dashboard
          </Link>

          <div className="mt-4 rounded-lg p-4 bg-white/10 backdrop-blur-md border border-white/20">
            {mounted ? (
              <>
                <h1 className="text-lg font-semibold text-white">{site?.name || "Loading..."}</h1>
                <p className="text-sm text-muted-foreground">{site?.description || "No description"}</p>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4 text-white">
                  <Stat label="Initial Budget" value={formatNumber(site?.initialBudget)} />
                  <Stat label="Total Funds" value={formatNumber(totalFunds)} />
                  <Stat label="Total Spendings" value={formatNumber(totalSpendings)} />
                  <Stat 
                    label="Current Balance" 
                    value={formatNumber(currentBalance)} 
                    className={currentBalance < 0 ? "text-red-400" : "text-green-400"}
                  />
                </div>
              </>
            ) : (
              <div className="animate-pulse space-y-3">
                <div className="h-5 w-40 rounded bg-white/10 " />
                <div className="h-4 w-3/4 rounded bg-white/10" />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="rounded-md border bg-white/10 border-white/20 p-3">
                      <div className="h-3 w-20 rounded bg-white/10 " />
                      <div className="mt-2 h-5 w-24 rounded bg-white/10 " />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {mounted ? (
              <>
                <Panel 
                  title={`Funds (${filteredFunds.length} of ${funds.length})`} 
                  items={filteredFunds} 
                  onAdd={() => setIsFundModalOpen(true)}
                  showAddButton={true}
                  emptyMessage="No funds added yet"
                  onEdit={handleEditFund}
                  onSoftDelete={openSoftDeleteFund}
                  onHardDelete={openHardDeleteFund}
                  type="fund"
                  searchValue={fundSearch}
                  onSearchChange={setFundSearch}
                  filterValue={fundFilter}
                  onFilterChange={setFundFilter}
                />
                <Panel 
                  title={`Spendings (${filteredSpendings.length} of ${spendings.length})`} 
                  items={filteredSpendings} 
                  onAdd={() => setIsSpendingModalOpen(true)}
                  showAddButton={true}
                  emptyMessage="No spendings yet"
                  onEdit={handleEditSpending}
                  onSoftDelete={openSoftDeleteSpending}
                  onHardDelete={openHardDeleteSpending}
                  type="spending"
                  searchValue={spendingSearch}
                  onSearchChange={setSpendingSearch}
                  filterValue={spendingFilter}
                  onFilterChange={setSpendingFilter}
                />
              </>
            ) : (
              <>
                {[0, 1].map((k) => (
                  <div key={k} className="rounded-lg bg-white/10 border border-white/20 p-4">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 w-24 rounded bg-white/10 " />
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="rounded-md bg-white/10 p-3">
                          <div className="flex items-center justify-between">
                            <div className="h-3 w-24 rounded bg-white/10 " />
                            <div className="h-3 w-16 rounded bg-white/10 0" />
                          </div>
                          <div className="mt-2 h-3 w-40 rounded bg-white/10 " />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>
      </div>

      {/* Spending Modal */}
      <SpendingFormModal
        isOpen={isSpendingModalOpen}
        setIsOpen={handleSpendingModalClose}
        siteId={id}
        spending={editingSpending}
        onSuccess={() => {
          mutateSpendings()
          mutateSite()
          setEditingSpending(null)
        }}
      />

      {/* Fund Modal */}
      <FundFormModal
        isOpen={isFundModalOpen}
        setIsOpen={handleFundModalClose}
        siteId={id}
        fund={editingFund}
        onSuccess={() => {
          mutateFunds()
          mutateSite()
          setEditingFund(null)
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleConfirm}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        confirmText={confirmationConfig.confirmText}
        type={confirmationConfig.type}
        isLoading={confirmationModal.isLoading}
      />
    </main>
  )
}

function Stat({ label, value, className = "" }) {
  return (
    <div className="rounded-md border border-white/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold ${className}`}>{value}</p>
    </div>
  )
}

function Panel({ 
  title, 
  items, 
  onAdd, 
  onEdit, 
  onSoftDelete, 
  onHardDelete,
  showAddButton = false, 
  emptyMessage = "No records.",
  type = "fund",
  searchValue = "",
  onSearchChange,
  filterValue = "all",
  onFilterChange
}) {
  const safeItems = Array.isArray(items) ? items : []
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "title-asc", label: "Title (A-Z)" },
    { value: "title-desc", label: "Title (Z-A)" },
    { value: "amount-high", label: "Amount (High to Low)" },
    { value: "amount-low", label: "Amount (Low to High)" },
    { value: "recent", label: "Recently Updated" },
    { value: "oldest", label: "Oldest First" },
  ]

  const selectedFilter = filterOptions.find(opt => opt.value === filterValue) || filterOptions[0]

  return (
    <div className="rounded-lg p-4 bg-white/10 backdrop-blur-md border border-white/20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">{title}</h3>
        {showAddButton && (
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-1 bg-primary px-3 py-1 rounded-lg text-xs font-medium text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="flex gap-2 mb-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
          <input
            type="text"
            placeholder={`Search ${type}...`}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm text-white bg-white/10 border border-white/20 rounded-lg placeholder-white/50 focus:outline-none focus:border-white/40 transition-all"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center  gap-2 px-3 py-2.5 text-sm text-white/80 bg-white/10 border border-white/20 rounded-lg hover:bg-white/15 transition-all duration-200"
          >
            <Filter className="h-4 w-4" />
            <ChevronDown className={`h-4 w-4 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-gray-800 border border-white/20 shadow-lg ring-1 ring-black/10 z-50">
              <div className="py-1">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onFilterChange?.(option.value)
                      setIsFilterOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-all ${
                      filterValue === option.value
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

      {/* Search Results Info */}
      {searchValue && (
        <div className="mb-3 text-sm text-white/70">
          Showing {safeItems.length} results for "{searchValue}"
        </div>
      )}
      
      {!safeItems.length ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="space-y-2 max-h-[480px] overflow-scroll">
          {safeItems.map((item) => (
            <ListItem 
              key={item.id} 
              item={item} 
              onEdit={onEdit}
              onSoftDelete={onSoftDelete}
              onHardDelete={onHardDelete}
              type={type}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function ListItem({ item, onEdit, onSoftDelete, onHardDelete, type }) {
  return (
    <li className="relative rounded-md border border-white/20 bg-white/5 p-3 transition hover:bg-white/10">
      {/* 3-dot dropdown menu */}
      <div className="absolute top-2 right-2 z-50">
        <CustomDropdown
          label={<MoreVertical className="h-4 w-4 text-white/80 hover:text-white" />}
          items={[
            { label: "Edit", icon: <Edit size={14} />, action: () => onEdit?.(item), },
            { label: "Soft Delete", icon: <Archive size={14} />, action: () => onSoftDelete?.(item), },
            { label: "Hard Delete", icon: <Trash2 size={14} />, action: () => onHardDelete?.(item), danger: true, },
          ]}
          onSelect={(selectedItem) => selectedItem.action?.()}
        />
      </div>

      <div className="flex items-center justify-between pr-8 ">
        <span className="font-medium text-white">{item.title || item.name || "Untitled"}</span>
        <span className="text-sm text-white">{formatNumber(item.amount)}</span>
      </div>
      {item.description && (
        <p className="text-sm text-white/70 mt-1 pr-8">{item.description}</p>
      )}
      <p className="text-xs text-white/50 mt-1">
        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ''}
      </p>
    </li>
  )
}