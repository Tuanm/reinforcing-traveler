export default class SingleValue {
    constructor(value) {
        this.value = value;
    }

    equals(other) {
        return this.value === other.value;
    }
};