/**
 * Saved Items System
 * Allows users to save and manage providers, clinical trials, and other items
 */

export type SavedItemType = 'provider' | 'trial' | 'screening' | 'article'

export interface SavedItem {
  id: string
  type: SavedItemType
  itemId: string
  title: string
  subtitle?: string
  metadata: Record<string, unknown>
  savedAt: Date
  notes?: string
  tags?: string[]
}

const STORAGE_KEY = 'basehealth_saved_items'

// Get all saved items
export function getSavedItems(): SavedItem[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const items = JSON.parse(stored) as SavedItem[]
    return items.map(item => ({
      ...item,
      savedAt: new Date(item.savedAt)
    }))
  } catch {
    return []
  }
}

// Get saved items by type
export function getSavedItemsByType(type: SavedItemType): SavedItem[] {
  return getSavedItems().filter(item => item.type === type)
}

// Check if an item is saved
export function isItemSaved(type: SavedItemType, itemId: string): boolean {
  const items = getSavedItems()
  return items.some(item => item.type === type && item.itemId === itemId)
}

// Save an item
export function saveItem(item: Omit<SavedItem, 'id' | 'savedAt'>): SavedItem {
  const items = getSavedItems()
  
  // Check if already saved
  const existing = items.find(i => i.type === item.type && i.itemId === item.itemId)
  if (existing) return existing
  
  const newItem: SavedItem = {
    ...item,
    id: `saved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    savedAt: new Date(),
  }
  
  items.unshift(newItem)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  
  // Dispatch event for real-time updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('saved-item-added', { detail: newItem }))
  }
  
  return newItem
}

// Remove a saved item
export function removeSavedItem(type: SavedItemType, itemId: string): void {
  const items = getSavedItems()
  const filtered = items.filter(item => !(item.type === type && item.itemId === itemId))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('saved-item-removed', { detail: { type, itemId } }))
  }
}

// Toggle saved status
export function toggleSavedItem(item: Omit<SavedItem, 'id' | 'savedAt'>): boolean {
  const isSaved = isItemSaved(item.type, item.itemId)
  
  if (isSaved) {
    removeSavedItem(item.type, item.itemId)
    return false
  } else {
    saveItem(item)
    return true
  }
}

// Update notes for a saved item
export function updateSavedItemNotes(id: string, notes: string): void {
  const items = getSavedItems()
  const updated = items.map(item => 
    item.id === id ? { ...item, notes } : item
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

// Add tags to a saved item
export function updateSavedItemTags(id: string, tags: string[]): void {
  const items = getSavedItems()
  const updated = items.map(item => 
    item.id === id ? { ...item, tags } : item
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

// Get saved providers count
export function getSavedProvidersCount(): number {
  return getSavedItemsByType('provider').length
}

// Get saved trials count
export function getSavedTrialsCount(): number {
  return getSavedItemsByType('trial').length
}

// Get total saved count
export function getTotalSavedCount(): number {
  return getSavedItems().length
}

// Clear all saved items (with confirmation)
export function clearAllSavedItems(): void {
  localStorage.removeItem(STORAGE_KEY)
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('saved-items-cleared'))
  }
}

// Export saved items (for backup)
export function exportSavedItems(): string {
  const items = getSavedItems()
  return JSON.stringify(items, null, 2)
}

// Import saved items
export function importSavedItems(jsonString: string): number {
  try {
    const imported = JSON.parse(jsonString) as SavedItem[]
    const existing = getSavedItems()
    
    // Merge, avoiding duplicates
    const merged = [...existing]
    let addedCount = 0
    
    for (const item of imported) {
      if (!existing.some(e => e.type === item.type && e.itemId === item.itemId)) {
        merged.push({
          ...item,
          id: `saved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          savedAt: new Date(item.savedAt)
        })
        addedCount++
      }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    return addedCount
  } catch {
    throw new Error('Invalid saved items format')
  }
}

// Helper functions for specific types

export const SavedProviders = {
  save: (provider: {
    npi: string
    name: string
    specialty: string
    address?: string
    phone?: string
  }) => saveItem({
    type: 'provider',
    itemId: provider.npi,
    title: provider.name,
    subtitle: provider.specialty,
    metadata: provider,
  }),
  
  remove: (npi: string) => removeSavedItem('provider', npi),
  
  isSaved: (npi: string) => isItemSaved('provider', npi),
  
  toggle: (provider: {
    npi: string
    name: string
    specialty: string
    address?: string
    phone?: string
  }) => toggleSavedItem({
    type: 'provider',
    itemId: provider.npi,
    title: provider.name,
    subtitle: provider.specialty,
    metadata: provider,
  }),
  
  getAll: () => getSavedItemsByType('provider'),
}

export const SavedTrials = {
  save: (trial: {
    nctId: string
    title: string
    phase?: string
    condition?: string
    location?: string
  }) => saveItem({
    type: 'trial',
    itemId: trial.nctId,
    title: trial.title,
    subtitle: trial.condition,
    metadata: trial,
  }),
  
  remove: (nctId: string) => removeSavedItem('trial', nctId),
  
  isSaved: (nctId: string) => isItemSaved('trial', nctId),
  
  toggle: (trial: {
    nctId: string
    title: string
    phase?: string
    condition?: string
    location?: string
  }) => toggleSavedItem({
    type: 'trial',
    itemId: trial.nctId,
    title: trial.title,
    subtitle: trial.condition,
    metadata: trial,
  }),
  
  getAll: () => getSavedItemsByType('trial'),
}

