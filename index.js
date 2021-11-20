import { Agent } from './reinforcement/base';
import { GridWorld, GridState } from './reinforcement/impl/grid-world';
import { RandomPolicy, ValueIterationPolicy } from './reinforcement/impl/policies';

function start() {
    const width = 6;
    const height = 6;
    const goalState = new GridState(width - 1, height - 1);
    const gridWorld = new GridWorld(width, height, goalState);
    const randomPolicy = new RandomPolicy(gridWorld);
    const valueIterationPolicy = new ValueIterationPolicy(gridWorld, 0.9);
    const initialState = new GridState(0, 0);
    const agent = new Agent(gridWorld, randomPolicy, initialState);
    const episodes = 5000; // number of episodes to run
    agent.setLimit(50); // set the limit of the number of steps
    let bestResult = null;
    for (let episode = 0; episode < episodes; episode++) {
        agent.reset(initialState);
        const result = agent.run(goalState);
        if (bestResult === null || result.totalReward > bestResult.totalReward) {
            bestResult = result;
        }
    }
    console.log(gridWorld.rewards);
    console.log(initialState);
    console.log(goalState);
    console.log(bestResult);
}

start();