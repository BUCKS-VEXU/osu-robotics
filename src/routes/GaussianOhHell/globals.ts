/* Noah Klein */

import cdf from '@stdlib/stats-base-dists-normal-cdf'



// Variable constants
export const MAX_PLAYER_COUNT: number = 4;
export const MIN_PLAYER_COUNT: number = 2;
export const DEFAULT_PLAYER_COUNT: number = 2;
export const DEFAULT_VARIANCE: number = 0.24;
export const FINAL_ROUND: number = 11;


// Structs basically lol
export enum GameLoopStages {
    StartScreen = "START SCREEN",
    Bidding = "BIDDING",
    Playing = "PLAYING",
    GameOver = "GAME OVER",
}

export interface IdlePlotAttributes {
    mean: number,
    variance: number,
    phaseShift: number,
}

export interface Player {
    index: number;
    name: string;
    score: number;
    mean: number;
    variance: number;
    tricks: number;
}

export interface GameState {
    round: number;
    playerCount: number;
    playerIndex: number;
    dealerIndex: number;
    gameLoopStage: GameLoopStages;
    roundGoingUp: boolean;
}

export interface Settings {
    displayIdlePlot: boolean;
    isNightTheme: boolean;
}


// Functions
export const calculateScore = (mean: number, variance: number, tricks: number): number => {
    return (cdf(tricks + 0.5, mean, Math.sqrt(variance)) - cdf(tricks - 0.5, mean, Math.sqrt(variance))) * 10;
}