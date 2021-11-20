import { GridWorld, GridState } from './reinforcement/impl/grid-world';
import { Agent, Policy } from './reinforcement/base';

function start() {
    const width = 4;
    const height = 4;
    const goalState = new GridState({ x: 3, y: 3 });
    const gridWorld = new GridWorld(width, height, goalState);
    const naivePolicy = new Policy((state, action) => {
        return gridWorld.actions[Math.floor(Math.random() * gridWorld.actions.length)];
    });
    const initialState = new GridState({ x: 0, y: 0 });
    const agent = new Agent(gridWorld, naivePolicy, initialState);
    const episodes = 1000;
    let bestResult = null;
    for (let i = 0; i < episodes; i++) {
        agent.reset(initialState);
        const result = agent.run(goalState);
        if (bestResult === null || result.totalReward > bestResult.totalReward) {
            bestResult = result;
        }
    }
    console.log(bestResult);
}

start();