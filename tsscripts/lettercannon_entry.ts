/*{# jslib files #}*/
/*{{ javascript("../jslib/physics2ddevice.js") }}*/
/*{{ javascript("../jslib/boxtree.js") }}*/
/*{{ javascript("../jslib/canvas.js") }}*/
/*{{ javascript("../jslib/draw2d.js") }}*/
/*{{ javascript("../jslib/observer.js") }}*/
/*{{ javascript("../jslib/requesthandler.js") }}*/
/*{{ javascript("../jslib/utilities.js") }}*/

/// <reference path="../jslib-modular/vmath.d.ts" />
/// <reference path="../jslib-modular/canvas.d.ts" />
/// <reference path="../jslib-modular/fontmanager.d.ts" />
/// <reference path="../jslib-modular/debug.d.ts" />
/// <reference path="../jslib-modular/turbulenz.d.ts" />
/// <reference path="../jslib-modular/aabbtree.d.ts" />
/// <reference path="../jslib-modular/jsengine.d.ts" />
/// <reference path="../jslib-modular/jsengine_base.d.ts" />
/// <reference path="../jslib-modular/jsengine_debug.d.ts" />
/// <reference path="../jslib-modular/physics2d.d.ts" />
/// <reference path="../jslib-modular/tzdraw2d.d.ts" />
/// <reference path="../jslib-modular/utilities.d.ts" />

/*{# our scripts #}*/
/// <reference path="math.ts" />
/// <reference path="drawing.ts" />
/// <reference path="letter.ts" />
/// <reference path="cannon.ts" />
/// <reference path="laser.ts" />
/// <reference path="gui.ts" />
/// <reference path="main.ts" />
/// <reference path="util.ts" />
/// <reference path="word_check.ts" />

// NOTES:
/*
We can use http://docs.turbulenz.com/jslibrary_api/physics2d_world_api.html#shapepointquery or bodyPointQuery to check which shapes the user is clicking for clearing mode.
*/

// indicate whether we're in clearing mode or not

/* Game code goes here */
var duration = 60*5; // 5 minutes in seconds

