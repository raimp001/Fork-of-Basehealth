/**
 * Unit Tests for Checkout State Machine
 * 
 * Tests FSM transitions, guards, and error recovery paths.
 */

import { describe, it, expect } from 'vitest'
import {
  checkoutReducer,
  initialContext,
  type CheckoutContext,
  type CheckoutEvent,
  type QuoteData,
  type WalletData,
  type TransactionResult,
} from '@/lib/checkout-machine'

// Test data
const mockQuote: QuoteData = {
  orderId: 'test-order-123',
  serviceName: 'Blood Panel',
  amountUsd: 75,
  amountUsdc: '75.00',
  providerId: 'provider-123',
  providerName: 'Dr. Smith',
  providerWallet: '0x1234567890abcdef',
}

const mockWallet: WalletData = {
  address: '0xabcdef1234567890',
  chainId: 84532, // Base Sepolia
}

const mockTransaction: TransactionResult = {
  paymentId: 'pay-123',
  txHash: '0xtxhash123',
  sender: '0xabcdef1234567890',
  amountUsdc: '75.00',
  recipient: '0x1234567890abcdef',
  timestamp: new Date(),
}

describe('Checkout State Machine', () => {
  describe('Initial State', () => {
    it('should start in idle state', () => {
      expect(initialContext.state).toBe('idle')
      expect(initialContext.quote).toBeNull()
      expect(initialContext.wallet).toBeNull()
      expect(initialContext.transaction).toBeNull()
      expect(initialContext.error).toBeNull()
      expect(initialContext.retryCount).toBe(0)
    })
  })

  describe('State Transitions', () => {
    describe('idle → quote_ready', () => {
      it('should transition to quote_ready when SET_QUOTE with valid quote', () => {
        const result = checkoutReducer(initialContext, {
          type: 'SET_QUOTE',
          payload: mockQuote,
        })

        expect(result.state).toBe('quote_ready')
        expect(result.quote).toEqual(mockQuote)
        expect(result.error).toBeNull()
      })

      it('should NOT transition if amount is 0', () => {
        const result = checkoutReducer(initialContext, {
          type: 'SET_QUOTE',
          payload: { ...mockQuote, amountUsd: 0 },
        })

        expect(result.state).toBe('idle')
      })
    })

    describe('quote_ready → wallet_ready', () => {
      const quoteReadyContext: CheckoutContext = {
        ...initialContext,
        state: 'quote_ready',
        quote: mockQuote,
      }

      it('should transition to wallet_ready when WALLET_CONNECTED', () => {
        const result = checkoutReducer(quoteReadyContext, {
          type: 'WALLET_CONNECTED',
          payload: mockWallet,
        })

        expect(result.state).toBe('wallet_ready')
        expect(result.wallet).toEqual(mockWallet)
      })

      it('should NOT transition without quote', () => {
        const noQuoteContext: CheckoutContext = {
          ...initialContext,
          state: 'quote_ready',
          quote: null,
        }

        const result = checkoutReducer(noQuoteContext, {
          type: 'WALLET_CONNECTED',
          payload: mockWallet,
        })

        expect(result.state).toBe('quote_ready')
        expect(result.wallet).toBeNull()
      })
    })

    describe('wallet_ready → awaiting_confirm → tx_pending', () => {
      const walletReadyContext: CheckoutContext = {
        ...initialContext,
        state: 'wallet_ready',
        quote: mockQuote,
        wallet: mockWallet,
      }

      it('should transition to awaiting_confirm when REQUEST_CONFIRM', () => {
        const result = checkoutReducer(walletReadyContext, {
          type: 'REQUEST_CONFIRM',
        })

        expect(result.state).toBe('awaiting_confirm')
      })

      it('should transition to tx_pending when USER_CONFIRMED', () => {
        const awaitingContext: CheckoutContext = {
          ...walletReadyContext,
          state: 'awaiting_confirm',
        }

        const result = checkoutReducer(awaitingContext, {
          type: 'USER_CONFIRMED',
        })

        expect(result.state).toBe('tx_pending')
      })

      it('should return to wallet_ready when USER_REJECTED', () => {
        const awaitingContext: CheckoutContext = {
          ...walletReadyContext,
          state: 'awaiting_confirm',
        }

        const result = checkoutReducer(awaitingContext, {
          type: 'USER_REJECTED',
        })

        expect(result.state).toBe('wallet_ready')
        expect(result.error).toBe('Transaction cancelled')
      })
    })

    describe('tx_pending → confirmed/failed', () => {
      const pendingContext: CheckoutContext = {
        ...initialContext,
        state: 'tx_pending',
        quote: mockQuote,
        wallet: mockWallet,
      }

      it('should transition to confirmed when TX_CONFIRMED', () => {
        const result = checkoutReducer(pendingContext, {
          type: 'TX_CONFIRMED',
          payload: mockTransaction,
        })

        expect(result.state).toBe('confirmed')
        expect(result.transaction).toEqual(mockTransaction)
        expect(result.retryCount).toBe(0) // Reset on success
      })

      it('should transition to failed when TX_FAILED', () => {
        const result = checkoutReducer(pendingContext, {
          type: 'TX_FAILED',
          payload: { error: 'Network error', recoverable: true },
        })

        expect(result.state).toBe('failed')
        expect(result.error).toBe('Network error')
        expect(result.retryCount).toBe(1)
      })
    })

    describe('confirmed → receipt', () => {
      it('should transition to receipt when SHOW_RECEIPT', () => {
        const confirmedContext: CheckoutContext = {
          ...initialContext,
          state: 'confirmed',
          quote: mockQuote,
          wallet: mockWallet,
          transaction: mockTransaction,
        }

        const result = checkoutReducer(confirmedContext, {
          type: 'SHOW_RECEIPT',
        })

        expect(result.state).toBe('receipt')
      })
    })
  })

  describe('Guard: Cannot enter tx_pending without wallet_ready', () => {
    it('should NOT allow tx_pending without wallet connected', () => {
      const noWalletContext: CheckoutContext = {
        ...initialContext,
        state: 'awaiting_confirm',
        quote: mockQuote,
        wallet: null, // No wallet!
      }

      const result = checkoutReducer(noWalletContext, {
        type: 'USER_CONFIRMED',
      })

      // Should stay in awaiting_confirm
      expect(result.state).toBe('awaiting_confirm')
    })

    it('should NOT allow tx_pending without quote', () => {
      const noQuoteContext: CheckoutContext = {
        ...initialContext,
        state: 'awaiting_confirm',
        quote: null, // No quote!
        wallet: mockWallet,
      }

      const result = checkoutReducer(noQuoteContext, {
        type: 'USER_CONFIRMED',
      })

      expect(result.state).toBe('awaiting_confirm')
    })
  })

  describe('Error Recovery: Retry Paths', () => {
    it('should allow retry when retryCount < maxRetries', () => {
      const failedContext: CheckoutContext = {
        ...initialContext,
        state: 'failed',
        quote: mockQuote,
        wallet: mockWallet,
        error: 'Network error',
        retryCount: 1,
        maxRetries: 3,
      }

      const result = checkoutReducer(failedContext, { type: 'RETRY' })

      expect(result.state).toBe('wallet_ready') // Back to wallet_ready with wallet
      expect(result.error).toBeNull()
    })

    it('should return to quote_ready if wallet was lost', () => {
      const failedNoWalletContext: CheckoutContext = {
        ...initialContext,
        state: 'failed',
        quote: mockQuote,
        wallet: null, // Lost wallet connection
        error: 'Wallet disconnected',
        retryCount: 1,
        maxRetries: 3,
      }

      const result = checkoutReducer(failedNoWalletContext, { type: 'RETRY' })

      expect(result.state).toBe('quote_ready')
    })

    it('should NOT allow retry when retryCount >= maxRetries', () => {
      const maxRetriesContext: CheckoutContext = {
        ...initialContext,
        state: 'failed',
        quote: mockQuote,
        error: 'Permanent error',
        retryCount: 3,
        maxRetries: 3,
      }

      const result = checkoutReducer(maxRetriesContext, { type: 'RETRY' })

      expect(result.state).toBe('failed') // Stays in failed
    })

    it('should set retryCount to max when error is not recoverable', () => {
      const pendingContext: CheckoutContext = {
        ...initialContext,
        state: 'tx_pending',
        quote: mockQuote,
        wallet: mockWallet,
        retryCount: 0,
        maxRetries: 3,
      }

      const result = checkoutReducer(pendingContext, {
        type: 'TX_FAILED',
        payload: { error: 'Insufficient funds', recoverable: false },
      })

      expect(result.state).toBe('failed')
      expect(result.retryCount).toBe(3) // Set to max, no more retries allowed
    })
  })

  describe('Reset', () => {
    it('should reset to initial context', () => {
      const complexContext: CheckoutContext = {
        state: 'failed',
        quote: mockQuote,
        wallet: mockWallet,
        transaction: mockTransaction,
        error: 'Some error',
        retryCount: 2,
        maxRetries: 3,
      }

      const result = checkoutReducer(complexContext, { type: 'RESET' })

      expect(result).toEqual(initialContext)
    })
  })

  describe('Wallet Disconnection', () => {
    it('should return to quote_ready when wallet disconnected from wallet_ready', () => {
      const walletReadyContext: CheckoutContext = {
        ...initialContext,
        state: 'wallet_ready',
        quote: mockQuote,
        wallet: mockWallet,
      }

      const result = checkoutReducer(walletReadyContext, {
        type: 'WALLET_DISCONNECTED',
      })

      expect(result.state).toBe('quote_ready')
      expect(result.wallet).toBeNull()
    })

    it('should return to quote_ready when wallet disconnected from awaiting_confirm', () => {
      const awaitingContext: CheckoutContext = {
        ...initialContext,
        state: 'awaiting_confirm',
        quote: mockQuote,
        wallet: mockWallet,
      }

      const result = checkoutReducer(awaitingContext, {
        type: 'WALLET_DISCONNECTED',
      })

      expect(result.state).toBe('quote_ready')
      expect(result.wallet).toBeNull()
    })
  })
})
