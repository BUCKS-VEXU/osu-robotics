/* Noah Klein */

import React, { useEffect, useRef, useState } from 'react';

import { usePromiseTracker, trackPromise } from 'react-promise-tracker';
import { ThreeDots } from "react-loader-spinner";

import { SpotifyApi, Artist, SimplifiedAlbum, Playlist, SimplifiedArtist, SimplifiedTrack } from '@spotify/web-api-ts-sdk';
import { GameLoopStages, GameState, SetObject } from './globals';
import ScrollableSetList from './ScrollableSetList';

import './GuessInterface.css'


interface LoadingIndicatorProps {
    className: string;
}

const LoadingIndicator = ({ className }: LoadingIndicatorProps) => {
    const { promiseInProgress } = usePromiseTracker();

    return promiseInProgress ? (
        <div className={className}>
            <ThreeDots color="#00BFFF" height={80} width={80} />
        </div>
    ) : null;
};


interface GuessInterfaceProps {
    sdk: SpotifyApi;
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    currentTrack: SimplifiedTrack | undefined;
    currentSet: SetObject;
    narrowSearchResults: boolean;
}

const GuessInterface = ({ sdk, gameState, setGameState, currentTrack, currentSet, narrowSearchResults }: GuessInterfaceProps) => {

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchResults, setSearchResults] = useState<SimplifiedTrack[]>();

    const clearGuesses = () => {
        setGameState(prevGameState => {
            return {
                ...prevGameState,
                guesses: new Array(6).fill(""),
            }
        })
    }

    const setGuess = (guess: string) => {
        setGameState(prevGameState => {
            const newGuesses = [...prevGameState.guesses];
            newGuesses[prevGameState.guessIndex] = guess;
            return {
                ...prevGameState,
                guesses: newGuesses,
            }
        })
    }

    /* Clear guesses when currentTrack changes, but not on every re-render */
    const hasRunEffect = useRef(false);
    useEffect(() => {
        if (!hasRunEffect.current) {
            hasRunEffect.current = true;
        } else {
            clearGuesses();
            setSearchQuery("");
            setSearchResults(undefined);
            console.log(currentTrack);
        }
    }, [currentTrack]);


    const skipGuess = () => {
        setGuess("Skipped");

        setGameState(prevGameState => {
            return {
                ...prevGameState,
                guessIndex: prevGameState.guessIndex + 1,
            }
        });
    }

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSearchResults(undefined)

        // Start tracking the promise
        trackPromise(
            search(searchQuery)
        );
    }

    async function search(searchInput: string) {
        return new Promise<void>(async (resolve, _) => {
            let results: SimplifiedTrack[] = [];


            if (currentSet.type !== 'artist') {
                const fetched = await sdk.search(searchInput, ["track"], undefined, 50)
                results = fetched.tracks.items;
            } else {
                const searchString = `search?q=${encodeURIComponent(currentSet.displayInfo.name)}+artist%3A${encodeURIComponent(currentSet.displayInfo.name)}&type=track`;
                const fetched: any = await sdk.makeRequest("GET", searchString);
                results = fetched.tracks.items;
            }

            if (narrowSearchResults) {
                results = results.filter(result => currentSet.tracks!.some(track => track.id === result.id));
            }


            setSearchResults(results.slice(0, 20));
            resolve();


        });
    }

    const exactSameArtistsOnTrack = (array1: SimplifiedArtist[], array2: SimplifiedArtist[]) => {
        if (array1.length !== array2.length) {
            return false;
        }
        const sortedArray1 = [...array1].sort((a, b) => JSON.stringify(a) > JSON.stringify(b) ? 1 : -1);
        const sortedArray2 = [...array2].sort((a, b) => JSON.stringify(a) > JSON.stringify(b) ? 1 : -1);

        for (let i = 0; i < sortedArray1.length; i++) {
            if (JSON.stringify(sortedArray1[i]) !== JSON.stringify(sortedArray2[i])) {
                return false;
            }
        }

        return true;
    }

    const trackIsSimilarToCurrentTrack = (track: SimplifiedTrack): boolean => {
        if (typeof currentTrack !== 'undefined') {
            return (track.id === currentTrack.id) || ((track.name === currentTrack.name) && exactSameArtistsOnTrack(track.artists, currentTrack.artists));
        }
        return false;
    }

    const updateGameState = (track: SimplifiedTrack) => {
        let newGameLoopStage: GameLoopStages = GameLoopStages.Playing;
        let newGuessIndex = gameState.guessIndex + 1;

        //Spotify is funny so check if the name of the songs and artists are the same just in case
        if (trackIsSimilarToCurrentTrack(track)) {
            newGameLoopStage = GameLoopStages.Won;
        } else if (gameState.guessIndex === 5) {
            newGameLoopStage = GameLoopStages.Lost;
        }

        setGameState(prevGameState => ({
            ...prevGameState,
            gameLoopStage: newGameLoopStage,
            guessIndex: newGuessIndex,
        }))

    }

    const handleTrackClick = (track: SimplifiedTrack) => {
        setGuess(track.name);

        setSearchQuery("");
        setSearchResults(undefined);
        updateGameState(track);
    }


    return (
        <div className='GuessInterface'>
            {Array.from({ length: 6 }).map((_, index) => {
                const isCurrentGuess: boolean = gameState.guessIndex === index;

                if (searchResults && gameState.guessIndex < index) {
                    return null; // Skip rendering other search boxes when results are displayed
                }

                return (
                    <div key={index} className={"guess-input"}>
                        <form onSubmit={(e) => { handleSearchSubmit(e); }}>
                            <input
                                type="text"
                                value={isCurrentGuess ? searchQuery : gameState.guesses[index]}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                disabled={(!isCurrentGuess) || !(gameState.gameLoopStage === GameLoopStages.Playing)}
                            />
                        </form>
                        {isCurrentGuess && <LoadingIndicator className={"loading-indicator-guess"} />}

                        {(isCurrentGuess && index < 5) &&
                            <>
                                <img title="Skip this guess" className="skip-icon" src="/media/skip-icon.svg" alt="" onClick={() => { skipGuess(); }} />
                            </>
                        }
                    </div>
                );
            })}

            {searchResults && (
                <ScrollableSetList
                    sdk={sdk}
                    setList={searchResults}
                    // Keep typescript happy
                    handleItemClick={handleTrackClick as (set: Artist | SimplifiedTrack | Playlist | SimplifiedAlbum) => void}
                />
            )}
        </div>
    );
}

export default GuessInterface;
