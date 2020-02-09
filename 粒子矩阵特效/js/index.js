/**
  Scroll to zoom, or use options
  
  Read description for notes on possible
  issues.
*/

window.addEventListener('load', function() {
  var canvas = document.getElementById("animation"),
      context = canvas.getContext("2d"),
      width, height, resize,
      gui = new dat.GUI(),
      stats = new Stats(),
      generatePoints,
      settings = {
        viewDistance: 100,
        offsetFromCenter: 100,
        margin: 20
      },
      points = [], limit = settings.offsetFromCenter, step = settings.margin, cp = {x:0,y:0,z:0};
  
  function generateParticles() {
    points = [];
    limit = settings.offsetFromCenter;
    step = settings.margin;
    cp = {x:0,y:0,z:0};
    for(var y = -limit; y < limit; y += step) {
      for(var x = -limit; x < limit; x += step) {
        for(var z = -limit; z < limit; z += step) {
          var v  = {x:x,y:y,z:z},
              dx = (v.x - cp.x),
              dy = (v.y - cp.y),
              dz = (v.z - cp.z),
              d  = Math.sqrt(dx * dx + dy * dy + dz * dz),
              zf = ~~(255 * (1 - (d / 150)));

          if(zf < 0) zf = 0;

          // generate a color based on the particle's position
          v.c = {r: 255-zf, g: zf, b: zf, a: 240};
          v.c.l = (v.c.r | (v.c.g << 8) | (v.c.b << 16) | (v.c.a << 24));

          points.push(v);
        }
      }
    }
  }
  
  var f1 = gui.addFolder('View'),
      f2 = gui.addFolder('Particle placement');
  
  f1.add(settings, 'viewDistance', -200, 600).step(10).name("Distance").listen().onChange(function() {
    if(settings.viewDistance === 0) settings.viewDistance = -1;
  });
  
  f2.add(settings, 'offsetFromCenter', 100, 400).step(10).name("Offset from origin").onChange(generateParticles);
  f2.add(settings, 'margin', 5, 40).step(5).name("Margin between").onChange(generateParticles);
  f1.open();
  f2.open();
  
  gui.close();
  
  stats.setMode(0); // FPS mode

  // Place the statistics at the bottom right.
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.right = '5px';
  stats.domElement.style.bottom = '5px';
  document.body.appendChild(stats.domElement);
  
  resize = function() {
    // resize the canvas
    canvas.width  = width  = window.innerWidth;
    canvas.height = height = window.innerHeight;
  }; resize();

  window.addEventListener('resize', resize);
  
  window.addEventListener('mousewheel', function(event) {
    if(event.wheelDeltaY < 0 || event.deltaY > 0) {
      settings.viewDistance += 10;
    } else {
      settings.viewDistance -= 10;
    }
    
    if(settings.viewDistance == 0)   settings.viewDistance = -1;
    if(settings.viewDistance < -200) settings.viewDistance = -200;
    if(settings.viewDistance > 600)  settings.viewDistance = 600;
    
    return event.preventDefault();
  });
  
  // generate cube
  for(var y = -limit; y < limit; y += step) {
    for(var x = -limit; x < limit; x += step) {
      for(var z = -limit; z < limit; z += step) {
        var v  = {x:x,y:y,z:z}, 
            dx = (v.x - cp.x), dy = (v.y - cp.y), dz = (v.z - cp.z),
            d  = Math.sqrt(dx * dx + dy * dy + dz * dz),
            zf = ~~(255 * (1 - (d / 150)));

        if(zf < 0) zf = 0;

        // generate a color based on the particle's position
        v.c = {r: 255-zf, g: zf, b: zf, a: 240};
        v.c.l = (v.c.r | (v.c.g << 8) | (v.c.b << 16) | (v.c.a << 24));

        points.push(v);
      }
    }
  }
  
  var fsin = Math.sin, fcos = Math.cos,
      rotateY = 0.005, rotateX = 0.003, rotateZ = -0.001, // rotate
      cosy = fcos(rotateY), siny = fsin(rotateY),
      cosx = fcos(rotateX), sinx = fsin(rotateX),
      cosz = fcos(rotateZ), sinz = fsin(rotateZ);
  
  var i, c, d, dd, d32, cx, cy, cos, sin, x, y, scale, cpx, cpy, cps,
      px, py, sy, sx, lx, ly, sl;
  
  +(function render() {
    stats.begin();

    context.fillStyle = 'rgba(0, 0, 0, 0.6)';
    context.fillRect(0, 0, width, height);

    d = context.getImageData(0, 0, width, height);
    dd = d.data;
    d32 = new Uint32Array(dd.buffer); // create a 32-bit view for faster access
    cx = width / 2;
    cy = height / 2;
    
    // further behind should be rendered first.
    points.sort(function(a, b) {
      return ((300 / ((a.z + settings.viewDistance) || 1)) - (300 / ((b.z + settings.viewDistance) || 1)));
    })
    
    for(i = 0; i < points.length; i += 1) {
      c = points[i];

      // calculate the cos and sin beforehand!
      x = c.x, z = c.z, c.x = (x * cosy + z * siny), c.z = (x * -siny + z * cosy); // rotate y
      z = c.z, y = c.y, c.y = (y * cosx + z * sinx), c.z = (y * -sinx + z * cosx); // rotate x
      x = c.x, y = c.y, c.y = (y * cosz + x * sinz), c.x = (y * -sinz + x * cosz); // rotate z
      scale = (300 / ((c.z + settings.viewDistance) || 1)), cpx = ~~(cx + c.x * scale), cpy = ~~(cy + c.y * scale), cps = scale;
      sl = (2 * cps);
      sy = cpy, sx = cpx, ly = ~~(sy + sl), lx = ~~(sx + sl);
      
      if(sl > 0 && sl < 1000 && cpx >= -sl && cpy >= -sl && cpx < width && cpy < height) {
        if(ly !== 0 && lx !== 0) {
          for(py = sy; py < ly; py += 1) {
            for(px = sx; px < lx; px += 1) {
              if(px >= 0 && py >= 0 && px < width && py < height) {
                d32[(py * width + px)] = c.c.l;
              }
            }
          }
        }
      }
    }

    context.putImageData(d, 0, 0);
    stats.end();
    
    // for some reason, if I don't do this, GC doesn't come along and clean my stuff up...
    // thus: memory leak, at 2.5g Chrome tells my tab to commit suicide.
    // Google search: Google Chrome putImageData memory leak
    // many results.
    d = dd = d32 = null;
    return setTimeout(function(){requestAnimFrame(render);},1);
  }());
});