const startButton = document.getElementById('start-button');
const stepSpeedInput = document.getElementById('step-speed-input');
const learningRateInput = document.getElementById('learning-rate-input');
const discountFactorInput = document.getElementById('discount-factor-input');
const explorationRateInput = document.getElementById('exploration-rate-input');
const maxStepsInput = document.getElementById('max-steps-input');
const gameStatesContainer = document.getElementById('game-states');
const gameValuesContainer = document.getElementById('game-values');
const totalRewardSpanner = document.getElementById('total-reward');
const nextActionSpanner = document.getElementById('next-action');

function createGameBoardRow() {
    const gameBoardRow = document.createElement('div');
    gameBoardRow.className = 'game-board-row';
    return gameBoardRow;
}

function createGameState(state) {
    const div = document.createElement('div');
    div.className = 'game-state';
    div.title = `(${state.x}, ${state.y})`;
    if (state.description === 'W') {
        div.style.backgroundColor = 'black';
    }
    else if (state.description === 'G') {
        div.style.backgroundColor = 'green';
    }
    else {
        div.style.backgroundColor = 'gray';
    }
    return div;
}

function createGameValue(values) {
    return undefined;
}

function visualizeGameStates(states, currentState) {
    gameStatesContainer.innerHTML = ''; // remove all child nodes
    for (const stateRow of states) {
        const gameBoardRow = createGameBoardRow();
        for (const state of stateRow) {
            const gameState = createGameState(state);
            if (state.x == currentState?.x && state.y == currentState?.y) {
                gameState.style.backgroundColor = 'red';
            }
            gameBoardRow.appendChild(gameState);
        }
        gameStatesContainer.appendChild(gameBoardRow);
    }
}



const that = io();

function init() {
    let states;

    that.on('connected', () => {
        that.emit('fetch-game', undefined);
    });

    that.on('game-fetched', (gameInfo) => {
        states = gameInfo.environment.states;
        console.log(gameInfo);
        visualizeGameStates(states);
        console.log('game fetched');
    });

    that.on('game-step-fetched', (gameStepInfo) => {
        const currentState = gameStepInfo.gameStep.state;
        visualizeGameStates(states, currentState);
        nextActionSpanner.textContent = gameStepInfo.gameStep.action;
        totalRewardSpanner.textContent = gameStepInfo.gameStep.totalReward;
        console.log(gameStepInfo);
        if (gameStepInfo.gameFinished === true) {
            that.running = false;
            updateStartButton();
            console.log('game finished');
        }
    });
}

function start() {
    that.emit('start-game', {
        policyNumber: 1, // Q-learning
        maxSteps: maxStepsInput.value || 200,
        learningRate: learningRateInput.value || 0.5,
        discountFactor: discountFactorInput.value || 0.7,
        explorationRate: explorationRateInput.value || 0.1,
        stepSpeed: stepSpeedInput.value || 1000 // default: 1 second
    });
    that.running = true;
    updateStartButton();
    console.log('game started');
}

function stop() {
    that.emit('stop-game');
    that.running = false;
    updateStartButton();
    console.log('game stopped');
}

function updateStartButton() {
    startButton.textContent = !that.running ? 'Start' : 'Stop';
}

window.onload = init;

startButton.onclick = function () {
    if (!that.running) start();
    else stop();
};