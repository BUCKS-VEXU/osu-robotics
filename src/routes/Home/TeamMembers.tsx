/* Noah Klein */

import './TeamMembers.css';

import { PieChart } from '@mui/x-charts/PieChart';

interface Member {
    name: string;
    href?: string;
    roles: string;
}

const teamMembers: Member[] = [
    { name: "Noah Klein", href: "https://www.noahkleinportfolio.org/", roles: "Co-President, Programmer, Builder, Drive Team" },
    { name: "Ryan Joseph", href: "https://www.linkedin.com/in/ryanjoseph1/", roles: "Co-President, Builder, Driver" },
    { name: "Sage Waehler", href: "https://www.linkedin.com/in/sage-waehler-9413582aa/", roles: "Treasurer, Notebooker, Drive Team" },
    { name: "Nathan Trybus", href: "https://www.linkedin.com/in/nathan-trybus-981819243/", roles: "Builder, Driver" },
    { name: "Alex Flis", href: "https://www.linkedin.com/in/alexander-flis-0a8225327/", roles: "Builder, Drive Team" },
    { name: "Camden Burgess", href: "https://www.linkedin.com/in/camden-burgess-203b94290/", roles: "Notebooker, Drive Team" },
    { name: "Andrew Flis", href: "https://www.linkedin.com/in/andrew-flis-12b665159/", roles: "Designer, Head of Filmography" },
    { name: "Robert Ashley", href: "https://www.linkedin.com/in/robert-ashley-71b482327/", roles: "Builder" },
    { name: "Matthew Allen", href: "https://www.linkedin.com/in/matthew-luis-allen/", roles: "Designer, 3D Printing Wizard" },
    { name: "Vighnesh Prabhu", href: "https://www.linkedin.com/in/vighnesh-prabhu-profile/", roles: "Programmer, Sponsorship Lead" },
    { name: "Jayhue Gabriel", href: "https://www.linkedin.com/in/jayhue-gabriel-8a765333a/", roles: "Programmer" },
    { name: "Drew Phillips", href: "https://engineering.osu.edu/people/phillips.1166", roles: "Advisor" },
];

const TeamMembers = () => {
    return (
        <section className="TeamMembers">
            <h2>The team</h2>

            <div className="display">

                <div className="chart-holder">
                    <PieChart
                        series={[
                            {
                                data: [
                                    { value: 3, color: 'orange', label: 'Mechanical Engineering' },
                                    { value: 4, color: 'red', label: 'Computer Science Engineering' },
                                    { value: 2, color: 'blue', label: 'Electrical & Computer Engineering' },
                                    { value: 1, color: 'green', label: 'Math and English' },
                                    { value: 1, color: 'purple', label: 'Psychology' },
                                ],
                                highlightScope: { fade: 'global', highlight: 'item' },
                                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                                innerRadius: 25,
                                outerRadius: 100,
                                paddingAngle: 5,
                                cornerRadius: 10,
                                startAngle: -45,
                                endAngle: 260,
                                cx: 100,
                                cy: 100,
                            }
                        ]}
                        height={210}
                        width={210}
                    />
                </div>
                <div className='table-holder'>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamMembers.map((member, index) => (
                                <tr key={index}>
                                    <td>
                                        <a href={member.href} target='_blank'>
                                            {member.name}
                                        </a></td>
                                    <td>
                                        {member.roles}
                                    </td>
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
