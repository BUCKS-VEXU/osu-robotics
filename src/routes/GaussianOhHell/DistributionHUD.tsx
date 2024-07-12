/* Noah Klein */

import { useEffect } from 'react';

import { Player, GameState, GameLoopStages } from "./globals"

import { displayHUDPlot } from "./plots"

import "./DistributionHUD.css";

interface DistributionHUDProps {
    playerArray: Player[];
    gameState: GameState;
    setPlayerTricks: (index: number, tricks: number) => void;
}

const DistributionHUD = ({ playerArray, gameState, setPlayerTricks }: DistributionHUDProps) => {
    const HUDPlotWidth: number = 300;
    const HUDPlotHeight: number = 120;

    useEffect(() => {
        for (let i: number = 0; i < gameState.playerCount; i++) {
            const player: Player = playerArray[i];
            displayHUDPlot(player.mean, player.variance, HUDPlotWidth, HUDPlotHeight, `#hud-plot-${i}`);
        }
        // eslint-disable-next-line
    }, [gameState]);

    useEffect(() => {
        const player: Player = playerArray[gameState.playerIndex];
        displayHUDPlot(player.mean, player.variance, HUDPlotWidth, HUDPlotHeight, `#hud-plot-${gameState.playerIndex}`);
        //console.log("DistributionHUD.tsx: LOG: useEffect triggered")
    }, [playerArray, gameState]);

    return (
        <form className="distribution-hud">
            {
                Array.from({ length: gameState.playerCount }).map((_, index) => (
                    <div className="player-box" key={index}>
                        <h2 style={{ textAlign: "center", marginTop: "5px", marginBottom: "5px" }}>
                            {playerArray[index].name + (index === gameState.dealerIndex ? " - Dealer" : "")}
                        </h2>

                        <div className="hud-plot" id={`hud-plot-${index}`} />

                        <div className="player-interface">

                            <p>Score: {playerArray[index].score.toFixed(1)}</p>
                            <p>Mean: {playerArray[index].mean}</p>

                            {gameState.gameLoopStage === GameLoopStages.Playing &&
                                <div className='trick-submission'>
                                    <p>Tricks: </p>
                                    <input
                                        type="number"
                                        className="trick-number-input"
                                        min="0"
                                        max="11"
                                        step="1"
                                        value={playerArray[index].tricks}
                                        onChange={(e) => { e.preventDefault(); setPlayerTricks(index, Number(e.target.value)) }}
                                    />
                                </div>
                            }

                        </div>
                    </div>
                ))
            }
        </form>
    );
};

export default DistributionHUD;
