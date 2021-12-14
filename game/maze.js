import { Agent } from './../reinforcement/base';
import { Maze, MazeState } from './impl/maze/environment';
import { OneStepTDPolicy } from './impl/maze/policies';
import fs from 'fs';

export function start(file) {
    if (!file) {
        file = 'data/maze.txt'; // default
    }
    const text = fs.readFileSync(file, 'utf-8');
    const maze = new Maze(text);
    const agent = new Agent(maze, new MazeState(0, 0));
    const oneStepTDPolicy = new OneStepTDPolicy(maze.actions, {
        learningRate: 0.5,
        discountFactor: 0.9,
        greedyRate: 0.1
    });
    agent.follow(oneStepTDPolicy);
    const result = agent.run();
    console.log(result);
};