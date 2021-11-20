import { NotImplementedError } from './error';

export default class Environment {
    constructor(states, actions, rewards) {
        this.states = states || [];
        this.actions = actions || [];
        this.rewards = rewards;
    }

    setStates(states) {
        this.states = states;
    }

    setActions(actions) {
        this.actions = actions;
    }

    setRewards(rewards) {
        this.rewards = rewards;
    }

    response(state, action) {
        throw new NotImplementedError(this.response);
    }
};