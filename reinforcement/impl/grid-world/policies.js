import { Policy } from '../../base';
import { GridWorld, GridState, GridAction } from './environment';

const createRandomDicision = (gridWorld) => (state, action, reward) => {
    const possibleActions = gridWorld.actions.filter(each => true); // copy
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
    constructor(gridWorld, config) {
        super();
        this.environment = gridWorld;
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
            discount: config.discount,
            values: initializeValues()
        });
        const randomDicision = createRandomDicision(gridWorld);
        this.setDicision((state, action, reward) => {
            if (reward) {
                const values = this.config.values;
                const possibleStates = [];
                if (state.x > 0) possibleStates.push(new GridState(
                    state.x - 1, state.y
                ));
                if (state.x < gridWorld.height - 1) possibleStates.push(new GridState(
                    state.x + 1, state.y
                ));
                if (state.y > 0) possibleStates.push(new GridState(
                    state.x, state.y - 1
                ));
                if (state.y < gridWorld.width - 1) possibleStates.push(new GridState(
                    state.x, state.y + 1
                ));
                const maxValue = Math.max(...possibleStates.map(state => {
                    return values[state.x][state.y];
                }));
                // find state with max value
                const maxStates = possibleStates.filter(state => {
                    return values[state.x][state.y] === maxValue;
                });
                const maxState = maxStates[Math.floor(Math.random() * maxStates.length)];
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

    improve(config) {
        const gridWorld = this.environment;
        const iterations = config.iterations;
        const epsilon = config.epsilon; // instead of using iterations
        const states = gridWorld.states;
        const actions = gridWorld.actions;
        const values = this.config.values;
        let iteration = 0;
        while (true) {
            const lastValues = values;
            for (const state of states) {
                let maxValue = null; // find max action-state value
                for (const action of actions) {
                    for (const nextState of states) {
                        const currentValue = gridWorld.getProbability(state, action, nextState)
                            * values[nextState.x][nextState.y];
                        if (maxValue === null || currentValue > maxValue) {
                            maxValue = currentValue;
                        }
                    }
                }
                // update values by Bellman equation with DP
                const newValue = gridWorld.getReward(state)
                    + this.config.discount * maxValue;
                values[state.x][state.y] = newValue;
            }
            if (iterations !== null && ++iteration === iterations) break;
        }
        // update policy
        this.update({
            gamma: this.config.gamma,
            values: values
        });
        return this;
    }
}

// TODO: Implement stochastic policies

export {
    RandomPolicy,
    ValueIterationPolicy
};