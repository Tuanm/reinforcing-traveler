import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import maze from './game/maze';


const app = express();

const __staticPath = path.join(path.dirname(fileURLToPath(import.meta.url)) + '/public/');
app.use('/', express.static(__staticPath));
app.use('/maze', maze.getHttpRouter());

const server = http.createServer(app);
maze.setSocketServer(server);

const port = process.env.PORT || 6969;

server.listen(port, () => {
    console.log(process.pid);
    console.log(`Server listening on port ${port}...`);
});