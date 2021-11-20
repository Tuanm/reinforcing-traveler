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
        return reward;
    }

    next(action, reward) {
        return this.policy.dicide(this.state, action, reward);
    }

    reset(initialState) {
        this.state = initialState;
        this.totalReward = 0;
    }

    setLimit(limit) {
        this.limit = limit;
    }

    run(goalState, logger) {
        const actions = [];
        let action = this.next();
        let step = 0;
        while (true) {
            const reward = this.act(action);
            this.totalReward += reward;
            if (logger) logger({
                step: step,
                action: action,
                state: this.state,
                reward: reward,
                totalReward: this.totalReward
            });
            actions.push(action);
            if (this.state.equals(goalState)) break;
            action = this.next(action, reward);
            step++;
            if (this.limit && step >= this.limit) break;
        }
        return {
            actions: actions,
            totalReward: this.totalReward
        };
    }
};