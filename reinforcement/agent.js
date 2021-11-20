export default class Agent {
    constructor(environment, policy, initialState) {
        this.environment = environment;
        this.policy = policy;
        this.state = initialState;
        this.totalReward = 0;
    }

    follow(policy) {
        this.policy = policy;
    }

    act(action) {
        const response = this.environment.response(this.state, action);
        this.state = response.nextState;
        const reward = response.reward;
        this.totalReward += reward;
    }

    next(action) {
        return this.policy.dicide(this.state, action);
    }

    reset(initialState) {
        this.state = initialState;
        this.totalReward = 0;
    }

    run(goalState, logger) {
        const actions = [];
        let action = this.next();
        while (true) {
            this.act(action);
            if (logger) logger(this);
            actions.push(action);
            if (this.state.equals(goalState)) break;
            action = this.next(action);
        }
        return {
            actions: actions,
            totalReward: this.totalReward
        };
    }
};