var letterCounter: number = 0;
var alphabetTexture;
var currentLetterObj;
var nextLetterObj;

// interface letterIDMap { [id: number]: Letter; }
var letters = {};
var neighbors = {};
var letterBucket;
var letterRadius = 21;
var letterSize = letterRadius*2;
var letterSpeed = 900;

function loadAlphabetTexture(graphicsDevice) {
    graphicsDevice.createTexture({
        src: "assets/letters.png",
        mipmaps: true,
        onload: function (texture)
        {
            if (texture)
            {
                alphabetTexture = texture;
                currentLetterObj.sprite.setTexture(texture);
                nextLetterObj.sprite.setTexture(texture);
            }
        }
    });
}

function drawLetters(ctx, draw2D, isClearing){
    var l1 = currentLetterObj;
    var l2 = nextLetterObj;
    ctx.save();
    if (!isClearing){
        [l1, l2].forEach(function(letter){
            drawCircle(ctx, letter.getColor(), letter.size/2, 
                       letter.sprite.x, letter.sprite.y);
        });
    }

    for (var id in letters){
        var letter = letters[id];
        if (letter.rigidBody){
            var pos = [];
            letter.rigidBody.getPosition(pos);
            letter.sprite.x = pos[0];
            letter.sprite.y = pos[1];
        }
        drawCircle(ctx, letter.getColor(), letter.size/2, 
                   letter.sprite.x, letter.sprite.y);
    }

    ctx.restore();

    draw2D.begin('additive');
    draw2D.drawSprite(l1.sprite);
    draw2D.drawSprite(nextLetterObj.sprite);
    for (var id in letters){
        var letter = letters[id];
        draw2D.drawSprite(letter.sprite);
    }
    draw2D.end();
}

function initializeLetters(graphicsDevice){
    letterBucket = new LetterGenerator();
    currentLetterObj = new Letter(letterBucket.generate());
    updateNextLetter(graphicsDevice);
    loadAlphabetTexture(graphicsDevice);
}

function updateNextLetter(graphicsDevice) {
    nextLetterObj = new Letter(letterBucket.generate(),
                               graphicsDevice.width - 32,
                               graphicsDevice.height - 32);
}

function updateCurrentLetter(graphicsDevice) {
    currentLetterObj = nextLetterObj;
    updateNextLetter(graphicsDevice);
}

// check if a physics shape corresponds to a letter
// by examining its userdata
function isLetterShape(shape) {
    return (shape !== undefined &&
            shape.userData !== null &&
            shape.userData.type === "letter");
}

class Letter {
    sprite: Draw2DSprite;
    points: number;
    id: number;
    letter: string;
    live: bool = false;
    size: number = letterSize;
    rigidBody: any = null;

    // physics object...
    constructor(letter: string, x: number = 0, y: number = 0) {
        this.letter = letter.toLowerCase();
        this.id = ++letterCounter;
        this.points = 1;
        this.sprite = Draw2DSprite.create({
            width: this.size,
            height: this.size,
            x: x,
            y: y,
            color: [1.0, 1.0, 1.0, 1.0],
            rotation: 0
        });

        this.sprite.setTexture(alphabetTexture);
        this.setTextureCoords();
    }

    // only works for lowercase letters
    letterIndex(letter: string): number {
        return letter.charCodeAt(0) - 97;
    }

    setTextureCoords() {
        var idx = this.letterIndex(this.letter);
        var col = idx % 6;
        var row = Math.floor(idx/6);
        var s = this.size;
        this.sprite.setTextureRectangle([s*col, s*row,
                                         s*(col+1), s*(row+1)]);
    }

    setLetter(letter: string) {
        this.letter = letter;
        this.setTextureCoords();
    }

    getColor(): string {
        return point_colors[letter_points[this.letter]];
    }

    placeOnCannon(cannon) {
        var offset = letterSize;
        var newLetterX = cannon.sprite.x - offset*Math.sin(cannon.rotation);
        var newLetterY = cannon.sprite.y + offset*Math.cos(cannon.rotation);

        this.sprite.x = newLetterX;
        this.sprite.y = newLetterY;
    }

    getShape(phys2D) {
       var letter_id = this.id;
       return phys2D.createCircleShape({
	   userData: {id: letter_id, type: "letter"},
           radius: letterRadius
       });
    }

    shoot(cannon, world, draw2D, phys2D) {
        var letterPoint = draw2D.viewportMap(this.sprite.x, 
                                             this.sprite.y);
        var liveBody = phys2D.createRigidBody({
            shapes: [this.getShape(phys2D)],
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
	neighbors[this.id] = [];
        world.addRigidBody(liveBody);
    }
}

interface LetterFrequencyMap {
    [letter: string]: number;
}

class LetterGenerator {
    letter_string: string = "abcdefghijklmnopqrstuvwxyz";
    freq_array: number[] = [];

    constructor(frequency_map:LetterFrequencyMap = default_frequencies)
    {
        var total: number = 0.0;

        for (var i = 0, len = this.letter_string.length; i < len; i++) {
            var letter = this.letter_string[i];
            var freq = frequency_map[letter];
            total += freq;
            this.freq_array.push(total);
        }
        console.log(this.freq_array);
    }

    generate(): string {
        var num = Math.random();
        console.log(num);
        for (var i = 0, len = this.freq_array.length; i < len; i++) {
            if (this.freq_array[i] > num){
                return this.letter_string[i];
            }
        }
        return this.letter_string[len-1];
    }
}

var default_frequencies: LetterFrequencyMap = {
    "a": 0.08268888880167657, 
    "b": 0.018085818230339945,
    "c": 0.04573283203692221, 
    "d": 0.02998359536274656, 
    "e": 0.10556658791394237, 
    "f": 0.011332150734284122, 
    "g": 0.02124655620354309, 
    "h": 0.02762395704967701, 
    "i": 0.08784231925464864, 
    "j": 0.0012293666554162774, 
    "k": 0.007024952316664443, 
    "l": 0.05863431394865113, 
    "m": 0.030814619749927396, 
    "n": 0.07047224162696326, 
    "o": 0.07641352636908079, 
    "p": 0.035004081536541526,
    "q": 0.0016831432540834988, 
    "r": 0.07229764997684512, 
    "s": 0.06211588424134439, 
    "t": 0.06914819509744669, 
    "u": 0.03926075131668799, 
    "v": 0.009281080508308281, 
    "w": 0.006381815969796629, 
    "x": 0.0031141338900967795, 
    "y": 0.023432532985879453,
    "z": 0.0035890049684858282
};

interface LetterPointMap {
    [letter: string]: number;
}

// based on: http://en.wikipedia.org/wiki/Scrabble_letter_distributions#English
var letter_points: LetterPointMap = {
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
    10: "purple",
};
