import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AITicketForm } from "@/components/tickets/ai-ticket-form";

export default async function NewTicketPage() {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (!user || userError) {
        redirect('/auth/login');
    }

    return (
        <div className="container max-w-2xl py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Create New Ticket</h1>
                <p className="text-muted-foreground">
                    Our AI assistant will help ensure your ticket has all the necessary information.
                </p>
            </div>
            <AITicketForm />
        </div>
    );
} 