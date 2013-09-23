/*{# jslib files #}*/
/*{{ javascript("../jslib/physics2ddevice.js") }}*/
/*{{ javascript("../jslib/boxtree.js") }}*/
/*{{ javascript("../jslib/canvas.js") }}*/
/*{{ javascript("../jslib/draw2d.js") }}*/
/*{{ javascript("../jslib/observer.js") }}*/
/*{{ javascript("../jslib/requesthandler.js") }}*/


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

/* Game code goes here */
TurbulenzEngine.onload = function onloadFn()
{
    var intervalID;
    var graphicsDevice = TurbulenzEngine.createGraphicsDevice({});
    var inputDevice = TurbulenzEngine.createInputDevice({});
    var md = TurbulenzEngine.createMathDevice({});
    var phys2D = Physics2DDevice.create();

    initializeLetters(graphicsDevice);
    var cannon = initializeCannon(graphicsDevice, md);

    inputDevice.addEventListener('mouseover', cannonMouseHandler(cannon));
    inputDevice.addEventListener('mouseup', handleClick);

    var draw2D = Draw2D.create({
        graphicsDevice: graphicsDevice
    });

    var world = phys2D.createWorld({
        gravity : [0, 0],
        velocityIterations : 8,
        positionIterations : 8
    });

    var bgColor = [0, 0, 0, 1];
    
    var canvasElem = TurbulenzEngine.canvas;
    var canvas = Canvas.create(graphicsDevice, md);
    var ctx = canvas.getContext('2d');

    function update() {
        /* Update code goes here */

        if (graphicsDevice.beginFrame())
        {
            graphicsDevice.clear(bgColor, 1.0);
            /* Rendering code goes here */

            draw2D.begin(); // opaque
            draw2D.end();

            if (ctx.beginFrame(graphicsDevice, 
                               md.v4Build(0,0, canvas.width, canvas.height))){
                currentLetterObj.draw(ctx, draw2D);
                ctx.endFrame();
            }

            cannon.draw(draw2D);

            graphicsDevice.endFrame();
        }
    }
    
    function handleClick(mouseCode, x, y) {
        updateCurrentLetter();
    }

    // 60 fps
    intervalID = TurbulenzEngine.setInterval(update, 1000 / 60);
}