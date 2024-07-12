# New Heardle Manifesto

## A Top-Down look at Heardle
### Components
- [x] Settings Bar
- [x] Confetti
- [x] Searching
    - [x] The Search box
    - [x] The Guess box
    - These two can share components
- [x] Progress Bar
- [x] Player



## Types
- GameLoopStage (enum)
    - Searching
    - Playing
    - Won
    - Lost


## States
- GameState
    - GameLoopStage: GameLoopStages
    - ListeningStep: number (was playCycle)
    - SongProgress: number
    - playing: boolean
    - errorMessage: string
- User
    - loggedIn: false,
    - token: string
    - deviceId: string
    - name: string (maybe)
- Settings
    - isNightTheme: boolean
    - showInfoModal: boolean
    - narrowSearchResults: boolean
    - confettiCount: number
- CurrentSet
- CurrentTrack



## Hooks and Effects
- WindowSize


## Notes

## To Do
(Indented items are high priority and incomplete)
- [ ] Night theme set in Heardle.tsx should match local storage (same applies for GOH)
- [x] Unify types in globals.ts with the above
- [x] Make sure environment variables work when deployed
- [x] Typescriptify spotifyServices.js
- [ ] Add warnings for errors when using SDK
- [x] Calculating artist track amount is going to be tricky using the provided types
- [x] Properly use narrowSearchResults
- [x] Fix loading indicator
- [ ] Fix shine on searchbox
- [x] Artists need to set currentSet
- [x] Make progress bar handle playing
- [x] Searching by Spotify link
- [x] refactor both handleItemClicks
- [x] Stop getting rate limited when trying to calculate artist track count
- [ ] Actually return searches by Spotify ranking, not [album, artist, playlist] Turns out spotify sdk search just returns [album, artist, playlist] lol
- [x] Make the creation of set list the responsibility of SearchBox and GuessInterface. Pass an array of things, not search results nonsense
- [ ] Make Heardle flex-box space between and combine player + progress bar (Maybe not)
- [ ] I can start at random points in the track now, make that an option
- [ ] Doesn't actually react much to theme change
- [ ] Add logout probably
- [ ] Make progress bar reset on track
- [ ] Refactor the set populating logic in ScrollableSetList
- [x] Properly handle winning and losing in GuessInterface
- [ ] Make Heardle mobile friendly
- [ ] Add score
- [ ] Give user feedback for auth errors like not having a premium account, or not emailing me to register them lol
- [x] Show song if you lose
- [x] Add win screen
- [x] Add lose screen
- [x] Add transition: background-color 0.3s ease; to all buttons because it rocks
- [ ] Make a users liked albums, playlists, and artists appear at the top of search results
    - [ ] Fix ScrollableSetList clipping bottom
- [ ] Display multiple artists in ScrollableSetList
