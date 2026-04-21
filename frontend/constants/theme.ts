import { Platform } from 'react-native';

const tintColorLight = '#416AA6';
const tintColorDark = '#9AB8F4';

export const Colors = {
  light: {
    text: '#11181C',
    mutedText: '#6D88B6',
    background: '#FFFFFF',
    surface: '#F6F8FC',
    fieldBg: '#EEF3FB',
    border: '#E1E8F3',
    tint: tintColorLight,
    icon: '#416AA6',
    tabIconDefault: '#6D88B6',
    tabIconSelected: tintColorLight,
    primary: '#416AA6',
    primaryText: '#FFFFFF',
    secondary: '#9AB8F4',
    accent: '#00DF56',
    warn: '#E8A13B',
    danger: '#D64B4B',
    overlay: 'rgba(17, 24, 28, 0.45)',
  },
  dark: {
    text: '#ECEDEE',
    mutedText: '#9BA8C4',
    background: '#0E1420',
    surface: '#1A2233',
    fieldBg: '#202A3F',
    border: '#2B384F',
    tint: tintColorDark,
    icon: '#9AB8F4',
    tabIconDefault: '#6D7A92',
    tabIconSelected: tintColorDark,
    primary: '#9AB8F4',
    primaryText: '#0E1420',
    secondary: '#416AA6',
    accent: '#00DF56',
    warn: '#E8A13B',
    danger: '#FF6B6B',
    overlay: 'rgba(0, 0, 0, 0.55)',
  },
};

export type ColorPalette = typeof Colors.light;

export const Brand = {
  green: '#00DF56',
  blue: '#9AB8F4',
  brown: '#83593D',
  logoBlue: '#416AA6',
};

export const Space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const Radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  display: 34,
} as const;

export const Breakpoints = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

export const ScreenMaxWidth = {
  phone: 720,
  tablet: 960,
  desktop: 1200,
} as const;

export const Shadow = {
  card: Platform.select({
    web: {
      boxShadow: '0 4px 16px rgba(65, 106, 166, 0.08)',
    },
    default: {
      shadowColor: '#416AA6',
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
  }) as any,
  floating: Platform.select({
    web: {
      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
    },
    default: {
      shadowColor: '#0F172A',
      shadowOpacity: 0.12,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
  }) as any,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
}) as { sans: string; serif: string; rounded: string; mono: string };
