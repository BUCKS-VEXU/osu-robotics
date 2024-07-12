/* Noah Klein */

import { useState, useEffect, useCallback } from 'react';
import { IdlePlotAttributes, Player } from "./globals";
import { displayIdlePlot } from './plots';

import mathClamp from 'math-clamp';

interface IdlePlotProps {
    width: number;
    height: number;
    playerCount: number;
    playerArray: Player[];
}

const IdlePlot = ({ width, height, playerCount, playerArray }: IdlePlotProps) => {
    const INTERVAL_TIME = 100; // Interval time in milliseconds

    const [idleConstants, setIdleConstants] = useState<IdlePlotAttributes[]>(() => {
        const populateConstants = (index: number): IdlePlotAttributes => ({
            mean: playerArray[index].mean,
            variance: playerArray[index].variance,
            phaseShift: index * Math.PI / 1.36457,
        });
        return Array.from({ length: playerCount }, (_, index) => populateConstants(index));
    });

    const [time, setTime] = useState(0);

    const calculateNewConstants = useCallback(async (constants: IdlePlotAttributes[], time: number): Promise<IdlePlotAttributes[]> => {
        const newConstants = await Promise.all(constants.map(async (constants, index) => {
            const player: Player = playerArray[index];

            // A small random value is added to each phase shift to make the idle screen more sporadic
            const newPhaseShift = constants.phaseShift + (Math.random() / 30);

            const meanAmplitude = 1;
            const meanFrequency = 0.25;

            const varianceAmplitude = 18;
            const varianceFrequency = 0.25;
            const preExponentialConstant = 1 / 14;

            const newMean = mathClamp(
                player.mean + (meanAmplitude * Math.sin((meanFrequency * time) + newPhaseShift)),
                {
                    min: player.mean - 1,
                    max: player.mean + 1
                }
            )

            // Variance could look better here by making the amplitude smaller and then taking an exponential
            const newVariance = Math.max(
                // Phase shift here is multiplied by two to put each plots variance out of sync with its mean
                Math.exp((varianceAmplitude + varianceAmplitude * Math.sin((varianceFrequency * time) + (newPhaseShift * 2))) * preExponentialConstant) - 1,
                0.125
            )

            return {
                mean: newMean,
                variance: newVariance,
                phaseShift: newPhaseShift,
            };
        }));
        return newConstants;
        //eslint-disable-next-line
    }, []);


    // Update constants when playerCount Changes
    useEffect(() => {
        setIdleConstants(() => {
            const populateConstants = (index: number): IdlePlotAttributes => ({
                mean: playerArray[index].mean,
                variance: playerArray[index].variance,
                phaseShift: index * Math.PI / 1.36457,
            });
            return Array.from({ length: playerCount }, (_, index) => populateConstants(index));
        });
        //eslint-disable-next-line
    }, [playerCount]);


    useEffect(() => {
        const updateConstants = async () => {
            const newConstants = await calculateNewConstants(idleConstants, time);
            setIdleConstants(newConstants);

            setTime(prevTime => prevTime + 1);
        };

        const interval = setInterval(updateConstants, INTERVAL_TIME);

        return () => {
            clearInterval(interval);
        };
    }, [time, idleConstants, calculateNewConstants]);


    // Display plot only when constants change
    useEffect(() => {
        displayIdlePlot(idleConstants, playerCount, width, height, "#idle-plot");
        //eslint-disable-next-line
    }, [idleConstants, width, height]);


    return (
        <div id='idle-plot' />
    );
};

export default IdlePlot;
