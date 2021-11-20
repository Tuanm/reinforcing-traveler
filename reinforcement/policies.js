import { Policy } from './base';

class DeterministicPolicy extends Policy {}

class StochasticPolicy extends Policy {}

export {
    DeterministicPolicy,
    StochasticPolicy
};