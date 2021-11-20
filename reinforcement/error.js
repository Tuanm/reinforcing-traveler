class NotImplementedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotImplementedError';
    }
}

class UnknownValueError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnknownValueError';
    }
};

export {
    NotImplementedError,
    UnknownValueError
};