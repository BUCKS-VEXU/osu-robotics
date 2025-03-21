/* Noah Klein */

import './TeamMembers.css';


interface Member {
    name: string;
    href?: string;
    roles: string;
}

const teamMembers: Member[] = [
    { name: "Noah Klein", href: "https://www.noahkleinportfolio.org/", roles: "Co-President, Lead Programmer, Builder, Drive Team" },
    { name: "Ryan Joseph", href: "https://www.linkedin.com/in/ryanjoseph1/", roles: "Co-President, Builder, Driver" },
    { name: "Nathan Trybus", href: "https://www.linkedin.com/in/nathan-trybus-981819243/", roles: "Builder, Driver" },
    { name: "Sage Waehler", href: "https://www.linkedin.com/in/sage-waehler-9413582aa/", roles: "Treasurer, Notebooker" },
    { name: "Alex Flis", href: "https://www.linkedin.com/in/alexander-flis-0a8225327/", roles: "Builder, Drive Team" },
    { name: "Cameron Molina", roles: "Builder" },
    { name: "Camden Burgess", href: "https://www.linkedin.com/in/camden-burgess-203b94290/", roles: "Notebooker" },
    { name: "Robert Ashley", roles: "Builder" },
    { name: "Matthew Allen", href: "https://www.linkedin.com/in/matthew-luis-allen/", roles: "Designer" },
    { name: "Vighnesh Prabhu", href: "https://www.linkedin.com/in/vighnesh-prabhu-profile/", roles: "Sponsorship Lead" },
    { name: "Jayhue Gabriel", href: "https://www.linkedin.com/in/jayhue-gabriel-8a765333a/", roles: "Programmer" },
    { name: "Zachary Hutton", href: "https://www.linkedin.com/in/zachhutton25/", roles: "Builder" },
    { name: "Andrew Flis", href: "https://www.linkedin.com/in/andrew-flis-12b665159/", roles: "Head of Filmography" },
    { name: "Maddux Dasenbrook", href: "https://www.linkedin.com/in/madduxdasen/", roles: "Financial Officer" },
    { name: "Drew Phillips", href: "https://engineering.osu.edu/people/phillips.1166", roles: "Advisor" },
];

const TeamMembers = () => {
    return (
        <div className="TeamMembers">
            <h2>The team</h2>
            <div className='table-holder'>
                <table className="team-table">
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
    )
}

export default TeamMembers;
