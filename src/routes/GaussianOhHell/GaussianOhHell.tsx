/* Noah Klein */

import { useState, useEffect } from 'react';
import { useWindowSize } from '@react-hook/window-size'


import { displayBiddingPlot } from "./plots"
import BidSubmissionInterface from "./BidSubmissionInterface"
import StartScreen from "./StartScreen"
import DistributionHUD from "./DistributionHUD"
import TrickSubmissionButton from './TrickSubmissionButton';
import IdlePlot from './IdlePlot';
import SettingsBar from './SettingsBar';

import { MAX_PLAYER_COUNT, DEFAULT_PLAYER_COUNT, DEFAULT_VARIANCE, Player, GameState, Settings, GameLoopStages } from "./globals"

import "./GaussianOhHell.css";

const GaussianOhHell = () => {
    /* States */

    const [width, height] = useWindowSize();

    const [settings, setSettings] = useState<Settings>({
        displayIdlePlot: false,
        isNightTheme: false,
    })

    const [gameState, setGameState] = useState<GameState>({
        round: 1,
        playerCount: DEFAULT_PLAYER_COUNT,
        playerIndex: 1, // Second player plays first, since first player is bidder
        dealerIndex: 0,
        gameLoopStage: GameLoopStages.StartScreen,
        roundGoingUp: true,
    });

    const [playerArray, setPlayerArray] = useState<Player[]>(() => {
        const defaultPlayer = (index: number): Player => ({
            index: index,
            name: "",
            score: 0,
            mean: 1,
            variance: DEFAULT_VARIANCE,
            tricks: 0
        });
        return Array.from({ length: MAX_PLAYER_COUNT }, (_, index) => defaultPlayer(index));
    });


    /* Effects */

    useEffect(() => {
        const player: Player = playerArray[gameState.playerIndex];
        displayBiddingPlot(player.mean, player.variance, width, height, player.name, '#plot-holder');
    }, [width, height, playerArray, gameState, settings]);


    /* Functions */

    const setPlayerAttribute = <K extends keyof Player>(index: number, key: K, value: Player[K]): void => {
        setPlayerArray(prevPlayerArray =>
            prevPlayerArray.map((player, i) =>
                i === index ? { ...player, [key]: value } : player
            )

        );
    };


    /* Return JSX */

    return (
        <div className="GaussianOhHell" data-theme={settings.isNightTheme ? "dark" : "light"}>

            <SettingsBar
                settings={settings}
                setSettings={setSettings}
            />

            {/* Maybe display StartScreen */}
            {gameState.gameLoopStage === GameLoopStages.StartScreen &&
                (<StartScreen
                    closeStartScreen={() => setGameState({ ...gameState, gameLoopStage: GameLoopStages.Bidding })}
                    playerArray={playerArray}
                    playerCount={gameState.playerCount}
                    setPlayerCount={(playerCount: number) => setGameState({ ...gameState, playerCount: playerCount })}
                    setPlayerName={(index: number, name: string) => { setPlayerAttribute(index, "name", name) }}
                />)
            }

            {/* This is main body of the website */}

            <div className="flex-column" style={{ marginLeft: "10px" }}>
                <h1 style={{ color: "var(--text-primary)" }}>Round: {gameState.round}</h1>

                {gameState.gameLoopStage === GameLoopStages.StartScreen &&
                    (
                        <>
                            {/* Maybe display IdlePlot */}
                            {settings.displayIdlePlot ?
                                (<IdlePlot
                                    width={width}
                                    height={height}
                                    playerCount={gameState.playerCount}
                                    playerArray={playerArray}
                                />)
                                :
                                (<div id="plot-holder" />)
                            }
                        </>
                    )
                }

                {gameState.gameLoopStage === GameLoopStages.Bidding &&
                    <>
                        <div id="plot-holder" />
                        <BidSubmissionInterface
                            width={width}
                            height={height}
                            gameState={gameState}
                            setGameState={setGameState}
                            playerArray={playerArray}
                            setPlayerAttribute={setPlayerAttribute}
                        />
                    </>
                }

                {gameState.gameLoopStage === GameLoopStages.Playing &&
                    <>
                        {/* Maybe display IdlePlot */}
                        {settings.displayIdlePlot ?
                            (<IdlePlot
                                width={width}
                                height={height}
                                playerCount={gameState.playerCount}
                                playerArray={playerArray}
                            />)
                            :
                            (<div id="plot-holder" />)
                        }
                        <TrickSubmissionButton
                            gameState={gameState}
                            setGameState={setGameState}
                            playerArray={playerArray}
                            setPlayerArray={setPlayerArray}
                        />
                    </>
                }
            </div>

            <div className="flex-column">
                <DistributionHUD
                    playerArray={playerArray}
                    gameState={gameState}
                    setPlayerTricks={(index: number, tricks: number) => { setPlayerAttribute(index, "tricks", tricks) }}
                />
            </div>
        </div >
    )
}

export default GaussianOhHell;
