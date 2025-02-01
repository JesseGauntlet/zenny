import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";

// Define our output types
interface TicketField {
    fieldName: string;
    value: string | null;
    reason?: string;  // Why this field is required
}

interface TicketAnalysis {
    canCreateTicket: boolean;
    missingFields: TicketField[];
    requiredFields: TicketField[];
    explanation?: string;  // Optional explanation of what's missing
}

// Create our prompt template
const TICKET_ANALYSIS_PROMPT = ChatPromptTemplate.fromTemplate(`
You are a helpful support ticket assistant. Your job is to analyze customer support tickets
and ensure they contain all necessary information before they can be created.

First, identify the type of ticket from these categories:
1. Hardware/Device Issues (repairs, physical problems)
2. Software/Account Issues (login, access, bugs)
3. Service Requests (quotes, upgrades, changes)
4. General Inquiries

Then, carefully analyze the description to extract any provided information and identify what's missing.

Required information by type:

For Hardware/Device Issues:
- Device model/type: Full model number or complete name (e.g., "Dell XPS 13 9310")
- Issue description: Clear description of the problem and symptoms
- Current physical condition: Any damage, spills, or visible issues
- When the problem started: Specific date or timeframe

For Software/Account Issues:
- Account identifier: Complete email or username used
- Steps to reproduce: Numbered steps to recreate the issue
- Error messages: Complete error text as shown
- Browser/app version: Specific browser/app name and version number
- When it started: Specific date or timeframe

For Service Requests:
- Service type: Exact service being requested
- Current setup: Complete details of existing service/plan
- Requirements: Specific needs or preferences
- Timeline: Specific date or timeframe needed

Ticket to analyze:
Subject: {subject}
Description: {description}

Instructions:
1. Read the description carefully and extract ALL provided information
2. For partial information:
   - If information is mentioned but needs more detail, include what's provided and request specifics
   - Only mark as completely missing if no related information is provided
3. For each required field:
   - If complete information is provided, include the full value
   - If partial information exists, include it and note what's missing
   - If no information is provided, set value to null
4. Create a clear explanation focusing only on truly missing or incomplete information

Example response format:
{{
    "canCreateTicket": false,
    "missingFields": [
        {{"fieldName": "Device Model/Type", "reason": "need complete model number (current: Dell XPS 13, need specific model variant)"}},
        {{"fieldName": "Current Physical Condition", "reason": "need details of any visible damage from the coffee spill"}}
    ],
    "requiredFields": [
        {{"fieldName": "Device Model/Type", "value": "Dell XPS 13 (need specific model)"}},
        {{"fieldName": "Issue Description", "value": "Won't start up - power light comes on briefly then goes off"}},
        {{"fieldName": "Current Physical Condition", "value": "Coffee spill occurred (need details of visible damage)"}},
        {{"fieldName": "When the Problem Started", "value": "Yesterday after coffee spill"}}
    ],
    "explanation": "To help assess your laptop issue, please provide: 1) The complete model number of your Dell XPS 13 2) Details of any visible damage or stains from the coffee spill"
}}

Analyze the ticket and respond in the exact JSON format shown above:
`);

// Create the output parser
const parser = new JsonOutputParser<TicketAnalysis>();

// Create the model
const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-1106",  // Using the JSON mode capable model
    temperature: 0
});

// Create the chain
const chain = TICKET_ANALYSIS_PROMPT.pipe(model).pipe(parser);

// Main analysis function
export async function analyzeTicket(subject: string, description: string): Promise<TicketAnalysis> {
    try {
        return await chain.invoke({
            subject,
            description
        });
    } catch (error) {
        console.error("Error analyzing ticket:", error);
        throw error;
    }
} 