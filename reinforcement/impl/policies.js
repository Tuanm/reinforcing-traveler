import { GridWorld, GridState } from './grid-world';
import { Policy } from '../base';

const createRandomPolicy = (gridWorld) => {
    return new Policy((state, action) => {
        return gridWorld.actions[Math.floor(Math.random() * gridWorld.actions.length)];
    });
};

const createValueIterationPolicy = (gridWorld, epsilon) => {
    const policy = new Policy();
    const initializeValues = () => {
        const values = [];
        for (let x = 0; x < gridWorld.width; x++) {
            values[x] = [];
            for (let y = 0; y < gridWorld.height; y++) {
                values[x][y] = 0;
            }
        }
        return values;
    };
    policy.update({
        gamma: 0.9,
        values: initializeValues()
    });
    policy.setDicision((state, action, reward) => {
        if (reward) {
            const values = policy.config.values;
            const lastValue = values[state.value.x][state.value.y];
            const newValue = reward + policy.config.gamma * lastValue;
            values[state.value.x][state.value.y] = newValue;
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
                return values[state.value.x][state.value.y];
            }));
            // find state with max value
            const maxStates = possibleStates.filter(state => {
                return values[state.value.x][state.value.y] === maxValue;
            });
            const maxState = maxStates[Math.floor(Math.random() * maxStates.length)];
            // update policy
            policy.update({
                gamma: policy.config.gamma,
                values: values
            });
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
    return policy;
};

export {
    createRandomPolicy,
    createValueIterationPolicy
};