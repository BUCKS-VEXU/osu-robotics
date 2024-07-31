/* Noah Klein */

import { useEffect, useState } from 'react';
import SlotCounter from 'react-slot-counter';

import './TeamRoller.css';


interface Team {
    name: string;
    tournamentChampion: number;
    excellence: number;
    design: number;
    skillsChampion: number;
    otherAwards: number;
}

interface TeamRollerProps {
    teams: Team[];
}

const TeamRoller = ({ teams }: TeamRollerProps) => {
    const [displayedTeam, setDisplayedTeam] = useState<Team>(teams[2]);
    const [lastOrg, setLastOrg] = useState<string>(' ');

    const [isHovered, setIsHovered] = useState(true);

    const [displayList, setDisplayList] = useState(false);
    const [displayAwards, setDisplayAwards] = useState(true);

    const [hoverOffCountdown, setHoverOffCountdown] = useState(false);

    const showListDiv = useDelayUnmount(displayList, 500);
    const showAwardsDiv = useDelayUnmount(displayAwards, 500);


    const getRandomTeam = () => {
        const filteredTeams = teams.filter(team => !team.name.startsWith(lastOrg));
        const team = filteredTeams[Math.floor(Math.random() * filteredTeams.length)];
        setLastOrg(team.name.slice(0, -1));
        return team;
    };

    /* Set a timer for a new team every time the team displayed changes */
    useEffect(() => {
        const timer = setInterval(() => {
            if (!isHovered) {
                setDisplayedTeam(getRandomTeam());
            }
        }, 5000);

        return () => {
            clearInterval(timer);
        };
    }, [displayedTeam, isHovered]);


    /* Effect to handle full team display */
    useEffect(() => {
        console.log(hoverOffCountdown)
        let timer: NodeJS.Timeout | undefined = undefined;

        if (!isHovered) {
            if (!displayAwards)
                setHoverOffCountdown(true);
            timer = setInterval(() => {
                setIsHovered(false);
                setDisplayList(false);
                setDisplayAwards(true);
                setHoverOffCountdown(false);
            }, 2500);
        }

        if (isHovered) {
            setDisplayList(true);
            setDisplayAwards(false);
            setHoverOffCountdown(false);
        }

        return () => {
            clearInterval(timer);
        };

    }, [isHovered]);


    const onTeamClick = (index: number) => {
        setDisplayedTeam(teams[index]);
        setDisplayList(false);
        setDisplayAwards(true);
    }


    const mountedStyle = { animation: "inAnimation 500ms ease-in" };
    const unmountedStyle = {
        animation: "outAnimation 500ms ease-out",
        animationFillMode: "forwards"
    };

    const hoverOffCountdownStyle = {
        backgroundColor: 'rgba(228, 151, 151, 0.1)',
        transition: 'background-color 2500ms ease-in',
    };

    return (
        <div
            className="TeamRoller"
            style={hoverOffCountdown ? hoverOffCountdownStyle : { backgroundColor: 'rgba(228, 151, 151, 0.459)', }}
            onMouseEnter={() => setIsHovered(true)}
            onClick={() => setIsHovered(true)}
            onMouseLeave={() => { console.log('left'); setIsHovered(false) }}
        >
            <div className="team-name">
                <SlotCounter
                    value={displayAwards ? displayedTeam.name : "TEAMS"}
                    dummyCharacters={[...new Set(teams.map(team => team.name).join('').split(''))]}
                />
            </div>

            {showListDiv && (
                <div className='list' style={displayList ? mountedStyle : unmountedStyle}>
                    {teams.map((team, index) => (
                        <div key={index} className="list-item" onClick={() => onTeamClick(index)}>
                            {team.name}
                        </div>
                    ))}
                </div>
            )}

            {showAwardsDiv && (
                <div className='awards' style={displayAwards ? mountedStyle : unmountedStyle} >
                    <div className="award-item">Tournament Champion: <SlotCounter value={displayedTeam.tournamentChampion} /></div>
                    <div className="award-item">Excellence: <SlotCounter value={displayedTeam.excellence} /></div>
                    <div className="award-item">Design: <SlotCounter value={displayedTeam.design} /></div>
                    <div className="award-item">Skills Champion: <SlotCounter value={displayedTeam.skillsChampion} /></div>
                    <div className="award-item">Other Awards: <SlotCounter value={displayedTeam.otherAwards} /></div>
                </div>
            )}


        </div>

    );


};


const useDelayUnmount = (isMounted: boolean, delayTime: number) => {
    const [showDiv, setShowDiv] = useState(false);
    useEffect(() => {
        let timeoutId: any;
        if (isMounted && !showDiv) {
            setShowDiv(true);
        } else if (!isMounted && showDiv) {
            timeoutId = setTimeout(() => setShowDiv(false), delayTime); //delay our unmount
        }
        return () => clearTimeout(timeoutId); // cleanup mechanism for effects , the use of setTimeout generate a sideEffect
    }, [isMounted, delayTime, showDiv]);
    return showDiv;
}


export default TeamRoller;
