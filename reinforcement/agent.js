export default class Agent {
    constructor(environment, policy, initialState) {
        this.environment = environment;
        this.policy = policy;
        this.state = initialState;
        this.totalReward = 0;
    }

    act(action) {
        const response = this.environment.response(this.state, action);
        this.state = response.nextState;
        const reward = response.reward;
        this.totalReward += reward;
    }

    nextAction(action) {
        return this.policy.dicide(this.state, action);
    }

    reset(initialState) {
        this.state = initialState;
        this.totalReward = 0;
    }

    run(goalState, logger) {
        const actions = [];
        while (true) {
            const action = this.nextAction();
            this.act(action);
            if (logger) logger(this);
            actions.push(action);
            if (this.state.equals(goalState)) break;
        }
        return {
            actions: actions,
            totalReward: this.totalReward
        };
    }
};