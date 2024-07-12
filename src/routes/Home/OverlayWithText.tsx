/* Noah Klein */

import { CSSProperties, useState } from 'react';

interface OverlayWithTextProps {
    text: string;
    rgba: number[];
    href: string;
    children: any;
    openInNewTab?: boolean;
}

const OverlayWithText = ({ text, rgba, href, children, openInNewTab = false }: OverlayWithTextProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const overlayStyle: CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: `calc(100% - 4px)`, // Adjusted height calculation
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        backgroundColor: `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3]})`,
        color: '#fff',
        fontSize: '2vw',
        fontWeight: 'bold',
        zIndex: 1,
        cursor: 'pointer',
        userSelect: 'none',
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.3s ease',
        lineHeight: '1.2',
        borderRadius: '5px',
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const handleOverlayClick = () => {
        if (href) {
            if (openInNewTab) {
                window.open(href, '_blank');
            } else {
                window.location.href = href;
            }
        }
    };

    return (
        <div
            className='overlay-with-text'
            style={{
                position: 'relative',
                display: 'inline-block',
                margin: 0,
                padding: 0,
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleOverlayClick}
        >
            {children}
            <div style={overlayStyle}>
                <div style={{ padding: '10px' }}>{text}</div>
                {href && <a href={href} style={{ display: 'none' }}> </a>}
            </div>
        </div>
    );
};

export default OverlayWithText;
