"use client";

import Link from "next/link";
import React, { useState } from "react";
import { sitesAPI } from "@/lib/api";
import { MoreVertical, Edit, Trash2, Archive } from "lucide-react";
import CustomDropdown from "./ui/dropDown";
import ConfirmationModal from "./ConfirmationModal";
import { formatNumber } from "@/lib/utils";

export default function SiteList({
  sites = [],
  onEdit,
  onSoftDelete,
  onHardDelete,
  mutate,
}) {
  const [mounted, setMounted] = React.useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: '', // 'softDelete' or 'hardDelete'
    site: null,
    isLoading: false
  });

  React.useEffect(() => setMounted(true), []);

  // Open confirmation modal functions
  const openSoftDeleteModal = (site) => {
    setConfirmationModal({
      isOpen: true,
      type: 'softDelete',
      site: site,
      isLoading: false
    });
  };

  const openHardDeleteModal = (site) => {
    setConfirmationModal({
      isOpen: true,
      type: 'hardDelete',
      site: site,
      isLoading: false
    });
  };

  // Handle confirmation
  const handleConfirm = async () => {
    setConfirmationModal(prev => ({ ...prev, isLoading: true }));

    try {
      if (confirmationModal.type === 'softDelete') {
        if (onSoftDelete) {
          await onSoftDelete(confirmationModal.site);
        } else {
          await sitesAPI.softDelete(confirmationModal.site.id);
          mutate?.();
        }
      } else if (confirmationModal.type === 'hardDelete') {
        if (onHardDelete) {
          await onHardDelete(confirmationModal.site);
        } else {
          await sitesAPI.hardDelete(confirmationModal.site.id);
          mutate?.();
        }
      }
      
      // Close confirmation modal
      setConfirmationModal({
        isOpen: false,
        type: '',
        site: null,
        isLoading: false
      });
    } catch (err) {
      console.error("Delete operation failed:", err);
      setConfirmationModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Close confirmation modal
  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      type: '',
      site: null,
      isLoading: false
    });
  };

  // Get confirmation modal config based on type
  const getConfirmationConfig = () => {
    const site = confirmationModal.site;
    const siteName = site?.name || "this site";
    
    switch (confirmationModal.type) {
      case 'softDelete':
        return {
          title: "Archive Site",
          message: `Are you sure you want to archive "${siteName}"? This action can be undone. The site will be hidden but not permanently deleted.`,
          confirmText: "Archive",
          type: 'warning'
        };
      case 'hardDelete':
        return {
          title: "Delete Site Permanently",
          message: `Are you sure you want to permanently delete "${siteName}"? This action cannot be undone. All associated funds and spendings will also be deleted.`,
          confirmText: "Delete Permanently",
          type: 'danger'
        };
      default:
        return {
          title: "Confirm Action",
          message: "Are you sure you want to proceed?",
          confirmText: "Confirm",
          type: 'warning'
        };
    }
  };

  // --- LOCAL FALLBACK HANDLERS (used if Dashboard didn't pass any) ---
  const handleUpdateLocal = async (id) => {
    const newName = prompt("Enter new site name:");
    if (!newName) return;
    await sitesAPI.update(id, { name: newName });
    mutate?.();
  };

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 animate-pulse space-y-2"
          >
            <div className="h-4 w-1/3 rounded bg-white/20" />
            <div className="h-3 w-2/3 rounded bg-white/20" />
            <div className="mt-3 h-4 w-1/2 rounded bg-white/20" />
          </div>
        ))}
      </div>
    );
  }

  if (!sites?.length)
    return (
      <p className="text-sm text-white/70">
        No sites yet. Create your first site.
      </p>
    );

  const confirmationConfig = getConfirmationConfig();

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-1 max-h-[470px] overflow-scroll">
        {sites?.map((site) => (
          <div
            key={site.id}
            className="relative rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 transition-all duration-200 hover:bg-white/15 hover:shadow-2xl hover:-translate-y-0.5"
          >
            {/* --- MENU BUTTON --- */}
            <div className="absolute top-4 right-0 z-50">
              <CustomDropdown
                label={<MoreVertical className="h-5 w-5 text-white/80 hover:text-white z-50" />}
                items={[
                  { 
                    label: "Update", 
                    icon: <Edit size={14} />, 
                    action: () => onEdit ? onEdit(site) : handleUpdateLocal(site.id) 
                  },
                  { 
                    label: "Soft Delete", 
                    icon: <Archive size={14} />, 
                    action: () => openSoftDeleteModal(site) 
                  },
                  { 
                    label: "Hard Delete", 
                    icon: <Trash2 size={14} />, 
                    action: () => openHardDeleteModal(site), 
                    danger: true 
                  },
                ]}
                onSelect={(item) => item.action?.()}
              />
            </div>

            {/* --- SITE CONTENT --- */}
            <Link href={`/sites/${site.id}`} className="block">
              <div className="flex items-center justify-between pr-12">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white text-pretty truncate">
                    {site.name}
                  </h3>
                  <p className="text-sm text-white/70 truncate">{site.description}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-sm text-white/70">
                    Initial: {formatNumber(site.initial_budget)}
                  </div>
                  {"current_balance" in site && (
                    <div className={`text-sm font-semibold ${
                      (site.current_balance || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      Balance: {formatNumber(site.current_balance)}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

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
    </>
  );
}