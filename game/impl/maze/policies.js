import { Policy } from './../../../reinforcement/base';
import { NotImplementedError, UnknownValueError } from './../../../reinforcement/error';
import { MazeAction, MazeState } from './environment';

class StateActionPair {
    constructor(state, action) {
        this.state = state;
        this.action = action;
    }

    equals(other) {
        return this.state.equals(other?.state)
            && this.action === other?.action;
    }
}

class StateActionPairMap extends Map {
    constructor(defaultValue) {
        super();
        this.setDefault(defaultValue);
    }

    get(stateActionPair) {
        for (const key of super.keys()) {
            if (key?.equals(stateActionPair)) {
                return super.get(key);
            }
        }
        return this.defaultValue;
    }

    set(stateActionPair, value) {
        if (value === undefined) value = this.defaultValue;
        for (const key of super.keys()) {
            if (key?.equals(stateActionPair)) {
                super.set(key, value);
                return;
            }
        }
        super.set(stateActionPair, value);
    }

    setDefault(defaultValue) {
        this.defaultValue = defaultValue;
    }
}

class StateMap extends Map {
    constructor(defaultValue) {
        super();
        this.setDefault(defaultValue);
    }

    get(state) {
        for (const key of super.keys()) {
            if (key?.equals(state)) {
                return super.get(key);
            }
        }
        return this.defaultValue;
    }

    set(state, value) {
        if (value === undefined) value = this.defaultValue;
        for (const key of super.keys()) {
            if (key?.equals(state)) {
                super.set(key, value);
                return;
            }
        }
        super.set(stateActionPair, value);
    }

    setDefault(defaultValue) {
        this.defaultValue = defaultValue;
    }
}

class StateSet extends Set {
    constructor() {
        super();
    }

    add(state) {
        if (!this.has(state)) super.add(state);
    }

    has(state) {
        for (const element of super.values()) {
            if (element?.equals(state)) return true;
        }
        return false;
    }
}

class TDPolicy extends Policy {
    constructor(actions, config) {
        super();
        this.actions = actions;
        this.learningRate = config?.learningRate; // alpha in (0, 1]
        this.discountFactor = config?.discountFactor; // gamma in [0, 1]
        this.explorationRate = config?.explorationRate; // epsilon in [0, 1)
        this.setValues(undefined); // v/q: overriding needed
        this.visitedStates = new StateSet(); // contains visited states
    }

    tryExplore(nextState) { // return an action
        if (nextState === undefined || (
            this.explorationRate != undefined && Math.random() < this.explorationRate
        )) {
            return this.actions[Math.floor(Math.random() * this.actions.length)];
        }
        return undefined; // not explore
    }

    setValues(values) {
        this.values = values;
    }

    getValues() {
        const copiedValues = [];
        for (const entry of this.values.entries()) {
            copiedValues.push(entry);
        }
        return copiedValues;
    }

    initializeValuesOnFirstVisit(state) {
        throw new NotImplementedError(this.initializeValuesOnFirstVisit);
    }

    takeActionByPolicy(nextState) {
        throw new NotImplementedError(this.takeActionByPolicy);
    }

    isValid(nextState) {
        if (nextState === undefined) return false;
        return nextState.description !== MazeState.WALL;
    }
}

class OneStepTDPolicy extends TDPolicy {
    constructor(actions, config) {
        super(actions, config);
        super.setValues(new StateMap(0)); // v: state -> numeric value
    }

    initializeValuesOnFirstVisit(state) {
        this.visitedStates.add(state);
    }

    takeActionByPolicy(nextState) {
        const explorationAction = this.tryExplore(nextState);
        if (explorationAction !== undefined) return explorationAction;

        const possibleWays = [
            {
                state: new MazeState(nextState?.x - 1, nextState?.y),
                action: MazeAction.UP
            },
            {
                state: new MazeState(nextState?.x + 1, nextState?.y),
                action: MazeAction.DOWN
            },
            {
                state: new MazeState(nextState?.x, nextState?.y - 1),
                action: MazeAction.LEFT
            },
            {
                state: new MazeState(nextState?.x, nextState?.y + 1),
                action: MazeAction.RIGHT
            }
        ];

        const nextActions = [];
        let maxValue = -Infinity;
        for (const way of possibleWays) {
            const state = way?.state;
            const action = way?.action;
            const value = this.values.get(state);
            if (value >= maxValue) {
                maxValue = value;
                nextActions.push(action);
            }
        }

        return nextActions[Math.floor(Math.random() * nextActions.length)];
    }

