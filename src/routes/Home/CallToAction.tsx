/* Noah Klein */

import './CallToAction.css';

const CallToAction = () => {
    return (
        <section className="CallToAction">
            <h2>Join the Team. Build your Future.</h2>

            <div className="row">
                <a href='/assets/worlds/Team-Pic.jpg'><img src="assets/worlds/Team-Pic.jpg" alt="Our Team at Worlds 2025" /></a>
                <div className='writeup'>
                    <p><em>BUCKS Robotics is just getting started.</em> We've made our mark on the global stage and this is only the beginning. We're thinking bigger, iterating faster, and unlocking new potential with every match, subsystem, and algorithm.</p>
                    <p>If you're passionate about <em>engineering</em>, <em>programming</em>, <em>competition</em>, or <em>building something that matters</em> — we want you on board. Whether you're a student, sponsor, mentor, or fan, there's a place for you here.</p>
                </div>
            </div>

            <a href="mailto:bucks@osurobotics.org" className="cta-button">
                Join our Team
            </a>
        </section>
    );
}

export default CallToAction;
