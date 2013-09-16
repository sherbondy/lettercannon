/*{{ javascript("jslib/draw2d.js") }}*/

// to build: makehtml --mode canvas-debug -t . game.js -o game.debug.html

/* Game code goes here */
TurbulenzEngine.onload = function onloadFn()
{
  var intervalID;
  var graphicsDevice = TurbulenzEngine.createGraphicsDevice({});

  var draw2D = Draw2D.create({
      graphicsDevice: graphicsDevice
  });

  var x1 = 50;
  var y1 = 50;
  var x2 = graphicsDevice.width - 50;
  var y2 = graphicsDevice.height - 50;
  // startx, starty, endx, endy
  var rectangle = [x1, y1, x2, y2];

  var drawObject = {
      color: [1.0, 0.0, 0.0, 1.0],
      destinationRectangle: rectangle
  };

  var sprite = Draw2DSprite.create({
      width: 100,
      height: 100,
      x: graphicsDevice.width / 2,
      y: graphicsDevice.height / 2,
      color: [1.0, 1.0, 1.0, 1.0],
      rotation: Math.PI / 4
  });

  // texture dimensions must be powers of 2
  var texture = graphicsDevice.createTexture({
      src: "assets/textures/particle_spark.png",
      mipmaps: true,
      onload: function (texture)
      {
          if (texture)
          {
              sprite.setTexture(texture);
              sprite.setTextureRectangle([0, 0, texture.width, texture.height]);
          }
      }
  });

  var PI2 = Math.PI * 2;
  var rotateAngle = Math.PI / 32;
  var scale = [1, 1];

  var r = 1.0, g = 1.0, b = 0.0, a = 1.0;
  var bgColor = [r, g, b, a];

  function update() {
    /* Update code goes here */
    b += 0.01;
    bgColor[2] = b % 1; // Clamp color between 0-1

    sprite.rotation += rotateAngle;
    sprite.rotation %= PI2; //Wrap rotation at PI * 2
    scale[0] = scale[1] = Math.cos(sprite.rotation) + 2;
    sprite.setScale(scale);

    if (graphicsDevice.beginFrame())
    {
        graphicsDevice.clear(bgColor, 1.0);
        /* Rendering code goes here */

        draw2D.begin(); // opaque
        draw2D.draw(drawObject);
        draw2D.end();

        draw2D.begin('additive'); // additive makes dark colors transparent...
        draw2D.drawSprite(sprite);
        draw2D.end();

        graphicsDevice.endFrame();
    }
  }

  // 60 fps
  intervalID = TurbulenzEngine.setInterval(update, 1000 / 60);
}