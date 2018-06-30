require('dotenv').config();

const port = process.env.PORT || 4000;
const env = process.env.NODE_ENV || 'development';
const app = require('./src/app');

app.listen(port);
