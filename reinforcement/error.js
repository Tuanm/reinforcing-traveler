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
}

class TerminalStateError extends Error {
    constructor(reward, message) {
        super(message);
        this.reward = reward;
    }
}

export {
    NotImplementedError,
    UnknownValueError,
    TerminalStateError
};