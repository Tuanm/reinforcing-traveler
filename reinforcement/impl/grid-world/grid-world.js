import { Environment } from '../../base';
import { UnknownValueError } from '../../error';

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

class GridAction {
    static UP = 'UP';
    static DOWN = 'DOWN';
    static LEFT = 'LEFT';
    static RIGHT = 'RIGHT';
}

class GridWorld extends Environment {
    constructor(width, height, goalState) {
        super();
        this.width = width;
        this.height = height;
        this.initializeStates(goalState);
        this.initializeRewards();
        this.setActions([
            GridAction.UP,
            GridAction.DOWN,
            GridAction.LEFT,
            GridAction.RIGHT
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
        if (!this.goalState) throw new UnknownValueError(goalState);
    }

    initializeRewards() {
        this.rewards = [];
        for (const state of this.states) {
            this.rewards.push({
                state: state,
                reward: Math.random() * (Math.random() > 0.95 ? 1 : -1) // random reward
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
            case GridAction.LEFT:
                if (y > 0) return new GridState(x, y - 1);
                break;
            case GridAction.RIGHT:
                if (y < this.width - 1) return new GridState(x, y + 1);
                break;
            case GridAction.UP:
                if (x > 0) return new GridState(x - 1, y);
                break;
            case GridAction.DOWN:
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

    getProbability(currentState, currentAction, nextState, nextReward) {
        const state = this.getNextState(currentState, currentAction);
        const reward = this.getReward(currentState);
        if (state.equals(nextState)
            && (!nextReward || (reward === nextReward))) return 1;
        return 0;
    }
}

export {
    GridWorld,
    GridState,
    GridAction
};