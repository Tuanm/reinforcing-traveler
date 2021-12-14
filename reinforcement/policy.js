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

    improve(config) {
        throw new NotImplementedError(this.improve);
    }

    dicide(state, action, reward, nextState) {
        if (this.dicision) return this.dicision(state, action, reward, nextState);
        throw new NotImplementedError(this.dicide);
    }

    save(config) {
        throw new NotImplementedError(this.save);
    }
}