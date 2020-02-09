'use strict';

const { PI, cos, sin, tan, abs, sqrt, pow, min, max, ceil, floor, round, random, atan2 } = Math;
const HALF_PI = 0.5 * PI;
const QUART_PI = 0.25 * PI;
const TAU = 2 * PI;
const TO_RAD = PI / 180;
const rand = n => n * random();
const randIn = (min, max) => rand(max - min) + min;
const randRange = n => n - rand(2 * n);
const fadeIn = (t, m) => t / m;
const fadeOut = (t, m) => (m - t) / m;
const fadeInOut = (t, m) => {
	let hm = 0.5 * m;
	return abs((t + hm) % m - hm) / (hm);
};
const dist = (x1, y1, x2, y2) => sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
const angle = (x1, y1, x2, y2) => atan2(y2 - y1, x2 - x1);
const lerp = (n1, n2, speed) => (1 - speed) * n1 + speed * n2;
const vh = v => v * window.innerHeight * 0.01;
const vw = v => v * window.innerWidth * 0.01;
const vmin = v => min(vh(v), vw(v));
const vmax = v => max(vh(v), vw(v));
const clamp = (n, _min, _max) => min(max(n, _min), _max);
