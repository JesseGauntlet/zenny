import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export async function testLangSmith() {
    try {
        // Initialize the model
        const model = new ChatOpenAI({
            modelName: "gpt-3.5-turbo",
            temperature: 0
        });

        // Create a simple prompt template
        const prompt = ChatPromptTemplate.fromTemplate(
            "Tell me a short joke about {topic} in one sentence."
        );

        // Create a simple chain
        const chain = prompt.pipe(model).pipe(new StringOutputParser());

        // Run the chain with metadata
        const result = await chain.invoke(
            { topic: "programming" },
            {
                tags: ["test-run", "joke-chain"],
                metadata: {
                    chain_type: "joke_generator",
                    topic: "programming",
                    timestamp: new Date().toISOString()
                }
            }
        );

        console.log("LangSmith test successful!");
        console.log("Result:", result);
        return { success: true, result };
    } catch (error) {
        console.error("LangSmith test failed:", error);
        return { success: false, error };
    }
} 