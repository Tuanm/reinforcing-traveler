const startButton = document.getElementById('start-button');
const stepSpeedInput = document.getElementById('step-speed-input');
const learningRateInput = document.getElementById('learning-rate-input');
const discountFactorInput = document.getElementById('discount-factor-input');
const explorationRateInput = document.getElementById('exploration-rate-input');
const maxStepsInput = document.getElementById('max-steps-input');

const that = io();

function init() {
    that.on('connected', () => {
        that.emit('fetch-game', undefined);
    });

    that.on('game-fetched', (gameInfo) => {
        console.log(gameInfo);
    });

    that.on('game-step-fetched', (info) => {
        console.log(info);
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
}

function stop() {
    that.emit('stop-game');
    that.running = false;
}

window.onload = init;

startButton.onclick = function () {
    if (!that.running) start();
    else stop();
    startButton.textContent = !that.running ? 'Start' : 'Stop';
};