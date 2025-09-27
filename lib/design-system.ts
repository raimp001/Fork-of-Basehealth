// BaseHealth Design System
// Standardized colors, spacing, and design tokens

export const colors = {
  // Primary brand colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe', 
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    900: '#0c4a6e',
  },
  
  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  
  // Neutral grays (our main brand colors)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
}

export const spacing = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
}

export const borderRadius = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
}

export const fontSize = {
  xs: '0.75rem',   // 12px
  sm: '0.875rem',  // 14px
  base: '1rem',    // 16px
  lg: '1.125rem',  // 18px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
  '6xl': '3.75rem',  // 60px
}

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
}

// Component-specific styles
export const components = {
  button: {
    primary: `bg-gray-900 hover:bg-gray-800 text-white border-gray-900 hover:border-gray-800`,
    secondary: `bg-white hover:bg-gray-50 text-gray-900 border-gray-300 hover:border-gray-400`,
    success: `bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700`,
    warning: `bg-amber-500 hover:bg-amber-600 text-white border-amber-500 hover:border-amber-600`,
    error: `bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700`,
    ghost: `bg-transparent hover:bg-gray-100 text-gray-700 hover:text-gray-900`,
    link: `bg-transparent hover:bg-transparent text-primary-600 hover:text-primary-700 underline`,
  },
  
  input: {
    base: `border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200`,
    error: `border-2 border-red-300 bg-white text-gray-900 placeholder-gray-500 hover:border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200`,
  },
  
  card: {
    base: `bg-white border border-gray-200 rounded-lg shadow-sm`,
    elevated: `bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow`,
  },
  
  badge: {
    primary: `bg-primary-100 text-primary-800 border-primary-200`,
    success: `bg-green-100 text-green-800 border-green-200`,
    warning: `bg-amber-100 text-amber-800 border-amber-200`,
    error: `bg-red-100 text-red-800 border-red-200`,
    gray: `bg-gray-100 text-gray-800 border-gray-200`,
  }
}

// Animation constants
export const animations = {
  fadeIn: 'animate-fade-in-up',
  slideIn: 'animate-slide-in-right',
  bounceIn: 'animate-bounce-in',
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  }
}

// Healthcare-specific design tokens
export const healthcare = {
  colors: {
    medical: '#0ea5e9',     // Blue for medical/clinical
    wellness: '#22c55e',    // Green for wellness/health
    emergency: '#ef4444',   // Red for emergency/urgent
    mental: '#8b5cf6',      // Purple for mental health
    specialty: '#f59e0b',   // Amber for specialty care
  },
  
  iconSizes: {
    xs: '1rem',    // 16px
    sm: '1.25rem', // 20px  
    md: '1.5rem',  // 24px
    lg: '2rem',    // 32px
    xl: '2.5rem',  // 40px
  }
}

export default {
  colors,
  spacing,
  borderRadius,
  fontSize,
  shadows,
  components,
  animations,
  healthcare
}
