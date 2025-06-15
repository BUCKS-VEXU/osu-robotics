/* Noah Klein */

import './AboutUs.css';
import SeasonRecord from "./SeasonRecord";
import GoFundMeEmbed from '../../common/GoFundMeEmbed';
import { YouTubeEmbed } from 'react-social-media-embed';

const AboutUs = () => {
    return (
        <section className="AboutUs">

            <div className="row">
                <div className="introText">
                    <h2>About BUCKS Robotics</h2>
                    <p style={{ padding: '0' }}>
                        BUCKS Robotics represents The Ohio State University in the VEX U Robotics Competition
                        <a href="https://vurc-kb.recf.org/hc/en-us/articles/9831327507095-Welcome-VEX-U-Robotics-Competition-Teams" target="_blank"> (VURC) </a>
                        — a collegiate-level engineering challenge where student teams design, build, and program custom robots to compete on a global stage.
                        We are a student-run organization dedicated to hands-on innovation, collaboration, and technical excellence in the world of competitive robotics.
                    </p>
                </div>
                <GoFundMeEmbed />
            </div>
            <SeasonRecord season="High Stakes" wins={21} losses={3} />


            <h2>Competitive Success</h2>
            <p>
                BUCKS had a remarkable first season in VEXU, growing steadily with each competition. We kicked things off at the Riverbots Signature Event,
                finished 6-2, placing 5th, finishing in the quarterfinals, and earning the Sportsmanship Award. At NUKEtown, we built on that momentum with a 6-1 record,
                a 3rd place finish, a 96-point skills score, and the Judges Award.
            </p>
            <p>
                BUCKS ended our season at the VEXU World Championship with an undefeated 9-0 qualification run, finishing 2nd in the Technology Division.
                Our run ended in the semifinals against <a target='_blank' href='https://tntnvex.com/'>TNTN</a>, the eventual triple crown winner
                (World Champion, Skills Champion, and Excellence Award recipient).
                <br /><br />
                After the tournament, a TNTN team member said:
                <blockquote>
                    “We didn't even scout after semis — we thought you would win.”
                </blockquote>
                Though our run ended in the semifinals, we're proud of our growth, teamwork, and accomplishments. We are excited for what comes next for BUCKS.
            </p>


            <h2>Worlds Recap!</h2>
            <div className="video-wrapper">
                <YouTubeEmbed
                    url="https://www.youtube.com/embed/YreDxcPKVq4?si=SVTML77ccOCmk1E0"
                    width="100%"
                    height="100%"
                    className="youtube-iframe"
                    title="BUCKS Robotics 2023-2024 Season Recap"
                />
            </div>
        </section >
    )
}

export default AboutUs;