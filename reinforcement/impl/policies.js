import { Policy } from '../base';
import { GridWorld, GridState } from './grid-world';

const createRandomDicision = (gridWorld) => (state, action, reward) => {
    const possibleActions = gridWorld.actions.filter(action => true); // copy
    if (state.value.x === 0) possibleActions.splice(possibleActions.indexOf(GridWorld.UP), 1);
    if (state.value.x === gridWorld.height - 1) possibleActions.splice(possibleActions.indexOf(GridWorld.DOWN), 1);
    if (state.value.y === 0) possibleActions.splice(possibleActions.indexOf(GridWorld.LEFT), 1);
    if (state.value.y === gridWorld.width - 1) possibleActions.splice(possibleActions.indexOf(GridWorld.RIGHT), 1);
    return possibleActions[Math.floor(Math.random() * possibleActions.length)];
};

class RandomPolicy extends Policy {
    constructor(gridWorld) {
        super(createRandomDicision(gridWorld));
    }
}

class ValueIterationPolicy extends Policy {
    constructor(gridWorld, gamma) {
        super();
        const initializeValues = () => {
            const values = [];
            for (let x = 0; x < gridWorld.height; x++) {
                values[x] = [];
                for (let y = 0; y < gridWorld.width; y++) {
                    values[x][y] = 0;
                }
            }
            return values;
        };
        this.update({
            gamma: gamma,
            values: initializeValues()
        });
        const randomDicision = createRandomDicision(gridWorld);
        this.setDicision((state, action, reward) => {
            if (reward) {
                const values = policy.config.values;
                const lastValue = values[state.value.x][state.value.y];
                const newValue = reward + policy.config.gamma * lastValue;
                values[state.value.x][state.value.y] = newValue;
                const possibleStates = [];
                if (state.value.x > 0) possibleStates.push(new GridState({
                    x: state.value.x - 1, y: state.value.y
                }));
                if (state.value.x < height - 1) possibleStates.push(new GridState({
                    x: state.value.x + 1, y: state.value.y
                }));
                if (state.value.y > 0) possibleStates.push(new GridState({
                    x: state.value.x, y: state.value.y - 1
                }));
                if (state.value.y < width - 1) possibleStates.push(new GridState({
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
            return randomDicision(state, action, reward);
        });
    }
}

export {
    RandomPolicy,
    ValueIterationPolicy
};