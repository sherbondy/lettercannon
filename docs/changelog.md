Lettercannon Design Changelog
Elizabeth Attaway, Carlo Biedenharn, Ethan Sherbondy
6.073 Fall 2013

- Decided to place the cannon in the center of the board in order to make better use of space.
- Decided to color letters to indicate point value so that players gain an intuition for scoring.
- Decided to have a strict time limit on the game. Time allowing, we could implement different play modes: infinite, puzzle (where the board is prepopulated).
- Possible "special" letters: blank letter, blinking/shifting letter, bomb to blow up regions.
- Came up with a scoring mechanism: sum base scores for words and add a multiplier for the number of words cleared simultaneously. Considering rewarding longer words.
- Added sidebar with color=point-value listing to clarify the purpose of the colors, since this was unclear in playtests.
- After focus testing, decided it is currently too hard to collide letters as intended. We are considering switching to a grid-based snapping system.
- Increased velocity on letters to make the game feel faster.
- Many players are frustrated by the "letter-clearing" mode, so we are switching to automatically clearing letters
- Added space-bar input to trigger clearing letters.
- Removed "letter-clearing mode" entirely.
- Should allow for complete keyboard input, time allowing.
