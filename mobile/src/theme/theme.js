export const COLORS = {
  // Exact Deep Forest Emerald Theme from tms12 Website
  primary: '#10B981',
  primaryDark: '#047857',
  primaryLight: '#34D399',
  accent: '#06B6D4',
  secondary: '#052C1D',
  accentWarm: '#F59E0B',

  background: '#020F09',
  card: '#052A1B',
  cardBorder: 'rgba(16, 185, 129, 0.22)',
  inputBg: 'rgba(16, 185, 129, 0.06)',

  text: '#ECFDF5',
  textSecondary: '#6EE7B7',
  textMuted: '#9CA3AF',

  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.18)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.18)',
  info: '#06B6D4',
  infoLight: 'rgba(6, 182, 212, 0.18)',
  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.18)',

  border: 'rgba(16, 185, 129, 0.2)',
  divider: 'rgba(16, 185, 129, 0.12)',

  // Status Colors
  status: {
    Pending: { text: '#F59E0B', bg: 'rgba(245, 158, 11, 0.18)', border: '#F59E0B' },
    In_Progress: { text: '#06B6D4', bg: 'rgba(6, 182, 212, 0.18)', border: '#06B6D4' },
    Resolved: { text: '#10B981', bg: 'rgba(16, 185, 129, 0.18)', border: '#10B981' },
    Rejected: { text: '#EF4444', bg: 'rgba(239, 68, 68, 0.18)', border: '#EF4444' },
  },

  // Priority Colors
  priority: {
    Low: { text: '#10B981', bg: 'rgba(16, 185, 129, 0.18)' },
    Medium: { text: '#F59E0B', bg: 'rgba(245, 158, 11, 0.18)' },
    High: { text: '#F97316', bg: 'rgba(249, 115, 22, 0.18)' },
    Urgent: { text: '#EF4444', bg: 'rgba(239, 68, 68, 0.18)' },
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
