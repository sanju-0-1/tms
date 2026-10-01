export const COLORS = {
  // Deep Emerald & Teal Theme (Identical to Website index.css & App.css)
  primary: '#10b981',
  primaryDark: '#059669',
  primaryLight: '#6ee7b7',
  primaryMint: '#a7f3d0',
  accent: '#14b8a6',
  accentDark: '#0d9488',
  accentWarm: '#f59e0b',

  background: '#020c07',
  card: '#0a2819',
  cardBorder: 'rgba(16, 185, 129, 0.18)',
  inputBg: 'rgba(16, 185, 129, 0.04)',

  text: '#ecfdf5',
  textSecondary: '#6ee7b7',
  textMuted: '#94a3b8',

  success: '#10b981',
  successLight: 'rgba(16, 185, 129, 0.15)',
  warning: '#f59e0b',
  warningLight: 'rgba(245, 158, 11, 0.15)',
  info: '#60a5fa',
  infoLight: 'rgba(96, 165, 250, 0.15)',
  danger: '#ef4444',
  dangerLight: 'rgba(239, 68, 68, 0.15)',

  border: 'rgba(16, 185, 129, 0.18)',
  divider: 'rgba(16, 185, 129, 0.12)',

  // Status Colors (Matching Website Status Pills)
  status: {
    Pending: { text: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)', border: '#fbbf24' },
    In_Progress: { text: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)', border: '#60a5fa' },
    Resolved: { text: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', border: '#34d399' },
    Completed: { text: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', border: '#34d399' },
    Rejected: { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: '#ef4444' },
  },

  // Priority Colors
  priority: {
    Low: { text: '#34d399', bg: 'rgba(52, 211, 153, 0.12)' },
    Medium: { text: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)' },
    High: { text: '#f97316', bg: 'rgba(249, 115, 22, 0.12)' },
    Urgent: { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
  }
};

export const SHADOWS = {
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  medium: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  large: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  }
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};
