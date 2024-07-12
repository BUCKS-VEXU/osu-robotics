import React, { useEffect, useState } from "react";

interface ProgressBarProps {
    playing: boolean;
    guessIndex: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ playing, guessIndex }) => {
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;

        if (playing) {
            setProgress(0);

            interval = setInterval(() => {
                setProgress(prevProgress => {
                    const newProgress = prevProgress + (10 / 16);
                    return newProgress >= 100 ? 100 : newProgress;
                });
            }, 100); // Adjust interval timing as needed

        } else {
            clearInterval(interval as NodeJS.Timeout);
        }

        return () => {
            clearInterval(interval as NodeJS.Timeout);
        };
    }, [playing]);

    const barContainerStyle: React.CSSProperties = {
        backgroundColor: 'none',
        height: '25px',
        outline: '1px solid black',
        position: 'relative',
        width: '100%',
        marginBottom: '7px',
    };

    const barStyle: React.CSSProperties = {
        width: `${progress}%`,
        maxWidth: `${[0, 1, 2, 4, 8, 12, 16][guessIndex + 1] / 0.16}%`,
        height: '100%',
        backgroundColor: 'rgb(56, 104, 181)',
        transition: progress === 0 ? 'none' : 'width 100ms linear',
    };

    const separatorStyle: React.CSSProperties = {
        position: 'absolute',
        backgroundColor: 'black',
        width: '1px',
        height: '100%',
        transform: 'translateY(-100%)',
    };

    const separators = [1, 2, 4, 8, 12].map((value, index) => {
        const separatorPosition = `${(value / 16) * 100}%`;
        return <div key={index} style={{ ...separatorStyle, left: separatorPosition }} />;
    });

    return (
        <div className="ProgressBar">
            <div style={barContainerStyle}>
                <div style={barStyle} />
                {separators}
            </div>
        </div>
    );
};

export default ProgressBar;
