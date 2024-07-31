/* Noah Klein */

import './TeamMembers.css';


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
                        <tr>
                            <td>Noah Klein</td>
                            <td>President, Programmer, Builder, Drive Team</td>
                        </tr>
                        <tr>
                            <td>Ryan Joseph</td>
                            <td>Vice-President, Builder, Driver</td>
                        </tr>
                        <tr>
                            <td>Sage Waehler</td>
                            <td>Treasurer, Notebooker</td>
                        </tr>
                        <tr>
                            <td>Nathan Trybus</td>
                            <td>Builder, Driver</td>
                        </tr>
                        <tr>
                            <td>Alex Flis</td>
                            <td>Builder, Drive Team</td>
                        </tr>
                        <tr>
                            <td>Camden Burgess</td>
                            <td>Notebooker</td>
                        </tr>
                        <tr>
                            <td>Maddux Dasenbrook</td>
                            <td>Financial Officer</td>
                        </tr>
                        <tr>
                            <td>Nikolai Radonjich</td>
                            <td>Builder</td>
                        </tr>
                        <tr>
                            <td>Zachary Hutton</td>
                            <td>Builder</td>
                        </tr>
                        <tr>
                            <td>Andrew Flis</td>
                            <td>Head of Filmography</td>
                        </tr>
                        <tr>
                            <td>Drew Phillips</td>
                            <td>Advisor</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TeamMembers;
