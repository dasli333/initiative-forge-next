import { Button } from '@/components/ui/button';
import { CalendarOff } from 'lucide-react';

interface EmptyStateProps {
    onAddEventClick: () => void;
}

export function EmptyState({ onAddEventClick }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
                <CalendarOff className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No events yet</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
                Your timeline is empty. Start recording the history of your campaign by adding your first event.
            </p>
            <Button onClick={onAddEventClick} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Add First Event
            </Button>
        </div>
    );
}
