export default class Agent {
    constructor(environment, policy, initialState) {
        this.environment = environment;
        this.reset(initialState);
        this.follow(policy);
    }

    follow(policy) {
        this.policy = policy;
    }

    getPolicy() {
        return this.policy;
    }

    act(action) {
        return this.environment.response(this.state, action);
    }

    getNextAction(action, reward, nextState) {
        return this.policy.dicide(this.state, action, reward, nextState);
    }

    updateState(nextState) {
        if (this.policy.isValid(nextState)) {
            this.state = nextState;
        }
        return this.state;
    }

    reset(initialState) {
        this.state = initialState;
        this.totalReward = 0;
    }

    setLimit(limit) {
        this.limit = limit; // max steps per episode
    }

    async run(goalState, log) {
        const actions = [];
        const states = [this.state];
        const rewards = [];
        let action = this.getNextAction();
        let step = 0;
        let isTerminated = false;
        let goalReached = false;
        while (true) {
            let response;
            try {
                response = this.act(action); // receive nextState, reward for the action
                actions.push(action);
            } catch (err) { // if enviroment throws a TerminalStateError
                response = {
                    nextState: err?.state,
                    reward: err?.reward
                };
                goalReached = err?.goalReached;
                isTerminated = true;
            }
            const nextState = response?.nextState;
            const reward = response?.reward;
            if (reward !== undefined) {
                rewards.push(reward);
                this.totalReward += reward;
            }
            try {
                if (log) await log({
                    step: step,
                    state: this.state,
                    action: action,
                    reward: reward,
                    responseState: nextState,
                    totalReward: this.totalReward
                });
            } catch (err) { // error when running function `log`
                console.log(err?.message);
                break;
            }
            action = this.getNextAction(action, reward, nextState);
            if (isTerminated || nextState?.equals(goalState)) {
                states.push(this.updateState(nextState));
                break;
            }
            states.push(this.updateState(nextState));
            step++;
            if (this.limit !== undefined && step >= this.limit) break;
        }
        return {
            actions: actions,
            states: states,
            rewards: rewards,
            totalReward: this.totalReward,
            goalReached: goalReached
        };
    }
}