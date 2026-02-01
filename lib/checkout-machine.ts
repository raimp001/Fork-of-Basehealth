/**
 * Checkout State Machine
 * 
 * Reducer-based finite state machine for checkout flow.
 * Models the complete payment lifecycle with guarded transitions.
 * 
 * States:
 *   idle → quote_ready → wallet_ready → awaiting_confirm → tx_pending → confirmed → receipt
 *                                                              ↓
 *                                                           failed → (retry paths)
 * 
 * @module checkout-machine
 */

// =============================================================================
// TYPES
// =============================================================================

export type CheckoutState = 
  | 'idle'
  | 'quote_ready'
  | 'wallet_ready'
  | 'awaiting_confirm'
  | 'tx_pending'
  | 'confirmed'
  | 'receipt'
  | 'failed'

export type CheckoutEvent =
  | { type: 'SET_QUOTE'; payload: QuoteData }
  | { type: 'WALLET_CONNECTED'; payload: WalletData }
  | { type: 'WALLET_DISCONNECTED' }
  | { type: 'REQUEST_CONFIRM' }
  | { type: 'USER_CONFIRMED' }
  | { type: 'USER_REJECTED' }
  | { type: 'TX_SUBMITTED'; payload: { txHash: string } }
  | { type: 'TX_CONFIRMED'; payload: TransactionResult }
  | { type: 'TX_FAILED'; payload: { error: string; recoverable: boolean } }
  | { type: 'SHOW_RECEIPT' }
  | { type: 'RETRY' }
  | { type: 'RESET' }

export interface QuoteData {
  orderId: string
  serviceName: string
  serviceDescription?: string
  amountUsd: number
  amountUsdc: string
  providerId: string
  providerName?: string
  providerWallet?: string
}

export interface WalletData {
  address: string
  chainId: number
  balance?: string
}

export interface TransactionResult {
  paymentId: string
  txHash?: string
  sender?: string
  amountUsdc: string
  recipient: string
  timestamp: Date
}

export interface CheckoutContext {
  state: CheckoutState
  quote: QuoteData | null
  wallet: WalletData | null
  transaction: TransactionResult | null
  error: string | null
  retryCount: number
  maxRetries: number
}

// =============================================================================
// INITIAL STATE
// =============================================================================

export const initialContext: CheckoutContext = {
  state: 'idle',
  quote: null,
  wallet: null,
  transaction: null,
  error: null,
  retryCount: 0,
  maxRetries: 3,
}

// =============================================================================
// GUARDS (Transition Validators)
// =============================================================================

const guards = {
  canEnterQuoteReady: (ctx: CheckoutContext, event: CheckoutEvent): boolean => {
    return event.type === 'SET_QUOTE' && 
           ctx.state === 'idle' &&
           event.payload.amountUsd > 0
  },

  canEnterWalletReady: (ctx: CheckoutContext, event: CheckoutEvent): boolean => {
    return event.type === 'WALLET_CONNECTED' &&
           ctx.state === 'quote_ready' &&
           ctx.quote !== null &&
           !!event.payload.address
  },

  canEnterAwaitingConfirm: (ctx: CheckoutContext): boolean => {
    return ctx.state === 'wallet_ready' &&
           ctx.wallet !== null &&
           ctx.quote !== null
  },

  canEnterTxPending: (ctx: CheckoutContext): boolean => {
    // CRITICAL: Cannot enter tx_pending without wallet_ready being satisfied
    return ctx.state === 'awaiting_confirm' &&
           ctx.wallet !== null &&
           ctx.quote !== null
  },

  canRetry: (ctx: CheckoutContext): boolean => {
    return ctx.state === 'failed' &&
           ctx.retryCount < ctx.maxRetries
  },
}

// =============================================================================
// REDUCER
// =============================================================================

