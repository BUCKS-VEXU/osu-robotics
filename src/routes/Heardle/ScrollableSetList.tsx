/* Noah Klein */

import React, { useEffect } from 'react';
import { Artist, Playlist, SimplifiedAlbum, SimplifiedTrack, SpotifyApi, Track } from '@spotify/web-api-ts-sdk';
import './ScrollableSetList.css';
import useArtistTracksMap from './useArtistTracksMap';

interface ScrollableSetListProps {
    sdk: SpotifyApi;
    setList: Array<Playlist | Artist | SimplifiedAlbum | SimplifiedTrack>;
    handleItemClick: (set: Playlist | Artist | SimplifiedAlbum | SimplifiedTrack) => void;
}

const ScrollableSetList: React.FC<ScrollableSetListProps> = ({ sdk, setList, handleItemClick }) => {
    const { artistTracksMap, fetchArtistTrackCounts } = useArtistTracksMap(sdk);

    // Effect to fetch track counts for artists in setList
    useEffect(() => {
        // Filter out artists from setList
        const artists: Artist[] = setList.filter(item => item.type === 'artist') as Artist[];
        if (artists.length > 0) {
            fetchArtistTrackCounts(artists);
        }
    }, [setList, fetchArtistTrackCounts]);

    // Render each item in setList
    const renderSearchItem = (item: Playlist | Artist | SimplifiedAlbum | SimplifiedTrack) => {
        let imageUrl = '';
        let setName = '';
        let setAuthor = '';
        let setLength = '';

        switch (item.type) {
            case 'album':
                const album = item as SimplifiedAlbum;
                imageUrl = album.images && album.images.length > 0 ? album.images[0].url : '';
                setName = album.name;
                setAuthor = album.artists[0]?.name || '';
                setLength = String(album.total_tracks);
                break;
            case 'artist':
                const artist = item as Artist;
                imageUrl = artist.images && artist.images.length > 0 ? artist.images[0].url : '';
                setName = artist.name;
                setAuthor = '';
                const storedTrackCount = artistTracksMap.get(artist.id);
                setLength = storedTrackCount !== -1 ? String(storedTrackCount) : 'Loading...';
                break;
            case 'playlist':
                const playlist = item as Playlist<Track>;
                imageUrl = playlist.images && playlist.images.length > 0 ? playlist.images[0].url : '';
                setName = playlist.name;
                setAuthor = playlist.owner?.display_name || '';
                setLength = String(playlist.tracks?.total);
                break;
            case 'track':
                const track = item as Track;
                imageUrl = track.album.images[0].url;
                setName = track.name;
                setAuthor = track.artists[0].name;
                break;
            default:
                break;
        }

        // Render the item with its details
        return (
            <div key={item.id} className="search-info" onClick={() => handleItemClick(item)}>
                <div className="search-image">
                    <img src={imageUrl} alt="Cover art" />
                </div>
                <div className="search-details">
                    <p className="search-name">{setName}</p>
                    <p className="search-author">{setAuthor}</p>
                </div>
                {item.type !== 'track' && <p className="search-length">{setLength} Songs</p>}
            </div>
        );
    };

    return (
        <div className="ScrollableSetList">
            <div className="scrollable-div">
                {setList.map(item => renderSearchItem(item))}
            </div>
        </div>
    );
};

export default ScrollableSetList;
