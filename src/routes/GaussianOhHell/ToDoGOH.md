# To Do

## These are not Gaussian Oh Hell things but I'm thinking about them now
- [x] Remove CSS styling from index.css
- [x] Remove Spotify playback sdk from index.js


## These are Gaussian Oh Hell things
- [x] Deal with sliders better
- [x] Implement game loop
- [x] Use variance and mean from playerArray
- [x] Overlay scoring distributions after everyone has bid maybe?
- [ ] Allow players to choose a color to be displayed in their graph
- [x] Factor the copy of calculateScore out
- [x] Dealer should only switch after all tricks are submitted, not after last bid in the cycle
- [x] Move submit trick button outside of player HUDs and make it one button where the sliders were
- [x] Reset player mean and variance on trick submission
- [x] Show a display graph that moves its variance and mean nicely (THIS IS SO COOL)
    - [x] This involves a lot
    - [x] Create temporary values to fluctuate the plots
    - [x] Add way to toggle idle plot, its expensive
- [x] Refactor GaussianOhHell.tsx
- [x] Settings bar
- [ ] Fix plot text/title color (Issue opened on package repo)
- [x] Enforce player names
- [ ] Validate tricks
    - [ ] Maybe add something funny to point out Eve if her name is present
- [ ] Fix HUDs
    - [x] Change cursor
    - [x] Make HUDs actually fit vertically
        - [ ] This is mostly fixed but more than 4 players is too many
- [ ] Use Z-table to improve cdf calculation performance (this probably doesn't matter very much, might not do it)
- [x] Cut mathjs
- [ ] Improve animated idle plot performance
- [ ] Make buttons actually buttons for accessibility
- [ ] Change Max player count to 6
    - [ ] If you play with more than 4 people you cant play to 11, you play less
- [x] Fix start screen idle
- [ ] Just use windowSize hook rather than passing height and width, true for home screen too
- [ ] Add transition: background-color 0.3s ease; to all buttons because it rocks
- [x] Add toggle to play normal oh hell lol
