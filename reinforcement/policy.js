import { NotImplementedError } from './error';

export default class Policy {
    constructor(dicision) {
        this.setDicision(dicision);
    }

    setDicision(dicision) {
        this.dicision = dicision;
    }

    update(config) {
        this.config = config;
    }

    dicide(state, action, reward) {
        if (this.dicision) return this.dicision(state, action, reward);
        throw new NotImplementedError(this.dicide);
    }
};