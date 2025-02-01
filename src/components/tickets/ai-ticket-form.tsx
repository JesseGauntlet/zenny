'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TicketField {
    fieldName: string;
    value: string | null;
    reason?: string;
}

interface TicketAnalysis {
    canCreateTicket: boolean;
    missingFields: TicketField[];
    requiredFields: TicketField[];
    explanation?: string;
}

export function AITicketForm() {
    const router = useRouter();
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [analysis, setAnalysis] = useState<TicketAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dynamicFields, setDynamicFields] = useState<Record<string, string>>({});

    // Analyze ticket when subject or description changes (with debounce)
    useEffect(() => {
        if (!subject || !description) return;

        const timer = setTimeout(async () => {
            setIsAnalyzing(true);
            try {
                const response = await fetch('/api/tickets/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subject, description })
                });
                const data = await response.json();
                if (data.success) {
                    setAnalysis(data.analysis);
                    // Initialize dynamic fields with current values AND missing fields
                    const fields: Record<string, string> = {};
                    
                    // Add all missing fields
                    data.analysis.missingFields.forEach((field: TicketField) => {
                        fields[field.fieldName] = '';
                    });
                    
                    // Add any required fields that have values
                    data.analysis.requiredFields.forEach((field: TicketField) => {
                        if (field.value) {
                            fields[field.fieldName] = field.value;
                        }
                    });
                    
                    setDynamicFields(fields);
                }
            } catch (error) {
                console.error('Error analyzing ticket:', error);
                setError('Failed to analyze ticket. Please try again.');
            } finally {
                setIsAnalyzing(false);
            }
        }, 1000); // 1 second debounce

        return () => clearTimeout(timer);
    }, [subject, description]);

    const handleFieldChange = (fieldName: string, value: string) => {
        setDynamicFields(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const canCreateTicket = analysis?.canCreateTicket || 
        (analysis?.requiredFields.every(field => dynamicFields[field.fieldName]?.trim()) ?? false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canCreateTicket || isAnalyzing || isSubmitting) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const supabase = createClient();
            
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Combine all fields into the description
            const fullDescription = `
${description}

Additional Information:
${Object.entries(dynamicFields)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')}
            `.trim();

            const { error: submitError } = await supabase
                .from('tickets')
                .insert({
                    subject,
                    description: fullDescription,
                    status: 'open',
                    priority: 'medium', // default priority
                    customer_id: user.id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (submitError) throw submitError;

            // Redirect to tickets list on success
            router.push('/tickets');
            router.refresh();
        } catch (error) {
            console.error('Error creating ticket:', error);
            setError('Failed to create ticket. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Basic Fields */}
            <div className="space-y-4">
                <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief summary of the issue"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detailed description of your issue"
                        rows={4}
                        required
                    />
                </div>
            </div>

            {/* Dynamic Required Fields */}
            {analysis && analysis.missingFields.length > 0 && (
                <div className="space-y-4">
                    <div className="border-t pt-4">
                        <h3 className="font-medium mb-4">Additional Information Needed</h3>
                        {analysis.missingFields.map((field) => (
                            <div key={field.fieldName} className="mb-4">
                                <Label htmlFor={field.fieldName}>
                                    {field.fieldName}
                                    <span className="text-red-500 text-sm ml-2">*</span>
                                </Label>
                                <Input
                                    id={field.fieldName}
                                    value={dynamicFields[field.fieldName] || ''}
                                    onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
                                    placeholder={field.reason}
                                    className="border-red-300"
                                />
                                <p className="text-sm text-red-500 mt-1">
                                    {field.reason}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Missing Fields Alert */}
                    {!canCreateTicket && analysis.explanation && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {analysis.explanation}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            )}

            {/* Submit Button */}
            <Button 
                type="submit" 
                disabled={!canCreateTicket || isAnalyzing || isSubmitting}
                className="w-full"
            >
                {isAnalyzing ? 'Analyzing...' : isSubmitting ? 'Creating Ticket...' : 'Create Ticket'}
            </Button>
        </form>
    );
} 