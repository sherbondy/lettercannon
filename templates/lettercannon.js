var PI2 = 2 * Math.PI;
// why does the canvas api not have a drawCircle function!?
function drawCircle(context, color, radius, centerX, centerY) {
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
}
function drawBottomBar(ctx, canvas) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, canvas.height - 64, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.restore();
}
function spriteRectangle(sprite) {
    var origin = [];
    sprite.getOrigin(origin);
    var x = sprite.x + origin[0];
    var y = sprite.y + origin[1];
    var w = sprite.getWidth();
    var h = sprite.getHeight();
    return [
        x - w / 2, 
        y - w / 2, 
        x + w / 2, 
        y + w / 2
    ];
}
var letterCounter = 0;
var alphabetTexture;
var currentLetterObj;
var nextLetterObj;
// interface letterIDMap { [id: number]: Letter; }
var letters = {
};
var letterBucket;
var letterRadius = 21;
var letterSize = letterRadius * 2;
var letterSpeed = 300;
function loadAlphabetTexture(graphicsDevice) {
    graphicsDevice.createTexture({
        src: "assets/letters.png",
        mipmaps: true,
        onload: function (texture) {
            if(texture) {
                alphabetTexture = texture;
                currentLetterObj.sprite.setTexture(texture);
                nextLetterObj.sprite.setTexture(texture);
            }
        }
    });
}
function drawLetters(ctx, draw2D, isClearing) {
    var l1 = currentLetterObj;
    var l2 = nextLetterObj;
    ctx.save();
    if(!isClearing) {
        [
            l1, 
            l2
        ].forEach(function (letter) {
            drawCircle(ctx, letter.getColor(), letter.size / 2, letter.sprite.x, letter.sprite.y);
        });
    }
    for(var id in letters) {
        var letter = letters[id];
        if(letter.rigidBody) {
            var pos = [];
            letter.rigidBody.getPosition(pos);
            letter.sprite.x = pos[0];
            letter.sprite.y = pos[1];
        }
        drawCircle(ctx, letter.getColor(), letter.size / 2, letter.sprite.x, letter.sprite.y);
    }
    ctx.restore();
    draw2D.begin('additive');
    draw2D.drawSprite(l1.sprite);
    draw2D.drawSprite(nextLetterObj.sprite);
    for(var id in letters) {
        var letter = letters[id];
        draw2D.drawSprite(letter.sprite);
    }
    draw2D.end();
}
function initializeLetters(graphicsDevice) {
    letterBucket = new LetterGenerator();
    currentLetterObj = new Letter(letterBucket.generate());
    updateNextLetter(graphicsDevice);
    loadAlphabetTexture(graphicsDevice);
}
function updateNextLetter(graphicsDevice) {
    nextLetterObj = new Letter(letterBucket.generate(), graphicsDevice.width - 32, graphicsDevice.height - 32);
}
function updateCurrentLetter(graphicsDevice) {
    currentLetterObj = nextLetterObj;
    updateNextLetter(graphicsDevice);
}
var Letter = (function () {
    // physics object...
    function Letter(letter, x, y) {
        if (typeof x === "undefined") { x = 0; }
        if (typeof y === "undefined") { y = 0; }
        this.live = false;
        this.size = letterSize;
        this.rigidBody = null;
        this.letter = letter.toLowerCase();
        this.id = ++letterCounter;
        this.points = 1;
        this.sprite = Draw2DSprite.create({
            width: this.size,
            height: this.size,
            x: x,
            y: y,
            color: [
                1.0, 
                1.0, 
                1.0, 
                1.0
            ],
            rotation: 0
        });
        this.sprite.setTexture(alphabetTexture);
        this.setTextureCoords();
    }
    Letter.prototype.letterIndex = // only works for lowercase letters
    function (letter) {
        return letter.charCodeAt(0) - 97;
    };
    Letter.prototype.setTextureCoords = function () {
        var idx = this.letterIndex(this.letter);
        var col = idx % 6;
        var row = Math.floor(idx / 6);
        var s = this.size;
        this.sprite.setTextureRectangle([
            s * col, 
            s * row, 
            s * (col + 1), 
            s * (row + 1)
        ]);
    };
    Letter.prototype.setLetter = function (letter) {
        this.letter = letter;
        this.setTextureCoords();
    };
    Letter.prototype.getColor = function () {
        return point_colors[letter_points[this.letter]];
    };
    Letter.prototype.placeOnCannon = function (cannon) {
        var offset = letterSize;
        var newLetterX = cannon.sprite.x - offset * Math.sin(cannon.rotation);
        var newLetterY = cannon.sprite.y + offset * Math.cos(cannon.rotation);
        this.sprite.x = newLetterX;
        this.sprite.y = newLetterY;
    };
    Letter.prototype.getShape = function (phys2D) {
        return phys2D.createCircleShape({
            radius: letterRadius
        });
    };
    Letter.prototype.shoot = function (cannon, world, draw2D, phys2D) {
        var letterPoint = draw2D.viewportMap(this.sprite.x, this.sprite.y);
        var liveBody = phys2D.createRigidBody({
            shapes: [
                this.getShape(phys2D)
            ],
            position: letterPoint
        });
        var veloVector = cannon.getDirectionVector();
        // scale velocity vector by desired speed;
        var trueVelo = md.v2ScalarMul(veloVector, letterSpeed);
        var veloArray = MathDeviceConvert.v2ToArray(trueVelo);
        liveBody.setVelocity(veloArray);
        this.rigidBody = liveBody;
        this.live = true;
        letters[this.id] = this;
        world.addRigidBody(liveBody);
    };
    return Letter;
})();
var LetterGenerator = (function () {
    function LetterGenerator(frequency_map) {
        if (typeof frequency_map === "undefined") { frequency_map = default_frequencies; }
        this.letter_string = "abcdefghijklmnopqrstuvwxyz";
        this.freq_array = [];
        var total = 0.0;
        for(var i = 0, len = this.letter_string.length; i < len; i++) {
            var letter = this.letter_string[i];
            var freq = frequency_map[letter];
            total += freq;
            this.freq_array.push(total);
        }
        console.log(this.freq_array);
    }
    LetterGenerator.prototype.generate = function () {
        var num = Math.random();
        console.log(num);
        for(var i = 1, len = this.freq_array.length; i < len; i++) {
            if(this.freq_array[i] > num) {
                return this.letter_string[i - 1];
            }
        }
        return this.letter_string[len - 1];
    };
    return LetterGenerator;
})();
var default_frequencies = {
    "a": 0.08268888880167657,
    "c": 0.04573283203692221,
    "b": 0.018085818230339945,
    "e": 0.10556658791394237,
    "d": 0.02998359536274656,
    "g": 0.02124655620354309,
    "f": 0.011332150734284122,
    "i": 0.08784231925464864,
    "h": 0.02762395704967701,
    "k": 0.007024952316664443,
    "j": 0.0012293666554162774,
    "m": 0.030814619749927396,
    "l": 0.05863431394865113,
    "o": 0.07641352636908079,
    "n": 0.07047224162696326,
    "q": 0.0016831432540834988,
    "p": 0.035004081536541526,
    "s": 0.06211588424134439,
    "r": 0.07229764997684512,
    "u": 0.03926075131668799,
    "t": 0.06914819509744669,
    "w": 0.006381815969796629,
    "v": 0.009281080508308281,
    "y": 0.023432532985879453,
    "x": 0.0031141338900967795,
    "z": 0.0035890049684858282
};
// based on: http://en.wikipedia.org/wiki/Scrabble_letter_distributions#English
var letter_points = {
    "e": 1,
    "a": 1,
    "i": 1,
    "o": 1,
    "n": 1,
    "r": 1,
    "t": 1,
    "l": 1,
    "s": 1,
    "u": 1,
    "d": 2,
    "g": 2,
    "b": 3,
    "c": 3,
    "m": 3,
    "p": 3,
    "f": 4,
    "h": 4,
    "v": 4,
    "w": 4,
    "y": 4,
    "k": 5,
    "j": 8,
    "x": 8,
    "q": 10,
    "z": 10
};
var point_colors = {
    1: "red",
    2: "orange",
    3: "silver",
    4: "green",
    5: "blue",
    8: "indigo",
    10: "purple"
};
var cannonTexture;
var md;
var upVec;
// texture dimensions must be powers of 2
function loadCannonTexture(graphicsDevice, cannon) {
    cannonTexture = graphicsDevice.createTexture({
        src: "assets/cannon_white.png",
        mipmaps: true,
        onload: function (texture) {
            if(texture) {
                cannon.sprite.setTexture(texture);
                cannon.sprite.setTextureRectangle([
                    0, 
                    0, 
                    texture.width, 
                    texture.height
                ]);
            }
        }
    });
}
function initializeCannon(graphicsDevice, mathDevice) {
    md = mathDevice;
    upVec = md.v2Build(0, 1.0);
    var cannon = new Cannon(graphicsDevice);
    loadCannonTexture(graphicsDevice, cannon);
    return cannon;
}
var Cannon = (function () {
    function Cannon(graphicsDevice) {
        this.width = 50;
        this.height = 100;
        // offset origin y slightly for laser pointer
        var yOffset = 5;
        this.sprite = Draw2DSprite.create({
            width: this.width,
            height: this.height,
            origin: [
                this.width / 2, 
                this.height / 2 + yOffset
            ],
            x: graphicsDevice.width / 2,
            y: graphicsDevice.height / 2 - (this.height / 4 + yOffset),
            color: [
                1.0, 
                1.0, 
                1.0, 
                1.0
            ]
        });
    }
    Cannon.prototype.setRotation = function (rotation) {
        this.rotation = rotation;
        this.sprite.rotation = rotation;
    };
    Cannon.prototype.getDirectionVector = function () {
        var dirVec = md.v2Build(-1 * Math.sin(this.rotation), Math.cos(this.rotation));
        return md.v2Normalize(dirVec);
    };
    Cannon.prototype.draw = function (draw2D) {
        // additive makes dark colors transparent...
        draw2D.begin('additive');
        draw2D.drawSprite(this.sprite);
        draw2D.end();
    };
    Cannon.prototype.mouseHandler = function () {
        var cannon = this;
        return function (x, y) {
            var mouseVec = md.v2Normalize(md.v2Build(x - cannon.sprite.x, y - cannon.sprite.y));
            var rotateAngle = Math.acos(md.v2Dot(upVec, mouseVec));
            if(mouseVec[0] > 0) {
                rotateAngle = PI2 - rotateAngle;
            }
            cannon.setRotation(rotateAngle);
        };
    };
    return Cannon;
})();
var Laser = (function () {
    function Laser(lineEndpoint) {
        this.lineEndpoint = lineEndpoint;
    }
    Laser.prototype.update = function (cannon, canvas, world) {
        var rayDir = cannon.getDirectionVector();
        var factor = (Math.max(canvas.width, canvas.height) / md.v2Length(rayDir));
        var ray = {
            origin: [
                cannon.sprite.x, 
                cannon.sprite.y
            ],
            direction: rayDir,
            maxFactor: factor
        };
        var result = world.rayCast(ray, false, truth, {
        });
        if(result) {
            this.lineEndpoint = result.hitPoint;
        }
    };
    Laser.prototype.draw = function (ctx, cannon) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cannon.sprite.x, cannon.sprite.y);
        ctx.lineTo(this.lineEndpoint[0], this.lineEndpoint[1]);
        ctx.strokeStyle = 'red';
        ctx.stroke();
        ctx.restore();
    };
    return Laser;
})();
var isClearing = false;
var GUI = (function () {
    function GUI() {
        this.toggleButton = null;
        this.bgColor = [
            0, 
            0, 
            0, 
            1
        ];
    }
    GUI.prototype.clearingModeText = function () {
        return isClearing ? "Enter Shooting Mode" : "Enter Word Clearing Mode";
    };
    GUI.prototype.toggleClearingMode = function () {
        isClearing = !isClearing;
        gui.toggleButton.innerHTML = gui.clearingModeText();
        gui.bgColor = isClearing ? [
            1, 
            1, 
            1, 
            1
        ] : [
            0, 
            0, 
            0, 
            1
        ];
    };
    GUI.prototype.setupGUI = function () {
        this.toggleButton = document.getElementById("toggle_mode");
        this.toggleButton.innerHTML = this.clearingModeText();
        this.toggleButton.addEventListener("click", this.toggleClearingMode);
    };
    return GUI;
})();
var gui = new GUI();
var testing = "Hello!";
function noop() {
    var args = [];
    for (var _i = 0; _i < (arguments.length - 0); _i++) {
        args[_i] = arguments[_i + 0];
    }
}
function truth() {
    var args = [];
    for (var _i = 0; _i < (arguments.length - 0); _i++) {
        args[_i] = arguments[_i + 0];
    }
    return true;
}
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
TurbulenzEngine.onload = function onloadFn() {
    var intervalID;
    var graphicsDevice = TurbulenzEngine.createGraphicsDevice({
    });
    var inputDevice = TurbulenzEngine.createInputDevice({
    });
    var md = TurbulenzEngine.createMathDevice({
    });
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
    var stageWidth = canvas.width;//meters
    
    var stageHeight = canvas.height - 64;//meters
    
    var draw2D = Draw2D.create({
        graphicsDevice: graphicsDevice,
        viewportRectangle: [
            0, 
            0, 
            stageWidth, 
            stageHeight
        ],
        scaleMode: 'scale'
    });
    var mainMaterial = phys2D.createMaterial({
        elasticity: 0
    });
    var world = phys2D.createWorld({
        gravity: [
            0, 
            0
        ],
        velocityIterations: 8,
        positionIterations: 8
    });
    var thickness = 1;
    var border = phys2D.createRigidBody({
        type: 'static',
        shapes: [
            phys2D.createPolygonShape({
                vertices: phys2D.createRectangleVertices(0, 0, thickness, stageHeight)
            }), 
            phys2D.createPolygonShape({
                vertices: phys2D.createRectangleVertices(0, 0, stageWidth, thickness)
            }), 
            phys2D.createPolygonShape({
                vertices: phys2D.createRectangleVertices((stageWidth - thickness), 0, stageWidth, stageHeight)
            }), 
            phys2D.createPolygonShape({
                vertices: phys2D.createRectangleVertices(0, (stageHeight - thickness), stageWidth, stageHeight)
            })
        ]
    });
    world.addRigidBody(border);
    // the end point of the laser line.
    var laserPointer = new Laser([
        canvas.width / 2, 
        canvas.height
    ]);
    function update() {
        /* Update code goes here */
        var canvasBox = md.v4Build(0, 0, canvas.width, canvas.height);
        if(graphicsDevice.beginFrame()) {
            // make the letters stop the moment they collide with anything
            var arbiters = world.staticArbiters;
            for(var i = 0, nArbs = arbiters.length; i < nArbs; i++) {
                var arb = arbiters[i];
                if(!arb.active) {
                    continue;
                }
                arb.bodyA.setAsStatic();
                arb.bodyB.setAsStatic();
            }
            laserPointer.update(cannon, canvas, world);
            world.step(1.0 / 60);
            // clear the canvas
            graphicsDevice.clear(gui.bgColor, 1.0);
            /* Rendering code goes here */
            draw2D.begin();
            // opaque drawing can go in here
            draw2D.end();
            if(!isClearing) {
                if(ctx.beginFrame(graphicsDevice, canvasBox)) {
                    // draw the laser line
                    laserPointer.draw(ctx, cannon);
                    ctx.endFrame();
                }
                // draw cannon on top of laser line
                cannon.draw(draw2D);
            }
            if(ctx.beginFrame(graphicsDevice, canvasBox)) {
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
        if(!isClearing) {
            cannonMouseFn(mouseX, mouseY);
            currentLetterObj.placeOnCannon(cannon);
        }
    }
    function handleClick(mouseCode, mouseX, mouseY) {
        if(!isClearing) {
            currentLetterObj.shoot(cannon, world, draw2D, phys2D);
            updateCurrentLetter(graphicsDevice);
            currentLetterObj.placeOnCannon(cannon);
        }
    }
    // 60 fps
    intervalID = TurbulenzEngine.setInterval(update, 1000 / 60);
};
