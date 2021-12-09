import { Agent } from './../reinforcement/base';
import { Maze } from './impl/maze/environment';
import fs from 'fs';

export function start() {
    const text = fs.readFileSync('data/maze.txt', 'utf-8');
    const maze = new Maze(text);
    console.log(maze.states);
}

// TODO: Many things to do