    dicide(state, action, reward, nextState) { // return an action
        if (state !== undefined && reward !== undefined) {
            if (!this.visitedStates.has(state)) {
                this.initializeValuesOnFirstVisit(state);
            }
            const currentStateValue = this.values.get(state);
            const nextStateValue = this.values.get(nextState);
            let tdError = reward + (
                this.discountFactor * nextStateValue - currentStateValue
            );
            this.values.set(state, currentStateValue + this.learningRate * tdError);
        }
        return this.takeActionByPolicy(
            this.isValid(nextState) ? nextState : state
        );
    }
}

class SARSAPolicy extends TDPolicy {
    constructor(actions, config) {
        super(actions, config);
        super.setValues(new StateActionPairMap(0)); // q: (state, action) -> numeric value
    }

    initializeValuesOnFirstVisit(state) {
        this.visitedStates.add(state);
        for (const action of this.actions) {
            this.values.set(new StateActionPair(state, action));
        }
    }

    // return an action
    takeActionByPolicy(nextState) {
        const explorationAction = this.tryExplore(nextState);
        if (explorationAction !== undefined) return explorationAction;

        let maxValue = -Infinity;
        for (const stateActionPair of this.values.keys()) {
            if (stateActionPair.state.equals(nextState)) {
                if (this.values.get(stateActionPair) >= maxValue) {
                    maxValue = this.values.get(stateActionPair);
                }
            }
        }
        const nextActions = [];
        for (const stateActionPair of this.values.keys()) {
            if (stateActionPair.state.equals(nextState)) {
                if (this.values.get(stateActionPair) == maxValue) {
                    nextActions.push(stateActionPair.action);
                }
            }
        }
        if (nextActions.length === 0) nextActions.push(...this.actions);

        return nextActions[Math.floor(Math.random() * nextActions.length)];
    }

    dicide(state, action, reward, nextState) { // return an action
        const nextAction = this.takeActionByPolicy(
            this.isValid(nextState) ? nextState : state
        );
        if (state !== undefined && reward !== undefined) {
            if (!this.visitedStates.has(state)) {
                this.initializeValuesOnFirstVisit(state);
            }
            const currentValue = this.values.get(new StateActionPair(state, action));
            const nextValue = this.values.get(new StateActionPair(nextState, nextAction));
            let tdError = reward + (
                this.discountFactor * nextValue - currentValue
            );
            this.values.set(new StateActionPair(state, action), currentValue + (
                this.learningRate * tdError
            ));
        }
        return nextAction;
    }
}

class QLearningPolicy extends TDPolicy {
    constructor(actions, config) {
        super(actions, config);
        super.setValues(new StateActionPairMap(0)); // q: (state, action) -> numeric value
    }

    initializeValuesOnFirstVisit(state) {
        this.visitedStates.add(state);
        for (const action of this.actions) {
            this.values.set(new StateActionPair(state, action));
        }
    }

    takeActionByPolicy(nextState) {
        const explorationAction = this.tryExplore(nextState);
        if (explorationAction !== undefined) return explorationAction;

        let maxValue = -Infinity;
        for (const stateActionPair of this.values.keys()) {
            if (stateActionPair.state.equals(nextState)) {
                const value = this.values.get(stateActionPair);
                if (value >= maxValue) {
                    maxValue = value;
                }
            }
        }
        const nextActions = [];
        for (const stateActionPair of this.values.keys()) {
            if (stateActionPair.state.equals(nextState)) {
                const value = this.values.get(stateActionPair);
                if (value == maxValue) {
                    nextActions.push(stateActionPair.action);
                }
            }
        }
        if (nextActions.length === 0) nextActions.push(...this.actions);

        return nextActions[Math.floor(Math.random() * nextActions.length)];
    }

    dicide(state, action, reward, nextState) { // return an action
        if (state !== undefined && reward !== undefined) {
            if (!this.visitedStates.has(state)) {
                this.initializeValuesOnFirstVisit(state);
            }
            const currentValue = this.values.get(new StateActionPair(state, action));
            let maxValue = this.values.defaultValue;
            for (const stateActionPair of this.values.keys()) {
                if (stateActionPair.state.equals(nextState)) {
                    if (this.values.get(stateActionPair) >= maxValue) {
                        maxValue = this.values.get(stateActionPair);
                    }
                }
            }
            const nextValue = maxValue;
            let tdError = reward + (
                this.discountFactor * nextValue - currentValue
            );
            this.values.set(new StateActionPair(state, action), currentValue + (
                this.learningRate * tdError
            ));
        }
        return this.takeActionByPolicy(
            this.isValid(nextState) ? nextState : state
        );
    }
}


export {
    OneStepTDPolicy,
    SARSAPolicy,
    QLearningPolicy
};