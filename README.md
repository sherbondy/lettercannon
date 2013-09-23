#How to use

- Install the Turbulenz SDK: https://hub.turbulenz.com/#downloads (requires login).
- Make sure you are using typescript version 0.8! `tsc --version`:
```
 sudo npm install -g typescript@0.8.3
```
- Modify the files in `tsscripts/lettercannon`, then run (from the root directory):

```
tsc -c --out templates/lettercannon.js tsscripts/lettercannon_entry.ts

makehtml --mode canvas-debug -t templates -t . -o lettercannon.debug.html lettercannon.js
```

- Run a static python server: `python -m SimpleHTTPServer`
- Visit http://localhost:8000/lettercannon.debug.html


Initial phase:
- Carlo and I will develop the shooting part of the game
- Elizabeth will develop the word clearing phase.


We give elizabeth a graph object which indicates collisions.
Every letter object has a unique id.
This is a graph of neighbors, stating: letter#0 is touching letters #1, 3, and 10
letters = {0: [1, 3, 10]}

Elizabeth also has access to the letter object data structure.
Letter objects are Draw2DSprites (or slight variants of them)


Initial game mechanics:
- Pieces radiate outward when the letters above them are cleared
-
