import { Environment, Action, Policy, State } from '../base';
import { UnknownValueError } from '../error';

class GridState extends State {
    constructor(value) {
        super(value);
    }

    equals(other) {
        return this.value.x === other.value.x && this.value.y === other.value.y;
    }
}

class GridWorld extends Environment {
    static UP = new Action('UP');
    static DOWN = new Action('DOWN');
    static LEFT = new Action('LEFT');
    static RIGHT = new Action('RIGHT');

    constructor(width, height, goalState) {
        super();
        this.width = width;
        this.height = height;
        this.goalState = goalState;
        this.initializeStates();
        this.setActions([
            GridWorld.UP,
            GridWorld.DOWN,
            GridWorld.LEFT,
            GridWorld.RIGHT
        ]);
    }

    initializeStates() {
        this.states = [];
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.states.push(new GridState({ x, y }));
            }
        }
    }

    response(state, action) {
        const newState = this.nextState(state, action);
        const reward = this.reward(newState);
        return {
            nextState: newState,
            reward: reward
        };
    }

    nextState(state, action) {
        const x = state.value.x;
        const y = state.value.y;
        switch (action) {
            case GridWorld.UP:
                if (y > 0) return new GridState({ x, y: y - 1 });
                break;
            case GridWorld.DOWN:
                if (y < this.height - 1) return new GridState({ x, y: y + 1 });
                break;
            case GridWorld.LEFT:
                if (x > 0) return new GridState({ x: x - 1, y });
                break;
            case GridWorld.RIGHT:
                if (x < this.width - 1) return new GridState({ x: x + 1, y });
                break;
            default:
                throw new UnknownValueError();
        }
        return state;
    }

    reward(newState) {
        if (newState.equals(this.goalState)) return 25;
        return -1;
    }
}

class NaivePolicy extends Policy {
    constructor(actions) {
        super(actions);
    }

    dicide(state, action) {
        return this.actions[Math.floor(Math.random() * this.actions.length)];
    }
}

export {
    GridWorld,
    GridState,
    NaivePolicy
};