import { Agent } from './../reinforcement/base';
import { Maze, MazeState } from './impl/maze/environment';
import { OneStepTDPolicy, SARSAPolicy } from './impl/maze/policies';
import fs from 'fs';

export function start(file) {
    if (!file) {
        file = 'data/maze.txt'; // default
    }
    const text = fs.readFileSync(file, 'utf-8');
    const maze = new Maze(text);
    const agent = new Agent(maze);
    const oneStepTDPolicy = new OneStepTDPolicy(maze.actions, {
        learningRate: 1,
        discountFactor: 0.8,
        greedyRate: 0.2
    });
    const sarsaPolicy = new SARSAPolicy(maze.actions, {
        learningRate: 0.5,
        discountFactor: 0.7,
        greedyRate: 0.2
    });
    agent.follow(sarsaPolicy);
    agent.setLimit(100);
    for (let episode = 0; episode < 1000; episode++) {
        agent.reset(new MazeState(1, 1));
        const result = agent.run();
        console.log(result);
    }
    console.log(maze.text);
};