/* Noah Klein */

import React, { useState } from 'react';

import { usePromiseTracker, trackPromise } from 'react-promise-tracker';
import { ThreeDots } from "react-loader-spinner";

import { SpotifyApi, Artist, Album, SimplifiedAlbum, Track, SimplifiedTrack, Playlist } from '@spotify/web-api-ts-sdk';
import { SetObject } from './globals';
import ScrollableSetList from './ScrollableSetList';

import { fetchAlbumTracks, fetchPlaylistTracks, fetchArtistTracks } from './spotifyServices';

import './SearchBox.css'


interface LoadingIndicatorProps {
    className: string;
}

const LoadingIndicator = ({ className }: LoadingIndicatorProps) => {
    const { promiseInProgress } = usePromiseTracker();

    return promiseInProgress ? (
        <div className={className}>
            <ThreeDots color="#00BFFF" height={80} width={80} />
        </div>
    ) : null;
};



interface SetSearchBoxProps {
    sdk: SpotifyApi;
    setCurrentSet: React.Dispatch<React.SetStateAction<SetObject>>
    selectNewTrackFromSet: (set: SetObject) => void;
}

const SearchBox = ({ sdk, setCurrentSet, selectNewTrackFromSet }: SetSearchBoxProps) => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchResults, setSearchResults] = useState<Array<Playlist | Artist | SimplifiedAlbum>>();

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        /* Don't search for nothing */
        if (searchQuery.trim().length === 0) return;

        setSearchResults(undefined)

        // Track the search query to show a loading icon while results are fetched
        trackPromise(
            search(searchQuery)
        );
    }


    const search = (searchInput: string) => {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const spotifyLinkPrefix = "https://open.spotify.com/";
                if (searchInput.startsWith(spotifyLinkPrefix)) {
                    var uri = searchInput.substring(spotifyLinkPrefix.length);
                    uri = uri.substring(0, uri.indexOf("/")) + "s" + uri.substring(uri.indexOf("/"));
                    const result = await sdk.makeRequest("GET", `${uri}`) as Playlist | Artist | SimplifiedAlbum;

                    setSearchResults(result.type !== 'track' ? [result] : []);
                } else {
                    const results = await sdk.search(searchInput, ["album", "artist", "playlist"]);

                    let playlists: Playlist[] = results.playlists!.items as Playlist[];

                    setSearchResults([
                        ...results.albums?.items?.slice(0, 5) ?? [],    // SimplifiedAlbum
                        ...results.artists?.items?.slice(0, 5) ?? [],   // Artist
                        ...playlists.slice(0, 5) ?? [], // Playlist
                    ]);
                }

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    const populateSetObject = async (set: Playlist | Artist | Album) => {
        let newSetObject: SetObject = {
            tracks: undefined,
            displayInfo: {
                image: set.images[0].url,
                author: "",
                name: set.name,
                link: set.external_urls.spotify,
                authorLink: "",
            },
            length: 0,
            type: set.type,
            id: set.id,
        }

        switch (set.type) {
            case 'album':
                const album = set as Album;
                newSetObject.displayInfo.author = album.artists[0].name;
                newSetObject.displayInfo.authorLink = album.artists[0].external_urls.spotify;
                newSetObject.length = album.total_tracks;

                newSetObject.tracks = await fetchAlbumTracks(sdk, set.id, newSetObject.length);
                break;

            case "artist":
                const artist = set as Artist;
                newSetObject.tracks = await fetchArtistTracks(sdk, artist);
                newSetObject.length = newSetObject.tracks.length;
                break;

            case 'playlist':
                const playlist = set as Playlist<Track>;
                newSetObject.displayInfo.author = playlist.owner.display_name;
                newSetObject.displayInfo.authorLink = playlist.owner.external_urls.spotify;
                newSetObject.length = playlist.tracks.total;
                newSetObject.tracks = await fetchPlaylistTracks(sdk, set.id, newSetObject.length);
                break;

            default:
                console.error("Unexpected set type:", set.type);
                break;
        }

        return newSetObject;
    }


    const handleSetClick = async (set: Playlist | Artist | Album) => {
        setSearchQuery("");
        setSearchResults(undefined);

        const newSetObject = await populateSetObject(set);
        setCurrentSet(newSetObject)
        selectNewTrackFromSet(newSetObject);
    }


    return (
        <div className='SearchBox'>
            <h2>Search for an Artist, Album, or Playlist</h2>
            <form onSubmit={(e) => { handleSearchSubmit(e) }} style={{ width: "80%" }}>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </form>

            <LoadingIndicator className={"loading-indicator-search"} />
            {searchResults &&
                <ScrollableSetList
                    sdk={sdk}
                    setList={searchResults}
                    // Keep typescript happy, since ScrollableSetList also handles SimplifiedTrack
                    handleItemClick={handleSetClick as (set: Artist | SimplifiedTrack | Playlist | SimplifiedAlbum) => void}
                />
            }
        </div>
    );
}

export default SearchBox;
