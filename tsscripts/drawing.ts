// why does the canvas api not have a drawCircle function!?
function drawCircle(ctx, color, radius, centerX, centerY) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
}

function drawBottomBar(ctx, canvas){
    ctx.save();
    ctx.beginPath();
    ctx.rect(0,canvas.height-64,canvas.width,canvas.height);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.restore();
}

function drawLetterBorderFn(ctx, color){
    return function(id){
        drawCircle(ctx, color, 24, letters[id].sprite.x, letters[id].sprite.y);
    };
}

function drawLetterBorders(ctx, letters, correct_letters, incorrect_letters, selected){
    var correctLetterFn = drawLetterBorderFn(ctx, 'limegreen');
    var incorrectLetterFn = drawLetterBorderFn(ctx, 'crimson');
    var selectedLetterFn = drawLetterBorderFn(ctx, 'skyblue');

    correct_letters.forEach(correctLetterFn);
    incorrect_letters.forEach(incorrectLetterFn);
    selected.forEach(selectedLetterFn);
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
