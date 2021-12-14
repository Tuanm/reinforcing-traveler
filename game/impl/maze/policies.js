import { Policy } from './../../../reinforcement/base';
import { NotImplementedError } from './../../../reinforcement/error';

class StateActionPair {
    constructor(state, action) {
        this.state = state;
        this.action = action;
    }

    equals(other) {
        return this.state === other.state
            && this.action === other.action;
    }
}

class StateActionPairMap extends Map {
    get(stateActionPair) {
        for (const key of super.keys()) {
            if (key.equals(stateActionPair)) {
                return super.get(key);
            }
        }
        return undefined;
    }

    set(stateActionPair, value) {
        for (const key of super.keys()) {
            if (key.equals(stateActionPair)) {
                super.delete(key);
                break;
            }
        }
        super.set(stateActionPair, value);
    }
}

class StateMap extends Map {
    get(state) {
        for (const key of super.keys()) {
            if (key.equals(state)) {
                return super.get(key);
            }
        }
        return undefined;
    }

    set(state, value) {
        for (const key of super.keys()) {
            if (key.equals(state)) {
                super.delete(key);
                break;
            }
        }
        super.set(state, value);
    }
}

class TDPolicy extends Policy {}

class OneStepTD extends TDPolicy {
    constructor(actions, config) {
        super();
        this.actions = actions;
        this.values = new StateMap(); // state -> numeric value
        this.policy = new StateMap(); // state -> action
        this.learningRate = config?.learningRate; // alpha
        this.discountFactor = config?.discountFactor; // gamma
    }

    dicide(state, action, reward) { // return an action
        // TODO: Implement TD(0)
        const nextAction = this.policy.get(state);
        if (!nextAction) { // choose random action
            return this.actions[[Math.floor(Math.random() * this.actions.length)]]
        }
        return nextAction;
    }
}

class SARSAPolicy extends TDPolicy {}

class QLearningPolicy extends TDPolicy {}


export {
    OneStepTD,
    SARSAPolicy,
    QLearningPolicy
};