/* Noah Klein */

import React from 'react'

import { Player, GameState, GameLoopStages, calculateScore } from "./globals"
import { } from './GaussianOhHell';


import { displayPlayingPlot } from "./plots"

import Slider from './Slider';

import "./BidSubmissionInterface.css";


interface BidSubmissionInterfaceProps {
    width: number;
    height: number;
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    playerArray: Player[];
    setPlayerAttribute: <K extends keyof Player>(index: number, key: K, value: Player[K]) => void;
}

const BidSubmissionInterface = ({ width, height, gameState, setGameState, playerArray, setPlayerAttribute }: BidSubmissionInterfaceProps) => {


    const getCurrentPlayer = (): Player => {
        return playerArray[gameState.playerIndex];
    }

    const updateIndexAndRound = () => {
        const playerCount: number = gameState.playerCount;
        let round: number = gameState.round;
        let playerIndex: number = gameState.playerIndex;
        let dealerIndex: number = gameState.dealerIndex;
        let gameLoopStage: GameLoopStages = gameState.gameLoopStage;

        if (gameLoopStage === GameLoopStages.Bidding) {
            if (playerIndex === dealerIndex) {
                playerIndex = (dealerIndex + 2) % playerCount;
                gameLoopStage = GameLoopStages.Playing;
                displayPlayingPlot(playerArray, gameState.playerCount, width, height, '#plot-holder')
            }
            else {
                playerIndex = (playerIndex + 1) % playerCount;
            }
        }

        setGameState({ ...gameState, playerIndex: playerIndex, round: round, dealerIndex: dealerIndex, gameLoopStage: gameLoopStage })
    }


    const handleBidSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        setPlayerAttribute(gameState.playerIndex, 'tricks', getCurrentPlayer().mean);
        updateIndexAndRound();
    };


    return (
        <>
            <form onSubmit={handleBidSubmit} className="BidSubmissionInterface">

                <label className="slider-pack" id="mean">
                    Mean:
                    <Slider
                        setValue={(mean: number) => { setPlayerAttribute(gameState.playerIndex, 'mean', mean); }}
                        value={getCurrentPlayer().mean}
                        min={0}
                        max={11}
                        scaleFunction={(x) => { return x / 2 }}
                        inverseScaleFunction={(x) => { return x * 2 }}
                    />
                </label>

                <label className="slider-pack" id="variance">
                    Variance:
                    <Slider
                        setValue={(variance: number) => { setPlayerAttribute(gameState.playerIndex, 'variance', variance); }}
                        value={getCurrentPlayer().variance}
                        min={0.01}
                        max={29.85}
                        scaleFunction={(x) => { return Math.exp(x / 14) - 1; }}
                        inverseScaleFunction={(x) => { return 14 * Math.log(x + 1) }}
                    />
                </label>

                <input type="submit" value="Submit Bid" className="submit-trick-button" />

            </form>

            <h4 style={{ textAlign: "center", color: "var(--text-primary)" }}>
                Score if correct: {calculateScore(getCurrentPlayer().mean, getCurrentPlayer().variance, getCurrentPlayer().mean).toFixed(2)}
            </h4>
        </>
    );
};

export default BidSubmissionInterface;
