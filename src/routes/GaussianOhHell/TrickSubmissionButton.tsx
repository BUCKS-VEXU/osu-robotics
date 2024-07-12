/* Noah Klein */
import React from 'react'

import { Player, GameState, GameLoopStages, DEFAULT_VARIANCE, FINAL_ROUND, calculateScore } from "./globals"

import "./TrickSubmissionButton.css"

interface TrickSubmissionButtonProps {
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    playerArray: Player[];
    setPlayerArray: React.Dispatch<React.SetStateAction<Player[]>>;
}

const TrickSubmissionButton = ({ gameState, setGameState, playerArray, setPlayerArray }: TrickSubmissionButtonProps) => {

    const updatePlayers = (newGameState: GameState): void => {
        setPlayerArray(
            playerArray.map((player) => ({
                ...player,
                mean: newGameState.round,
                variance: DEFAULT_VARIANCE,
                score: player.score + (calculateScore(player.mean, player.variance, player.tricks) + player.tricks),
            }))
        )
    }

    const isGameOver = (): boolean => {
        let gameOver: boolean = false;
        if (gameState.round === 1 && !gameState.roundGoingUp) {
            gameOver = true;
        }
        return gameOver;
    }

    const shouldRoundSwitch = (): boolean => {
        return gameState.round === FINAL_ROUND;
    }

    const newRound = (): number => {
        const roundIncrement: number = (gameState.roundGoingUp ? 1 : -1);
        const adjustForGameOver: number = (isGameOver() ? 1 : 0);
        const adjustedRound: number = -Math.abs(gameState.round + roundIncrement - FINAL_ROUND) + FINAL_ROUND + adjustForGameOver;

        return adjustedRound;
    }

    const updatePlayersWithNewGameState = (prevState: GameState): GameState => {
        const newGameState: GameState = {
            ...prevState,
            gameLoopStage: isGameOver() ? GameLoopStages.GameOver : GameLoopStages.Bidding,
            roundGoingUp: !shouldRoundSwitch() && prevState.roundGoingUp, // Keep it false if it already is
            dealerIndex: (prevState.dealerIndex + 1) % prevState.playerCount,
            round: newRound(),
        };

        updatePlayers(newGameState);

        return newGameState; // Return updated state
    };

    const updateGameStateAndPlayers = (): void => {
        setGameState(updatePlayersWithNewGameState(gameState));
    }

    return (
        <button className='TrickSubmissionButton' onClick={() => { updateGameStateAndPlayers(); }}>
            Submit Tricks
        </button>
    );
};

export default TrickSubmissionButton;