TurbulenzEngine.onload = function onloadFn()
{
    var intervalID;
    var score: number = 0;
    var startTime: number;

    var mouse_down:bool = false;
    var used_letters = {};
    // all of these are arrays of letter ids
    var selected = [];
    var correct_letters = [];
    var incorrect_letters = [];

    var graphicsDevice = TurbulenzEngine.createGraphicsDevice({});
    var inputDevice = TurbulenzEngine.createInputDevice({});
    var md = TurbulenzEngine.createMathDevice({});
    var phys2D = Physics2DDevice.create();

    var canvasElem = TurbulenzEngine.canvas;
    var canvas = Canvas.create(graphicsDevice, md);
    var ctx = canvas.getContext('2d');

    gui.setupGUI(toggleModeCallback);

    var cannon = initializeCannon(graphicsDevice, md);
    initializeLetters(graphicsDevice);
    currentLetterObj.placeOnCannon(cannon);

    inputDevice.addEventListener('mouseover', handleMouseOver);
    inputDevice.addEventListener('mouseup', handleClick);
    inputDevice.addEventListener('mousedown', handleDown);

    // handle touch events! start and move are identical
    inputDevice.addEventListener('touchstart', handleTouchMove);
    inputDevice.addEventListener('touchmove', handleTouchMove);
    inputDevice.addEventListener('touchend', handleTouchEnd);

    inputDevice.addEventListener('keydown', handleKeyDown);

    var stageWidth = canvas.width; //meters
    var stageHeight = canvas.height - 64; //meters

    var draw2D = Draw2D.create({
        graphicsDevice: graphicsDevice,
        viewportRectangle: [0,0, stageWidth, stageHeight],
        scaleMode: 'scale'
    });

    var mainMaterial = phys2D.createMaterial({
        elasticity: 0,
    });

    var world = phys2D.createWorld({
        gravity : [0, 0],
        velocityIterations : 8,
        positionIterations : 8
    });

    function toggleModeCallback(){
        // if (!isClearing){
        //     console.log("Back in shooting mode!");
        //     // do letter removal
        //     correct_letters.forEach(function(id) {
        //         if (id in letters){
        //             world.removeRigidBody(letters[id].rigidBody);
        //             delete letters[id];
        //             // make neighbors dynamic once more.
        //             neighbors[id].forEach(function(nid){
        //                 if (nid in letters){
        //                     letters[nid].makeDynamic();
        //                 }
        //             });
        //         }
        //     });

        //     /* current naive scoring algorithm:
        //        give player points for every letter in every word
        //        (even overlapping ones).
        //        Then give multiplier bonus based on *quantity*
        //        of words made that round.
        //     */
        //     var roundScore = 0;
        //     words.forEach(function(word){
        //         for(var i = 0; i < word.length; i++){
        //             var letter = word.charAt(i).toLowerCase();
        //             roundScore += letter_points[letter];
        //         }
        //     });

        //     roundScore *= words.length;
        //     score += roundScore;
        //     gui.updateScore(score);
            
        //     correct_letters  = [];
        //     incorrect_letters = [];
        //     words = [];
        // } else {
        //     // handle clearing mode setup logic here
        // }
        clearWords();
    }

    var thickness = 1
    var border = phys2D.createRigidBody({
        type: 'static',
        shapes: [
            phys2D.createPolygonShape({
                vertices: phys2D.createRectangleVertices(
                    0, 0, thickness, stageHeight)
            }), 
            phys2D.createPolygonShape({
                vertices: phys2D.createRectangleVertices(
                    0, 0, stageWidth, thickness)
            }), 
            phys2D.createPolygonShape({
                vertices: phys2D.createRectangleVertices(
                    (stageWidth - thickness), 0, stageWidth, stageHeight)
            }), 
            phys2D.createPolygonShape({
                vertices: phys2D.createRectangleVertices(
                    0, (stageHeight - thickness), stageWidth, stageHeight)
            })
        ]
    });

    world.addRigidBody(border);

    // the end point of the laser line.
    var laserPointer = new Laser([canvas.width/2,canvas.height]);
    var center_width  = graphicsDevice.width  / 2;
    var center_height = graphicsDevice.height / 2 - 30;
    
    function timeRemaining(){
        if (isOver){
            return 0;
        }
        // turbulenz reports time in seconds
        var now = TurbulenzEngine.time;
        var playTime = now - startTime;
        // 5 minutes - time played so far
        return Math.max(duration - playTime, 0);
    }
    
    function update() {
        if (isOver){
            TurbulenzEngine.clearInterval(intervalID);
            var replay = confirm("Game Over! You scored: " + score +" points.\n"+
                                 "Play again?");
            if (replay){
                restartGame();
            }
            return;
        }

        /* Update code goes here */

        var canvasBox = md.v4Build(0,0, canvas.width, canvas.height);
    
        var timeLeft = timeRemaining();
        gui.updateTime(timeLeft);
        if (timeLeft <= 0) {
            isOver = true;
        }

        if (graphicsDevice.beginFrame())
        {
            // make the letters stop the moment they collide with anything
            var arbiters = world.staticArbiters;
            for (var i = 0, nArbs = arbiters.length; i < nArbs; i++){
                var arb = arbiters[i];
                if (!arb.active){
                    continue;
                }

                // Add colliding bubbles to the neighbors array
                if (isLetterShape(arb.shapeA) && isLetterShape(arb.shapeB)) {
                            var idA = arb.shapeA.userData.id;
                            var idB = arb.shapeB.userData.id;
                   neighbors[idA].push(idB);
                   neighbors[idB].push(idA);
                   //checkWordsGroup(neighbors, idA);
                }

		var y_val = arb.bodyB._data[3];
		var w = 40;
		var h = 40;
		arb.bodyB._data[3] = y_val-(y_val%h)+h/2;
		var x_val = arb.bodyB._data[2];
		arb.bodyB._data[2] = x_val-(x_val%w)+((y_val-y_val%h)/h)%1 + w/2; 

// Uncomment for hex grid
/*		if (arb.bodyB._data[2]%(w*2) != w/2){
		    console.log("this happened");
		    arb.bodyB._data[3] += h/2;
	 }	*/

		arb.bodyA.setAsStatic();
                arb.bodyB.setAsStatic();
	        grid_neighbors[arb.bodyB._data[2]/w+0.5][arb.bodyB._data[3]/h+0.5] = arb.shapeB.userData.id;	
                // Maybe we should just make the cannon a physics body too instead
                // of manually checking these private _data attrs?
                // Currently exploiting an impl. detail of turbulenz which could change...
                if ((70 > Math.sqrt(
                      Math.pow(center_width  - arb.bodyB._data[2], 2) +
                      Math.pow(center_height - arb.bodyB._data[3], 2))) ||
                    (70 > Math.sqrt(
                        Math.pow(arb.bodyA._data[2] - center_width,  2) +
                            Math.pow(arb.bodyA._data[3] - center_height, 2)))) {
                    isOver = true;
                }
            }

            laserPointer.update(cannon, canvas, world);
            world.step(1.0/60);

            // clear the canvas
            graphicsDevice.clear(gui.bgColor, 1.0);
            /* Rendering code goes here */

            draw2D.begin();
            // opaque drawing can go in here
            draw2D.end();

            if (!isClearing) {
                if (ctx.beginFrame(graphicsDevice, canvasBox)){
                    // draw the laser line
                    laserPointer.draw(ctx, cannon);

                    ctx.endFrame();
                }
                // draw cannon on top of laser line
                cannon.draw(draw2D);
            } else {
               
            }

            if (ctx.beginFrame(graphicsDevice, canvasBox)){
                if (isClearing){
                    drawLetterBorders(ctx, letters, correct_letters, 
                                      incorrect_letters, selected);
                }

                // draw the lower bar
                drawBottomBar(ctx, canvas);

                // draw the letters
                drawLetters(ctx, draw2D, isClearing);
                ctx.endFrame();
            }

            graphicsDevice.endFrame();
        }
    }

    var cannonMouseFn = cannon.mouseHandler();

    // just pipes to mouse over fn
    function handleTouchMove(touchEvent) {
        var movedTouches = touchEvent.changedTouches;
        var oneTouch = movedTouches[0];
        handleMouseOver(oneTouch.positionX, oneTouch.positionY);
    }

    function handleMouseOver(mouseX, mouseY) {
        if (!isClearing && !isOver){
            cannonMouseFn(mouseX, mouseY);
            currentLetterObj.placeOnCannon(cannon);
        } else if (isClearing && mouse_down){
            var point = draw2D.viewportMap(mouseX, mouseY);
            var shapeStore = [];
            world.shapePointQuery(point, shapeStore);
            var letterShape = shapeStore[0];

            if (isLetterShape(letterShape)) {
                var letterID = letterShape.userData.id;
                if (!(letterID in used_letters)) {
                    console.log(shapeStore);
                    used_letters[letterID] = true;
                    selected.push(letterID);
                }
            }
        }
    }

    function handleTouchEnd(touchEvent) {
        var endTouches = touchEvent.changedTouches;
        var oneTouch = endTouches[0];
        handleClick(0, oneTouch.positionX, oneTouch.positionY);
    }
   
    function handleClick(mouseCode, mouseX, mouseY) {
        mouse_down = false;
        if (!isClearing && !isOver){
            currentLetterObj.shoot(cannon, world, draw2D, phys2D);
            updateCurrentLetter(graphicsDevice);
            currentLetterObj.placeOnCannon(cannon);
        } else if (isClearing) {
            var word = checkWord(neighbors, selected);

            if (word != "") {
                gui.addWord(word);
                words.push(word);
                correct_letters = correct_letters.concat(selected);
            } else {
                incorrect_letters = [].concat(selected);
            }
        }
        used_letters = {};
        selected     = [];
    }

    function handleDown(mouseCode, mouseX, mouseY) {
        mouse_down = true;
    }

    function handleKeyDown(e) {
        // press space
        if (e == 402) {
            clearWords();
        }
    }

    function clearWords() {
	neighbors = {};
	for (var i = 0; i < 13; i++){
	    for (var j = 0; j < 13; j++){
		if (grid_neighbors[i][j] != -1){
		    neighbors[grid_neighbors[i][j]] = [];
		}
	    }
	}
	for (var i = 0; i < 12; i++){
	    for (var j = 0; j < 12; j++){
		if (grid_neighbors[i][j] != -1){
		    if (i != 12 && grid_neighbors[i+1][j] != -1){
			neighbors[grid_neighbors[i][j]].push(grid_neighbors[i+1][j]);
			neighbors[grid_neighbors[i+1][j]].push(grid_neighbors[i][j]);
		    }
		    if (j != 12 && grid_neighbors[i][j+1] != -1){
			neighbors[grid_neighbors[i][j]].push(grid_neighbors[i][j+1]);
			neighbors[grid_neighbors[i][j+1]].push(grid_neighbors[i][j]);
	                
		    }
		}
	    }
	}

        checkWordsAll(neighbors);
        var letters_to_delete = []
        lettersWords.forEach(function(lid) {
            letters_to_delete = letters_to_delete.concat(lid.split(","));
        });
        /* current naive scoring algorithm:
           give player points for every letter in every word
           (even overlapping ones).
           Then give multiplier bonus based on *quantity*
           of words made that round.
        */
        var roundScore = 0;
        wordsWords.forEach(function(word){
            for(var i = 0; i < word.length; i++){
                var letter = word.charAt(i).toLowerCase();
                roundScore += letter_points[letter];
            }
            gui.addWord(word);
        });

        roundScore *= wordsWords.length;
        score += roundScore;
        gui.updateScore(score);
        lettersWords = [];
        wordsWords   = [];

        letters_to_delete = letters_to_delete.filter(function(elem, pos) {
            return letters_to_delete.indexOf(elem) == pos;
        })
        letters_to_delete.forEach(function(lid) {
            if (lid in letters){
                world.removeRigidBody(letters[lid].rigidBody);
                delete letters[lid];
                // make neighbors dynamic once more.
                neighbors[lid].forEach(function(nid){
                    if (nid in letters){
                        letters[nid].makeDynamic();
                    }
                });
            }
        });
    }


    // 60 fps
    restartGame();

    function restartGame(){
        intervalID = TurbulenzEngine.setInterval(update, 1000 / 60);
        isOver = false;
        startTime = TurbulenzEngine.time;
        score = 0;

        for (var id in letters){
            world.removeRigidBody(letters[id].rigidBody);
        }
        letters = {};
    }
}
