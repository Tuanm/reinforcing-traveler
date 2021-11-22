export default class Agent {
    constructor(environment, policy, initialState) {
        this.environment = environment;
        this.reset(initialState);
        this.follow(policy);
    }

    follow(policy) {
        this.policy = policy;
    }

    act(action) {
        const response = this.environment.response(this.state, action);
        this.state = response.nextState;
        return response.reward;
    }

    getNextAction(action, reward) {
        return this.policy.dicide(this.state, action, reward);
    }

    reset(initialState) {
        this.state = initialState;
        this.totalReward = 0;
    }

    setLimit(limit) {
        this.limit = limit;
    }

    run(goalState, log) {
        const actions = [];
        let action = this.getNextAction();
        let step = 0;
        while (true) {
            const reward = this.act(action);
            this.totalReward += reward;
            if (log) log({
                step: step,
                action: action,
                state: this.state,
                reward: reward,
                totalReward: this.totalReward
            });
            actions.push(action);
            if (this.state.equals(goalState)) break;
            action = this.getNextAction(action, reward);
            step++;
            if (this.limit && step >= this.limit) break;
        }
        return {
            actions: actions,
            totalReward: this.totalReward
        };
    }
};