require('dotenv').config();
require('./src/mq/index').initMq();

const port = process.env.PORT || (process.argv[2] || 4000);
const env = process.env.NODE_ENV || 'development';
const app = module.exports = require('./src/app');

if (!module.parent) { app.listen(port); }
