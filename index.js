import { GridWorld, GridState } from './reinforcement/impl/grid-world';
import { Agent, Policy } from './reinforcement/base';

function start() {
    const width = 6;
    const height = 6;
    const goalState = new GridState({ x: 4, y: 4 });
    const gridWorld = new GridWorld(width, height, goalState);
    const naivePolicy = new Policy((state, action) => {
        return gridWorld.actions[Math.floor(Math.random() * gridWorld.actions.length)];
    });
    const valuePolicy = new Policy();
    const initializeValues = (width, height) => {
        const values = [];
        for (let x = 0; x < width; x++) {
            values[x] = [];
            for (let y = 0; y < height; y++) {
                values[x][y] = 0;
            }
        }
        return values;
    };
    valuePolicy.update({
        gamma: 0.9,
        values: initializeValues(width, height)
    });
    valuePolicy.setDicision((state, action, reward) => {
        if (reward) {
            const lastValue = valuePolicy.config.values[state.value.x][state.value.y];
            valuePolicy.config.values[state.value.x][state.value.y]
                = reward + valuePolicy.config.gamma * lastValue;
            const possibleStates = [];
            if (state.value.x > 0) possibleStates.push(new GridState({
                x: state.value.x - 1, y: state.value.y
            }));
            if (state.value.x < width - 1) possibleStates.push(new GridState({
                x: state.value.x + 1, y: state.value.y
            }));
            if (state.value.y > 0) possibleStates.push(new GridState({
                x: state.value.x, y: state.value.y - 1
            }));
            if (state.value.y < height - 1) possibleStates.push(new GridState({
                x: state.value.x, y: state.value.y + 1
            }));
            const maxValue = Math.max(...possibleStates.map(state => {
                return valuePolicy.config.values[state.value.x][state.value.y];
            }));
            // find state with max value
            const maxStates = possibleStates.filter(state => {
                return valuePolicy.config.values[state.value.x][state.value.y] === maxValue;
            });
            const maxState = maxStates[Math.floor(Math.random() * maxStates.length)];
            // choose action for max state
            if (maxState.value.x === state.value.x) {
                if (maxState.value.y > state.value.y) return GridWorld.RIGHT;
                if (maxState.value.y < state.value.y) return GridWorld.LEFT;
            }
            if (maxState.value.y === state.value.y) {
                if (maxState.value.x > state.value.x) return GridWorld.DOWN;
                if (maxState.value.x < state.value.x) return GridWorld.UP;
            }
        }
        return gridWorld.actions[Math.floor(Math.random() * gridWorld.actions.length)];
    });
    const initialState = new GridState({ x: 0, y: 0 });
    const agent = new Agent(gridWorld, naivePolicy, initialState);
    agent.setLimit(50);
    const episodes = 100;
    let bestResult = null;
    for (let episode = 0; episode < episodes; episode++) {
        agent.reset(initialState);
        const result = agent.run(goalState, console.log);
        if (bestResult === null || result.totalReward > bestResult.totalReward) {
            bestResult = result;
        }
    }
    console.log(bestResult);
}

start();