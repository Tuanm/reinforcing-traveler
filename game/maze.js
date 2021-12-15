import { Agent } from './../reinforcement/base';
import { Maze, MazeState } from './impl/maze/environment';
import { SARSAPolicy, QLearningPolicy } from './impl/maze/policies';
import fs from 'fs';

export async function start(file) {
    if (!file) {
        file = 'data/maze.txt'; // default
    }
    const text = fs.readFileSync(file, 'utf-8');
    const maze = new Maze(text);
    const agent = new Agent(maze);
    const policyConfig = {
        learningRate: 0.5,
        discountFactor: 0.7
    };
    const sarsaPolicy = new SARSAPolicy(maze.actions, policyConfig); // SARSA
    const qlearningPolicy = new QLearningPolicy(maze.actions, policyConfig); // Q-learning

    const policy = qlearningPolicy;
    agent.follow(policy);
    agent.setLimit(200);
    const initialState = new MazeState(1, 1, '-');
    const episodes = 1000 * 2;

    policy.explorationRate = 1; // exploration only
    for (let episode = 0; episode < episodes; episode++) {
        agent.reset(maze.getRandomState());
        await agent.run().then(res => console.log(res.totalReward));
    }

    policy.explorationRate = 0.3; // epsilon-greedy
    for (let episode = 0; episode < episodes; episode++) {
        agent.reset(maze.getRandomState());
        await agent.run().then(res => console.log(res.totalReward));
    }

    policy.explorationRate = 0; // just follow policy
    agent.reset(initialState);
    await agent.run().then(console.log);
}