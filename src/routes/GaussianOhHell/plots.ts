/* Noah Klein */

import functionPlot from "function-plot";

import { Player, IdlePlotAttributes } from "./globals"

export const displayBiddingPlot = (mean: number, variance: number, width: number, height: number, playerName: string, target: string): void => {
    functionPlot({
        title: `${playerName}'s Gaussian Oh Hell Bidding Portal`,
        target: target,
        width: Math.min(width * (70 / 100), 1200),
        height: Math.min(height - 30, 600),
        yAxis: {
            label: 'Score',
            domain: [0, 12.5]

        },
        xAxis: {
            label: 'Tricks Won',
            domain: [-0.5, 11.5]
        },
        data: [
            {
                fn: `exp(-(1/2)*((x-${mean})/${Math.sqrt(variance)})^2) * (10/(${Math.sqrt(variance)}*sqrt(2*3.14159265)))`,
                range: [mean - 0.5, mean + 0.5],
                closed: true,
                color: '#05b378',
                graphType: 'polyline',
                skipTip: true,
            },
            {
                fn: `exp(-(1/2)*((x-${mean})/${Math.sqrt(variance)})^2) * (10/(${Math.sqrt(variance)}*sqrt(2*3.14159265)))`,
                color: '#05b378',
            },
        ],
        disableZoom: true,
        grid: true
    });
}

export const displayPlayingPlot = (playerArray: Player[], playerCount: number, width: number, height: number, target: string): void => {
    const data = playerArray.slice(0, playerCount).map(player => {
        return {
            fn: `exp(-(1/2)*((x-${player.mean})/${Math.sqrt(player.variance)})^2) * (10/(${Math.sqrt(player.variance)}*sqrt(2*3.14159265)))`,
            color: '#05b378', // Assuming each player has a color property
            closed: true,
            skipTip: true,
        };
    });

    functionPlot({
        title: "Gaussian Oh Hell",
        target: target,
        width: Math.min(width * (70 / 100), 1200),
        height: Math.min(height - 30, 600),
        yAxis: {
            label: 'Score',
            domain: [0, 12.5]
        },
        xAxis: {
            label: 'Tricks Won',
            domain: [-0.5, 11.5]
        },
        data: data,
        disableZoom: true,
        grid: true
    });
}

export const displayHUDPlot = (mean: number, variance: number, width: number, height: number, target: string): void => {
    functionPlot({
        target: target,
        width: width,
        height: height,
        yAxis: {
            domain: [0, 9]
        },
        xAxis: {
            domain: [-0.5, 11.5]
        },
        data: [
            {
                fn: `exp(-(1/2)*((x-${mean})/${Math.sqrt(variance)})^2) * (10/(${Math.sqrt(variance)}*sqrt(2*3.14159265)))`,
                range: [mean - 0.5, mean + 0.5],
                closed: true,
                color: '#05b378',
                graphType: 'polyline',
                skipTip: true,
            },
            {
                fn: `exp(-(1/2)*((x-${mean})/${Math.sqrt(variance)})^2) * (10/(${Math.sqrt(variance)}*sqrt(2*3.14159265)))`,
                color: '#05b378',
                skipTip: true,
            },
        ],
        disableZoom: true,
        grid: false
    });
}

export const displayIdlePlot = (constantArray: IdlePlotAttributes[], playerCount: number, width: number, height: number, target: string): void => {
    const data = constantArray.slice(0, playerCount).map(constantArray => {
        return {
            fn: `exp(-(1/2)*((x-${constantArray.mean})/${Math.sqrt(constantArray.variance)})^2) * (10/(${Math.sqrt(constantArray.variance)}*sqrt(2*3.14159265)))`,
            color: '#05b378', // Assuming each player has a color property
            closed: true,
            skipTip: true,
        };
    });

    functionPlot({
        title: "Gaussian Oh Hell",
        target: target,
        width: Math.min(width * (70 / 100), 1200),
        height: Math.min(height - 30, 600),
        yAxis: {
            domain: [0, 12.5]
        },
        xAxis: {
            domain: [-0.5, 11.5]
        },
        data: data,
        disableZoom: true,
        grid: true
    });
}