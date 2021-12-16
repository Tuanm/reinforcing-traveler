import express from 'express';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import { getGameInfo } from './maze';


const history = [];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function setSocketServer(server) {
    const socketServer = new Server(server);
    socketServer.on('connection', (socket) => {

        const id = socket.id;
        const game = getGameInfo();
        const environment = game.environment.instance;
        const agent = game.agent;
        
        let isRunning = false; // for checking if game has been started or not
        let stopForced = false; // for checking if game has been stopped or not

        socket.on('disconnect', (data) => {
            history.push({
                time: +new Date(),
                id: id,
                data: data
            });
            console.log(`${id} disconnected.`);
        });

        socket.on('fetch-history', () => {
            socket.emit('history-fetched', history);
        });

        socket.on('fetch-game', (file) => {
            socket.emit('game-fetched', game); // Fetch game's information.
        });

        socket.on('start-game', async (settings) => {
            if (isRunning) return;
            console.log('game started');
            isRunning = true;
            console.log(settings);
            const policy = game.policies[settings.policyNumber];
            policy.learningRate = settings.learningRate;
            policy.discountFactor = settings.discountFactor;
            policy.explorationRate = settings.explorationRate;
            agent.setLimit(settings.maxSteps);
            agent.follow(policy);
            agent.reset(environment.getRandomState());
            const result = await agent.run(undefined, async (gameStep) => {
                socket.emit('game-step-fetched', {
                    gameStep: gameStep,
                    policyValues: policy.getValues()
                });
                await sleep(settings.stepSpeed);
                if (socket.disconnected) {
                    throw new Error('socket disconnected');
                }
                if (stopForced) {
                    stopForced = false;
                    throw new Error('game stopped');
                }
            });
            const finalGameStepInfo = {
                gameStep: {
                    state: result.states[result.states.length - 1],
                    action: result.actions[result.actions.length - 1],
                    reward: result.rewards[result.rewards.length - 1],
                    totalReward: result.totalReward
                },
                policyValues: policy.getValues(),
                gameFinished: true
            };
            socket.emit('game-step-fetched', finalGameStepInfo);
            game.policies[settings.policyNumber] = policy; // update policy
            isRunning = false;
            console.log('game finished');
        });

        socket.on('stop-game', () => {
            if (!stopForced) stopForced = true;
        });

        socket.emit('connected');
        console.log(`${id} connected.`);
    });
}

export function getRouter() {
    const router = express.Router();

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const __staticPath = path.join(__dirname + '/../../public/maze/');
    router.use('/', express.static(__staticPath));

    router.get('/', (req, res) => {
        res.sendFile('index.html');
    });

    router.get('/base.js', (req, res) => {
        res.sendFile(__dirname + '/../../reinforcement/base.js');
    });

    return router;
}

