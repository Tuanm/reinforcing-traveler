import { Agent } from './../reinforcement/base';
import { Maze, MazeState } from './impl/maze/environment';
import { OneStepTDPolicy, SARSAPolicy, QLearningPolicy } from './impl/maze/policies';
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
    const qlearningPolicy = new QLearningPolicy(maze.actions, {
        learningRate: 0.6,
        discountFactor: 0.7,
        greedyRate: 0.1
    });
    agent.follow(qlearningPolicy);
    agent.setLimit(100);
    for (let episode = 0; episode < 50; episode++) {
        agent.reset(new MazeState(1, 1));
        agent.run().then(console.log);
        agent.getPolicy().save({ filePath: `.res/maze/policy${episode}.json` });
    }
    console.log(maze.text);
};