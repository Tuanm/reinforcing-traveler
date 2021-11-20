import { Agent } from './reinforcement/base';
import { GridWorld, GridState } from './reinforcement/impl/grid-world';
import { RandomPolicy, ValueIterationPolicy } from './reinforcement/impl/policies';

function start() {
    // Initialize environment and agent
    const width = 6;
    const height = 6;
    const goalState = new GridState(width - 1, height - 1);
    const gridWorld = new GridWorld(width, height, goalState);
    const initialState = new GridState(0, 0);
    const agent = new Agent(gridWorld);

    // Test random policy
    const randomPolicy = new RandomPolicy(gridWorld);
    agent.follow(randomPolicy);
    agent.setLimit(50); // To ensure each episode doesn't take much time
    let randomPolicyResult = null
    const episodes = 1000;
    for (let episode = 0; episode < episodes; episode++) {
        agent.reset(initialState);
        const result = agent.run(goalState);
        const lastResult = randomPolicyResult;
        if (randomPolicyResult === null || result.totalReward > lastResult.totalReward) {
            randomPolicyResult = result;
        }
    }

    // Test value-iteration policy
    const valueIterationPolicy = new ValueIterationPolicy(gridWorld, {
        discount: 0.6
    });
    valueIterationPolicy.improve(gridWorld, {
        iterations: 1000
    });
    agent.follow(valueIterationPolicy);
    agent.reset(initialState);
    let valueIterationPolicyResult = agent.run(goalState);

    console.log(gridWorld.rewards);
    console.log(initialState);
    console.log(goalState);
    console.log(randomPolicyResult);
    console.log(valueIterationPolicyResult);
}

start();