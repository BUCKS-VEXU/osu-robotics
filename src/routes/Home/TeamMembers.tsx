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
    { name: "Noah Klein", majorIndex: Major.CSE, href: "https://www.noahkleinportfolio.org/", roles: "Co-President, Programmer, Builder, Driver" },
    { name: "Ryan Joseph", majorIndex: Major.MechEng, href: "https://www.linkedin.com/in/ryanjoseph1/", roles: "Co-President, Builder, Drive Team" },
    { name: "Sage Waehler", majorIndex: Major.MathEng, href: "https://www.linkedin.com/in/sage-waehler-9413582aa/", roles: "Treasurer, Notebooker, Drive Team" },
    { name: "Nathan Trybus", majorIndex: Major.MechEng, href: "https://www.linkedin.com/in/nathan-trybus-981819243/", roles: "Builder, Driver" },
    { name: "Alex Flis", majorIndex: Major.Psych, href: "https://www.linkedin.com/in/alexander-flis-0a8225327/", roles: "Builder, Drive Team" },
    { name: "Camden Burgess", majorIndex: Major.CSE, href: "https://www.linkedin.com/in/camden-burgess-203b94290/", roles: "Notebooker, Drive Team" },
    { name: "Cassidy Klodnick", majorIndex: Major.Psych, href: "https://www.linkedin.com/in/cassidy-klodnick/", roles: "Strategist, Drive Team" },
    { name: "Andrew Flis", majorIndex: Major.ECE, href: "https://www.linkedin.com/in/andrew-flis-12b665159/", roles: "Designer, Head of Filmography" },
    { name: "Robert Ashley", majorIndex: Major.ECE, href: "https://www.linkedin.com/in/robert-ashley-71b482327/", roles: "Builder" },
    { name: "John Cruz", majorIndex: Major.MechEng, roles: "Builder" },
    { name: "Christopher Hawthorne", roles: "Designer" },
    { name: "Matthew Allen", majorIndex: Major.MechEng, href: "https://www.linkedin.com/in/matthew-luis-allen/", roles: "Designer, 3D Printing Wizard" },
    { name: "Vighnesh Prabhu", majorIndex: Major.CSE, href: "https://www.linkedin.com/in/vighnesh-prabhu-profile/", roles: "Programmer, Sponsorship Lead" },
    { name: "Jayhue Gabriel", majorIndex: Major.CSE, href: "https://www.linkedin.com/in/jayhue-gabriel-8a765333a/", roles: "Programmer" },
    { name: "Drew Phillips", href: "https://engineering.osu.edu/people/phillips.1166", roles: "Advisor" },
];

const seriesData = [
    { value: 4, color: ' #048BA8', label: 'Mechanical Engineering' },
    { value: 4, color: ' #16DB93', label: 'Computer Science Engineering' },
    { value: 2, color: ' #EFEA5A', label: 'Electrical & Computer Engineering' },
    { value: 1, color: ' #F29E4C', label: 'Math & English' },
    { value: 2, color: ' #C1666B', label: 'Psychology' },
];

// '#BA0C2F',
// '#C32A49',
// '#CB4963',
// '#D4647B',
// '#DD8697',
// '#E5A2B1',
// '#EEC2CB',
// '#F6E1E5',


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
                        slotProps={{ legend: { className: 'custom-legend', } }}
                    />
                </div>

                <div className="table-holder">
                    <table>
                        <thead>
                            <tr><th>Name</th><th>Role</th></tr>
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
    )
}

export default TeamMembers;
