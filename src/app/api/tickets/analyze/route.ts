import { NextResponse } from "next/server";
import { analyzeTicket } from "@/utils/langchain/ticket-assistant";
import { withTracing } from "@/utils/langchain/tracing";

export async function POST(request: Request) {
    return withTracing(async () => {
        try {
            const body = await request.json();
            const { subject, description } = body;

            if (!subject || !description) {
                return NextResponse.json(
                    { error: "Subject and description are required" },
                    { status: 400 }
                );
            }

            const analysis = await analyzeTicket(subject, description);
            
            return NextResponse.json({
                success: true,
                analysis
            });
        } catch (error) {
            console.error("Error in ticket analysis:", error);
            return NextResponse.json(
                { error: "Failed to analyze ticket" },
                { status: 500 }
            );
        }
    }, {
        tags: ["ticket-analysis"],
        metadata: {
            endpoint: "/api/tickets/analyze"
        }
    });
} 