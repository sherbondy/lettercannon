class Laser {
    lineEndpoint: number[];

    update(cannon, canvas, world) {
        var rayDir = cannon.getDirectionVector();
        var factor = (Math.max(canvas.width, canvas.height) / 
                      md.v2Length(rayDir));
        var ray = {
            origin: [cannon.sprite.x, cannon.sprite.y],
            direction: rayDir,
            maxFactor: factor
        };
        var result = world.rayCast(ray, false, truth, {});
        if (result){
            this.lineEndpoint = result.hitPoint;
        }
    }

    draw(ctx, cannon){
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cannon.sprite.x, cannon.sprite.y);
        ctx.lineTo(this.lineEndpoint[0], this.lineEndpoint[1]);
        ctx.strokeStyle = 'red';
        ctx.stroke();
        ctx.restore();
    }

    constructor(lineEndpoint: number[]){
        this.lineEndpoint = lineEndpoint;
    }
}