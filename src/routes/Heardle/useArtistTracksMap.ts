/* Noah Klein */

import { Artist, SpotifyApi } from "@spotify/web-api-ts-sdk";
import { artistTrackCount } from "./spotifyServices";
import { useCallback, useEffect, useState } from "react";
import useLocalStorage from "use-local-storage";

const useArtistTracksMap = (sdk: SpotifyApi) => {
    // Load the artistTracksMap from local storage, defaulting to an empty Map if not found
    const [artistTracksMap, setArtistTracksMap] = useLocalStorage('artistTracksMap', JSON.stringify(Array.from(new Map<string, number>())));
    const [mapState, setMapState] = useState(new Map<string, number>(JSON.parse(artistTracksMap)));

    // 2 hours (7200000 ms)
    const expirationOffsetMs: number = 7200000;
    const [expiryTime, setExpiryTime] = useLocalStorage<string | undefined>('artistTracksMapExpirationTime', undefined);  // Store the expiry time in localStorage

    // Effect to initialize the expiry time when first called
    useEffect(() => {
        if (!expiryTime) {
            console.log("Setting expiration date");
            const now = new Date();
            now.setTime(now.getTime() + expirationOffsetMs);
            setExpiryTime(now.toISOString());
        }
    }, [expiryTime, setExpiryTime]);

    // Effect to check if expiry time has passed and clear the map if needed
    useEffect(() => {
        const now = new Date();
        if (expiryTime) {
            const expiryDate = new Date(expiryTime);
            if (now >= expiryDate) {
                console.log("Expiration date has come");
                const newMap = new Map<string, number>();
                setArtistTracksMap(JSON.stringify(Array.from(newMap)));
                setMapState(newMap);

                console.log("Setting new expiration date");
                const now = new Date();
                now.setTime(now.getTime() + expirationOffsetMs);
                setExpiryTime(now.toISOString());
            }
        }
    }, [expiryTime, setArtistTracksMap, setExpiryTime]);

    // Function to update artistTracksMap
    const updateArtistTracksMap = useCallback((key: string, value: number) => {
        setMapState(prevMap => {
            const newMap = new Map(prevMap);
            newMap.set(key, value);
            setArtistTracksMap(JSON.stringify(Array.from(newMap)));
            return newMap;
        });
    }, [setArtistTracksMap]);

    // Function to fetch track count if needed
    const fetchArtistTrackCounts = useCallback(async (artists: Artist[]) => {
        const promises: Promise<void>[] = [];

        artists.forEach(artist => {
            if (!mapState.has(artist.id)) {
                const fetchPromise = artistTrackCount(sdk, artist)
                    .then(totalTracks => {
                        updateArtistTracksMap(artist.id, totalTracks);
                    })
                    .catch(error => {
                        console.error(`Error fetching tracks for ${artist.name}:`, error);
                    });
                promises.push(fetchPromise);
                setMapState(prevMap => {
                    const newMap = new Map(prevMap);
                    newMap.set(artist.id, -1); // Mark as fetching to prevent concurrent fetches
                    return newMap;
                });
            }
        });

        await Promise.all(promises);
    }, [sdk, mapState, updateArtistTracksMap]);

    return { artistTracksMap: mapState, fetchArtistTrackCounts };
}

export default useArtistTracksMap;
