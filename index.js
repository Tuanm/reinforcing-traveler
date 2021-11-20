import { GridWorld, GridState, NaivePolicy } from './reinforcement/impl/grid-world';
import { Agent } from './reinforcement/base';

function start() {
    const width = 4;
    const height = 4;
    const goalState = new GridState({ x: 3, y: 3 });
    const gridWorld = new GridWorld(width, height, goalState);
    const policy = new NaivePolicy(gridWorld.actions);
    const initialState = new GridState({ x: 0, y: 0 });
    const episodes = 1000;
    let bestResult = null;
    for (let i = 0; i < episodes; i++) {
        const agent = new Agent(gridWorld, policy, initialState);
        const result = agent.run(goalState);
        if (bestResult === null || result.totalReward > bestResult.totalReward) {
            bestResult = result;
        }
    }
    console.log(bestResult);
}

start();