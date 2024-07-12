# Gaussian Oh Hell Notes:

## Classic Oh Hell Game Loop
- Step 0: Establish Players <span style="color:orange">[Done]</span>
- Step 1: Establish dealer. When the game begins, the dealer will be the first player. Otherwise the new dealer is the player immediately after the current dealer. <span style="color:orange">[Done]</span>
    - Note: First to bid is always the player immediately following the dealer
- Step 2: Draw cards <span style="color:green">[Out Of Scope]</span>
- Step 3: Bid <span style="color:orange">[Done]</span>
    - Step 3a:  First player to bid specifies and submits distribution <span style="color:orange">[Done]</span>
    - Step 3b: Repeat 3a for all players <span style="color:orange">[Done]</span>
- Step 4: Play for your tricks <span style="color:yellow">[In Progress]</span>
    - Note: Displaying everyone's distribution overlayed would be nice, or some other interesting idle screen.
    - Step 4a: Animated idle screen <span style="color:orange">[Done]</span>
    - Step 4b: Alternate still idle screen
- Step 5: Tally Scores <span style="color:yellow">[In Progress]</span>
    - Step 5a: Get tricks by accepting trick values from distribution hud <span style="color:orange">[Done]</span>
    - Step 5b: Update scores <span style="color:orange">[Done]</span>
    - Step 5c: Validate scores (Eve p0wned) <span style="color:yellow">[In Progress]</span>
- Step 6: Repeat from step 1 <span style="color:orange">[Done]</span>


## Idea for scoring, cool tab for each person

Each tab includes:
- Name <span style="color:orange">[Done]</span>
- Score <span style="color:orange">[Done]</span>
- Mini version of their distribution <span style="color:orange">[Done]</span>
- An easy way to enter tricks actually scored
- A way to expand their distributions and get a larger view (Low Priority)

Tabs will probably have to:
- Be in a scrollable list? [Probably not, 6 isn't too many]
- Be nice looking little cards <span style="color:orange">[Done]</span>
- Be in their own component to keep a clean top level <span style="color:orange">[Done]</span>


## Color scheme:
- Ice Cold: #a0d2eb
- Freeze Purple: #e5eaf5
- Medium Purple: #d0bdf4
- Purple Pain: #8458B3
- Heavy Purple: #a28089


## What to do after bidding is done
Idk


## Misc
Use the \<br\> HTML tag for newline <br>
I'm a new line!