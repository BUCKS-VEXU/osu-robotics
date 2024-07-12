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
                    <img src="media/VexU/Fundraiser-team-pic.jpg" alt="Team picture at first fundraiser" />
                    <img src="media/VexU/elyria-states-2022.png" alt="11124R States 2022 Amaze Award" />
                    <img src="media/VexU/noah-working-on-robot.jpg" alt="Noah working on robot at States 2022" />
                    <div className='matlack'>
                        <img src="media/VexU/states-champs-2022.JPG" alt="60883D 2011F State Champions" />
                    </div>
                    <div className='matlack'>
                        <img src="media/VexU/Kala2011E.JPG" alt="2011 Kalahari 2023 Innovate Award" />
                    </div>
                    <div className='matlack'>
                        <img src="media/VexU/states-2022-elims.JPEG" alt="States 2022 Finals" />
                    </div>

                </Carousel>
                <div className="overlay"></div>
            </div>
        </div>
    )
}

export default Header;