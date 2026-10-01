export const COLORS = {
  // Deep Emerald & Teal Theme (matching Website)
  primary: '#10B981',
  primaryDark: '#059669',
  primaryLight: '#34D399',
  accent: '#14B8A6',
  secondary: '#0D9488',
  accentWarm: '#F59E0B',

  background: '#020C07',
  card: '#0A2819',
  cardBorder: 'rgba(16, 185, 129, 0.18)',
  inputBg: 'rgba(16, 185, 129, 0.05)',

  text: '#ECFDF5',
  textSecondary: '#6EE7B7',
  textMuted: '#94A3B8',

  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.15)',
  info: '#3B82F6',
  infoLight: 'rgba(59, 130, 246, 0.15)',
  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.15)',

  border: 'rgba(16, 185, 129, 0.18)',
  divider: 'rgba(16, 185, 129, 0.12)',

  // Status Colors
  status: {
    Pending: { text: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', border: '#F59E0B' },
    In_Progress: { text: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)', border: '#3B82F6' },
    Resolved: { text: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', border: '#10B981' },
    Rejected: { text: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', border: '#EF4444' },
  },

  // Priority Colors
  priority: {
    Low: { text: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
    Medium: { text: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
    High: { text: '#F97316', bg: 'rgba(249, 115, 22, 0.15)' },
    Urgent: { text: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' },
  }
};

export const SHADOWS = {
  small: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  large: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
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
