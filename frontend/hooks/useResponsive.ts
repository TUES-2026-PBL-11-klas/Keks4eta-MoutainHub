import { useWindowDimensions } from 'react-native';
import { Breakpoints } from '@/constants/theme';

export type Breakpoint = 'phone' | 'tablet' | 'desktop' | 'wide';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isWide = width >= Breakpoints.wide;
  const isDesktop = width >= Breakpoints.desktop;
  const isTablet = width >= Breakpoints.tablet && width < Breakpoints.desktop;
  const isPhone = width < Breakpoints.tablet;

  const breakpoint: Breakpoint = isWide
    ? 'wide'
    : isDesktop
    ? 'desktop'
    : isTablet
    ? 'tablet'
    : 'phone';

  return {
    width,
    height,
    isPhone,
    isTablet,
    isDesktop,
    isWide,
    breakpoint,
    /** Pick a value per breakpoint, falling back to smaller sizes if missing. */
    pick: <T,>(values: { phone: T; tablet?: T; desktop?: T; wide?: T }): T => {
      if (isWide) return values.wide ?? values.desktop ?? values.tablet ?? values.phone;
      if (isDesktop) return values.desktop ?? values.tablet ?? values.phone;
      if (isTablet) return values.tablet ?? values.phone;
      return values.phone;
    },
  };
}
