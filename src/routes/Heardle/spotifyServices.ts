/* Noah Klein */

import { Artist, SimplifiedTrack, SpotifyApi, Page, PlaylistedTrack, SimplifiedAlbum } from '@spotify/web-api-ts-sdk';


export async function fetchPlaylistTracks(sdk: SpotifyApi, id: string, totalTracks: number): Promise<SimplifiedTrack[]> {
    const limit = 100;
    const offsets = Array.from({ length: Math.ceil(totalTracks / limit) }, (_, index) => index * limit);

    const fetchTrackBatch = async (offset: number): Promise<SimplifiedTrack[]> => {
        const fetchedPage: Page<PlaylistedTrack<any>> = await sdk.makeRequest("GET", `playlists/${id}/tracks?offset=${offset}&limit=${limit}`);
        return fetchedPage.items.map(playlistedTrack => playlistedTrack.track);
    };

    const promises = offsets.map(fetchTrackBatch);

    // Use Promise.all to wait for all promises to resolve
    const results = await Promise.all(promises);

    // Flatten the array of arrays into a single array of SimplifiedTrack
    const flattenedResults = results.flat();

    return flattenedResults;
};



export async function fetchAlbumTracks(sdk: SpotifyApi, id: string, totalTracks: number): Promise<SimplifiedTrack[]> {
    const limit = 50;
    const offsets = Array.from({ length: Math.ceil(totalTracks / limit) }, (_, index) => index * limit);

    const fetchTrackBatch = async (offset: number): Promise<SimplifiedTrack[]> => {
        const fetchedPage: Page<SimplifiedTrack> = await sdk.albums.tracks(id, undefined, limit, offset);
        return fetchedPage.items;
    };

    const promises = offsets.map(fetchTrackBatch);

    // Use Promise.all to wait for all promises to resolve
    const results = await Promise.all(promises);

    // Flatten the array of arrays into a single array of SimplifiedTrack
    const flattenedResults = results.flat();

    return flattenedResults;
};


const fetchArtistAlbumsAndSingles = async (sdk: SpotifyApi, artist: Artist): Promise<SimplifiedAlbum[]> => {
    return ((await sdk.makeRequest("GET", `artists/${artist.id}/albums?include_groups=album%2Csingle&limit=50`)) as Page<SimplifiedAlbum>).items;
}


export const fetchArtistTracks = async (sdk: SpotifyApi, artist: Artist): Promise<SimplifiedTrack[]> => {
    const albums: SimplifiedAlbum[] = await fetchArtistAlbumsAndSingles(sdk, artist);
    const promises = albums.map(album => fetchAlbumTracks(sdk, album.id, album.total_tracks));

    // Use Promise.all to wait for all promises to resolve
    const results = await Promise.all(promises);

    // Flatten the array of arrays into a single array of SimplifiedTrack
    return results.flat();
};


/* This technically doesn't work properly if an artist has a ton of albums and singles (more than 50) but I don't really care because being rate limited sucks */
export const artistTrackCount = async (sdk: SpotifyApi, artist: Artist): Promise<number> => {
    const albums: SimplifiedAlbum[] = await fetchArtistAlbumsAndSingles(sdk, artist);
    const totalTracks = albums.reduce((accumulator, currentValue) => accumulator + currentValue.total_tracks, 0);
    return totalTracks;
}
