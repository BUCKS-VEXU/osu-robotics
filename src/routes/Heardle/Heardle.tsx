/* Noah Klein */

import { useState } from 'react';

import { GameLoopStages, GameState, Settings, SetObject } from './globals'

import useLocalStorage from 'use-local-storage'
import createSpotifySDK from './createSpotifySDK';

import InfoModal from './InfoModal';
import SettingsBar from './SettingsBar';
import SearchBox from './SearchBox';

import './Heardle.css'

import GuessInterface from './GuessInterface';
import { SimplifiedTrack } from '@spotify/web-api-ts-sdk';
import Player from './Player';
import WebPlayback from './WebPlayBack';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import GameOverScreen from './GameOverScreen';

const Heardle = ({ }) => {
    const sdk = createSpotifySDK();

    /* States */
    const [gameState, setGameState] = useState<GameState>({
        gameLoopStage: GameLoopStages.Searching,
        listeningStep: 0,
        guessIndex: 0,
        guesses: new Array(6).fill(""),
    });

    const [localNightTheme, _] = useLocalStorage("isNightTheme", false);
    const [settings, setSettings] = useState<Settings>({
        isNightTheme: localNightTheme,
        showInfoModal: true,
        narrowSearchResults: false,
    });

    const [currentTrack, setCurrentTrack] = useState<SimplifiedTrack | undefined>();


    const [deviceId, setDeviceId] = useState<string | undefined>();

    const [width, height] = useWindowSize();


    const [currentSet, setCurrentSet] = useState<SetObject>({
        tracks: undefined,
        displayInfo: {
            image: "",
            author: "",
            name: "",
            link: "",
            authorLink: "",
        },
        length: 0,
        type: "",
        id: "",
    });


    const selectNewTrackFromSet = (set?: SetObject) => {
        const usingSet = set ? set : currentSet;
        if (typeof usingSet.tracks !== 'undefined') {
            const randIndex = Math.floor(Math.random() * (usingSet.length));
            setCurrentTrack(usingSet.tracks![randIndex]);

            console.log(usingSet.tracks![randIndex].name);

            setGameState({
                ...gameState,
                gameLoopStage: GameLoopStages.Playing,
                listeningStep: 0,
                guessIndex: 0,
            })
        }
    }


    return (
        <div className="Heardle" data-theme={settings.isNightTheme ? "dark" : "light"}>

            <h1 style={{ color: "var(--text-primary)", paddingTop: "10px" }}>Heardle (For You)</h1>

            <SettingsBar
                gameState={gameState}
                setGameState={setGameState}
                settings={settings}
                setSettings={setSettings}
                currentTrack={currentTrack!}
                selectNewTrackFromSet={selectNewTrackFromSet}
            />

            <Confetti
                width={width}
                height={height}
                numberOfPieces={(gameState.gameLoopStage === GameLoopStages.Won) ? 100 : 0}
            />


            {settings.showInfoModal &&
                <InfoModal
                    closeModal={() => { setSettings(prevSettings => ({ ...prevSettings, showInfoModal: false })) }}
                />
            }

            {gameState.gameLoopStage === GameLoopStages.Searching &&
                <SearchBox
                    sdk={sdk}
                    setCurrentSet={setCurrentSet}
                    selectNewTrackFromSet={(set: SetObject) => selectNewTrackFromSet(set)}
                />
            }

            {gameState.gameLoopStage === GameLoopStages.Playing &&
                <>
                    <GuessInterface
                        sdk={sdk}
                        gameState={gameState}
                        setGameState={setGameState}
                        currentTrack={currentTrack}
                        currentSet={currentSet}
                        narrowSearchResults={settings.narrowSearchResults}
                    />
                    <Player
                        sdk={sdk}
                        playbackDeviceId={deviceId!}
                        currentSet={currentSet}
                        currentTrack={currentTrack!}
                        gameState={gameState}
                    />
                </>
            }

            {(gameState.gameLoopStage === GameLoopStages.Won || gameState.gameLoopStage === GameLoopStages.Lost) &&
                <GameOverScreen
                    currentTrack={currentTrack!}
                    gameStage={gameState.gameLoopStage}
                    setGameState={setGameState}
                    selectNewTrack={selectNewTrackFromSet}
                />
            }


            <WebPlayback
                sdk={sdk}
                setDeviceId={setDeviceId}
            />


        </div>
    );
}

export default Heardle;
