import { GridWorld, GridState, printRewardsAs2DArray } from './reinforcement/impl/grid-world';
import { Agent } from './reinforcement/base';
import { createRandomPolicy, createValueIterationPolicy } from './reinforcement/impl/policies';

function start() {
    const width = 6;
    const height = 6;
    const goalState = new GridState({ x: width - 1, y: height - 1 });
    const gridWorld = new GridWorld(width, height, goalState);
    printRewardsAs2DArray(gridWorld);
    const randomPolicy = createRandomPolicy(gridWorld);
    const valueIterationPolicy = createValueIterationPolicy(gridWorld);
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