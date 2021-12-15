import { Agent } from './../reinforcement/base';
import { Maze, MazeState } from './impl/maze/environment';
import { OneStepTDPolicy, SARSAPolicy, QLearningPolicy } from './impl/maze/policies';
import fs from 'fs';

export async function start(file) {
    if (!file) {
        file = 'data/maze.txt'; // default
    }
    const text = fs.readFileSync(file, 'utf-8');
    const maze = new Maze(text);
    const agent = new Agent(maze);
    const oneStepTDPolicy = new OneStepTDPolicy(maze.actions, {
        learningRate: 1,
        discountFactor: 0.8,
        explorationRate: 0.2
    });
    const sarsaPolicy = new SARSAPolicy(maze.actions, {
        learningRate: 0.5,
        discountFactor: 0.7,
        explorationRate: 0.2
    });
    const qlearningPolicy = new QLearningPolicy(maze.actions, {
        learningRate: 0.6,
        discountFactor: 0.7
    });
    const policy = qlearningPolicy;
    agent.follow(policy);
    agent.setLimit(500);
    const initialState = new MazeState(1, 1);
    const episodes = 1000;

    policy.explorationRate = 1;
    for (let episode = 0; episode < episodes / 10; episode++) {
        agent.reset(initialState);
        await agent.run().then(res => console.log(res.totalReward));
    }

    policy.explorationRate = 0.3;
    for (let episode = episodes / 10; episode < episodes; episode++) {
        agent.reset(initialState);
        await agent.run().then(res => console.log(res.totalReward));
    }

    policy.explorationRate = 0;
    agent.reset(initialState);
    await agent.run().then(console.log);

    console.log(maze.text);
};