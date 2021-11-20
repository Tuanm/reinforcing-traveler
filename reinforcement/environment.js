import { NotImplementedError } from './error';

export default class Environment {
    constructor(states, actions) {
        this.states = states || [];
        this.actions = actions || [];
    }

    setStates(states) {
        this.states = states;
    }

    setActions(actions) {
        this.actions = actions;
    }

    response(state, action) {
        throw new NotImplementedError();
    }
};