"use client"

import useSWR from "swr"
import { BarChart3, Download, FileText, PieChart, ArrowLeft } from "lucide-react"
import { reportsAPI } from "@/lib/api"
import { sum } from "@/lib/utils"
import Link from "next/link"
import { useState, useMemo } from "react"
import CSVExport from "@/components/CSVExport"

export default function ReportsPage() {
  const [exportFormat, setExportFormat] = useState("csv")

  const { data: reportsData, isLoading } = useSWR("/reports/sites", async () => {
    const res = await reportsAPI.siteReports()
    return res.data?.data?.sites || []
  })

  const sites = reportsData || []

  const totals = useMemo(() => {
    const totalInitialBudget = sum(sites.map((s) => s.initial_budget || 0))
    const totalFunds = sum(sites.map((s) => s.total_funds || 0))
    const totalSpendings = sum(sites.map((s) => s.total_spendings || 0))
    const totalBalance = sum(sites.map((s) => s.current_balance || 0))
    const totalInvestment = totalInitialBudget + totalFunds
    const utilizationRate = totalInvestment > 0 ? (totalSpendings / totalInvestment * 100) : 0

    return {
      totalInitialBudget,
      totalFunds,
      totalSpendings,
      totalBalance,
      totalInvestment,
      utilizationRate: utilizationRate.toFixed(1)
    }
  }, [sites])

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-700">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 hover:text-white transition-colors text-sm text-primary underline underline-offset-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-500" />
              <h1 className="text-xl font-semibold text-white">Site Reports</h1>
            </div>
          </div>
          
          {/* Export Controls - Only CSV button */}
          <CSVExport 
            data={sites}
            totals={totals}
            filename="sites-report"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <SummaryCard
            title="Total Sites"
            value={sites.length}
            icon={<FileText className="h-5 w-5" />}
            color="blue"
          />
          <SummaryCard
            title="Total Investment"
            value={`₹ ${formatNumber(totals.totalInvestment)}`}
            icon={<PieChart className="h-5 w-5" />}
            color="green"
          />
          <SummaryCard
            title="Total Spendings"
            value={`₹ ${formatNumber(totals.totalSpendings)}`}
            icon={<BarChart3 className="h-5 w-5" />}
            color="orange"
          />
          <SummaryCard
            title="Net Balance"
            value={`₹ ${formatNumber(totals.totalBalance)}`}
            icon={<PieChart className="h-5 w-5" />}
            color={totals.totalBalance >= 0 ? "green" : "red"}
          />
        </div>

        {/* Detailed Report */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Detailed Site Report</h2>
          
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded bg-white/10" />
              ))}
            </div>
          ) : sites.length === 0 ? (
            <p className="text-white/70 text-center py-8">No sites available for reporting.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Site Name</th>
                    <th className="text-right py-3 px-4 text-white/70 font-medium">Initial Budget</th>
                    <th className="text-right py-3 px-4 text-white/70 font-medium">Total Funds</th>
                    <th className="text-right py-3 px-4 text-white/70 font-medium">Total Spendings</th>
                    <th className="text-right py-3 px-4 text-white/70 font-medium">Current Balance</th>
                    <th className="text-center py-3 px-4 text-white/70 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sites.map((site, index) => (
                    <tr key={site.id || index} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4 text-white">{site.name}</td>
                      <td className="py-3 px-4 text-right text-white">₹ {formatNumber(site.initial_budget || 0)}</td>
                      <td className="py-3 px-4 text-right text-white">₹ {formatNumber(site.total_funds || 0)}</td>
                      <td className="py-3 px-4 text-right text-white">₹ {formatNumber(site.total_spendings || 0)}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${
                        (site.current_balance || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ₹ {formatNumber(site.current_balance || 0)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          site.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {site.status || 'active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-white/5">
                    <td className="py-3 px-4 text-white font-semibold">Total</td>
                    <td className="py-3 px-4 text-right text-white font-semibold">₹ {formatNumber(totals.totalInitialBudget)}</td>
                    <td className="py-3 px-4 text-right text-white font-semibold">₹ {formatNumber(totals.totalFunds)}</td>
                    <td className="py-3 px-4 text-right text-white font-semibold">₹ {formatNumber(totals.totalSpendings)}</td>
                    <td className={`py-3 px-4 text-right font-semibold ${
                      totals.totalBalance >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      ₹ {formatNumber(totals.totalBalance)}
                    </td>
                    <td className="py-3 px-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Additional Metrics */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard
            title="Utilization Rate"
            value={`${totals.utilizationRate}%`}
            description="Percentage of total funds utilized"
          />
          <MetricCard
            title="Average per Site"
            value={`₹ ${formatNumber(Math.round(totals.totalInvestment / (sites.length || 1)))}`}
            description="Average investment per site"
          />
          <MetricCard
            title="Active Sites"
            value={sites.filter(s => s.status === 'active').length}
            description="Number of active projects"
          />
        </div>
      </div>
    </main>
  )
}

function SummaryCard({ title, value, icon, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    orange: "bg-orange-500/20 text-orange-400",
    red: "bg-red-500/20 text-red-400"
  }

  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 transition-all duration-200 hover:shadow-2xl hover:bg-white/15">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/70">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, description }) {
  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6">
      <h3 className="text-sm font-medium text-white mb-2">{title}</h3>
      <p className="text-2xl font-semibold text-white mb-1">{value}</p>
      <p className="text-xs text-white/50">{description}</p>
    </div>
  )
}