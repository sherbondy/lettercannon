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
TurbulenzEngine.onload = function onloadFn()
{
    var intervalID;
    var graphicsDevice = TurbulenzEngine.createGraphicsDevice({});
    var inputDevice = TurbulenzEngine.createInputDevice({});
    var md = TurbulenzEngine.createMathDevice({});
    var phys2D = Physics2DDevice.create();

    var canvasElem = TurbulenzEngine.canvas;
    var canvas = Canvas.create(graphicsDevice, md);
    var ctx = canvas.getContext('2d');

    gui.setupGUI(toggleMode);

    var cannon = initializeCannon(graphicsDevice, md);
    initializeLetters(graphicsDevice);
    currentLetterObj.placeOnCannon(cannon);

    inputDevice.addEventListener('mouseover', handleMouseOver);
    inputDevice.addEventListener('mouseup', handleClick);
    inputDevice.addEventListener('mousedown', handleDown);

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

    function toggleMode(){
        if (!isClearing){
            console.log("Back in shooting mode!");
            // do letter removal
            correct_letters.forEach(function(i) {
                world.removeRigidBody(letters[i].rigidBody);
                delete letters[i];
            });
        }
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
    
    function update() {
        /* Update code goes here */

        var canvasBox = md.v4Build(0,0, canvas.width, canvas.height);

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
		}

                arb.bodyA.setAsStatic();
                arb.bodyB.setAsStatic();

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

                    // This WAS a double circle to indicate
                    // where the player will lose, but it
                    // isn't necessary. Leaving here just in
                    // case we want it for aesthetic reasons?
                    // ctx.save()
                    // ctx.beginPath();
                    // ctx.strokeStyle = 'gray';
                    // ctx.arc(center_width, center_height,
                    //         67, 0, PI2, false);
                    // ctx.stroke();
                    // ctx.beginPath();
                    // ctx.strokeStyle = 'gray';
                    // ctx.arc(center_width, center_height,
                    //         70, 0, PI2, false);
                    // ctx.stroke();
                    // ctx.restore();

                    ctx.endFrame();
                }
                // draw cannon on top of laser line
                cannon.draw(draw2D);
            } else {
               
            }

            if (ctx.beginFrame(graphicsDevice, canvasBox)){
                if (isClearing){
                    drawLetterBorders(ctx, letters, correct_letters, incorrect_letters, selected);
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
    var mouse_down    = false;
    var used_letters  = {};
    var selected:number[] = [];
    var correct_letters   = [];
    var incorrect_letters = [];
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
   
    function handleClick(mouseCode, mouseX, mouseY) {
        mouse_down = false;
        if (!isClearing && !isOver){
            incorrect_letters  = [];
            correct_letters   = [];
            currentLetterObj.shoot(cannon, world, draw2D, phys2D);
            updateCurrentLetter(graphicsDevice);
            currentLetterObj.placeOnCannon(cannon);
        } else if (isClearing) {
            var word = checkWord(neighbors, selected);
            if (word != "") {
              var foundWordsLists = document.getElementById("found_words_list");
              var listElem = document.createElement("li");
              var wordListItem = document.createTextNode(word);

              listElem.appendChild(wordListItem);
              foundWordsLists.appendChild(listElem);

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

    // 60 fps
    intervalID = TurbulenzEngine.setInterval(update, 1000 / 60);
}
