/* Noah Klein */

import React, { useEffect } from 'react';

import { DarkModeSwitch } from 'react-toggle-dark-mode';
import useLocalStorage from 'use-local-storage'

import { GameState, Settings, GameLoopStages } from "./globals";
import "./SettingsBar.css"
import { SimplifiedTrack } from '@spotify/web-api-ts-sdk';



interface ThemeSwitchProps {
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const ThemeSwitch = ({ setSettings }: ThemeSwitchProps) => {
    const [localIsNightTheme, setLocalIsNightTheme] = useLocalStorage("isNightTheme", false);

    // Sync settings with localStorage theme
    useEffect(() => {
        setSettings(prevSettings => ({
            ...prevSettings,
            isNightTheme: localIsNightTheme,
        }));
        //eslint-disable-next-line
    }, [localIsNightTheme]);

    return (
        <div className='theme-switch'>
            <DarkModeSwitch
                checked={localIsNightTheme}
                onChange={() => { setLocalIsNightTheme(!localIsNightTheme) }}
                size={37}
            />
        </div>
    )

}



interface NewSongButtonProps {
    selectNewTrackFromSet: () => void;
}

const NewSongButton = ({ selectNewTrackFromSet }: NewSongButtonProps) => {

    const onClick = () => {
        selectNewTrackFromSet();
    }

    return (
        <svg className="NewSongButton" onClick={onClick} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50px" height="50px">
            <path
                d="M 25 2 A 2.0002 2.0002 0 1 0 25 6 C 35.517124 6 44 14.482876 44 25 C 44 35.517124 35.517124 44 25 44 C 14.482876 
            44 6 35.517124 6 25 C 6 19.524201 8.3080175 14.608106 12 11.144531 L 12 15 A 2.0002 2.0002 0 1 0 16 15 L 16 4 L 5 4 A 2.0002 
            2.0002 0 1 0 5 8 L 9.5253906 8 C 4.9067015 12.20948 2 18.272325 2 25 C 2 37.678876 12.321124 48 25 48 C 37.678876 48 48 
            37.678876 48 25 C 48 12.321124 37.678876 2 25 2 z"
                fill="var(--icons)"
            />
        </svg>
    )
}



interface InfoModalToggleProps {
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const InfoModalToggle = ({ setSettings }: InfoModalToggleProps) => {
    const toggleModal = () => {
        setSettings(prevSettings => ({
            ...prevSettings,
            showInfoModal: !prevSettings.showInfoModal,
        }))
    }

    return (
        <svg className='InfoModalToggle' onClick={toggleModal} width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 17V11"
                stroke="var(--icons)"
                strokeWidth="1.75"
                strokeLinecap="round"
            />
            <circle
                cx="1" cy="1" r="1.05"
                transform="matrix(1 0 0 -1 11 9)"
                fill="var(--icons)" />
            <path
                d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 
                17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7"
                stroke="var(--icons)"
                strokeWidth="1.75"
                strokeLinecap="round"
            />
        </svg>
    );
}



interface NarrowSearchResultsToggleProps {
    checked: boolean;
    setChecked: (checked: boolean) => void;
}

const NarrowSearchResultsToggle = ({ checked, setChecked }: NarrowSearchResultsToggleProps) => {
    return (
        <input type="checkbox" className="NarrowSearchResultsToggle" checked={checked} onChange={() => setChecked(!checked)} />
    );
}


interface SearchGuessToggleProps {
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    currentTrack: SimplifiedTrack | undefined;
}

const SearchGuessToggle = ({ gameState, setGameState, currentTrack }: SearchGuessToggleProps) => {

    const toggle = () => {
        setGameState(prevGameState => {
            const searching: boolean = prevGameState.gameLoopStage === GameLoopStages.Searching;

            return {
                ...prevGameState,
                gameLoopStage: searching ? GameLoopStages.Playing : GameLoopStages.Searching,
            }
        })
    }

    return (
        <>
            {typeof currentTrack !== 'undefined' &&
                <i
                    className={`search-icon ${gameState.gameLoopStage === GameLoopStages.Playing ? 'clicked' : ''}`}
                    onClick={() => toggle()}
                />
            }
        </>
    );

}


interface SettingsBarProps {
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    settings: Settings;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
    currentTrack: SimplifiedTrack;
    selectNewTrackFromSet: () => void;
}

const SettingsBar = ({ setGameState, gameState, settings, setSettings, currentTrack, selectNewTrackFromSet }: SettingsBarProps) => {
    return (
        <div className='SettingsBar'>
            <ThemeSwitch
                setSettings={setSettings}
            />
            <InfoModalToggle
                setSettings={setSettings}
            />
            <NarrowSearchResultsToggle
                checked={settings.narrowSearchResults}
                setChecked={(checked: boolean) => { setSettings({ ...settings, narrowSearchResults: checked }) }}
            />
            <NewSongButton
                selectNewTrackFromSet={selectNewTrackFromSet}
            />
            <SearchGuessToggle
                gameState={gameState}
                setGameState={setGameState}
                currentTrack={currentTrack}
            />

        </div>
    );
};


export default SettingsBar;
