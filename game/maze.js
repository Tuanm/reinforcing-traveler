import express from 'express';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { Agent } from './../reinforcement/base';
import { Maze } from './impl/maze/environment';
import { SARSAPolicy, QLearningPolicy } from './impl/maze/policies';


const history = [];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getGame(mazeText) {
    if (!mazeText) {
        mazeText = fs.readFileSync('data/maze.txt', 'utf-8'); // default
    }

    const maze = new Maze(mazeText);
    const agent = new Agent(maze);
    const sarsaPolicy = new SARSAPolicy(maze.actions); // SARSA
    const qlearningPolicy = new QLearningPolicy(maze.actions); // Q-learning

    return {
        agent: agent,
        policies: [
            {
                instance: sarsaPolicy,
                title: 'SARSA'
            },
            {
                instance: qlearningPolicy,
                title: 'Q-learning'
            }
        ],
        environment: {
            instance: maze,
            states: maze.states
        }
    };
}

function setSocketServer(httpServer) {
    const socketServer = new Server(httpServer);
    socketServer.on('connection', (socket) => {

        const id = socket.id;

        let game;
        let isRunning = false; // for checking if game has been started or not
        let stopForced = false; // for checking if game has been stopped or not

        socket.on('disconnect', () => {
            console.log(`${id} disconnected.`);
        });

        socket.on('save-history', (data) => {
            history.push({
                time: +new Date(),
                id: id,
                data: data
            });
            socket.emit('history-saved', id);
        })

        socket.on('fetch-history', (historyId) => {
            const result = [];
            history.forEach(each => {
                if (each.id === historyId) result.push(each);
            });
            socket.emit('history-fetched', result);
        });

        socket.on('fetch-game', () => {
            game = getGame();
            socket.emit('game-fetched', game); // Fetch game's information.
        });

        socket.on('change-map', (mazeText) => {
            game = getGame(mazeText);
            socket.emit('map-changed', game); // Change game's information.
        });

        socket.on('start-game', async (settings) => {
            if (isRunning) return;
            console.log('game started');
            isRunning = true;
            console.log(settings);
            const environment = game.environment.instance;
            const agent = game.agent;
            const policy = game.policies[settings.policyNumber].instance;
            policy.learningRate = settings.learningRate;
            policy.discountFactor = settings.discountFactor;
            policy.explorationRate = settings.explorationRate;
            agent.setLimit(settings.maxSteps);
            agent.follow(policy);
            agent.reset(environment.tryGetState(settings?.initialState));
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

function getHttpRouter() {
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

export default {
    setSocketServer,
    getHttpRouter
};