/* Noah Klein */

import NavBar from '../../common/NavBar';


import './History.css';

const History = () => {
    return (
        <div className="History">
            <NavBar />
            <h1>This page is a work in progress</h1>
            <section className='history'>
                <h2>Riverbots</h2>
                <p>
                    At our first VEXU tournament, the Riverbots Signature Event, finishing with a strong 6-2 record and placing 5th overall.
                    BUCKS were proud to make it to the quarterfinals and honored to receive the Sportsmanship Award.
                    The event gave us new ideas for building and showed us where we can improve.
                    We were motivated to practice and prepare even more for future competitions.
                </p>

                <h2>NUKETown</h2>
                <p>
                    At the NUKEtown tournament, BUCKS finished 6-1 in qualifications and secured 3rd place overall.
                    We focused more on skills in preparation for this tournament, our second competition as a team.
                    We earned a total skills score of 96. We also received the Judges Award. We realized after these two competitions that,
                    while we had a lot of talented people on our team, BUCKS needed to grow.
                </p>

                <h2>Worlds</h2>
                <p>
                    BUCKS wrapped up the first season at the VEXU World Championship with an incredible run,
                    going 9-0 in qualification and finished 2nd in the Technology Division.
                    Although we were eliminated in the division semifinals by TNTN,
                    we had an amazing experience and are proud of BUCKS's first year.
                </p>
            </section>
        </div>
    );
};

export default History;
