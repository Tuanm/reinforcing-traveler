class NotImplementedError extends Error {
    constructor(source, message) {
        super(message);
        this.source = source;
    }
}

class UnknownValueError extends Error {
    constructor(value, message) {
        super(message);
        this.value = value;
    }
};

export {
    NotImplementedError,
    UnknownValueError
};