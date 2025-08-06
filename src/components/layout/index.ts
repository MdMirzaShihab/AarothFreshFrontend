import React from 'react';

// Main layout components
export { default as AppLayout, DashboardLayout, FullWidthLayout, SimpleLayout } from './AppLayout';
export { default as Header } from './Header';
export { default as Sidebar } from './Sidebar';
export { default as MobileNavigation } from './MobileNavigation';
export { default as Breadcrumb, useBreadcrumb } from './Breadcrumb';
export { default as AuthLayout } from './AuthLayout';

// Layout utility functions
export const getLayoutBreakpoints = () => ({
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  widescreen: '(min-width: 1280px)',
});

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

// Layout configuration constants
export const LAYOUT_CONFIG = {
  header: {
    height: '4rem', // 64px
    mobileHeight: '4rem', // 64px with mobile search
  },
  sidebar: {
    width: '18rem', // 288px
    collapsedWidth: '5rem', // 80px
    mobileWidth: '20rem', // 320px
  },
  mobileNav: {
    height: '4rem', // 64px
    safeAreaPadding: true,
  },
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
    widescreen: 1536,
  },
} as const;