'use strict';

const bunyan = require('bunyan');
const logger = bunyan.createLogger({name: "bw-image-app"});

module.exports = logger;