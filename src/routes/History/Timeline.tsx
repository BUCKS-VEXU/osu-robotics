/* Noah Klein */

import { useState, useEffect, useRef } from 'react';
import { events } from './Events'
import './Timeline.css';

const Timeline = () => {
    const [selected, setSelected] = useState<number>(-1);
    const eventRefs = useRef<(HTMLDivElement | null)[]>([]);

    // 1) Observer only adds the slide‐in class the first time an entry crosses 60% visibility
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('slide-in');
                    }
                });
            },
            { threshold: 0.6 }
        );

        eventRefs.current.forEach((el) => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    // 2) select topmost entry >10% visible
    useEffect(() => {
        const visibleSet = new Set<number>();
        const viewThresh = 0.75;

        const selectObs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const idx = eventRefs.current.indexOf(
                        entry.target as HTMLDivElement
                    );
                    if (idx < 0) return;

                    if (entry.intersectionRatio >= viewThresh) {
                        visibleSet.add(idx);
                    } else {
                        visibleSet.delete(idx);
                    }
                });

                // pick the smallest index in the set (i.e. earliest in the list)
                const next =
                    visibleSet.size > 0 ? Math.min(...visibleSet) : -1;
                setSelected((prev) => (prev !== next ? next : prev));
            },
            { threshold: [viewThresh] }
        );

        eventRefs.current.forEach((el) => el && selectObs.observe(el));
        return () => selectObs.disconnect();
    }, []);

    return (
        <div className="Timeline">
            {events.map((event, index) => (
                <div
                    key={index}
                    // add your `.selected` class when this is the topmost visible
                    className={`entry${index % 2 === 0 ? ' even' : ' odd'}${index === selected ? ' selected' : ''}`}
                >
                    <div className="date-box">{event.date}</div>
                    <img className="indicator" src="assets/logos/BUCKS.png" />
                    <div
                        ref={(el) => (eventRefs.current[index] = el)}
                        className="event-rails"
                    >
                        <div className="event column">
                            <span className="mobile-date">{event.date}</span>
                            <h3>{event.title}</h3>
                            {event.embed && event.embed}
                            <p>{event.description}</p>
                        </div>
                    </div>
                </div>
            ))}
            <div className="line" />
            <img src="assets/logos/BUCKS.png" className="cap" draggable="false" />
        </div>
    );
};

export default Timeline;
