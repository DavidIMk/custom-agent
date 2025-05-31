# Custom-Agent Demo Repository

This repository contains two custom AI agents showcasing different approaches to building conversational AI using OpenAI APIs and LangChain:

1. **Scheduler Agent** (`src/scheduler-agent/agent.ts`)
2. **LangChain Agent** (`src/langchain-agent/agent.ts`)

Use the scripts provided in `package.json` to run each agent independently.

---

## Prerequisites

* Node.js v18.x (or newer)
* npm (comes bundled with Node.js)
* An OpenAI API key (and, if using LangChain with web tools, any required API keys)
* Basic familiarity with TypeScript

---

## Repository Structure

```
custom-agent/
├── package.json            # Root package.json defining scripts & deps
├── tsconfig.json           # TypeScript configuration
├── src/                    # Source folder
│   ├── scheduler-agent/    # Scheduler agent code
│   │   └── agent.ts
│   └── langchain-agent/    # LangChain agent code
│       └── agent.ts
└── README.md               # This file
```

---

## Environment Variables

Create `.env` and fill in the following value:

```
OPENAI_API_KEY=your_openai_api_key_here
```

> **Note**: `.env` is not committed to source control. Keep your keys secure.

---

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/davidimk/custom-agent.git
   cd custom-agent
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env` and populate your API keys.

---

## Running the Agents

The root `package.json` defines two scripts:

```json
"scripts": {
  "dev:scheduler": "tsx --watch --env-file .env src/scheduler-agent/agent.ts",
  "dev:langchain": "tsx --watch --env-file .env src/langchain-agent/agent.ts"
}
```

### Scheduler Agent

This agent is a custom appointment scheduler that interacts with the OpenAI Chat API directly, using a system prompt describing function-calling logic.

To start the scheduler agent:

```bash
npm run dev:scheduler
```

1. The agent will prompt you to **"Say something:"**
2. It maintains an in-memory conversation (`messages[]`) and sends user messages to the OpenAI chat endpoint (`gpt-4o`).
3. The agent can call three functions when generating a JSON response:

   * `check_appointment_availability(datetime)`
   * `schedule_appointment(datetime, name, email)`
   * `delete_appointment(datetime, name, email)`
4. Respond in JSON format with the keys:

   ```json
   {  
     "to": "user" | "system",  
     "message": "...",  
     "function_call": {  
       "function": "<function_name>",  
       "arguments": [ ... ]  
     }  
   }
   ```
5. When the agent emits a `system` response, the code looks up the function name, calls it, and feeds the Boolean return value (`true`/`false`) back into the chat loop.
6. The scheduler agent automatically handles timezone in the system prompt (owner is in IST, user may be elsewhere).

---

### LangChain Agent

This agent demonstrates building a conversational AI using LangChain abstractions (React-style agent, memory, and tools).

To start the LangChain agent:

```bash
npm run dev:langchain
```

1. The agent uses `for the LLM and` to store chat history under the key `chat_history`.
2. It defines a built-in `CurrentTimeTool` (a `DynamicTool`) that, when invoked, returns the current date/time string.
3. If the user’s input contains the word **"time"**, the code manually calls `CurrentTimeTool.func()` and prints the result, then re-prompts.
4. For any other input, the agent’s executor (`initializeAgentExecutorWithOptions`) automatically:

   * Constructs a ReAct-style prompt with the conversation history.
   * Decides whether to call any registered tools (none in this demo, except the manual example).
   * Uses `BufferMemory` to pass `chat_history` into each turn.
   * Returns a generated response that can cite tools or rely on LLM reasoning.
5. The LangChain agent will continue until you type `or`.

