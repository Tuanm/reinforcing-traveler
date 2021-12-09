import { Policy } from './../../../reinforcement/base';
import { NotImplementedError } from './../../../reinforcement/error';

// TODO: Implement Monte-Carlo methods

class MonteCarloPolicy extends Policy {}

class MonteCarloPredictionPolicy extends MonteCarloPolicy {
    constructor() {
        super();
        this.experiences = [];
    }
}

class FirstVisitMonteCarloPredictionPolicy extends MonteCarloPredictionPolicy {
    constructor() {
        super();
        this.returnsMap = new Map(); // contains returns following the first occurance of each state s
    }

    addReturn(newReturn, state, action) {
        throw new NotImplementedError(this.addReturn);
    }

    getAverageReturn(state, action) {
        throw new NotImplementedError(this.getAverageReturn);
    }
}

class StateValueFirstVisitMonteCarloPredictionPolicy extends FirstVisitMonteCarloPredictionPolicy {
    constructor() {
        super();
    }

    addReturn(newReturn, state, action) {
        let returns = this.returnsMap.get(state);
        if (!returns) returns = [];
        returns.push(newReturn);
        this.returnsMap.set(state, returns);
    }

    getAverageReturn(state, action) {
        let returns = this.returnsMap.get(state);
        if (!returns) return 0;
        return returns.reduce((prev, curr) => prev + curr);
    }

    improve(config) {
        throw new NotImplementedError(this.improve);
    }

    dicide(state, action, reward) {
        if (this.dicision) return this.dicision(state, action, reward);
        throw new NotImplementedError(this.dicide);
    }

    save(config) {
        throw new NotImplementedError(this.save);
    }
}

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

class StateActionPairMap extends WeakMap {
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

class StateActionValueFirstVisitMonteCarloPredictionPolicy extends FirstVisitMonteCarloPredictionPolicy {
    constructor() {
        super();
        this.returnsMap = new StateActionPairMap();
    }

    addReturn(newReturn, state, action) {
        const stateActionPair = new StateActionPair(state, action);
        let returns = this.returnsMap.get(stateActionPair);
        if (!returns) returns = [];
        returns.push(newReturn);
        this.returnsMap.set(stateActionPair, returns);
    }

    getAverageReturn(state, action) {
        const stateActionPair = new StateActionPair(state, action);
        let returns = this.returnsMap.get(stateActionPair);
        if (!returns) return 0;
        return returns.reduce((prev, curr) => prev + curr);
    }

    improve(config) {
        throw new NotImplementedError(this.improve);
    }

    dicide(state, action, reward) {
        if (this.dicision) return this.dicision(state, action, reward);
        throw new NotImplementedError(this.dicide);
    }

    save(config) {
        throw new NotImplementedError(this.save);
    }
}

class EveryVisitMonteCarloPredictionPolicy extends MonteCarloPredictionPolicy {}

export {
    MonteCarloPolicy
};