import { Policy } from '../base';
import { GridWorld, GridState, GridAction } from './grid-world';

const createRandomDicision = (gridWorld) => (state, action, reward) => {
    const possibleActions = gridWorld.actions.filter(action => true); // copy
    if (state.x === 0)
        possibleActions.splice(possibleActions.indexOf(GridAction.UP), 1);
    if (state.x === gridWorld.height - 1)
        possibleActions.splice(possibleActions.indexOf(GridAction.DOWN), 1);
    if (state.y === 0)
        possibleActions.splice(possibleActions.indexOf(GridAction.LEFT), 1);
    if (state.y === gridWorld.width - 1)
        possibleActions.splice(possibleActions.indexOf(GridAction.RIGHT), 1);
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
        this.setDicision((state, action, reward) => { // TODO: it doesn't work
            if (reward) {
                const values = policy.config.values;
                const lastValue = values[state.x][state.y];
                const newValue = reward + policy.config.gamma * lastValue;
                values[state.x][state.y] = newValue;
                const possibleStates = [];
                if (state.x > 0) possibleStates.push(new GridState({
                    x: state.x - 1, y: state.y
                }));
                if (state.x < height - 1) possibleStates.push(new GridState({
                    x: state.x + 1, y: state.y
                }));
                if (state.y > 0) possibleStates.push(new GridState({
                    x: state.x, y: state.y - 1
                }));
                if (state.y < width - 1) possibleStates.push(new GridState({
                    x: state.x, y: state.y + 1
                }));
                const maxValue = Math.max(...possibleStates.map(state => {
                    return values[state.x][state.y];
                }));
                // find state with max value
                const maxStates = possibleStates.filter(state => {
                    return values[state.x][state.y] === maxValue;
                });
                const maxState = maxStates[Math.floor(Math.random() * maxStates.length)];
                // update policy
                policy.update({
                    gamma: policy.config.gamma,
                    values: values
                });
                // choose action for max state
                if (maxState.x === state.x) {
                    if (maxState.y > state.y) return GridAction.RIGHT;
                    if (maxState.y < state.y) return GridAction.LEFT;
                }
                if (maxState.y === state.y) {
                    if (maxState.x > state.x) return GridAction.DOWN;
                    if (maxState.x < state.x) return GridAction.UP;
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