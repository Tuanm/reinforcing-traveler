import { Environment } from '../../../reinforcement/base';
import { UnknownValueError } from '../../../reinforcement/error';

class MazeState {
    static WALL = 'W';
    static GOAL = 'G';
    static OTHER = '-';

    constructor(x, y, description) {
        this.x = x;
        this.y = y;
        this.description = description;
    }

    equals(other) {
        return this.x === other.x
            && this.y === other.y;
    }
}

class MazeAction {
    static UP = 'UP';
    static DOWN = 'DOWN';
    static LEFT = 'LEFT';
    static RIGHT = 'RIGHT';
}

class Maze extends Environment {
    constructor(text) { // file content
        super();
        this.initializeMazeFromText(text);
    }

    initializeMazeFromText(text) {
        const maze = [];
        const lines = text.split('\n');
        for (const line of lines) {
            const row = [];
            const values = line.split(' ');
            for (const value of values) {
                row.push(value);
            }
            maze.push(row);
        }
        this.initializeMaze(maze);
    }

    initializeMaze(maze) {
        this.initializeStates(maze);
        this.initializeRewards();
        this.setActions([
            MazeAction.UP,
            MazeAction.DOWN,
            MazeAction.LEFT,
            MazeAction.RIGHT
        ]);
    }

    initializeStates(maze) {
        this.height = maze.length;
        if (!this.height) throw new UnknownValueError(this.height);
        this.width = maze[0].length;
        if (!this.width) throw new UnknownValueError(this.width);
        this.states = [];
        for (let x = 0; x < this.height; x++) {
            const row = [];
            for (let y = 0; y < this.width; y++) {
                row.push(new MazeState(x, y, maze[x][y]));
            }
            this.states.push(row);
        }
    }

    initializeRewards() {
        this.rewards = [];
        for (let x = 0; x < this.height; x++) {
            const row = [];
            for (let y = 0; y < this.width; y++) {
                let reward = 0;
                const state = this.states[x][y];
                switch (state.description) {
                    case MazeState.OTHER:
                        reward = 0;
                        break;
                    case MazeState.WALL:
                        reward = -1;
                        break;
                    case MazeState.GOAL:
                        reward = 1;
                        break;
                }
                row.push({
                    state: state,
                    reward: reward
                });
            }
            this.rewards.push(row);
        }
    }

    response(state, action) {
        const newState = this.getNextState(state, action);
        const reward = this.getReward(newState);
        return {
            nextState: newState.description === MazeState.WALL ? state : newState,
            reward: reward
        }
    }

    getNextState(state, action) {
        const x = state.x;
        const y = state.y;
        switch (action) {
            case MazeAction.LEFT:
                if (y > 0) y--;
                break;
            case MazeAction.RIGHT:
                if (y < this.width - 1) y++;
                break;
            case MazeAction.UP:
                if (x > 0) x--;
                break;
            case MazeAction.DOWN:
                if (x < this.height - 1) x++;
                break;
            default:
                throw new UnknownValueError(state);
        }
        const nextState = this.states[x][y];
        return nextState;
    }

    getReward(newState) {
        return this.rewards[newState.x][newState.y];
    }
}

export {
    Maze, MazeState, MazeAction
};