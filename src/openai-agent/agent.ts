import { Agent, run, tool } from "@openai/agents";
import z from "zod";

const main = async () => {
  const funFact = tool({
    name: "fun_fact",
    description: "Give a fun fact",
    execute: async () => {
      return "Sharks are older than trees.";
    },
    parameters: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false,
    },
  });

  const getWeather = tool({
    name: "get_weather",
    description: "Return the weather for a given city.",
    parameters: z.object({ city: z.string() }),
    async execute({ city }) {
      return `The weather in ${city} is sunny.`;
    },
  });

  const weatherAgent = new Agent({
    name: "Weather bot",
    instructions: "You are a helpful weather bot.",
    model: "o4-mini",
    tools: [getWeather],
  });

  const agents = new Agent({
    name: "Assistant",
    instructions: "You are a helpful assistant",
    tools: [funFact],
  });

  const result = await run(weatherAgent, "Give me current weather in Jakarta.");
  console.log({ result: JSON.stringify(result.output, null, 2) });
};

main();
