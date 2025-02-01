import { NextResponse } from 'next/server';
import { testLangSmith } from '@/utils/langchain/test-langsmith';
import { withTracing } from '@/utils/langchain/tracing';

export async function GET() {
    return withTracing(
        async () => {
            const result = await testLangSmith();
            return NextResponse.json({
                status: 'success',
                data: result,
                timestamp: new Date().toISOString()
            });
        },
        {
            tags: ['test', 'langsmith'],
            metadata: {
                endpoint: '/api/test-langsmith',
                method: 'GET'
            }
        }
    );
} 