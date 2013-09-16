#High Level Design Document:
===

Letter Cannon is a fast paced pattern-matching word game.
Think bananagrams with a gun: Bust-A-Move with words.
You're racing against the clock to place random sequences of letters on a board.
The player controls a cannon which shoots letters into the scene.
As piles of letters build up, you can clear them by entering the word-clearing mode,
where you draw out words of adjacent letters to remove them from the board.
Try to come up with long chains of words for a high score before the letters envelop you!

#Team/Responsibility Breakdown:
===

- Ethan = Art Direction, Powerups
- Elizabeth = Play Testing Czar (Making sure it's not broken!), Scoring + Dictionary Code
- Carlo = Core Implementation (Shooting + Collision)

#Thirty Seconds of Gameplay
===

You start shooting letters onto the board. Oh man, where are you gonna put that X?
You're beginning to form a few words. DOG, EXACT.
You get a blank letter, hmm, wonder what that does...
You see a clock ticking down, 5 seconds left...
Ah, the screen flashes "WORD CLEARING MODE."
You start frantically tracing the outlines of the words.
Oh man, where was DOG again... OH, there it is!
Another timer is ticking down, 2 more seconds...
POW, a giant explosion as your words are cleared.
Now you're back to shooting letters, the clock is ticking...

#Risks
===

Making sure the game is fun!
Ensuring the scoring is balanced and powerups are reasonable.
Making the mechanics clear without directions (cuing player to sketch out words...)