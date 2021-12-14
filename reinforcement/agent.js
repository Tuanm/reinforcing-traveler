export default class Agent {
    constructor(environment, policy, initialState) {
        this.environment = environment;
        this.reset(initialState);
        this.follow(policy);
    }

    follow(policy) {
        this.policy = policy;
    }

    // return { nextState, reward }
    act(action) {
        return this.environment.response(this.state, action);
    }

    // return an action
    getNextAction(action, reward, nextState) {
        return this.policy.dicide(this.state, action, reward, nextState);
    }

    reset(initialState) {
        this.state = initialState;
        this.totalReward = 0;
    }

    // max steps
    setLimit(limit) {
        this.limit = limit;
    }

    run(goalState, log) {
        const actions = [];
        const states = [this.state];
        let action = this.getNextAction();
        let step = 0;
        let isTerminated = false;
        while (true) {
            let response;
            try {
                response = this.act(action)
                actions.push(action);
            } catch (err) { // if enviroment throws a TerminalStateError
                const terminalReward = err?.reward;
                if (terminalReward !== undefined) this.totalReward += terminalReward;
                isTerminated = true;
            }
            const nextState = response?.nextState;
            const reward = response?.reward;
            if (reward !== undefined) this.totalReward += reward;
            if (log) log({
                step: step,
                action: action,
                state: this.state,
                nextState: nextState,
                reward: reward,
                totalReward: this.totalReward
            });
            if (isTerminated || nextState?.equals(goalState)) break;
            action = this.getNextAction(action, reward, nextState);
            this.state = nextState;
            states.push(this.state);
            step++;
            if (this.limit !== undefined && step >= this.limit) break;
        }
        return {
            actions: actions,
            states: states,
            totalReward: this.totalReward
        };
    }
};