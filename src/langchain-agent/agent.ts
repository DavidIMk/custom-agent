import readline from "readline";
import { ChatOpenAI } from "@langchain/openai";
import { BufferMemory } from "langchain/memory";
import { DynamicTool } from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const llm = new ChatOpenAI({ openAIApiKey: process.env.OPENAI_API_KEY });
  console.log("Agent initializing...\n");

  const memory = new BufferMemory({
    memoryKey: "chat_history",
    returnMessages: true,
  });
  const tools = [
    new DynamicTool({
      name: "CurrentTimeTool",
      description: "Returns the current date and time. No input needed.",
      func: async (_input: string) => new Date().toLocaleString(),
    }),
  ];

  const executor = await initializeAgentExecutorWithOptions(tools, llm, {
    agentType: "chat-conversational-react-description",
    memory,
    verbose: true,
  });
  console.log("Agent ready! Type your question or 'exit' to quit.\n");

  const promptLoop = () => {
    rl.question("> ", async (input) => {
      const normalized = input.trim().toLowerCase();
      if (normalized === "exit" || normalized === "quit") {
        console.log("Goodbye!");
        rl.close();
        process.exit(0);
      }

      try {
        /**
         * If user asks for the current time, explicitly call the tool.
         * Otherwise, let the agent decide if/how to use tools based on user input.
         */
        if (normalized.includes("time")) {
          // Example of manually invoking a tool
          const timeTool = tools.find((t) => t.name === "CurrentTimeTool");
          if (timeTool) {
            const toolResult = await timeTool.func("");
            console.log(`Current Time: ${toolResult}`);
            promptLoop();
            return;
          }
        }

        const result = await executor.call({ input });
        console.log(result.output);
      } catch (err) {
        console.error("Agent error:", err);
      }

      promptLoop();
    });
  };

  promptLoop();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
