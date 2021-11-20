import { Agent } from './reinforcement/base';
import { GridWorld, GridState } from './reinforcement/impl/grid-world';
import { RandomPolicy, ValueIterationPolicy } from './reinforcement/impl/policies';

function start() {
    const width = 6;
    const height = 6;
    const goalState = new GridState({ x: width - 1, y: height - 1 });
    const gridWorld = new GridWorld(width, height, goalState);
    const randomPolicy = new RandomPolicy(gridWorld);
    const valueIterationPolicy = new ValueIterationPolicy(gridWorld, 0.9);
    const initialState = new GridState({ x: 0, y: 0 });
    const agent = new Agent(gridWorld, randomPolicy, initialState);
    agent.setLimit(50);
    const episodes = 5000;
    let bestResult = null;
    for (let episode = 0; episode < episodes; episode++) {
        agent.reset(initialState);
        const result = agent.run(goalState);
        if (bestResult === null || result.totalReward > bestResult.totalReward) {
            bestResult = result;
        }
    }
    console.log(initialState);
    console.log(goalState);
    console.log(bestResult);
}

start();