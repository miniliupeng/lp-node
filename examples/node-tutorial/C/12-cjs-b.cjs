'use strict';

exports.done = false;
const a = require('./12-cjs-a.cjs');
exports.aDoneWhileBInit = a.done;
exports.done = true;
