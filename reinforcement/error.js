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
    constructor(state, reward, goalReached, message) {
        super(message);
        this.state = state;
        this.reward = reward;
        this.goalReached = goalReached;
    }
}

export {
    NotImplementedError,
    UnknownValueError,
    TerminalStateError
};