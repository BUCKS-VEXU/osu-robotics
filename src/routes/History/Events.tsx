/* Noah Klein */

// import { InstagramEmbed } from "react-social-media-embed";
// import { YouTubeEmbed } from "react-social-media-embed/dist/components/embeds/YouTubeEmbed";

interface Event {
    date: string;
    title: string;
    description: string;
    embed?: JSX.Element;
}

export const events: Array<Event> = [
    {
        date: 'Dec 14th-15th 2024',
        title: 'RiverBots III VEX U Robotics Competition',
        description: 'At our first VEXU tournament, the Riverbots Signature Event, finishing with a strong 6-2 record and placing 5th overall. BUCKS were proud to make it to the quarterfinals and honored to receive the Sportsmanship Award. The event gave us new ideas for building and showed us where we can improve. We were motivated to practice and prepare even more for future competitions.',
        // embed:
        //     <div className="embed-container-insta">
        //         <InstagramEmbed url="https://www.instagram.com/p/DDn6b_ntzo6/" />  {/*width={"75%"}*/}
        //     </div>,
    },
    {
        date: 'Jan 26th 2025',
        title: 'NUKEtown Qualifier',
        description: 'At the NUKEtown tournament, BUCKS finished 6-1 in qualifications and secured 3rd place overall. We focused more on skills in preparation for this tournament, our second competition as a team. We earned a total skills score of 96. We also received the Judges Award. We realized after these two competitions that, while we had a lot of talented people on our team, BUCKS needed to grow.',
        // embed:
        //     <div className="embed-container-youtube">
        //         <YouTubeEmbed url="https://www.youtube.com/watch?v=84cbX2pEHPM" />
        //     </div>,
    },
    {
        date: 'May 9th 2025',
        title: '2025 VEX Robotics World Championship',
        description: 'BUCKS wrapped up the first season at the VEXU World Championship with an incredible run, going 9-0 in qualification and finished 2nd in the Technology Division. Although we were eliminated in the division semifinals by TNTN, we had an amazing experience and are proud of BUCKS\'s first year.',
        // embed:
        //     <div className="embed-container-insta">
        //         <InstagramEmbed url="https://www.instagram.com/p/C5qUbMcgfZ2/" />
        //     </div>,
    },
];
