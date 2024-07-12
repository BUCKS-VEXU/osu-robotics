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
                case 'about-us':
                    scrollToSection('AboutUs')
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
        const element = document.getElementsByClassName(className)[0];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <nav className={`NavBar${isSticky ? ' sticky' : ''}`}>
            <a style={{ paddingLeft: 'clamp(15px, 5vw, 260px)' }} href="#home" onClick={() => scrollToSection('VexU')}>Home</a>
            <a href="#about-us" onClick={() => scrollToSection('AboutUs')}>About Us</a>
            <a href="#contact" onClick={() => scrollToSection('Footer')}>Contact</a>
        </nav>
    );
};

export default NavBar;
