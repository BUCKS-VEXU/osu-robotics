/* Noah Klein */

import React, { useState, useEffect } from 'react';
import './Carousel.css';

interface SlideOptions {
    durationSeconds?: number;
}

interface AutoSlideOptions {
    play?: boolean;
    intervalSeconds?: number;
    direction?: 'left' | 'right';
}

interface CarouselProps {
    children: React.ReactNode[];
    slideOptions?: SlideOptions;
    autoSlide?: AutoSlideOptions | true;
}

const Carousel = ({ children, slideOptions, autoSlide }: CarouselProps) => {
    const [index, setIndex] = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const shouldAutoSlide = () => {
        if (autoSlide === undefined)
            return false;

        if (autoSlide === true)
            return true;

        if (autoSlide?.play !== undefined)
            return autoSlide?.play;

        return true;
    }

    const autoSlidePlay = shouldAutoSlide();
    const autoSlideIntervalSeconds = autoSlide === true ? 3 : autoSlide?.intervalSeconds ?? 3;
    const autoSlideDirection = autoSlide === true ? 'right' : autoSlide?.direction ?? 'right';
    const slideDuration = slideOptions === undefined ? 1 : slideOptions?.durationSeconds ?? 1;

    const firstImage = children[0];
    const lastImage = children[children.length - 1];


    /* Increment currentIndex every autoSlideIntervalSeconds, reset when isTransitioning changes */
    useEffect(() => {
        const timer = setInterval(() => {
            if (autoSlide === true || autoSlidePlay) {
                if (!isTransitioning) {
                    if (autoSlideDirection === 'right')
                        handleNext();
                    else
                        handlePrevious();
                }
            }
        }, autoSlideIntervalSeconds * 1000);


        return () => {
            clearInterval(timer);
        };

    }, [autoSlide, isTransitioning]);


    const handleNext = () => {
        setIsTransitioning(true);
        setIndex(prevIndex => prevIndex + 1);

        setTimeout(() => {
            setIsTransitioning(false);
            if (index === children.length) setIndex(1);
        }, slideDuration * 1000 + 50);
    };


    const handlePrevious = () => {
        setIsTransitioning(true);
        setIndex(prevIndex => prevIndex - 1);

        setTimeout(() => {
            setIsTransitioning(false);
            if (index === 1) setIndex(children.length);
        }, slideDuration * 1000 + 50);
    };


    return (
        <div className="Carousel">
            <div
                className='track'
                style={{
                    transform: `translateX(${-index * 100}%)`,
                    transition: `${isTransitioning ? `transform ${slideDuration}s ease-in-out` : ''}`,
                }}
            >
                <div className="item">{lastImage}</div>
                {children.map((image, index) => (
                    <div className="item" key={index}>
                        {image}
                    </div>
                ))}
                <div className="item">{firstImage}</div>

            </div>
            <button className="control prev" disabled={isTransitioning} onClick={handlePrevious}>&#x276E;</button>
            <button className="control next" disabled={isTransitioning} onClick={handleNext}>&#x276F;</button>
        </div>
    );
};

export default Carousel;
