/* Noah Klein */

import { useEffect, useState } from 'react';
import './Player.css';

import { GameState, SetObject } from './globals';
import { SimplifiedTrack, SpotifyApi } from '@spotify/web-api-ts-sdk';
import ProgressBar from './ProgressBar';


interface PlayerProps {
    sdk: SpotifyApi;
    playbackDeviceId: string;
    currentSet: SetObject;
    currentTrack: SimplifiedTrack;
    gameState: GameState;
}

const Player = ({ sdk, playbackDeviceId, currentSet, currentTrack, gameState }: PlayerProps) => {
    const [trackPlaying, setTrackPlaying] = useState<boolean>(false);
    const [playTimeoutId, setPlayTimeoutId] = useState<NodeJS.Timeout | undefined>(undefined);


    const playToggle = async () => {
        // Clear any existing timeouts
        if (playTimeoutId) {
            clearTimeout(playTimeoutId);
            setPlayTimeoutId(undefined);
        }

        if (trackPlaying) {
            await sdk.player.pausePlayback(playbackDeviceId);
            setTrackPlaying(false);
        } else {
            await sdk.player.startResumePlayback(playbackDeviceId, undefined, [currentTrack.uri], undefined, 0);
            setTrackPlaying(true);

            // Create a new timeout and store the reference
            const timeoutId = setTimeout(async () => {
                let timer = Date.now();
                await sdk.player.pausePlayback(playbackDeviceId);
                console.log(`Pause operation took ${Date.now() - timer} milliseconds`);

                setTrackPlaying(false);

                // Cut it 50 milliseconds short because pausing always takes some time
            }, ([1000, 2000, 4000, 8000, 12000, 16000][gameState.guessIndex] - 140));

            setPlayTimeoutId(timeoutId);
        }
    }

    /* Pause possibly playing song when currentTrack updates */
    useEffect(() => {
        setTrackPlaying(false);
        sdk.player.pausePlayback(playbackDeviceId);

    }, [currentTrack]);



    const displayInfo = currentSet.displayInfo;
    return (
        <div className='Player'>
            <ProgressBar
                guessIndex={gameState.guessIndex}
                playing={trackPlaying}
            />
            <div className="media-info">

                <div className="media-image">
                    <img src={displayInfo.image} alt="Cover art" />
                </div>

                <div className="media-details">
                    <a className="media-name" href={displayInfo.link} target="_blank" rel="noreferrer noopener">{displayInfo.name}</a>
                    <a className="media-author" href={displayInfo.authorLink} target="_blank" rel="noreferrer noopener">
                        {currentSet.type.charAt(0).toUpperCase() + currentSet.type.slice(1)}
                        {currentSet.type !== "artist" ? " • " : ""}
                        {displayInfo.author}
                    </a>
                    <img className="spotify-full-logo" src="/media/Spotify_Logo_RGB_White.png" alt="Spotify logo" />
                </div>
                <div className="count-and-toggle">
                    <p className="media-length">{currentSet.length !== 0 ? currentSet.length : ""} Songs</p>
                    <button className={trackPlaying ? "play-pause paused" : "play-pause"} onClick={() => playToggle()} ></button>
                </div>
            </div>
        </div>
    )

}

export default Player;
