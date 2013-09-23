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
/// <reference path="letter.ts" />
/// <reference path="main.ts" />

var rotateAngle = 0;

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

var spriteRectangle = function(sprite: Draw2DSprite): number[] {
    var origin = [];
    sprite.getOrigin(origin);
    var x = sprite.x + origin[0];
    var y = sprite.y + origin[1];
    var w = sprite.getWidth();
    var h = sprite.getHeight();
    return [x - w/2, y - w/2,
            x + w/2, y + w/2];
}

var noop = function(args){
};

var drawCircle = function(context, color, radius, centerX, centerY) {
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
}

/* Game code goes here */
TurbulenzEngine.onload = function onloadFn()
{
    var intervalID;
    var graphicsDevice = TurbulenzEngine.createGraphicsDevice({});
    var inputDevice = TurbulenzEngine.createInputDevice({});
    var md = TurbulenzEngine.createMathDevice({});
    var phys2D = Physics2DDevice.create();

    initializeLetters(graphicsDevice);

    inputDevice.addEventListener('mouseover', handleMouse);
    inputDevice.addEventListener('mouseup', handleClick);

    var draw2D = Draw2D.create({
        graphicsDevice: graphicsDevice
    });

    var world = phys2D.createWorld({
        gravity : [0, 0],
        velocityIterations : 8,
        positionIterations : 8
    });

    var cannonSprite = Draw2DSprite.create({
        width: 50,
        height: 100,
        x: graphicsDevice.width / 2,
        y: graphicsDevice.height / 2,
        color: [1.0, 1.0, 1.0, 1.0],
        rotation: Math.PI / 4
    });

    // texture dimensions must be powers of 2
    var cannonTexture = graphicsDevice.createTexture({
        src: "assets/cannon_white.png",
        mipmaps: true,
        onload: function (texture)
        {
            if (texture)
            {
                cannonSprite.setTexture(texture);
                cannonSprite.setTextureRectangle([0, 0, 
                                                  texture.width, texture.height]);
            }
        }
    });

    var bgColor = [0, 0, 0, 1];
    var PI2 = 2*Math.PI;
    var upVec = md.v2Build(0, 1.0);
    var mouseVec = md.v2Build(0, 1.0);
    
    var canvasElem = TurbulenzEngine.canvas;
    var canvas = Canvas.create(graphicsDevice, md);
    var ctx = canvas.getContext('2d');

    function update() {
        /* Update code goes here */

        cannonSprite.rotation = rotateAngle;

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

            draw2D.begin('additive'); // additive makes dark colors transparent...
            draw2D.drawSprite(cannonSprite);
            draw2D.end();

            graphicsDevice.endFrame();
        }
    }

    function handleMouse(x, y) {
        mouseVec = md.v2Normalize(md.v2Build(x-cannonSprite.x, y-cannonSprite.y));
        rotateAngle = Math.acos(md.v2Dot(upVec, mouseVec));
        if (mouseVec[0] > 0){
            rotateAngle = PI2 - rotateAngle;
        }
        console.log(rotateAngle);
    }
    
    function handleClick(mouseCode, x, y) {
        updateCurrentLetter();
    }

    // 60 fps
    intervalID = TurbulenzEngine.setInterval(update, 1000 / 60);
}
