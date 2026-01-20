/* Noah Klein */
/* NavBar.tsx */

import { useEffect, useState } from 'react';
import './NavBar.css';

interface NavBarItem {
  className?: string;
  href?: string;
  navText: string;
  flashing?: boolean;
}

const navBarMap: Map<string, NavBarItem> = new Map([
  ['home', { className: 'AboutUs', navText: 'Home' }],
  ['latest', { className: 'InstagramFeed',  navText: 'Latest Updates'}],
  ['the-team', { className: 'TeamMembers', navText: 'The Team' }],
  ['sponsors', { className: 'Sponsors', navText: 'Sponsors' }],
  ['join', { className: 'CallToAction', navText: 'Join' }],
  ['history', { href: 'history', navText: 'History', flashing: true }],
]);

export default function NavBar() {
  const [selected, setSelected] = useState<string>('');
  // precompute only the entries that have className
  const scrollItems = Array.from(navBarMap.entries())
    .filter(([, v]) => v.className)
    .map(([key, v]) => ({ key, cls: v.className! }));

  const scrollToSection = (className: string) => {
    const el = document.getElementsByClassName(className)[0];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const handleScroll = () => {
      let closestKey: string | null = null;
      let minDistance = Infinity;
      // you can set offset if your nav is sticky
      const offset = 0;

      scrollItems.forEach(({ key, cls }) => {
        const el = document.getElementsByClassName(cls)[0];
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // only consider sections that are at least partly on screen
        if (rect.bottom > offset && rect.top < window.innerHeight) {
          const distance = Math.abs(rect.top - offset);
          if (distance < minDistance) {
            minDistance = distance;
            closestKey = key;
          }
        }
      });

      if (closestKey && closestKey !== selected) {
        setSelected(closestKey);
      }
    };

    // listen and also trigger once on mount
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollItems, selected]);

  // also highlight when user navigates via hash or link
  useEffect(() => {
    const onLocationChange = () => {
      const { hash, pathname } = window.location;
      if (hash) {
        setSelected(hash.substring(1));
      } else {
        for (const [key, v] of navBarMap.entries()) {
          if (v.href && pathname.endsWith(`/${v.href}`)) {
            setSelected(key);
            return;
          }
        }
      }
    };
    window.addEventListener('popstate', onLocationChange);
    onLocationChange();
    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);

  return (
    <nav className="NavBar">
      <img src="assets/logos/BUCKS.png" alt="Logo" />

      {Array.from(navBarMap.entries()).map(([key, v]) => {
        const isActive = selected === key ? ' selected' : '';
        const isFlashing = v.flashing ? ' flashing' : '';
        const className = isActive + isFlashing;

        if (v.className) {
          return (
            <a
              key={key}
              href={`/#${key}`}
              className={className}
              onClick={() => {
                scrollToSection(v.className!);
                setSelected(key);
              }}
            >
              {v.navText}
            </a>
          );
        }

        if (v.href) {
          return (
            <a key={key} href={`/${v.href}`} className={className}>
              {v.navText}
            </a>
          );
        }

        return null;
      })}
    </nav>
  );
}
