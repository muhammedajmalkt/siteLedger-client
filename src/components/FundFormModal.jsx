"use client"

import { Plus, X, Pencil } from "lucide-react"
import useSWRMutation from "swr/mutation"
import { fundsAPI } from "@/lib/api"
import { useState, useEffect } from "react"
import { mutate } from "swr"

export default function FundFormModal({ isOpen, setIsOpen, siteId, fund, onSuccess }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")

  const isEditMode = !!fund

  // Prefill form when editing - FIXED VERSION
  useEffect(() => {
    if (isOpen && fund) {
      console.log("Prefilling fund form with:", fund) // Debug log
      setTitle(fund.title || "")
      setDescription(fund.description || "")
      setAmount(fund.amount?.toString() || "")
    } else if (!isOpen) {
      // Reset form when modal closes
      setTitle("")
      setDescription("")
      setAmount("")
    }
  }, [isOpen, fund]) // Depend on isOpen and fund

  const createFund = async (url, { arg }) => {
    return fundsAPI.create(siteId, arg)
  }

  const updateFund = async (url, { arg }) => {
    return fundsAPI.update(siteId, fund.id, arg)
  }

  const { trigger: triggerCreate, isMutating: creating } = useSWRMutation(`/funds/${siteId}`, createFund)
  const { trigger: triggerUpdate, isMutating: updating } = useSWRMutation(`/funds/${siteId}/${fund?.id}`, updateFund)

  const submit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        title,
        description,
        amount: Number(amount) || 0,
      }

      if (isEditMode) {
        await triggerUpdate(payload)
      } else {
        await triggerCreate(payload)
      }
      
      // Close modal
      setIsOpen(false)
      
      // Refresh data
      await mutate(`/funds/${siteId}`)
      await mutate(`/sites/${siteId}`)
      onSuccess?.()
    } catch (err) {
      console.error("Error saving fund:", err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 border border-white/20 p-6 shadow-2xl">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="mb-5 text-xl font-semibold text-white text-center">
          {isEditMode ? "Edit Fund" : "Add Fund"}
        </h3>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">Title *</label>
            <input
              className="w-full border border-white/20 bg-white/10 px-3 py-2 rounded-lg text-white placeholder-white/50 focus:border-white/40 focus:bg-white/15 focus:ring-2 focus:ring-white/20 transition-all"
              placeholder="Investor Capital"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">Description</label>
            <textarea
              className="w-full border border-white/20 bg-white/10 px-3 py-2 rounded-lg text-white placeholder-white/50 focus:border-white/40 focus:bg-white/15 focus:ring-2 focus:ring-white/20 transition-all resize-none"
              placeholder="Initial funding from investors"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">Amount *</label>
            <input
              type="number"
              className="w-full border border-white/20 bg-white/10 px-3 py-2 rounded-lg text-white placeholder-white/50 focus:border-white/40 focus:bg-white/15 focus:ring-2 focus:ring-white/20 transition-all"
              placeholder="500000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </div>

          <button
            type="submit"
            disabled={creating || updating}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary px-4 py-2 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditMode ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {creating || updating ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Fund" : "Add Fund")}
          </button>
        </form>
      </div>
    </div>
  )
}