/* Noah Klein */

import './AboutUs.css';
import SeasonRecord from "./SeasonRecord";

const AboutUs = () => {
    return (
        <section className="AboutUs">


            <h2>About BUCKS Robotics</h2>
            <p>
                BUCKS Robotics represents The Ohio State University in the VEX U Robotics Competition
                <a href="https://vurc-kb.recf.org/hc/en-us/articles/9831327507095-Welcome-VEX-U-Robotics-Competition-Teams" target="_blank"> (VURC) </a>
                — a collegiate-level engineering challenge where student teams design, build, and program custom robots to compete on a global stage.
                We are a student-run organization dedicated to hands-on innovation, collaboration, and technical excellence in the world of competitive robotics.
            </p>
            <SeasonRecord season="High Stakes" wins={21} losses={3} />

            <h2>Competitive Success</h2>
            <p>
                In our debut season, BUCKS made an immediate impact at the 2024 VEX U World Championship.
                We went undefeated in qualification matches and earned the #2 seed in our division.
                Our run ended in the semifinals against <a target='_blank' href='https://tntnvex.com/'>TNTN</a>, the eventual triple crown winner
                (World Champion, Skills Champion, and Excellence Award recipient).
                <br /><br />
                After the tournament, a TNTN team member said:
                <blockquote>
                    “We didn't even scout after semis — we thought you would win.”
                </blockquote>
            </p>
        </section >
    )
}

export default AboutUs;