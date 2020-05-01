const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const dotenv = require('dotenv');
const app = express();
const port = 3001;
dotenv.config();

app.use(cors()); //origin: 'http://meuendereco.com'
app.use(express.json());
app.use(routes);

console.log(`Server running ${port}`);

app.listen(port);