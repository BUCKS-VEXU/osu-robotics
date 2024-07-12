import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import React, { useState, useEffect } from 'react';

interface WebPlaybackProps {
    sdk: SpotifyApi;
    setDeviceId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const WebPlayback = ({ sdk, setDeviceId }: WebPlaybackProps) => {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const getToken = async () => {
            try {
                const tokenResponse = await sdk.getAccessToken();
                setToken(tokenResponse!.access_token);
            } catch (error) {
                console.error('Error fetching token:', error);
                setToken(null);
            }
        };

        if (!token)
            getToken();
    }, [sdk]);

    useEffect(() => {
        if (!token) {
            return; // Render nothing if token is not valid or not fetched yet
        }

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: 'Heardle',
                getOAuthToken: cb => {
                    cb(token);
                },
                volume: 0.5
            });

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                setDeviceId(device_id);
                sdk.player.transferPlayback([device_id], false);
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.connect();
        };

        return () => {
            document.body.removeChild(script);
        };
    }, [token]);

    return (
        <></>
    );
};

export default WebPlayback;