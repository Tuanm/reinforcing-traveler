import { NotImplementedError } from './error';

export default class Policy {
    constructor(actions) {
        this.actions = actions;
    }

    dicide(state, action) {
        throw new NotImplementedError();
    }
};