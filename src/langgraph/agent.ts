import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";
import { writeFileSync } from "node:fs";

const main = async () => {
  const agentTools = [new TavilySearch({ maxResults: 3 })];
  const agentModel = new ChatOpenAI({ temperature: 0 });

  const agentCheckPointer = new MemorySaver();
  const agent = createReactAgent({
    llm: agentModel,
    tools: agentTools,
    checkpointSaver: agentCheckPointer,
  });

  const agentFinalState = await agent.invoke(
    {
      messages: [new HumanMessage("What is the current weather in Jakarta")],
    },
    { configurable: { thread_id: 42 } }
  );

  console.log(
    agentFinalState.messages[agentFinalState.messages.length - 1].content
  );

  const agentNextState = await agent.invoke(
    {
      messages: [new HumanMessage("What about NY")],
    },
    { configurable: { thread_id: 42 } }
  );

  console.log(
    agentNextState.messages[agentNextState.messages.length - 1].content
  );

  const graph = await agent.getGraphAsync();
  const graphStateImage = await graph.drawMermaidPng();

  const graphStateArrayBuffer = await graphStateImage.arrayBuffer();

  const filePath = "./graphState.png";
  writeFileSync(filePath, new Uint8Array(graphStateArrayBuffer));
};

main();
