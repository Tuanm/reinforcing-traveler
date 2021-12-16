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
                const terminalReward = err?.reward;
                goalReached = err?.goalReached;
                if (terminalReward !== undefined) this.totalReward += terminalReward;
                isTerminated = true;
            }
            const nextState = response?.nextState;
            const reward = response?.reward;
            if (reward !== undefined) this.totalReward += reward;
            try {
                if (log) await log({
                    step: step,
                    state: this.state,
                    action: action,
                    reward: reward,
                    totalReward: this.totalReward
                });
            } catch (err) { // error when running function `log`
                console.log(err?.message);
                break;
            }
            if (isTerminated || nextState?.equals(goalState)) break;
            action = this.getNextAction(action, reward, nextState);
            this.updateState(nextState);
            states.push(this.state);
            step++;
            if (this.limit !== undefined && step >= this.limit) break;
        }
        return {
            actions: actions,
            states: states,
            totalReward: this.totalReward,
            goalReached: goalReached
        };
    }
}