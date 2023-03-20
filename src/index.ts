import { PineconeClient } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";
import { OpenAI } from "langchain";
import { AgentExecutor, ChatConversationalAgent } from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models";
import { CSVLoader } from "langchain/document_loaders";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { BufferMemory, BufferWindowMemory } from "langchain/memory";
import { VectorStoreQATool } from "langchain/tools";
import { PineconeStore } from "langchain/vectorstores";
import prompts from "prompts";

dotenv.config();

// Setup LLM
const chatModel = new ChatOpenAI({
  temperature: 0,
});
const llmModel = new OpenAI({
  temperature: 0,
});

// Setup data
const loader = new CSVLoader("data/home-and-garden.csv");

const docs = await loader.load(); // uncomment this if you'd like to index again

// Setup Vector store
const pinecone = new PineconeClient();
await pinecone.init({
  environment: "us-central1-gcp",
  apiKey: process.env.PINECONE_KEY || "",
});
const embeddingIndex = pinecone.Index("ecommerce");

// Index Ecommerce data
const vectorStore = await PineconeStore.fromExistingIndex(
  new OpenAIEmbeddings(),
  {
    pineconeIndex: embeddingIndex,
  }
);
// uncomment below to index (again)
// const vectorStore = await PineconeStore.fromDocuments(
//   docs,
//   new OpenAIEmbeddings(),
//   {
//     pineconeIndex: embeddingIndex,
//   }
// );

// Setup tools
const vectorStoreTool = new VectorStoreQATool(
  "Product Info",
  "useful for when you need to answer find products available in the store",
  {
    llm: llmModel,
    vectorStore,
  }
);
const tools = [vectorStoreTool];

// Setup memory
const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "chat_history",
  inputKey: "input",
});

const executor = AgentExecutor.fromAgentAndTools({
  agent: ChatConversationalAgent.fromLLMAndTools(chatModel, tools, {
    systemMessage:
      "You are an AI Shopping Assistant for ShopHome.com, designed to be able to assist the user find the right product in an online store. The store contains products for various categories such as furnitures, home decors, gardening tools and equipments. You are given the following filtered products in a shop and a conversation. You should try better to understand the user needs and suggest one or more products.  Provide a conversational a nswer based on the products provided. If you have more than one product to recommend, show them as bulleted list. If you can't find the answer in the context below, say politely \"Hmm, I'm not sure.\" Don't try to make up a product which is not.",
  }),
  tools,
});

executor.memory = memory;

while (true) {
  const userInput = await prompts<string>({
    type: "text",
    name: "input",
    message: "User: ",
  });

  if (userInput.input.toLowerCase().includes("bye")) {
    console.log("✔ Bot : Bye!");
    break;
  } else {
    const response = await executor.call({
      input: userInput.input,
    });
    console.log(`✔ Bot : ${response.output}`);
  }
}
