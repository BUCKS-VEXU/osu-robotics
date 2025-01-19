/* Noah Klein */

import { useEffect } from 'react';
import './NavBar.css';

interface NavBarProps {

}

interface NavBarItem {
    className: string;
    navText: string;
}

const navBarMap: Map<string, NavBarItem> = new Map([
    ['home', { className: 'Header', navText: 'Home' }],
    ['about-us', { className: 'AboutUs', navText: 'About Us' }],
    ['the-team', { className: 'TeamMembers', navText: 'The Team' }],
    ['sponsors', { className: 'Sponsors', navText: 'Sponsors' }],
    ['contact', { className: 'Footer', navText: 'Contact' }],
]);


const NavBar = ({ }: NavBarProps) => {

    useEffect(() => {
        /* Scroll to the proper location on page load */
        const hash = window.location.hash;

        if (hash) {
            const sectionId = hash.substring(1); // Remove the '#' character
            const section = navBarMap.get(sectionId);
            if (section) {
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
            {Array.from(navBarMap.entries()).map(([key, value]) => (
                <a key={key} href={`#${key}`} onClick={() => scrollToSection(value.className)}>
                    {value.navText}
                </a>
            ))}
        </nav>
    );
};

export default NavBar;
