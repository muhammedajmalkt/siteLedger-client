"use client"

import { Download } from "lucide-react"
import { useState } from "react"

export default function CSVExport({ 
  data, 
  totals, 
  filename = "sites-report",
  className = ""
}) {
  const [isExporting, setIsExporting] = useState(false)

  const formatNumberForExport = (num) => {
    return new Intl.NumberFormat('en-IN').format(num)
  }

  const escapeCSVField = (field) => {
    if (field === null || field === undefined) return ''
    const stringField = String(field)
    if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
      return `"${stringField.replace(/"/g, '""')}"`
    }
    return stringField
  }

  const generateCSVContent = () => {
    const headers = [
      'Site Name',
      'Description',
      'Initial Budget (₹)',
      'Total Funds (₹)',
      'Total Spendings (₹)',
      'Current Balance (₹)',
      'Status',
      'Utilization Rate (%)'
    ]

    const dataRows = data.map(site => [
      escapeCSVField(site.name),
      escapeCSVField(site.description),
      formatNumberForExport(site.initial_budget || 0),
      formatNumberForExport(site.total_funds || 0),
      formatNumberForExport(site.total_spendings || 0),
      formatNumberForExport(site.current_balance || 0),
      escapeCSVField(site.status || 'active'),
      site.total_funds ? ((site.total_spendings || 0) / site.total_funds * 100).toFixed(1) : '0.0'
    ])

    const summaryData = [
      ['SUMMARY', '', '', '', '', '', '', ''],
      ['Total Sites', data.length, '', '', '', '', '', ''],
      ['Total Initial Budget (₹)', formatNumberForExport(totals.totalInitialBudget), '', '', '', '', '', ''],
      ['Total Funds (₹)', formatNumberForExport(totals.totalFunds), '', '', '', '', '', ''],
      ['Total Spendings (₹)', formatNumberForExport(totals.totalSpendings), '', '', '', '', '', ''],
      ['Net Balance (₹)', formatNumberForExport(totals.totalBalance), '', '', '', '', '', ''],
      ['Total Investment (₹)', formatNumberForExport(totals.totalInvestment), '', '', '', '', '', ''],
      ['Utilization Rate (%)', `${totals.utilizationRate}%`, '', '', '', '', '', '']
    ]

    const csvContent = [
      ['SITES FINANCIAL REPORT', '', '', '', '', '', '', ''],
      ['Generated on', new Date().toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }), '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      headers,
      ...dataRows,
      ['', '', '', '', '', '', '', ''],
      ...summaryData
    ]

    return csvContent.map(row => row.join(',')).join('\n')
  }

  const handleExport = async () => {
    if (data.length === 0) {
      alert('No data available to export.')
      return
    }

    setIsExporting(true)
    
    try {
      const csvContent = generateCSVContent()
      const timestamp = new Date().toISOString().split('T')[0]
      const finalFilename = `${filename}-${timestamp}.csv`

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      
      link.setAttribute('href', url)
      link.setAttribute('download', finalFilename)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('CSV export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || data.length === 0}
      className={`inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 ${className}`}
    >
      <Download className="h-4 w-4" />
      {isExporting ? 'Exporting...' : 'Export CSV'}
    </button>
  )
}