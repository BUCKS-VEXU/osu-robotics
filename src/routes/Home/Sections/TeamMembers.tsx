/* Noah Klein */

import './TeamMembers.css';


interface Member {
    name: string;
    roles: string;
}

const teamMembers: Member[] = [
    { name: "Noah Klein", roles: "President, Programmer, Builder, Drive Team" },
    { name: "Ryan Joseph", roles: "Vice-President, Builder, Driver" },
    { name: "Sage Waehler", roles: "Treasurer, Notebooker" },
    { name: "Nathan Trybus", roles: "Builder, Driver" },
    { name: "Alex Flis", roles: "Builder, Drive Team" },
    { name: "Vig Prabhu", roles: "Sponsorship Lead" },
    { name: "Camden Burgess", roles: "Notebooker" },
    { name: "Jayhue ", roles: "Programmer" },
    { name: "Maddux Dasenbrook", roles: "Financial Officer" },
    { name: "Nikolai Radonjich", roles: "Builder" },
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
