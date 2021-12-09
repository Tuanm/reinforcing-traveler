import { Agent } from './../reinforcement/base';
import { Maze } from './impl/maze/environment';
import fs from 'fs';

export function start(file) {
    if (!file) {
        file = 'data/maze.txt'; // default
    }
    const text = fs.readFileSync(file, 'utf-8');
    const maze = new Maze(text);
    console.log(maze.states);
}

// TODO: Many things to do