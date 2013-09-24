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
/// <reference path="main.ts" />

var requestHandler = RequestHandler.create({
    initialRetryTime: 500,
    notifyTime: 4000,
    maxRetryTime: 8000,
    onReconnected: function onReconnectedFn(reason, requestCallContext)
    {
        console.log('Reconnected');
    },
    onRequestTimeout: function onRequestTimeoutFn(reason, requestCallContext)
    {
        console.log('Connection lost');
    }
});

function noop(args){}

// NOTES:
/*
We can use http://docs.turbulenz.com/jslibrary_api/physics2d_collisionutils_api.html to check which shapes the user is clicking for clearing mode.
*/

var toggleButton = document.getElementById("toggle_mode");
var isClearing = false;
var bgColor = [0,0,0,1];

function clearingModeText()
{
    return isClearing ? "Enter Shooting Mode" : "Enter Word Clearing Mode";
}

function toggleClearingMode()
{
    isClearing = !isClearing;
    toggleButton.innerHTML = clearingModeText();
    bgColor = isClearing ? [1,1,1,1] : [0,0,0,1];
}

function setupGUI()
{
    toggleButton.innerHTML = clearingModeText();
    toggleButton.addEventListener("click", toggleClearingMode);
}

setupGUI();

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
        staticFriction: 10,
        dynamicFriction: 10,
        rollingFriction: 10
    });

    var letterShape = phys2D.createCircleShape({
        radius: letterRadius, 
        material: mainMaterial
    });

    var world = phys2D.createWorld({
        gravity : [0, 0],
        velocityIterations : 8,
        positionIterations : 8
    });

    var thickness = 1;// 1 cm
         
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
    
    function update() {
        /* Update code goes here */

        if (graphicsDevice.beginFrame())
        {
            graphicsDevice.clear(bgColor, 1.0);
            /* Rendering code goes here */

            draw2D.begin(); // opaque
            draw2D.end();

            cannon.draw(draw2D);

            if (ctx.beginFrame(graphicsDevice, 
                               md.v4Build(0,0, canvas.width, canvas.height))){
                ctx.save();
                ctx.beginPath();
                ctx.rect(0,canvas.height-64,canvas.width,canvas.height);
                ctx.fillStyle = 'white';
                ctx.fill();
                ctx.restore();

                drawLetters(ctx, draw2D, isClearing);
                ctx.endFrame();
            }

            graphicsDevice.endFrame();
        }

        world.step(1.0/60);
    }

    var cannonMouseFn = cannonMouseHandler(cannon);
    function handleMouseOver(mouseX, mouseY) {
        if (!isClearing){
            cannonMouseFn(mouseX, mouseY);
            currentLetterObj.placeOnCannon(cannon);
        }
    }
    
    function handleClick(mouseCode, mouseX, mouseY) {
        if (!isClearing){
            var liveLetter = currentLetterObj;
            var letterPoint = draw2D.viewportMap(liveLetter.sprite.x, 
                                                 liveLetter.sprite.y);
            var liveBody = phys2D.createRigidBody({
                shapes: [letterShape.clone()],
                position: letterPoint
            });

            var veloVector = md.v2Build(-1*Math.sin(cannon.rotation),
                                        Math.cos(cannon.rotation));
            var veloNorm = md.v2Normalize(veloVector);
            var trueVelo = md.v2ScalarMul(veloNorm, 200.0);
            var veloArray = MathDeviceConvert.v2ToArray(trueVelo);

            liveBody.setVelocity(veloArray);
            liveLetter.rigidBody = liveBody;
            liveLetter.live = true;
            letters[liveLetter.id] = liveLetter;
            world.addRigidBody(liveBody);

            updateCurrentLetter(graphicsDevice);
            currentLetterObj.placeOnCannon(cannon);
        }
    }

    // 60 fps
    intervalID = TurbulenzEngine.setInterval(update, 1000 / 60);
}