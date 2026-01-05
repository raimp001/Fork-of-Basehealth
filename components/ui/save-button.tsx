"use client"

/**
 * Save Button Component
 * Reusable button for saving providers, trials, etc.
 */

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Bookmark, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  SavedProviders,
  SavedTrials,
  isItemSaved,
  SavedItemType
} from "@/lib/saved-items"

interface SaveButtonProps {
  type: SavedItemType
  itemId: string
  item: Record<string, unknown>
  variant?: 'icon' | 'button' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onSaveChange?: (isSaved: boolean) => void
}

export function SaveButton({
  type,
  itemId,
  item,
  variant = 'button',
  size = 'md',
  className,
  onSaveChange,
}: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsSaved(isItemSaved(type, itemId))
    
    const handleAdd = (e: CustomEvent) => {
      if (e.detail?.type === type && e.detail?.itemId === itemId) {
        setIsSaved(true)
      }
    }
    
    const handleRemove = (e: CustomEvent) => {
      if (e.detail?.type === type && e.detail?.itemId === itemId) {
        setIsSaved(false)
      }
    }
    
    window.addEventListener('saved-item-added', handleAdd as EventListener)
    window.addEventListener('saved-item-removed', handleRemove as EventListener)
    
    return () => {
      window.removeEventListener('saved-item-added', handleAdd as EventListener)
      window.removeEventListener('saved-item-removed', handleRemove as EventListener)
    }
  }, [type, itemId])

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)
    
    let newSavedState: boolean
    
    if (type === 'provider') {
      newSavedState = SavedProviders.toggle(item as Parameters<typeof SavedProviders.toggle>[0])
    } else if (type === 'trial') {
      newSavedState = SavedTrials.toggle(item as Parameters<typeof SavedTrials.toggle>[0])
    } else {
      return
    }
    
    setIsSaved(newSavedState)
    onSaveChange?.(newSavedState)
  }

  const sizes = {
    sm: { icon: 'h-4 w-4', button: 'h-8 px-3 text-xs' },
    md: { icon: 'h-5 w-5', button: 'h-9 px-4 text-sm' },
    lg: { icon: 'h-6 w-6', button: 'h-10 px-5 text-base' },
  }

  const Icon = type === 'provider' ? Heart : Bookmark

  // Icon-only variant
  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        className={cn(
          "p-2 rounded-full transition-all duration-200",
          isSaved
            ? "bg-rose-100 text-rose-600 hover:bg-rose-200"
            : "bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700",
          isAnimating && "scale-125",
          className
        )}
        aria-label={isSaved ? 'Remove from saved' : 'Save'}
      >
        <Icon
          className={cn(
            sizes[size].icon,
            "transition-transform",
            isSaved && "fill-current"
          )}
        />
      </button>
    )
  }

  // Minimal variant (just icon, no background)
  if (variant === 'minimal') {
    return (
      <button
        onClick={handleToggle}
        className={cn(
          "transition-all duration-200 hover:scale-110",
          isSaved ? "text-rose-500" : "text-stone-400 hover:text-stone-600",
          isAnimating && "scale-125",
          className
        )}
        aria-label={isSaved ? 'Remove from saved' : 'Save'}
      >
        <Icon
          className={cn(
            sizes[size].icon,
            isSaved && "fill-current"
          )}
        />
      </button>
    )
  }

  // Button variant (with text)
  return (
    <Button
      variant={isSaved ? "secondary" : "outline"}
      onClick={handleToggle}
      className={cn(
        sizes[size].button,
        "gap-2 font-medium transition-all",
        isSaved
          ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
          : "border-stone-300 hover:border-stone-400",
        isAnimating && "scale-105",
        className
      )}
    >
      {isSaved ? (
        <>
          <Check className={sizes[size].icon} />
          Saved
        </>
      ) : (
        <>
          <Icon className={sizes[size].icon} />
          Save
        </>
      )}
    </Button>
  )
}

// Specialized variants
export function SaveProviderButton({
  provider,
  ...props
}: Omit<SaveButtonProps, 'type' | 'itemId' | 'item'> & {
  provider: { npi: string; name: string; specialty: string; address?: string; phone?: string }
}) {
  return (
    <SaveButton
      type="provider"
      itemId={provider.npi}
      item={provider}
      {...props}
    />
  )
}

export function SaveTrialButton({
  trial,
  ...props
}: Omit<SaveButtonProps, 'type' | 'itemId' | 'item'> & {
  trial: { nctId: string; title: string; phase?: string; condition?: string; location?: string }
}) {
  return (
    <SaveButton
      type="trial"
      itemId={trial.nctId}
      item={trial}
      {...props}
    />
  )
}

