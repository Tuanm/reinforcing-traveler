import { Policy } from './../../../reinforcement/base';
import { NotImplementedError, UnknownValueError } from './../../../reinforcement/error';
import { MazeAction, MazeState } from './environment';
import fs from 'fs';

class StateActionPair {
    constructor(state, action) {
        this.state = state;
        this.action = action;
    }

    equals(other) {
        return this.state === other?.state
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
        let foundKey;
        for (const key of super.keys()) {
            if (key?.equals(stateActionPair)) {
                foundKey = key;
                break;
            }
        }
        if (foundKey !== undefined) super.set(foundKey, value);
        else super.set(stateActionPair, value);
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
        let foundKey;
        for (const key of super.keys()) {
            if (key?.equals(state)) {
                foundKey = key;
                break;
            }
        }
        if (foundKey !== undefined) super.set(foundKey, value);
        else super.set(stateActionPair, value);
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
        this.greedyRate = config?.greedyRate; // epsilon in [0, 1)
        if (this.learningRate === undefined || this.discountFactor === undefined) {
            throw new UnknownValueError(this.config);
        }
        this.setValues(new Map()); // v/q: overriding needed
        this.setPolicy(new StateMap()); // pi: state -> action
        this.visitedStates = new StateSet(); // contains visited states
    }

    setValues(values) {
        this.values = values;
    }

    setPolicy(policy) {
        this.policy = policy;
    }

    initializeValuesOnFirstVisit(state) {
        throw new NotImplementedError(this.initializeValuesOnFirstVisit);
    }

    takeActionByPolicy(nextState) {
        throw new NotImplementedError(this.takeActionByPolicy);
    }

    isValid(nextState) {
        return nextState.description !== MazeState.WALL;
    }

    save(config) {
        fs.writeFileSync(config?.filePath, JSON.stringify(this));
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

    // return an action
    takeActionByPolicy(nextState) {
        if (nextState === undefined || (
            this.greedyRate != undefined && Math.random() < this.greedyRate
        )) {
            return this.actions[Math.floor(Math.random() * this.actions.length)];
        }

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
        return this.takeActionByPolicy(nextState);
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
        if (nextState === undefined || (
            this.greedyRate != undefined && Math.random() < this.greedyRate
        )) {
            return this.actions[Math.floor(Math.random() * this.actions.length)];
        }

        const nextActions = [];
        let maxValue = -Infinity;
        for (const stateActionPair of this.values.keys()) {
            if (stateActionPair.state.equals(nextState)) {
                if (this.values.get(stateActionPair) >= maxValue) {
                    maxValue = this.values.get(stateActionPair);
                    nextActions.push(stateActionPair.action);
                }
            }
        }
        if (nextActions.length === 0) nextActions.push(...this.actions);

        return nextActions[Math.floor(Math.random() * nextActions.length)];
    }

    dicide(state, action, reward, nextState) { // return an action
        const nextAction = this.takeActionByPolicy(nextState);
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

    // return an action
    takeActionByPolicy(nextState) {
        if (nextState === undefined || (
            this.greedyRate != undefined && Math.random() < this.greedyRate
        )) {
            return this.actions[Math.floor(Math.random() * this.actions.length)];
        }

        const nextActions = [];
        let maxValue = -Infinity;
        for (const stateActionPair of this.values.keys()) {
            if (stateActionPair.state.equals(nextState)) {
                if (this.values.get(stateActionPair) >= maxValue) {
                    maxValue = this.values.get(stateActionPair);
                    nextActions.push(stateActionPair.action);
                }
            }
        }
        if (nextActions.length === 0) nextActions.push(...this.actions);

        return nextActions[Math.floor(Math.random() * nextActions.length)];
    }

    dicide(state, action, reward, nextState) { // return an action
        const nextAction = this.takeActionByPolicy(nextState);
        if (state !== undefined && reward !== undefined) {
            if (!this.visitedStates.has(state)) {
                this.initializeValuesOnFirstVisit(state);
            }
            const currentValue = this.values.get(new StateActionPair(state, action));
            let maxValue = this.values.get(new StateActionPair(nextState, nextAction));
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
        return nextAction;
    }
}


export {
    OneStepTDPolicy,
    SARSAPolicy,
    QLearningPolicy
};