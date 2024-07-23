/* Noah Klein */

import { useState, useEffect } from 'react';
import './NavBar.css';

interface NavBarProps {

}

const NavBar = ({ }: NavBarProps) => {
    const [isSticky, setSticky] = useState(false);

    useEffect(() => {

        /* Scroll to the proper location on page load*/
        const hash = window.location.hash;

        if (hash) {
            const sectionId = hash.substring(1); // Remove the '#' character
            switch (sectionId) {
                case 'home':
                    scrollToSection('Header')
                    break;
                case 'about-us':
                    scrollToSection('AboutUs')
                    break;
                case 'the-team':
                    scrollToSection('TeamMembers')
                    break;
                case 'sponsors':
                    scrollToSection('Sponsors')
                    break;
                case 'contact':
                    scrollToSection('Footer')
                    break;
            }
        }

        const handleScroll = () => {
            const offset = window.scrollY / window.innerHeight;
            setSticky(offset > 1);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToSection = (className: string) => {
        console.log('scrolling to: ' + className)
        const element = document.getElementsByClassName(className)[0];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <nav className={`NavBar${isSticky ? ' sticky' : ''}`}>
            <a style={{ paddingLeft: 'clamp(15px, 5vw, 260px)' }} href="#home" onClick={() => scrollToSection('Header')}>Home</a>
            <a href="#about-us" onClick={() => scrollToSection('AboutUs')}>About us</a>
            <a href="#the-team" onClick={() => scrollToSection('TeamMembers')}>The team</a>
            <a href="#sponsors" onClick={() => scrollToSection('Sponsors')}>Sponsors</a>
            <a href="#contact" onClick={() => scrollToSection('Footer')}>Contact</a>
        </nav>
    );
};

export default NavBar;
