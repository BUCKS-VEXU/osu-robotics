/* Noah Klein */

import { SimplifiedTrack } from "@spotify/web-api-ts-sdk";

export enum GameLoopStages {
    Searching,
    Playing,
    Won,
    Lost
}

export interface GameState {
    gameLoopStage: GameLoopStages;
    listeningStep: number;
    guessIndex: number;
    guesses: string[];
}


export interface Settings {
    isNightTheme: boolean;
    showInfoModal: boolean;
    narrowSearchResults: boolean;
}


interface SetDisplayInfo {
    image: string;
    author: string;
    name: string;
    link: string;
    authorLink: string;
}

export interface SetObject {
    tracks: SimplifiedTrack[] | undefined;
    displayInfo: SetDisplayInfo;
    length: number;
    type: string;
    id: string;
}
