/* Noah Klein */

import { useState } from 'react';
import './TeamMembers.css';

// TODO Clean this whole thing up

import {
  PieChart,
  type PieSeriesType,
  type PieValueType,
  type HighlightItemData,
} from '@mui/x-charts';

enum Major {
  MechEng = 0,
  ECE,
  CIS,
  NuclearEng,
  HealthSci,
}

interface Member {
  name: string;
  href?: string;
  roles: string;
  majorIndex?: Major;
}

const hexToRgba = (hex: string, alpha: number) => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const teamMembers: Member[] = [
  {
    name: 'Christopher Hawthorne',
    majorIndex: Major.NuclearEng,
    href: 'www.linkedin.com/in/christopher-r-hawthorne',
    roles: 'President, Programmer, Designer, Builder',
  },
  {
    name: 'Beth Maloof',
    majorIndex: Major.MechEng,
    href: 'www.linkedin.com/in/beth-maloof',
    roles: 'Co-President, Designer, Builder',
  },
  {
    name: 'Zach Nehez',
    majorIndex: Major.MechEng,
    href: 'https://www.linkedin.com/in/zach-nehez/',
    roles: 'Treasurer, Driver, Designer',
  },
  {
    name: 'William Jackson',
    majorIndex: Major.MechEng,
    roles: 'Secretary, Builder',
  },
  {
    name: 'John',
    majorIndex: Major.MechEng,
    roles: 'John',
  },
  {
    name: 'Lysander LaCourse',
    majorIndex: Major.ECE,
    roles: 'Electronics Specialist',
  },
  {
    name: 'Tyler Ing',
    majorIndex: Major.CIS,
    href: 'https://www.linkedin.com/in/tyler-ing/',
    roles: 'Web Developer, Programmer, Builder',
  },
  {
    name: 'Derek Patton',
    majorIndex: Major.MechEng,
    roles: 'Lead Designer, Builder',
  },
  {
    name: 'Bryce Horton',
    majorIndex: Major.MechEng,
    roles: 'Media Coordinator, Designer, Builder',
  },
  {
    name: 'Lorenz Henry',
    majorIndex: Major.MechEng,
    roles: 'Lead Notebooker',
  },
  {
    name: 'Nathan Rakestraw',
    majorIndex: Major.MechEng,
    roles: 'Designer, Builder, Driver',
  },
  {
    name: 'Brett Cunningham',
    majorIndex: Major.MechEng,
    roles: 'Sponsorship Lead',
  },
  {
    name: 'Katrina Fegley',
    majorIndex: Major.HealthSci,
    roles: 'Notebooker',
  },
  {
    name: 'Position Open',
    roles: 'Advisor',
  },
];

const seriesData = [
  { value: 9, color: '#702963', label: 'Mechanical Engineering' },
  { value: 1, color: '#16DB93', label: 'Electrical & Computer Engineering' },
  { value: 1, color: '#EFEA5A', label: 'Computer & Information Science' }, 
  { value: 1, color: '#F29E4C', label: 'Nuclear Engineering' },
  { value: 1, color: '#C1666B', label: 'Health Science' },

];

const series: PieSeriesType<PieValueType>[] = [
  {
    type: 'pie',
    id: 'majors',
    data: seriesData.map(({ major, ...slice }) => slice),
    highlightScope: {
      fade: 'global',
      highlight: 'item',
    } as const,
    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
    innerRadius: 25,
    outerRadius: 100,
    paddingAngle: 5,
    cornerRadius: 10,
    startAngle: -45,
    endAngle: 270,
    cx: 100,
    cy: 100,
  },
];

const TeamMembers = () => {
  const [highlightedItem, setHighlightedItem] = useState<HighlightItemData | null>(null);

  return (
    <section className="TeamMembers">
      <h2>The Team</h2>

      <div className="display">
        <div className="chart-holder">
          <PieChart
            series={series}
            height={210}
            width={210}
            highlightedItem={highlightedItem!}
            onHighlightChange={(h) => setHighlightedItem(h)}
            slotProps={{ legend: { className: 'custom-legend' } }}
          />
        </div>

        <div className="table-holder">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member, i) => {
                const highlightedMajor =
                  highlightedItem?.dataIndex != null
                    ? seriesData[highlightedItem.dataIndex]?.major
                    : undefined;

                const isHighlighted =
                  highlightedItem?.seriesId === 'majors' &&
                  member.majorIndex === highlightedMajor;

                return (
                  <tr
                    key={i}
                    className={isHighlighted ? 'highlighted-row' : undefined}
                    style={
                      isHighlighted &&
                      highlightedItem?.dataIndex != null &&
                      seriesData[highlightedItem.dataIndex]
                        ? {
                            backgroundColor: hexToRgba(
                              seriesData[highlightedItem.dataIndex].color,
                              0.25
                            ),
                          }
                        : undefined
                    }
                    onMouseEnter={() => {
                      if (member.majorIndex == null) return;

                      const dataIndex = seriesData.findIndex(
                        (item) => item.major === member.majorIndex
                      );

                      if (dataIndex === -1) return;

                      setHighlightedItem({
                        seriesId: 'majors',
                        dataIndex,
                      });
                    }}
                    onMouseLeave={() => setHighlightedItem(null)}
                  >
                    <td>
                      {member.href ? (
                        <a href={member.href} target="_blank" rel="noreferrer">
                          {member.name}
                        </a>
                      ) : (
                        member.name
                      )}
                    </td>
                    <td>{member.roles}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
export default TeamMembers;
