import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LANDING_SECTION_IDS } from '@/constants/landingNav';
import { scrollToSection } from '@/lib/scrollToSection';

const SCROLL_OFFSET = 100;

function getActiveSectionId() {
  let active = LANDING_SECTION_IDS[0];
  for (const id of LANDING_SECTION_IDS) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= SCROLL_OFFSET + 8) {
      active = id;
    }
  }
  return active;
}

export function useLandingSectionNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(LANDING_SECTION_IDS[0]);
  const isHome = pathname === '/';

  useEffect(() => {
    if (!isHome) return undefined;

    const onScroll = () => setActiveSection(getActiveSectionId());
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  const navigateToSection = useCallback(
    (sectionId) => {
      if (pathname === '/') {
        scrollToSection(sectionId);
        setActiveSection(sectionId);
        return;
      }
      navigate('/', { state: { scrollTo: sectionId } });
    },
    [pathname, navigate]
  );

  return { activeSection, navigateToSection, isHome };
}
