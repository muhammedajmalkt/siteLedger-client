"use client"

import useSWR, { mutate } from "swr"
import { PieChart, Plus, BarChart3 } from "lucide-react"
import Topbar from "@/components/TopBar"
import SiteFormModal from "@/components/SiteFormModal"
import SiteList from "@/components/sitList"
import SiteFilterDropdown from "@/components/ui/SiteFilterDropdown"
import { useEffect, useState, useMemo } from "react"
import { sitesAPI, reportsAPI } from "@/lib/api"
import { formatNumber, sum } from "@/lib/utils"
import Link from "next/link"

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedSite, setSelectedSite] = useState(null)
  const [currentFilter, setCurrentFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => setMounted(true), [])

  // Fetch site reports data
  const { data: reportsData, isLoading } = useSWR("/reports/sites", async () => {
    const res = await reportsAPI.siteReports()
    return res.data?.data?.sites || []
  })

  const sites = reportsData || []

  // Calculate totals from reports data
  const totalFunds = useMemo(() => sum(sites.map((s) => s.total_funds || 0)), [sites])
  const totalSpendings = useMemo(() => sum(sites.map((s) => s.total_spendings || 0)), [sites])
  const totalBalance = useMemo(() => sum(sites.map((s) => s.current_balance || 0)), [sites])
  const totalInitialBudget = useMemo(() => sum(sites.map((s) => s.initial_budget || 0)), [sites])

  const filteredSites = useMemo(() => {
    if (!sites.length) return []

    // First, apply search filter
    let filtered = sites
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = sites.filter(site => 
        site.name?.toLowerCase().includes(query) ||
        site.description?.toLowerCase().includes(query)
      )
    }

    // Then apply sorting
    let sortedSites = [...filtered]

    switch (currentFilter) {
      case "name-asc":
        sortedSites.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        sortedSites.sort((a, b) => b.name.localeCompare(a.title))
        break
      case "budget-high":
        sortedSites.sort((a, b) => (b.initial_budget || 0) - (a.initial_budget || 0))
        break
      case "budget-low":
        sortedSites.sort((a, b) => (a.initial_budget || 0) - (b.initial_budget || 0))
        break
      case "funds-high":
        sortedSites.sort((a, b) => (b.total_funds || 0) - (a.total_funds || 0))
        break
      case "funds-low":
        sortedSites.sort((a, b) => (a.total_funds || 0) - (b.total_funds || 0))
        break
      case "spendings-high":
        sortedSites.sort((a, b) => (b.total_spendings || 0) - (a.total_spendings || 0))
        break
      case "spendings-low":
        sortedSites.sort((a, b) => (a.total_spendings || 0) - (b.total_spendings || 0))
        break
      case "balance-high":
        sortedSites.sort((a, b) => (b.current_balance || 0) - (a.current_balance || 0))
        break
      case "balance-low":
        sortedSites.sort((a, b) => (a.current_balance || 0) - (b.current_balance || 0))
        break
      case "recent":
        sortedSites.sort((a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id))
        break
      case "oldest":
        sortedSites.sort((a, b) => new Date(a.createdAt || a.id) - new Date(b.createdAt || a.id))
        break
      case "all":
      default:
        break
    }

    return sortedSites
  }, [sites, currentFilter, searchQuery])

  const refreshSites = async () => {
    await mutate("/reports/sites")
  }

  const handleEdit = (site) => {
    setSelectedSite(site)
    setIsEditOpen(true)
  }

  const handleSoftDelete = async (site) => {
    try {
      await sitesAPI.softDelete(site.id)
      mutate("/reports/sites")
    } catch (err) {
      console.error("Soft delete failed:", err)
    }
  }

  const handleHardDelete = async (site) => {
    if (!confirm("Are you sure you want to permanently delete this site?")) return
    try {
      await sitesAPI.hardDelete(site.id)
      mutate("/reports/sites")
    } catch (err) {
      console.error("Hard delete failed:", err)
    }
  }

  const handleSearchChange = (query) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (filter) => {
    setCurrentFilter(filter)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-700">
      <div className="relative">

        <section className="mx-auto max-w-5xl px-4 py-6">
          {/* Header with Reports Button */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-white">Overview</h2>
            </div>
            <Link
              href="/reports"
              className="inline-flex  items-center gap-2  bg-primary hover:opacity-90  px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              <BarChart3 className="h-4 w-4" />
              View Reports
            </Link>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4 ">
            {mounted && !isLoading ? (
              <>
                <KpiCard title="Total Sites" value={sites.length} />
                <KpiCard 
                  title="Total Initial Budget" 
                  value={`₹ ${formatNumber(totalInitialBudget)}`} 
                />
                <KpiCard 
                  title="Total Funds" 
                  value={`₹ ${formatNumber(totalFunds)}`} 
                />
                <KpiCard 
                  title="Total Spendings" 
                  value={`₹ ${formatNumber(totalSpendings)}`} 
                />
              </>
            ) : (
              <SkeletonCards />
            )}
          </div>

          {/* Summary Card */}
          {mounted && !isLoading && (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-1">
              <SummaryCard 
                title="Financial Summary"
                items={[
                  { label: "Net Balance", value: `₹ ${formatNumber(totalBalance)}`, type: "balance" },
                  { label: "Total Investment", value: `₹ ${formatNumber(totalInitialBudget + totalFunds)}` },
                  { label: "Utilization Rate", value: `${calculateUtilizationRate(totalSpendings, totalInitialBudget + totalFunds)}%` },
                ]}
              />
            </div>
          )}

          {/* Create + Site List */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Create Section */}
            <div className="md:col-span-1">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-6">
                <h3 className="mb-4 text-sm font-medium text-white">
                  Create Site
                </h3>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary px-3 py-2 rounded-lg font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Plus className="h-4 w-4" />
                  Create Site
                </button>
              </div>
            </div>

            {/* Site List */}
            <div className="md:col-span-2">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white">Your Sites</h3>
                  <SiteFilterDropdown 
                    onFilterChange={handleFilterChange}
                    onSearchChange={handleSearchChange}
                  />
                </div>

                {/* Show search results info */}
                {searchQuery && (
                  <div className="mb-4 text-sm text-white/70">
                    Showing {filteredSites.length} of {sites.length} sites for "{searchQuery}"
                  </div>
                )}

                <SiteList
                  sites={filteredSites}
                  onEdit={handleEdit}
                  onSoftDelete={handleSoftDelete}
                  onHardDelete={handleHardDelete}
                />
              </div>
            </div>
          </div>

          {/* Create Modal */}
          <SiteFormModal
            isOpen={isCreateOpen}
            setIsOpen={setIsCreateOpen}
            onSuccess={refreshSites}
          />

          {/* Edit Modal */}
          <SiteFormModal
            isOpen={isEditOpen}
            setIsOpen={setIsEditOpen}
            site={selectedSite}
            onSuccess={refreshSites}
          />
        </section>
      </div>
    </main>
  )
}

function KpiCard({ title, value }) {
  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 transition-all duration-200 hover:shadow-2xl hover:bg-white/15  ">
      <p className="text-xs text-white/70">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}

function SummaryCard({ title, items }) {
  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 transition-all duration-200 hover:shadow-2xl hover:bg-white/15">
      <h3 className="text-sm font-medium text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-white/70">{item.label}</span>
            <span className={`text-sm font-semibold ${
              item.type === 'balance' 
                ? item.value.includes('-') 
                  ? 'text-red-400' 
                  : 'text-green-400'
                : 'text-white'
            }`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SkeletonCards() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6"
        >
          <div className="animate-pulse space-y-2">
            <div className="h-3 w-20 rounded bg-white/20" />
            <div className="h-6 w-24 rounded bg-white/20" />
          </div>
        </div>
      ))}
    </>
  )
}

// Utility functions
// function formatNumber(num) {
//   return new Intl.NumberFormat('en-IN').format(num)
// }

function calculateUtilizationRate(spendings, totalAvailable) {
  if (totalAvailable === 0) return 0
  return ((spendings / totalAvailable) * 100).toFixed(1)
}