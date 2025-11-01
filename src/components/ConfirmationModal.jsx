"use client"

import { AlertTriangle, Trash2, Archive, X } from "lucide-react"

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger", // 'danger' for hard delete, 'warning' for soft delete
  isLoading = false
}) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <Trash2 className="h-6 w-6 text-red-600" />
      case 'warning':
        return <Archive className="h-6 w-6 text-yellow-400" />
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-400" />
    }
  }

  const getButtonColor = () => {
    switch (type) {
      case 'danger':
        return "bg-red-700 hover:bg-red-700 focus:ring-red-500"
      case 'warning':
        return "bg-yellow-500 hover:bg-yellow-700 focus:ring-yellow-500"
      default:
        return "bg-primary hover:bg-primary/90 focus:ring-primary"
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 border border-white/20 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          disabled={isLoading}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          {getIcon()}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>

        <p className="text-white/80 mb-6">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white/80 bg-white/10 border border-white/20 rounded-lg hover:bg-white/15 transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 ${getButtonColor()}`}
          >
            {isLoading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}