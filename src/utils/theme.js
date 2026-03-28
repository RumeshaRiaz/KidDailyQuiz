export const COLORS = {
  primary: '#534AB7',
  primaryDark: '#3C3489',
  primaryLight: '#EEEDFE',
  primaryMid: '#AFA9EC',

  teal: '#0F6E56',
  tealLight: '#E1F5EE',
  tealMid: '#5DCAA5',

  amber: '#854F0B',
  amberLight: '#FAEEDA',
  amberMid: '#EF9F27',

  coral: '#993C1D',
  coralLight: '#FAECE7',
  coralMid: '#F0997B',

  green: '#3B6D11',
  greenLight: '#EAF3DE',
  greenMid: '#97C459',

  white: '#FFFFFF',
  offWhite: '#F8F7FF',
  lightGray: '#F1EFE8',
  midGray: '#888780',
  darkGray: '#2C2C2A',
  text: '#1A1A2E',
  textMuted: '#6B6B8A',

  success: '#1D9E75',
  danger: '#E24B4A',
  warning: '#EF9F27',
};

export const SUBJECTS = [
  {
    key: 'math',
    label: 'Mathematics',
    shortLabel: 'Math',
    emoji: '🔢',
    color: COLORS.primary,
    lightColor: COLORS.primaryLight,
    midColor: COLORS.primaryMid,
    description: 'Numbers & Logic',
  },
  {
    key: 'science',
    label: 'Science',
    shortLabel: 'Science',
    emoji: '🔬',
    color: COLORS.teal,
    lightColor: COLORS.tealLight,
    midColor: COLORS.tealMid,
    description: 'Nature & Discovery',
  },
  {
    key: 'english',
    label: 'English',
    shortLabel: 'English',
    emoji: '📖',
    color: COLORS.coral,
    lightColor: COLORS.coralLight,
    midColor: COLORS.coralMid,
    description: 'Words & Grammar',
  },
  {
    key: 'gk',
    label: 'General Knowledge',
    shortLabel: 'GK',
    emoji: '🌍',
    color: COLORS.amber,
    lightColor: COLORS.amberLight,
    midColor: COLORS.amberMid,
    description: 'World & Facts',
  },
];

export const FONTS = {
  regular: 'System',
  bold: 'System',
};

export const SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};
