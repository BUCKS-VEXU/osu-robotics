/* Noah Klein */

import './TeamMembers.css';


interface Member {
    name: string;
    roles: string;
}

const teamMembers: Member[] = [
    { name: "Noah Klein", roles: "Co-President, Lead Programmer, Builder, Drive Team" },
    { name: "Ryan Joseph", roles: "Co-President, Builder, Driver" },
    { name: "Nathan Trybus", roles: "Builder, Driver" },
    { name: "Sage Waehler", roles: "Treasurer, Notebooker" },
    { name: "Alex Flis", roles: "Builder, Drive Team" },
    { name: "Cameron Molina", roles: "Builder" },
    { name: "Camden Burgess", roles: "Notebooker" },
    { name: "Vighnesh Prabhu", roles: "Sponsorship Lead" },
    { name: "Jayhue Gabriel", roles: "Programmer" },
    { name: "Maddux Dasenbrook", roles: "Financial Officer" },
    { name: "Zachary Hutton", roles: "Builder" },
    { name: "Andrew Flis", roles: "Head of Filmography" },
    { name: "Drew Phillips", roles: "Advisor" },
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
                                <td>{member.name}</td>
                                <td>{member.roles}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TeamMembers;
