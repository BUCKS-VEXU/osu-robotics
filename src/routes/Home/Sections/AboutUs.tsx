/* Noah Klein */

import TeamRoller from "./TeamRoller"

import './AboutUs.css';

// TODO get 6008C 2011A awards

const teams = [
    {
        name: '2011B',
        tournamentChampion: 1,
        excellence: 0,
        design: 1,
        skillsChampion: 0,
        otherAwards: 3
    },
    {
        name: '2011E',
        tournamentChampion: 3,
        excellence: 1,
        design: 2,
        skillsChampion: 1,
        otherAwards: 7
    },
    {
        name: '2011F',
        tournamentChampion: 22,
        excellence: 2,
        design: 0,
        skillsChampion: 5,
        otherAwards: 9
    },
    {
        name: '6008C',
        tournamentChampion: 1,
        excellence: 0,
        design: 0,
        skillsChampion: 0,
        otherAwards: 0
    },
    {
        name: '11124R',
        tournamentChampion: 13,
        excellence: 7,
        design: 4,
        skillsChampion: 7,
        otherAwards: 24
    },
    {
        name: '60883D',
        tournamentChampion: 10,
        excellence: 9,
        design: 1,
        skillsChampion: 17,
        otherAwards: 9
    }
]

const AboutUs = () => {
    return (
        <div className="AboutUs">

            <h2>About us</h2>
            <p>
                The VEX U Robotics Organization at The Ohio State University (or BUCKS) facilitates student creation and competition in the
                <a href="https://vurc-kb.recf.org/hc/en-us/articles/9831327507095-Welcome-VEX-U-Robotics-Competition-Teams" target="_blank"> VURC </a>
                (VEX University Robotics Competition). Our V5RC teams collectively won the Ohio State Competition 11 times.
            </p>

            <h3>What is VURC?</h3>
            <p>
                VURC is a university-level robotics competition operated by the <a href="https://recf.org/" target="_blank">RECF</a>.
                Teams design, build, and program robots to compete in a new game each year, created by the RECF.
                VURC competitors are encouraged to manufacture parts for their robots, as well as use third party electronics
            </p>

            <h3>What is V5RC?</h3>
            <p>
                <a href="https://www.vexrobotics.com/v5/competition/vrc-current-game" target="_blank">V5RC</a> is a high-school level robotics competition, also operated by the <a href="https://recf.org/" target="_blank">RECF</a>.
                Competitors participate in the same game as VURC students, but are limited to strictly products provided for V5RC competition by the RECF.
            </p>
            <p>
                BUCKS is comprised of members from V5RC teams:
            </p>

            <div className='team-display-holder'>
                <TeamRoller teams={teams} />
            </div>


            <p>Our members have consistently been some of the best in the world, and we're excited to compete again.</p>

        </div>
    )
}

export default AboutUs;