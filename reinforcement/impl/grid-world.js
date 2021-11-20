import { Environment } from '../base';
import { UnknownValueError } from '../error';

class GridState  {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equals(other) {
        return this.x === other.x
            && this.y === other.y;
    }
}

class GridWorld extends Environment {
    static UP = 'UP';
    static DOWN = 'DOWN';
    static LEFT = 'LEFT';
    static RIGHT = 'RIGHT';

    constructor(width, height, goalState) {
        super();
        this.width = width;
        this.height = height;
        this.initializeStates(goalState);
        this.initializeRewards();
        this.setActions([
            GridWorld.UP,
            GridWorld.DOWN,
            GridWorld.LEFT,
            GridWorld.RIGHT
        ]);
    }

    initializeStates(goalState) {
        this.states = [];
        for (let x = 0; x < this.height; x++) {
            for (let y = 0; y < this.width; y++) {
                this.states.push(new GridState(x, y));
            }
        }
        this.goalState = this.states.find(state => state.equals(goalState));
    }

    initializeRewards() {
        this.rewards = [];
        for (const state of this.states) {
            this.rewards.push({
                state: state,
                reward: Math.random() * (Math.random() > 0.95 ? 1 : -1)
            })
        }
        const goalIndex = this.states.findIndex(state => state.equals(this.goalState));
        if (goalIndex !== -1) this.rewards[goalIndex].reward = this.width + this.height;
    }

    response(state, action) {
        const newState = this.getNextState(state, action);
        const reward = this.getReward(newState);
        return {
            nextState: newState,
            reward: reward
        };
    }

    getNextState(state, action) {
        const x = state.x;
        const y = state.y;
        switch (action) {
            case GridWorld.LEFT:
                if (y > 0) return new GridState(x, y - 1);
                break;
            case GridWorld.RIGHT:
                if (y < this.width - 1) return new GridState(x, y + 1);
                break;
            case GridWorld.UP:
                if (x > 0) return new GridState(x - 1, y);
                break;
            case GridWorld.DOWN:
                if (x < this.height - 1) return new GridState(x + 1, y);
                break;
            default:
                throw new UnknownValueError(state);
        }
        return state;
    }

    getReward(newState) {
        const state = this.states.find(state => state.equals(newState));
        return this.rewards.find(reward => reward.state.equals(state)).reward;
    }

    getProbability(nextState, nextReward, currentState, currentAction) {
        const state = this.getNextState(currentState, currentAction);
        const reward = this.getReward(currentState);
        if (state.equals(nextState) && reward === nextReward) return 1;
        return 0;
    }
}

export {
    GridWorld,
    GridState
};