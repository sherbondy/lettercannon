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

var noop = function(args){
};

// only works for lowercase letters
var letterIndex = function(letter){
    return letter.charCodeAt(0) - 97;
};

/* Game code goes here */
TurbulenzEngine.onload = function onloadFn()
{
    var intervalID;
    var graphicsDevice = TurbulenzEngine.createGraphicsDevice({});
    var inputDevice = TurbulenzEngine.createInputDevice({});
    var md = TurbulenzEngine.createMathDevice({});
    var phys2D = Physics2DDevice.create();

    var letterBucket = new LetterGenerator();
    var currentLetter = letterBucket.generate();

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

    // var x1 = 50;
    // var y1 = 50;
    // var x2 = graphicsDevice.width - 50;
    // var y2 = graphicsDevice.height - 50;
    // // startx, starty, endx, endy
    // var rectangle = [x1, y1, x2, y2];

    // var drawObject = {
    //     color: [1.0, 0.0, 0.0, 1.0],
    //     destinationRectangle: rectangle
    // };

    var cannonSprite = Draw2DSprite.create({
        width: 50,
        height: 100,
        x: graphicsDevice.width / 2,
        y: graphicsDevice.height / 2,
        color: [1.0, 1.0, 1.0, 1.0],
        rotation: Math.PI / 4
    });

    var currentLetterSprite = Draw2DSprite.create({
        width: 42,
        height: 42,
        x: graphicsDevice.width - 64,
        y: graphicsDevice.height - 64,
        color: [1,1,1,1],
        rotation: 0
    });

    var updateLetterSpriteCoords = function(){
        var idx = letterIndex(currentLetter);
        var col = idx % 6;
        var row = Math.floor(idx/6);
        var s = 42;
        currentLetterSprite.setTextureRectangle([s*col,s*row,
                                                 s*(col+1),s*(row+1)]);
    };

    var updateCurrentLetter = function() {
        currentLetter = letterBucket.generate();
        updateLetterSpriteCoords();  
    };

    var alphabetTexture = graphicsDevice.createTexture({
        src: "assets/letters.png",
        mipmaps: true,
        onload: function (texture)
        {
            if (texture)
            {
                currentLetterSprite.setTexture(texture);
                updateCurrentLetter();
            }
        }
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
                cannonSprite.setTextureRectangle([0, 0, texture.width, texture.height]);
            }
        }
    });

    var bgColor = [0, 0, 0, 1];
    var PI2 = 2*Math.PI;
    var upVec = md.v2Build(0, 1.0);
    var mouseVec = md.v2Build(0, 1.0);

    function update() {
        /* Update code goes here */

        cannonSprite.rotation = rotateAngle;

        if (graphicsDevice.beginFrame())
        {
            graphicsDevice.clear(bgColor, 1.0);
            /* Rendering code goes here */

            draw2D.begin(); // opaque
            draw2D.end();

            draw2D.begin('additive'); // additive makes dark colors transparent...
            draw2D.drawSprite(cannonSprite);
            draw2D.drawSprite(currentLetterSprite);
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
