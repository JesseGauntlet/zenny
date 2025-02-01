import { Client } from "langsmith";

// Initialize LangSmith client
const client = new Client();

interface TracingOptions {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    tags?: string[];
    metadata?: Record<string, any>;
}

// Helper to generate a unique request ID
const generateRequestId = () => Math.random().toString(36).substring(7);

// Helper to safely serialize response data
function serializeResponse(data: any) {
    try {
        // If it's a Response object, get the status and statusText
        if (data instanceof Response) {
            return {
                status: data.status,
                statusText: data.statusText,
                type: 'Response'
            };
        }
        // For other objects, try to serialize them
        return JSON.parse(JSON.stringify(data));
    } catch (e) {
        return {
            type: typeof data,
            serialization_error: 'Could not serialize response'
        };
    }
}

// Middleware for API routes to add tracing
export async function withTracing<T>(
    handler: () => Promise<T>,
    options: TracingOptions = {}
): Promise<T> {
    const requestId = options.requestId || generateRequestId();
    const startTime = Date.now();
    let result: T;
    
    try {
        // Execute the handler
        result = await handler();
        
        // Log successful run
        await client.createRun({
            name: "API Success",
            run_type: "chain",
            start_time: startTime,
            end_time: Date.now(),
            inputs: {},
            outputs: { 
                result: serializeResponse(result)
            },
            extra: {
                metadata: {
                    ...options.metadata,
                    userId: options.userId,
                    sessionId: options.sessionId,
                    requestId,
                    duration: Date.now() - startTime,
                    tags: options.tags || []
                }
            }
        });
        
        return result;
    } catch (error) {
        // Log error run
        if (error instanceof Error) {
            await client.createRun({
                name: "API Error",
                run_type: "chain",
                start_time: startTime,
                end_time: Date.now(),
                inputs: {},
                outputs: {},
                error: error.message,
                extra: {
                    metadata: {
                        ...options.metadata,
                        userId: options.userId,
                        sessionId: options.sessionId,
                        requestId,
                        errorStack: error.stack,
                        duration: Date.now() - startTime,
                        tags: options.tags || []
                    }
                }
            });
        }
        throw error;
    }
} 