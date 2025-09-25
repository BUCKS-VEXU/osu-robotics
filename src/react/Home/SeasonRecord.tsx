/* Noah Klein */

import { useState, useRef, useEffect } from 'react';
import './SeasonRecord.css';

interface SeasonRecordProps {
  season: string;
  wins: number;
  losses: number;
  ties?: number;
}

export default function SeasonRecord({ season, wins, losses, ties }: SeasonRecordProps) {
  const total = wins + losses + (ties ?? 0);
  const winPct = ((wins / total) * 100).toFixed(1);
  const lossPct = ((losses / total) * 100).toFixed(1);
  const tiePct = ties !== undefined ? ((ties / total) * 100).toFixed(1) : undefined;

  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }, // fire when 20% visible
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="season-record" ref={containerRef}>
      <h3 className="title">{season} Season Record</h3>

      <div className="group">
        <div className="labels">
          <span>Wins</span>
          <span>
            {wins} ({winPct}%)
          </span>
        </div>
        <div className="bar">
          <div className="fill" style={{ width: inView ? `${winPct}%` : '0%' }} />
        </div>
      </div>

      <div className="group">
        <div className="labels">
          <span>Losses</span>
          <span>
            {losses} ({lossPct}%)
          </span>
        </div>
        <div className="bar">
          <div className="fill fill--loss" style={{ width: inView ? `${lossPct}%` : '0%' }} />
        </div>
      </div>

      {ties !== undefined && (
        <div className="group">
          <div className="labels">
            <span>Ties</span>
            <span>
              {ties} ({tiePct}%)
            </span>
          </div>
          <div className="bar">
            <div className="fill fill--tie" style={{ width: inView ? `${tiePct}%` : '0%' }} />
          </div>
        </div>
      )}
    </div>
  );
}
