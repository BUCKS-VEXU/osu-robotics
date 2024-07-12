/* Noah Klein */

import { Player } from './globals';

import "./DynamicNameInput.css"


interface DynamicNameInputProps {
    playerCount: number;
    playerArray: Player[]
    setPlayerName: (index: number, name: string) => void;
}

const DynamicNameInput = ({ playerCount, playerArray, setPlayerName }: DynamicNameInputProps) => {
    return (
        <div className="dynamic-name-input">
            {
                Array.from({ length: playerCount }).map((_, index) => (
                    <div className="name-input-segment" key={index}>
                        <span>
                            {`Player ${index + 1} Name:  `}
                            <input
                                type="text"
                                value={playerArray[index].name}
                                onChange={(e) => setPlayerName(index, e.target.value)}
                            />
                        </span>
                    </div>
                ))
            }
        </div>
    );
}

export default DynamicNameInput;