export function checkoutReducer(
  ctx: CheckoutContext,
  event: CheckoutEvent
): CheckoutContext {
  switch (event.type) {
    case 'SET_QUOTE':
      if (guards.canEnterQuoteReady(ctx, event)) {
        return {
          ...ctx,
          state: 'quote_ready',
          quote: event.payload,
          error: null,
        }
      }
      // Allow updating quote while in quote_ready
      if (ctx.state === 'quote_ready') {
        return {
          ...ctx,
          quote: event.payload,
        }
      }
      return ctx

    case 'WALLET_CONNECTED':
      if (guards.canEnterWalletReady(ctx, event)) {
        return {
          ...ctx,
          state: 'wallet_ready',
          wallet: event.payload,
          error: null,
        }
      }
      // Update wallet info in wallet_ready state
      if (ctx.state === 'wallet_ready') {
        return {
          ...ctx,
          wallet: event.payload,
        }
      }
      return ctx

    case 'WALLET_DISCONNECTED':
      if (ctx.state === 'wallet_ready' || ctx.state === 'awaiting_confirm') {
        return {
          ...ctx,
          state: 'quote_ready',
          wallet: null,
          error: null,
        }
      }
      return ctx

    case 'REQUEST_CONFIRM':
      if (guards.canEnterAwaitingConfirm(ctx)) {
        return {
          ...ctx,
          state: 'awaiting_confirm',
          error: null,
        }
      }
      return ctx

    case 'USER_CONFIRMED':
      if (guards.canEnterTxPending(ctx)) {
        return {
          ...ctx,
          state: 'tx_pending',
          error: null,
        }
      }
      return ctx

    case 'USER_REJECTED':
      if (ctx.state === 'awaiting_confirm') {
        return {
          ...ctx,
          state: 'wallet_ready',
          error: 'Transaction cancelled',
        }
      }
      return ctx

    case 'TX_SUBMITTED':
      // Update txHash while pending
      if (ctx.state === 'tx_pending') {
        return {
          ...ctx,
          transaction: {
            ...ctx.transaction,
            paymentId: ctx.transaction?.paymentId || '',
            txHash: event.payload.txHash,
            sender: ctx.wallet?.address || '',
            amountUsdc: ctx.quote?.amountUsdc || '0',
            recipient: ctx.quote?.providerWallet || '',
            timestamp: new Date(),
          },
        }
      }
      return ctx

    case 'TX_CONFIRMED':
      if (ctx.state === 'tx_pending') {
        return {
          ...ctx,
          state: 'confirmed',
          transaction: event.payload,
          error: null,
          retryCount: 0,
        }
      }
      return ctx

    case 'TX_FAILED':
      if (ctx.state === 'tx_pending' || ctx.state === 'awaiting_confirm') {
        return {
          ...ctx,
          state: 'failed',
          error: event.payload.error,
          retryCount: event.payload.recoverable ? ctx.retryCount + 1 : ctx.maxRetries,
        }
      }
      return ctx

    case 'SHOW_RECEIPT':
      if (ctx.state === 'confirmed') {
        return {
          ...ctx,
          state: 'receipt',
        }
      }
      return ctx

    case 'RETRY':
      if (guards.canRetry(ctx)) {
        // Return to wallet_ready to attempt again
        return {
          ...ctx,
          state: ctx.wallet ? 'wallet_ready' : 'quote_ready',
          error: null,
        }
      }
      return ctx

    case 'RESET':
      return initialContext

    default:
      return ctx
  }
}

// =============================================================================
// REACT HOOK
// =============================================================================

import { useReducer, useCallback } from 'react'

export function useCheckoutMachine(initialState?: Partial<CheckoutContext>) {
  const [context, dispatch] = useReducer(
    checkoutReducer,
    { ...initialContext, ...initialState }
  )

  const send = useCallback((event: CheckoutEvent) => {
    dispatch(event)
  }, [])

  // Convenience methods
  const actions = {
    setQuote: (quote: QuoteData) => send({ type: 'SET_QUOTE', payload: quote }),
    
    connectWallet: (wallet: WalletData) => 
      send({ type: 'WALLET_CONNECTED', payload: wallet }),
    
    disconnectWallet: () => send({ type: 'WALLET_DISCONNECTED' }),
    
    requestConfirm: () => send({ type: 'REQUEST_CONFIRM' }),
    
    confirm: () => send({ type: 'USER_CONFIRMED' }),
    
    reject: () => send({ type: 'USER_REJECTED' }),
    
    submitTx: (txHash: string) => 
      send({ type: 'TX_SUBMITTED', payload: { txHash } }),
    
    confirmTx: (result: TransactionResult) => 
      send({ type: 'TX_CONFIRMED', payload: result }),
    
    failTx: (error: string, recoverable = true) => 
      send({ type: 'TX_FAILED', payload: { error, recoverable } }),
    
    showReceipt: () => send({ type: 'SHOW_RECEIPT' }),
    
    retry: () => send({ type: 'RETRY' }),
    
    reset: () => send({ type: 'RESET' }),
  }

  // State checks
  const is = {
    idle: context.state === 'idle',
    quoteReady: context.state === 'quote_ready',
    walletReady: context.state === 'wallet_ready',
    awaitingConfirm: context.state === 'awaiting_confirm',
    pending: context.state === 'tx_pending',
    confirmed: context.state === 'confirmed',
    receipt: context.state === 'receipt',
    failed: context.state === 'failed',
    canPay: context.state === 'wallet_ready' && context.wallet !== null,
    canRetry: guards.canRetry(context),
  }

  return {
    context,
    send,
    actions,
    is,
  }
}

// =============================================================================
// SELECTORS
// =============================================================================

export const selectors = {
  getDisplayAmount: (ctx: CheckoutContext): string => {
    if (!ctx.quote) return '$0.00'
    return `$${ctx.quote.amountUsd.toFixed(2)}`
  },

  getServiceName: (ctx: CheckoutContext): string => {
    return ctx.quote?.serviceName || 'Healthcare Service'
  },

  getTxExplorerUrl: (ctx: CheckoutContext): string | null => {
    if (!ctx.transaction?.txHash) return null
    const isTestnet = process.env.NODE_ENV !== 'production'
    const baseUrl = isTestnet 
      ? 'https://sepolia.basescan.org' 
      : 'https://basescan.org'
    return `${baseUrl}/tx/${ctx.transaction.txHash}`
  },

  canProceed: (ctx: CheckoutContext): boolean => {
    switch (ctx.state) {
      case 'idle':
        return false
      case 'quote_ready':
        return false // Need wallet
      case 'wallet_ready':
        return true // Can pay
      case 'awaiting_confirm':
        return false // Waiting
      case 'tx_pending':
        return false // Processing
      case 'confirmed':
        return true // Can view receipt
      case 'receipt':
        return true // Done
      case 'failed':
        return ctx.retryCount < ctx.maxRetries
      default:
        return false
    }
  },
}
