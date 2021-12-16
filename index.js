import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import { setSocketServer, getRouter } from './game/index';


const app = express();

const __staticPath = path.join(path.dirname(fileURLToPath(import.meta.url)) + '/public/');
app.use('/', express.static(__staticPath));
app.use('/maze', getRouter());

const server = http.createServer(app);
setSocketServer(server);

const port = process.env.PORT || 6969;

server.listen(port, () => {
    console.log(`Server listening on port ${port}...`);
});