/* Noah Klein */

import { useEffect } from 'react';
import './NavBar.css';

interface NavBarItem {
    className?: string;
    href?: string;
    navText: string;
}

const navBarMap: Map<string, NavBarItem> = new Map([
    ['about-us', { className: 'AboutUs', navText: 'About Us' }],
    ['the-team', { className: 'TeamMembers', navText: 'The Team' }],
    ['sponsors', { className: 'Sponsors', navText: 'Sponsors' }],
    ['history', { href: 'history', navText: 'History' }],
    ['contact', { className: 'Footer', navText: 'Contact' }],
]);


const NavBar = () => {

    useEffect(() => {
        /* Scroll to the proper location on page load */
        const hash = window.location.hash;

        if (hash) {
            const sectionId = hash.substring(1); // Remove the '#' character
            const section = navBarMap.get(sectionId);
            if (section && section.className) {
                scrollToSection(section.className);
            }
        }
    }, []);

    const scrollToSection = (className: string) => {
        const element = document.getElementsByClassName(className)[0];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <nav className={'NavBar'}>
            <img src="assets/logos/BUCKS.png" />
            {Array.from(navBarMap.entries()).map(([key, value]) =>
                value.className ? (
                    <a key={key} href={`/#${key}`} onClick={() => scrollToSection(value.className!)}>
                        {value.navText}
                    </a>
                ) : value.href ? (
                    <a key={key} href={value.href}>
                        {value.navText}
                    </a>
                ) : null
            )}
        </nav>
    );
};

export default NavBar;
