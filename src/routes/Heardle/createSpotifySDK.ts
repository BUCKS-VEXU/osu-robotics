/* Noah Klein */

import { SpotifyApi } from '@spotify/web-api-ts-sdk';

const createSpotifySDK = (): SpotifyApi => {
    const clientId = "5e4b86f307514ae582ae97c0571ae829";
    const redirectUrl = import.meta.env.VITE_REACT_APP_LOGIN_REDIRECT_URL;

    const sdk = SpotifyApi.withUserAuthorization(
        clientId,
        redirectUrl,
        ["streaming", "user-read-private", "user-read-email", "user-read-playback-state", "user-modify-playback-state", "user-library-read", "user-read-currently-playing"]
    );

    return sdk;
}

export default createSpotifySDK;
