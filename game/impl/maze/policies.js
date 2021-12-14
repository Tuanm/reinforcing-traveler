import { Policy } from './../../../reinforcement/base';
import { NotImplementedError, UnknownValueError } from './../../../reinforcement/error';
import { MazeAction, MazeState } from './environment';

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
            if (key?.equals(stateActionPair)) {
                return super.get(key);
            }
        }
        return undefined;
    }

    set(stateActionPair, value) {
        for (const key of super.keys()) {
            if (key?.equals(stateActionPair)) {
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
            if (key?.equals(state)) {
                return super.get(key);
            }
        }
        return undefined;
    }

    set(state, value) {
        for (const key of super.keys()) {
            if (key?.equals(state)) {
                super.delete(key);
                break;
            }
        }
        super.set(state, value);
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
    }
}

class OneStepTDPolicy extends TDPolicy {
    constructor(actions, config) {
        super(actions, config);
        this.values = new StateMap(); // state -> numeric value
        this.policy = new StateMap(); // state -> action
    }

    // return an action
    takeActionByPolicy(nextState) {
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

        let maxValue = -Infinity;
        let nextNextState;
        let nextAction;
        possibleWays.forEach(way => {
            const state = way?.state;
            const action = way?.action;
            const value = this.values.get(state);
            if (value > maxValue) {
                maxValue = value;
                nextNextState = state;
                nextAction = action;
            }
        });

        if (this.greedyRate != undefined && Math.random() < this.greedyRate) {
            return this.actions[[Math.floor(Math.random() * this.actions.length)]]
        }
        return nextAction;
    }

    dicide(state, action, reward, nextState) { // return an action
        let tdError = reward + (
            this.config?.discountFactor * this.values.get(nextState) - this.values.get(state)
        );
        this.values.set(state, this.values.get(state) + this.config?.learningRate * tdError);
        return this.takeActionByPolicy(nextState);
    }
}

class SARSAPolicy extends TDPolicy {}

class QLearningPolicy extends TDPolicy {}


export {
    OneStepTDPolicy,
    SARSAPolicy,
    QLearningPolicy
};