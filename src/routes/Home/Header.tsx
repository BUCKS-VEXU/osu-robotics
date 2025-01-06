/* Noah Klein */

import { useState, useEffect } from 'react';
import Carousel from './Carousel';

import useWindowFocus from 'use-window-focus';

import './Header.css'


const Header = () => {
    const [isSticky, setSticky] = useState(false);
    const windowFocused = useWindowFocus();

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY / window.innerHeight;
            setSticky(offset > 1);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);


    return (
        <div className="Header">

            <div className={`title${isSticky ? '' : ' sticky'}`}>
                <h1>VEXU Robotics Organization at Ohio State</h1>
                <img src="media/Ohio-State-Logo.png" alt="Ohio State University Logo" />
            </div>

            <div className="carousel-container">
                <Carousel
                    autoSlide={{ play: windowFocused, intervalSeconds: 5 }}
                    slideOptions={{ durationSeconds: 1.5 }}
                >
                    {/* TODO update this alt text */}
                    <img src="media/riverbots/Team-picture.jpg" alt="Team picture at first fundraiser" />
                    <img src="media/riverbots/DKFNX-Wallstakes.jpg" alt="11124R States 2022 Amaze Award" />
                    <img src="media/riverbots/Bots-lined-up.jpg" alt="BUCKS Drive team at RiverBots" />
                    <img src="media/riverbots/Noah-Adjusting-Bot.jpg" alt="60883D 2011F State Champions" />
                    <img src="media/riverbots/Sportsmanship.jpg" alt="2011 Kalahari 2023 Innovate Award" />
                    <img src="media/riverbots/Pit.jpg" alt="States 2022 Finals" />
                </Carousel>
                <div className="overlay"></div>
            </div>
        </div>
    )
}

export default Header;