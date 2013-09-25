var cannonTexture;
var md;

var upVec;


// texture dimensions must be powers of 2
function loadCannonTexture(graphicsDevice, cannon){
    cannonTexture = graphicsDevice.createTexture({
        src: "assets/cannon_white.png",
        mipmaps: true,
        onload: function (texture)
        {
            if (texture)
            {
                cannon.sprite.setTexture(texture);
                cannon.sprite.setTextureRectangle([0, 0, 
                                                   texture.width,
                                                   texture.height]);
            }
        }
    });
}

function initializeCannon(graphicsDevice, mathDevice){
    md = mathDevice;
    upVec = md.v2Build(0, 1.0);

    var cannon = new Cannon(graphicsDevice);
    loadCannonTexture(graphicsDevice, cannon);
    return cannon;
}

class Cannon {
    rotation: number;
    sprite: Draw2DSprite;
    width: number = 50;
    height: number = 100;

    constructor(graphicsDevice){
        // offset origin y slightly for laser pointer
        var yOffset = 5;
        this.sprite = Draw2DSprite.create({
            width: this.width,
            height: this.height,
            origin: [this.width/2, this.height/2 + yOffset],
            x: graphicsDevice.width / 2,
            y: graphicsDevice.height / 2 - (this.height/4 + yOffset),
            color: [1.0, 1.0, 1.0, 1.0],
        });
    }

    setRotation(rotation: number){
        this.rotation = rotation;
        this.sprite.rotation = rotation;
    }

    getDirectionVector(): number[] {
        var dirVec =  md.v2Build(-1*Math.sin(this.rotation),
                                 Math.cos(this.rotation));
        return md.v2Normalize(dirVec);
    }

    draw(draw2D){
        // additive makes dark colors transparent...
        draw2D.begin('additive');
        draw2D.drawSprite(this.sprite);
        draw2D.end();
    }

    mouseHandler(){
        var cannon = this;
        return function(x, y){
            var mouseVec = md.v2Normalize(md.v2Build(x-cannon.sprite.x, 
                                                     y-cannon.sprite.y));
            var rotateAngle = Math.acos(md.v2Dot(upVec, mouseVec));
            if (mouseVec[0] > 0){
                rotateAngle = PI2 - rotateAngle;
            }
            cannon.setRotation(rotateAngle);
        }
    }
}
