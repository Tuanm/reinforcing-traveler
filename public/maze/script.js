console.log('This is the small game for my academic project.');
console.log('I am still working on https://github.com/Tuanm/tuanlearning');
console.log('Your contribution is always welcome!');


let debug = false; // change it as `true` to see the logs

(function () {
    const startButton = document.getElementById('start-button');
    const mapReloadButton = document.getElementById('map-reload-button');
    const mapInput = document.getElementById('map');
    const stepSpeedInput = document.getElementById('step-speed-input');
    const learningRateInput = document.getElementById('learning-rate-input');
    const discountFactorInput = document.getElementById('discount-factor-input');
    const explorationRateInput = document.getElementById('exploration-rate-input');
    const maxStepsInput = document.getElementById('max-steps-input');
    const initStateInput = document.getElementById('init-state-input');
    const gamePolicyMenu = document.getElementById('game-policies');
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
        gameState.title = `\nState: ${state.x}, ${state.y}`;
        gameState.className = 'game-state';
        let reward;
        if (state.description === 'W') {
            reward = -5;
            gameState.style.backgroundColor = 'black';
            gameState.title += `\t[WALL]`;
        }
        else if (state.description === 'G') {
            reward = +10;
            gameState.style.backgroundColor = 'green';
            gameState.title += `\t[GOAL]`;
        }
        else {
            reward = Number(state.description);
            let backgroundColor = 'gray';
            if (Number.isNaN(reward)) reward = 0;
            if (reward > 0) backgroundColor = 'lightgreen';
            else if (reward < 0) backgroundColor = 'lightpink';
            gameState.style.backgroundColor = backgroundColor;
            gameState.onmouseleave = function () {
                gameState.style.backgroundColor = backgroundColor;
            };
            gameState.onmouseover = function () {
                gameState.style.backgroundColor = 'white';
            };
        }
        gameState.title += `\nReward: ${reward < 0 ? '-' : '+'}${Math.abs(reward)}\n`;
        gameState.title += '\nClick to view State-Action Values!';
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
                let gameValue;
                if (!Number.isNaN(values[1])) {
                    gameValue = Number(values[1]);
                    gameValue = Math.round(gameValue * 1e3) / 1e3; // takes 3 digits after floating point
                }
                if (values[0].action === 'UP') gameValues.up = gameValue;
                else if (values[0].action === 'LEFT') gameValues.left = gameValue;
                else if (values[0].action === 'RIGHT') gameValues.right = gameValue;
                else if (values[0].action === 'DOWN') gameValues.down = gameValue;
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
    
    function addGamePolicy(index, title) {
        const gamePolicy = document.createElement('option');
        gamePolicy.className = 'game-policy';
        gamePolicy.innerText = title;
        gamePolicy.title = `\n${title}\t[Index: ${index}]`;
        gamePolicy.value = index;
        gamePolicyMenu.appendChild(gamePolicy);
    }
    
    function addGamePolicies(policies) {
        gamePolicyMenu.innerHTML = ''; // remove all child nodes
        if (policies !== undefined) {
            for (let index = 0; index < policies.length; index++) {
                addGamePolicy(index, policies[index].title);
            }
        }
    }
    
    
    // socket client
    const that = io();

    function updateMap(gameInfo) {
        mapInput.value = gameInfo.environment.instance.text;
        if (debug) console.log(gameInfo);
        addGamePolicies(gameInfo.policies);
        visualizeGameStates(states);
        if (debug) console.log('map changed');
    }
    
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
    
        that.on('game-fetched', updateMap);
        that.on('map-changed', updateMap);
    
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
    }
    
    function close() {
        that.close();
    }
    
    function start() {
        const initState = initStateInput.value.split(',');
        let policyOption;
        for (const gamePolicy of gamePolicyMenu.childNodes) {
            if (gamePolicy.selected) {
                policyOption = gamePolicy;
                break;
            }
        }
        let learningRate = learningRateInput.valueAsNumber;
        let discountFactor = discountFactorInput.valueAsNumber;
        let explorationRate = explorationRateInput.valueAsNumber;
        if (Number.isNaN(learningRate)) learningRate = 0.5;
        if (Number.isNaN(discountFactor)) discountFactor = 0.7;
        if (Number.isNaN(explorationRate)) explorationRate = 0.1;
        that.emit('start-game', {
            policyNumber: policyOption.value || 0,
            maxSteps: maxStepsInput.value || 200,
            learningRate: learningRate,
            discountFactor: discountFactor,
            explorationRate: explorationRate,
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
    
    function reloadMap() {
        const mapText = mapInput.value.replaceAll('\n', '\r\n').toUpperCase();
        localStorage.setItem('map', mapText);
        if (debug) console.log('map saved in local storage');
        that.emit('change-map', mapText);
    }
    
    startButton.onclick = function () {
        if (!that.running) start();
        else stop();
    };
    
    mapReloadButton.onclick = function () {
        reloadMap();
    }
    
    gameValuesPopup.onclick = function () {
        gameValuesPopup.style.visibility = 'hidden';
    };

    window.onbeforeunload = close;
    window.onload = init;
})();

// TODO: Load saved policies