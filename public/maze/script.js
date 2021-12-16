console.log('This is the small game for my academic project.');
console.log('I am still working on https://github.com/Tuanm/tuanlearning');
console.log('Your contribution is always welcome!');


let debug = false; // change it as `true` to see the logs

const startButton = document.getElementById('start-button');
const mapModifyButton = document.getElementById('map-modify-button');
const mapInput = document.getElementById('map');
const stepSpeedInput = document.getElementById('step-speed-input');
const learningRateInput = document.getElementById('learning-rate-input');
const discountFactorInput = document.getElementById('discount-factor-input');
const explorationRateInput = document.getElementById('exploration-rate-input');
const maxStepsInput = document.getElementById('max-steps-input');
const initStateInput = document.getElementById('init-state-input');
const gameStatesContainer = document.getElementById('game-states');
const totalRewardSpanner = document.getElementById('total-reward');
const nextActionSpanner = document.getElementById('next-action');
const gameValuesPopup = document.getElementById('game-values');
const actionUpValueSpanner = document.getElementById('action-up-value');
const actionLeftValueSpanner = document.getElementById('action-left-value');
const actionRightValueSpanner = document.getElementById('action-right-value');
const actionDownValueSpanner = document.getElementById('action-down-value');


function createGameState(state) {
    const gameState = document.createElement('div');
    gameState.title = `[${state.x}, ${state.y}]`;
    gameState.className = 'game-state';
    if (state.description === 'W') {
        gameState.style.backgroundColor = 'black';
    }
    else if (state.description === 'G') {
        gameState.style.backgroundColor = 'green';
    }
    else {
        gameState.style.backgroundColor = 'gray';
        gameState.onmouseover = function () {
            gameState.style.backgroundColor = 'white';
        };
        gameState.onmouseleave = function () {
            gameState.style.backgroundColor = 'gray';
        };
    }
    return gameState;
}

function setGameValues(state, policyValues) {
    const gameValues = {
        up: undefined,
        left: undefined,
        right: undefined,
        down: undefined
    };
    for (const values of policyValues) {
        if (values[0].state.x === state.x && values[0].state.y === state.y) {
            if (values[0].action === 'UP') gameValues.up = values[1];
            else if (values[0].action === 'LEFT') gameValues.left = values[1];
            else if (values[0].action === 'RIGHT') gameValues.right = values[1];
            else if (values[0].action === 'DOWN') gameValues.down = values[1];
        }
        if (gameValues.up !== undefined && gameValues.left !== undefined) {
            if (gameValues.right !== undefined && gameValues.down !== undefined) {
                break;
            }
        }
    }
    actionUpValueSpanner.innerText = gameValues.up !== undefined ? gameValues.up : '';
    actionLeftValueSpanner.innerText = gameValues.left !== undefined ? gameValues.left : '';
    actionRightValueSpanner.innerText = gameValues.right !== undefined ? gameValues.right : '';
    actionDownValueSpanner.innerText = gameValues.down !== undefined ? gameValues.down : '';
}

function peekGameStateValues(state, policyValues) {
    if (state === undefined || policyValues === undefined) return;
    setGameValues(state, policyValues);
    const gameState = gameStatesContainer.childNodes[state.x].childNodes[state.y];
    gameValuesPopup.style.top = gameState.offsetTop - gameState.offsetHeight;
    gameValuesPopup.style.left = gameState.offsetLeft - gameState.offsetWidth;
    gameValuesPopup.style.visibility = 'visible';
}

function visualizeGameStates(states, currentState, policyValues) {
    gameStatesContainer.innerHTML = ''; // remove all child nodes
    for (const stateRow of states) {
        const gameBoardRow = document.createElement('div');
        gameBoardRow.className = 'game-board-row';
        for (const state of stateRow) {
            const gameState = createGameState(state);
            gameState.onclick = function () {
                peekGameStateValues(state, policyValues);
            };
            if (state.x == currentState?.x && state.y == currentState?.y) {
                gameState.style.backgroundColor = 'yellow'; // highlight current state
            }
            gameBoardRow.appendChild(gameState);
        }
        gameStatesContainer.appendChild(gameBoardRow);
    }
}



const that = io();

function init() {
    let states;

    that.on('connected', function () {
        const mapText = localStorage.getItem('map');
        if (!mapText) {
            that.emit('fetch-game'); // fetch map from server
        }
        else {
            that.emit('change-map', mapText);
        }
    });

    that.on('game-fetched', function (gameInfo) {
        mapInput.value = gameInfo.environment.instance.text;
        states = gameInfo.environment.states;
        if (debug) console.log(gameInfo);
        visualizeGameStates(states);
        if (debug) console.log('game fetched');
    });

    that.on('game-step-fetched', function (gameStepInfo) {
        const currentState = gameStepInfo.gameStep.state;
        const policyValues = gameStepInfo.policyValues;
        visualizeGameStates(states, currentState, policyValues);
        nextActionSpanner.textContent = gameStepInfo.gameStep.action;
        totalRewardSpanner.textContent = gameStepInfo.gameStep.totalReward;
        if (debug) console.log(gameStepInfo);
        if (gameStepInfo.gameFinished === true) {
            that.running = false;
            updateStartButton();
            if (debug) console.log('game finished');
        }
    });

    that.on('map-changed', function (gameInfo) {
        states = gameInfo.environment.states;
        console.log(gameInfo);
        visualizeGameStates(states);
        if (debug) console.log('map changed');
    })
}

function start() {
    const initState = initStateInput.value.split(',');
    that.emit('start-game', {
        policyNumber: 1, // Q-learning
        maxSteps: maxStepsInput.value || 200,
        learningRate: learningRateInput.value || 0.5,
        discountFactor: discountFactorInput.value || 0.7,
        explorationRate: explorationRateInput.value || 0.1,
        stepSpeed: stepSpeedInput.value || 1000, // default: 1 second
        initialState: {
            x: initState[0]?.trim(),
            y: initState[1]?.trim()
        }
    });
    that.running = true;
    updateStartButton();
    if (debug) console.log('game started');
}

function updateStartButton() {
    startButton.textContent = !that.running ? 'Start' : 'Stop';
}

function stop() {
    that.emit('stop-game');
    that.running = false;
    updateStartButton();
    if (debug) console.log('game stopped');
}

function modify() {
    const mapText = mapInput.value.replaceAll('\n', '\r\n').toUpperCase();
    localStorage.setItem('map', mapText);
    if (debug) console.log('map saved in local storage');
    that.emit('change-map', mapText);
}

window.onload = init;

startButton.onclick = function () {
    if (!that.running) start();
    else stop();
};

mapModifyButton.onclick = function () {
    modify();
}

gameValuesPopup.onclick = function () {
    gameValuesPopup.style.visibility = 'hidden';
};