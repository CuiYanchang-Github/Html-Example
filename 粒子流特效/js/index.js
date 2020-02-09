'use strict';

const particleCount = 500;
const particlePropCount = 10;
const particlePropsLength = particleCount * particlePropCount;
const rangeY = 100;
const rangeZ = 100;
const baseTTL = 50;
const rangeTTL = 200;
const baseHue = rand(360);
const rangeHue = 100;
const xOff = 0.0005;
const yOff = 0.0015;
const zOff = 0.0005;
const tOff = 0.0015;
const backgroundColor = `hsla(${baseHue},10%,5%,1)`;
const backdropColor = 'hsla(0,0%,0%,1)';

let container;
let canvas;
let ctx;
let center;
let tick;
let simplex;
let particleProps;
let vMin;
let backdropSize;

function setup() {
  createCanvas();
  resize();
  initParticles();
  draw();
}

function initParticles() {
  tick = 0;
  simplex = new SimplexNoise();
  particleProps = new Float32Array(particlePropsLength);

  let i;

  for (i = 0; i < particlePropsLength; i += particlePropCount) {
    initParticle(i);
  }
}

function initParticle(i) {
  let t, x, y, z, vx, vy, vz, life, ttl, speed, hue;

  t = rand(TAU);
  x = center[0] + randRange(0.5 * backdropSize) * cos(t);
  y = center[1] + randRange(0.5 * backdropSize) * sin(t);
  z = rand(rangeZ);
  vx = 0;
  vy = 0;
  vz = 0;
  life = 0;
  ttl = baseTTL + rand(rangeTTL);
  speed = 0;
  hue = baseHue + rand(rangeHue);

  particleProps.set([x, y, z, vx, vy, vz, life, ttl, speed, hue], i);
}

function drawParticles() {
  let i;

  for (i = 0; i < particlePropsLength; i += particlePropCount) {
    updateParticle(i);
  }
}

function updateParticle(i) {
  let i2 = 1 + i,i3 = 2 + i,i4 = 3 + i,i5 = 4 + i,i6 = 5 + i,i7 = 6 + i,i8 = 7 + i,i9 = 8 + i;
  let n, theta, phi, x, y, z, vx, vy, vz, life, ttl, speed, x2, y2, z2, size, hue;

  x = particleProps[i];
  y = particleProps[i2];
  z = particleProps[i3];
  n = simplex.noise4D(x * xOff, y * yOff, z * zOff, tick * tOff);
  theta = n * TAU;
  phi = (1 - n) * TAU;
  vx = lerp(particleProps[i4], cos(theta) * cos(phi), 0.05);
  vy = lerp(particleProps[i5], sin(phi), 0.05);
  vz = lerp(particleProps[i6], sin(theta) * cos(phi), 0.1);
  life = particleProps[i7];
  ttl = particleProps[i8];
  speed = particleProps[i9];
  x2 = x + vx * speed;
  y2 = y + vy * speed;
  z2 = z + vz * speed;
  size = z2 * 0.1;
  speed = lerp(particleProps[i9], size * 0.5, 0.9);
  hue = baseHue + n * rangeHue;

  drawParticle(x, y, z, life, ttl, size, n, hue);

  life++;

  particleProps[i] = x2;
  particleProps[i2] = y2;
  particleProps[i3] = z2;
  particleProps[i4] = vx;
  particleProps[i5] = vy;
  particleProps[i7] = life;
  particleProps[i9] = speed;

  (checkBounds(x, y) || life > ttl) && initParticle(i);
}

function drawParticle(x, y, z, life, ttl, size, n, hue) {
  ctx.a.save();
  ctx.a.translate(x, y);
  ctx.a.rotate(n * TAU);
  ctx.a.translate(-x, -y);
  ctx.a.strokeStyle = `hsla(${hue + clamp(z, 0, 180)},${clamp(z, 10, 100)}%,${clamp(z, 20, 60)}%,${fadeInOut(life, ttl)})`;
  ctx.a.strokeRect(x, y, size, size);
  ctx.a.restore();
}

function checkBounds(x, y) {
  return (
    x > canvas.a.width ||
    x < 0 ||
    y > canvas.a.height ||
    y < 0);

}

function createCanvas() {
  canvas = {
    a: document.createElement('canvas'),
    b: document.createElement('canvas') };

  canvas.b.style = `
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	`;
  canvas.a.width = canvas.b.width = 500;
  canvas.a.height = canvas.b.height = 500;
  document.body.appendChild(canvas.b);
  ctx = {
    a: canvas.a.getContext('2d'),
    b: canvas.b.getContext('2d') };

  center = [];
}

function resize() {
  const { innerWidth, innerHeight } = window;

  backdropSize = vmin(40);

  canvas.a.width = innerWidth;
  canvas.a.height = innerHeight;

  ctx.a.drawImage(canvas.b, 0, 0);

  canvas.b.width = innerWidth;
  canvas.b.height = innerHeight;

  ctx.b.drawImage(canvas.a, 0, 0);

  center[0] = 0.5 * canvas.a.width;
  center[1] = 0.5 * canvas.a.height;
}

function renderGlow() {
  ctx.b.save();
  ctx.b.filter = 'blur(8px) brightness(200%)';
  ctx.b.globalCompositeOperation = 'lighter';
  ctx.b.drawImage(canvas.a, 0, 0);
  ctx.b.restore();

  ctx.b.save();
  ctx.b.filter = 'blur(4px) brightness(200%)';
  ctx.b.globalCompositeOperation = 'lighter';
  ctx.b.drawImage(canvas.a, 0, 0);
  ctx.b.restore();
}

function renderToScreen() {
  ctx.b.save();
  ctx.b.globalCompositeOperation = 'lighter';
  ctx.b.drawImage(canvas.a, 0, 0);
  ctx.b.restore();
}

function drawBackground() {
  ctx.a.clearRect(0, 0, canvas.a.width, canvas.a.height);

  ctx.b.save();
  ctx.b.fillStyle = backgroundColor;
  ctx.b.fillRect(0, 0, canvas.a.width, canvas.a.height);
  ctx.b.restore();

  ctx.b.save();
  ctx.b.shadowBlur = 20;
  ctx.b.shadowColor = 'rgba(200,200,200,0.25)';
  ctx.b.fillStyle = backdropColor;
  ctx.b.translate(center[0], center[1]);
  ctx.b.rotate(0.25 * PI);
  ctx.b.fillRect(-0.5 * backdropSize, -0.5 * backdropSize, backdropSize, backdropSize);
  ctx.b.restore();
}

function draw() {
  tick++;

  drawBackground();
  drawParticles();
  renderGlow();
  renderToScreen();

  window.requestAnimationFrame(draw);
}

window.addEventListener('load', setup);
window.addEventListener("resize", resize);