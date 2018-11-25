require('dotenv').config();
const logger = require('./src/utilities/winston');

const port = process.env.PORT || 4000;
const env = process.env.NODE_ENV || 'development';
const app = require('./src/app');

app.listen(port);
logger.info('Started the app, listening on port: ', port);
