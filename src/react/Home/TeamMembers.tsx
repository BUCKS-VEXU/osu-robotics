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
  CSE,
  ECE,
  EngPhysics,
  MathEng,
  Psych,
}

interface Member {
  name: string;
  href?: string;
  roles: string;
  majorIndex?: Major;
}

const teamMembers: Member[] = [
  {
    name: 'Noah Klein',
    majorIndex: Major.CSE,
    href: 'https://www.noahkleinportfolio.org/',
    roles: 'President, Programmer, Builder',
  },
  {
    name: 'Christopher Hawthorne',
    majorIndex: Major.EngPhysics,
    roles: 'Vice President, Designer, Builder',
  },
  {
    name: 'Sage Waehler',
    majorIndex: Major.MathEng,
    href: 'https://www.linkedin.com/in/sage-waehler-9413582aa/',
    roles: 'Treasurer, Notebooker',
  },
  {
    name: 'William Jackson',
    majorIndex: Major.MechEng,
    roles: 'Secretary, Builder',
  },
  {
    name: 'Beth Maloof',
    majorIndex: Major.MechEng,
    roles: 'Lead, Designer, Builder',
  },
  {
    name: 'Zach Nehez',
    majorIndex: Major.MechEng,
    href: 'https://www.linkedin.com/in/zach-nehez/',
    roles: 'Lead, Designer',
  },
  {
    name: 'Nathan Trybus',
    href: 'https://www.linkedin.com/in/nathan-trybus-981819243/',
    roles: 'Builder, Driver',
  },
  {
    name: 'Matthew Allen',
    majorIndex: Major.MechEng,
    href: 'https://www.linkedin.com/in/matthew-luis-allen/',
    roles: '3D Printing Wizard',
  },
  {
    name: 'John',
    majorIndex: Major.MechEng,
    roles: 'John',
  },
  {
    name: 'Lysander LeCourse',
    majorIndex: Major.ECE,
    roles: 'Electronics Specialist',
  },
  {
    name: 'Robert Ashley',
    majorIndex: Major.ECE,
    href: 'https://www.linkedin.com/in/robert-ashley-71b482327/',
    roles: 'Builder',
  },
  {
    name: 'Camden Burgess',
    majorIndex: Major.CSE,
    href: 'https://www.linkedin.com/in/camden-burgess-203b94290/',
    roles: 'Notebooker',
  },
  {
    name: 'Eli Kosobud',
    majorIndex: Major.MechEng,
    roles: 'Designer, Builder'
  },
  {
    name: 'Airy (Jiazhuo) Li',
    majorIndex: Major.ECE,
    roles: 'Builder'
  },
  { name: 'Ryan Joseph',
    majorIndex: Major.MechEng,
    href: 'https://www.linkedin.com/in/ryanjoseph1/',
    roles: 'Financial Advisor'
  },
  {
    name: 'Andrew Flis',
    majorIndex: Major.ECE,
    href: 'https://www.linkedin.com/in/andrew-flis-12b665159/',
    roles: 'Mentor, Head of Filmography',
  },
  {
    name: 'Drew Phillips',
    href: 'https://engineering.osu.edu/people/phillips.1166',
    roles: 'Advisor',
  },
];

const seriesData = [
  { value: 7, color: ' #048BA8', label: 'Mechanical Engineering' },
  { value: 2, color: ' #16DB93', label: 'Computer Science Engineering' },
  { value: 4, color: ' #EFEA5A', label: 'Electrical & Computer Engineering' },
  { value: 1, color: ' #F29E4C', label: 'Engineering Physics' },
  { value: 1, color: ' #C1666B', label: 'Math & English' },
];

const series: PieSeriesType<PieValueType>[] = [
  {
    type: 'pie',
    id: 'majors',
    data: seriesData,
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
    endAngle: 260,
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
              {teamMembers.map((member, i) => (
                <tr
                  key={i}
                  onMouseEnter={() => {
                    if (member.majorIndex == null) return;
                    setHighlightedItem({
                      seriesId: 'majors',
                      dataIndex: member.majorIndex,
                    });
                  }}
                  onMouseLeave={() => setHighlightedItem(null)}
                >
                  <td>
                    <a href={member.href} target="_blank">
                      {member.name}
                    </a>
                  </td>
                  <td>{member.roles}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default TeamMembers;
