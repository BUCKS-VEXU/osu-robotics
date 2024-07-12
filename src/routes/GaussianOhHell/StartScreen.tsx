/* Noah Klein */

import { useState } from 'react';

import { MAX_PLAYER_COUNT, MIN_PLAYER_COUNT, Player } from './globals'

import "./StartScreen.css";
import DynamicNameInput from './DynamicNameInput';

interface StartScreenProps {
    closeStartScreen: any;
    playerArray: Player[];
    playerCount: number;
    setPlayerCount: any;
    setPlayerName: (index: number, name: string) => void;
}

const StartScreen = ({ closeStartScreen, playerArray, playerCount, setPlayerCount, setPlayerName }: StartScreenProps): JSX.Element => {
    /* States */
    const [errorMessage, setErrorMessage] = useState('');


    /* Functions */
    const validateForm = (): boolean => {
        for (let i = 0; i < playerCount; i++) {
            if (playerArray[i].name.trim() === '') {
                setErrorMessage('All player names are required.');
                return false;
            }
        }
        setErrorMessage('');
        return true;
    };

    const handleFormSubmit = (): void => {
        if (validateForm())
            closeStartScreen();
    }


    /* Return JSX */
    return (
        <div className="StartScreen">
            <div className="modal-overlay">
                <div className="modal-content">
                    <h1 style={{ textAlign: "center" }}>Welcome To Gaussian Oh Hell!</h1>

                    <form onSubmit={closeStartScreen} className="name-form">

                        <span>
                            {"Player Count:  "}
                            <input
                                type="number"
                                className="player-count-input"
                                value={playerCount}
                                min={MIN_PLAYER_COUNT}
                                max={MAX_PLAYER_COUNT}
                                onChange={(e) => { setPlayerCount(e.target.value); setErrorMessage('') }}
                                required
                            />
                        </span>


                        <DynamicNameInput
                            playerCount={playerCount}
                            playerArray={playerArray}
                            setPlayerName={(index: number, name: string) => { setPlayerName(index, name); setErrorMessage('') }}
                        />

                        {errorMessage && <div className="error-message">{errorMessage}</div>}

                        <input type="button" className="modal-close-button" onClick={() => { handleFormSubmit() }} value="Start Game" />


                    </form>

                </div>
            </div>
        </div >
    );
}

export default StartScreen;
