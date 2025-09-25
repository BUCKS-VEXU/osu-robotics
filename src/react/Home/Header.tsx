/* Noah Klein */

import { useState, useEffect } from 'react';
import Carousel from './Carousel';

import useWindowFocus from 'use-window-focus';

import './Header.css';

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
        <img src="assets/logos/BUCKSText.png" alt="BUCKS Logo with text" />
      </div>

      <div className="carousel-container">
        <Carousel
          autoSlide={{ play: windowFocused, intervalSeconds: 5 }}
          slideOptions={{ durationSeconds: 1.5 }}
        >
          {/* TODO update this alt text */}
          <img
            src="assets/worlds/Worlds-Pit.jpg"
            alt="Team picture at 2025 Worlds with Eaton reps"
          />
          <img
            src="assets/riverbots/DKFNX-Wallstakes.jpg"
            alt="DKFNX Getting boxed in wallstakes at riverbots"
          />
          <img src="assets/worlds/Rush.jpg" alt="High Stakes autonomous goal rush" />
          <img src="assets/worlds/15-With-Goal.jpg" alt='15" Robot at 2025 Worlds' />
          <img src="assets/worlds/24-At-Pit.jpg" alt='24" Robot at 2025 Worlds' />
          <img src="assets/worlds/15-Drive-Pit.jpg" alt="Drive team at 2025 Worlds" />
        </Carousel>
        <div className="overlay"></div>
      </div>
    </div>
  );
};

export default Header;
