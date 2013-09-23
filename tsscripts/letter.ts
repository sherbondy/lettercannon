var letterCounter: number = 0;
var letterTexture;

class Letter {
    sprite: Draw2DSprite;
    points: number;
    id: number;
    letter: string;
    live: bool = false;
    size: number = 42;

    // physics object...
    constructor(letter: string, x: number, y: number) {
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

        this.sprite.setTexture(letterTexture);
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
        this.sprite.setTextureRectangle([s*col,s*row,
                                         s*(col+1),s*(row+1)]);
    }

    setLetter(letter: string) {
        this.letter = letter;
        this.setTextureCoords();
    }

    getColor(): string {
        return point_colors[letter_points[this.letter]];
    }

    draw(ctx, draw2D) {
        ctx.save();
        drawCircle(ctx, this.getColor(), this.size/2, 
                   this.sprite.x, this.sprite.y);
        ctx.restore();

        draw2D.begin('additive');
        draw2D.drawSprite(this.sprite);
        draw2D.end();
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
        for (var i = 1, len = this.freq_array.length; i < len; i++) {
            if (this.freq_array[i] > num){
                return this.letter_string[i-1];
            }
        }
        return this.letter_string[len-1];
    }
}

var default_frequencies: LetterFrequencyMap = {
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