import { Agent } from './../reinforcement/base';
import { Maze } from './impl/maze/environment';
import { SARSAPolicy, QLearningPolicy } from './impl/maze/policies';
import fs from 'fs';


export function getGameInfo(text) {
    if (!text) {
        text = fs.readFileSync('data/maze.txt', 'utf-8'); // default
    }
    const maze = new Maze(text);
    const agent = new Agent(maze);
    const policyConfig = {
        learningRate: 0.5,
        discountFactor: 0.7,
        explorationRate: 0.1
    };
    const sarsaPolicy = new SARSAPolicy(maze.actions, policyConfig); // SARSA
    const qlearningPolicy = new QLearningPolicy(maze.actions, policyConfig); // Q-learning

    return {
        agent: agent,
        policyConfig: policyConfig,
        policies: [sarsaPolicy, qlearningPolicy],
        environment: {
            instance: maze,
            states: maze.states
        }
    };
}