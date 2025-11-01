"use client"

import { Plus, X, Pencil } from "lucide-react"
import useSWRMutation from "swr/mutation"
import { sitesAPI } from "@/lib/api"
import { useState, useEffect } from "react"
import { mutate } from "swr"

export default function SiteFormModal({ isOpen, setIsOpen, onSuccess, site }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [initialBudget, setInitialBudget] = useState("")

  // Detect mode
  const isEditMode = !!site

  // Prefill fields if editing
  useEffect(() => {
    if (site) {
      setName(site.name || "")
      setDescription(site.description || "")
      setInitialBudget(site.initial_budget || site.initialBudget || "")
    } else {
      setName("")
      setDescription("")
      setInitialBudget("")
    }
  }, [site, isOpen]) // Added isOpen to reset when modal opens

  // SWR Mutations
  const createSite = async (url, { arg }) => sitesAPI.create(arg)
  const updateSite = async (url, { arg }) => sitesAPI.update(site.id, arg)

  const { trigger: triggerCreate, isMutating: creating } = useSWRMutation("/sites", createSite)
  const { trigger: triggerUpdate, isMutating: updating } = useSWRMutation(`/sites/${site?.id}`, updateSite)

  const submit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        name,
        description,
        initialBudget: Number(initialBudget) || 0,
      }

      if (isEditMode) {
        await triggerUpdate(payload)
      } else {
        await triggerCreate(payload)
      }

      // 🔥 CRITICAL: Manually trigger revalidation for all relevant keys
      await mutate("/reports/sites") // For Dashboard
      await mutate("/sites") // For SiteList if it's using this key
      
      setIsOpen(false)
      onSuccess?.() // Call the success callback
    } catch (err) {
      console.error("Error:", err)
    }
  }

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName("")
      setDescription("")
      setInitialBudget("")
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 border border-white/20 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="mb-5 text-xl font-semibold text-white text-center">
          {isEditMode ? "Update Site" : "Create New Site"}
        </h3>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">Name</label>
            <input
              className="w-full border border-white/20 bg-white/10 px-3 py-2 rounded-lg text-white placeholder-white/50 
              focus:border-white/40 focus:bg-white/15 focus:ring-2 focus:ring-white/20 transition-all"
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">Description</label>
            <input
              className="w-full border border-white/20 bg-white/10 px-3 py-2 rounded-lg text-white placeholder-white/50 
              focus:border-white/40 focus:bg-white/15 focus:ring-2 focus:ring-white/20 transition-all"
              placeholder="Short description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">Initial Budget</label>
            <input
              type="number"
              className="w-full border border-white/20 bg-white/10 px-3 py-2 rounded-lg text-white placeholder-white/50 
              focus:border-white/40 focus:bg-white/15 focus:ring-2 focus:ring-white/20 transition-all"
              placeholder="1000000"
              value={initialBudget}
              onChange={(e) => setInitialBudget(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={creating || updating}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary px-4 py-2 rounded-lg font-semibold 
            text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditMode ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {creating || updating
              ? isEditMode ? "Updating..." : "Creating..."
              : isEditMode ? "Update Site" : "Create Site"}
          </button>
        </form>
      </div>
    </div>
  )
}