'use strict';

exports.done = false;
const b = require('./12-cjs-b.cjs');
exports.bDoneWhileAInit = b.done;
exports.done = true;
