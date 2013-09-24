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

    gui.setupGUI();

    var cannon = initializeCannon(graphicsDevice, md);
    initializeLetters(graphicsDevice);
    currentLetterObj.placeOnCannon(cannon);

    inputDevice.addEventListener('mouseover', handleMouseOver);
    inputDevice.addEventListener('mouseup', handleClick);

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
                arb.bodyA.setAsStatic();
                arb.bodyB.setAsStatic();
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
            }

            if (ctx.beginFrame(graphicsDevice, canvasBox)){
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
    function handleMouseOver(mouseX, mouseY) {
        if (!isClearing){
            cannonMouseFn(mouseX, mouseY);
            currentLetterObj.placeOnCannon(cannon);
        }
    }
   
    function handleClick(mouseCode, mouseX, mouseY) {
        if (!isClearing){
            currentLetterObj.shoot(cannon, world, draw2D, phys2D);
            updateCurrentLetter(graphicsDevice);
            currentLetterObj.placeOnCannon(cannon);
        }
    }

    // 60 fps
    intervalID = TurbulenzEngine.setInterval(update, 1000 / 60);
}