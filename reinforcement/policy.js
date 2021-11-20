import { NotImplementedError } from './error';

export default class Policy {
    constructor(dicision) {
        this.dicision = dicision;
    }

    setDicision(dicision) {
        this.dicision = dicision;
    }

    dicide(state, action) {
        if (this.dicision) return this.dicision(state, action);
        throw new NotImplementedError();
    }
};