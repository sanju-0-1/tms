export const COLORS = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  secondary: '#0EA5E9',
  
  background: '#0F172A',
  card: '#1E293B',
  cardBorder: '#334155',
  inputBg: '#1E293B',
  
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.15)',
  info: '#3B82F6',
  infoLight: 'rgba(59, 130, 246, 0.15)',
  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.15)',
  
  border: '#334155',
  divider: '#1E293B',
  
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  large: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
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
