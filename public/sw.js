/**
 * BaseHealth Service Worker
 * Enables offline functionality and caching
 */

const CACHE_NAME = 'basehealth-v1'
const OFFLINE_URL = '/offline'

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// Dynamic cache strategies
const CACHE_STRATEGIES = {
  // Network first for API calls
  networkFirst: [
    '/api/',
  ],
  // Cache first for static assets
  cacheFirst: [
    '/fonts/',
    '/images/',
    '/_next/static/',
  ],
  // Stale while revalidate for pages
  staleWhileRevalidate: [
    '/screening',
    '/providers',
    '/clinical-trials',
    '/patient-portal',
  ],
}

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching assets')
      return cache.addAll(PRECACHE_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - handle requests with appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return

  // Determine cache strategy
  const strategy = getStrategy(url.pathname)

  switch (strategy) {
    case 'networkFirst':
      event.respondWith(networkFirst(request))
      break
    case 'cacheFirst':
      event.respondWith(cacheFirst(request))
      break
    case 'staleWhileRevalidate':
      event.respondWith(staleWhileRevalidate(request))
      break
    default:
      event.respondWith(networkFirst(request))
  }
})

// Get caching strategy for a path
function getStrategy(pathname) {
  for (const [strategy, paths] of Object.entries(CACHE_STRATEGIES)) {
    if (paths.some((path) => pathname.startsWith(path))) {
      return strategy
    }
  }
  return 'networkFirst'
}

// Network first strategy - try network, fall back to cache
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    const cached = await caches.match(request)
    if (cached) return cached
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match(OFFLINE_URL)
      if (offlinePage) return offlinePage
    }
    
    throw error
  }
}

// Cache first strategy - try cache, fall back to network
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    // Return offline response for navigation
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match(OFFLINE_URL)
      if (offlinePage) return offlinePage
    }
    
    throw error
  }
}

// Stale while revalidate - return cache immediately, update in background
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request)
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cache = caches.open(CACHE_NAME)
      cache.then((c) => c.put(request, response.clone()))
    }
    return response
  }).catch(() => {
    // If network fails and we have cache, that's fine
    if (cached) return cached
    throw new Error('Network failed and no cache available')
  })

  return cached || fetchPromise
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'default',
    data: data.url || '/',
    actions: data.actions || [],
    vibrate: [100, 50, 100],
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-saved-items') {
    event.waitUntil(syncSavedItems())
  }
})

async function syncSavedItems() {
  // Implement sync logic when needed
  console.log('[SW] Syncing saved items...')
}

