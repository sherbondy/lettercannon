// why does the canvas api not have a drawCircle function!?
function drawCircle(context, color, radius, centerX, centerY) {
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
}

function spriteRectangle(sprite: Draw2DSprite): number[] {
    var origin = [];
    sprite.getOrigin(origin);
    var x = sprite.x + origin[0];
    var y = sprite.y + origin[1];
    var w = sprite.getWidth();
    var h = sprite.getHeight();
    return [x - w/2, y - w/2,
            x + w/2, y + w/2];
}
