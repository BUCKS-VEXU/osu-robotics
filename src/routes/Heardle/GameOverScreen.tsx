/* Noah Klein */

import { SimplifiedTrack } from "@spotify/web-api-ts-sdk"
import { GameState, GameLoopStages } from "./globals";

import './GameOverScreen.css'

interface GameOverScreenProps {
    currentTrack: SimplifiedTrack;
    gameStage: GameLoopStages;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    selectNewTrack: () => void;
}

const GameOverScreen = ({ currentTrack, gameStage, setGameState, selectNewTrack }: GameOverScreenProps) => {

    const handleSearchClick = () => {
        setGameState(prevGameState => {
            return {
                ...prevGameState,
                gameLoopStage: GameLoopStages.Searching,
                listeningStep: 0,
                guessIndex: 0,
                guesses: new Array(6).fill(""),
            }
        })
    }



    const handleRestartClick = () => {
        selectNewTrack();
        setGameState(prevGameState => {
            return {
                ...prevGameState,
                gameLoopStage: GameLoopStages.Playing,
                listeningStep: 0,
                guessIndex: 0,
                guesses: new Array(6).fill(""),
            }
        })
    }

    return (
        <div className="GameOverScreen">
            {gameStage === GameLoopStages.Won &&
                <>
                    <h1>You Won!</h1>
                    <button onClick={() => handleRestartClick()}>Play another song from your set</button>
                    <button onClick={() => handleSearchClick()}>Search for a different set</button>
                </>
            }
            {gameStage === GameLoopStages.Lost &&
                <>
                    <h1>You Lost</h1>
                    <h2>The song was "{currentTrack.name}" by {currentTrack.artists[0].name}</h2>
                    <button onClick={() => handleRestartClick()}>Play another song from your set</button>
                    <button onClick={() => handleSearchClick()}>Search for a different set</button>
                </>
            }
        </div>
    )
}

export default GameOverScreen