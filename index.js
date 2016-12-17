const gpio = require('rpi-gpio');
const LedLayout = require('./ledLayout.js');

const leds = new LedLayout(gpio, 5000, {
  success: 32,
  warn: 38,
  progress: [37, 35, 33, 31, 29],
}, () => leds.unexport());
