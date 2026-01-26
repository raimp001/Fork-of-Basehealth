/**
 * HIPAA Compliance Module
 * 
 * This module provides comprehensive HIPAA compliance utilities for BaseHealth.
 * It includes encryption, access control, audit logging, and PHI handling.
 * 
 * IMPORTANT: This module should be used in conjunction with:
 * 1. A signed BAA with your database provider (Neon)
 * 2. Proper network security configurations
 * 3. Regular security audits and penetration testing
 * 4. Staff HIPAA training
 * 
 * @module hipaa
 * @version 1.0.0
 */

export * from './config'
export * from './encryption'
export * from './phi-access-log'
export * from './middleware'
