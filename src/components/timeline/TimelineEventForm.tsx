import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTimelineEventSchema } from '@/lib/schemas/timeline-event.schema';
import { TimelineEventFormData } from '@/types/timeline-view.types';
import { TimelineEventDTO, CreateTimelineEventCommand, UpdateTimelineEventCommand } from '@/types/timeline-events';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { RichTextEditor } from '@/components/shared/RichTextEditor';

interface TimelineEventFormProps {
    mode: 'create' | 'edit';
    initialData?: TimelineEventDTO;
    campaignId: string;
    onSubmit: (data: CreateTimelineEventCommand | UpdateTimelineEventCommand) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export function TimelineEventForm({
    mode,
    initialData,
    campaignId,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: TimelineEventFormProps) {
    const form = useForm<TimelineEventFormData>({
        resolver: zodResolver(createTimelineEventSchema),
        defaultValues: {
            title: initialData?.title || '',
            event_date: initialData?.event_date || '',
            sort_date: initialData?.sort_date ? new Date(initialData.sort_date) : new Date(),
            description_json: initialData?.description_json || null,
        },
    });

    const handleSubmit = (data: TimelineEventFormData) => {
        if (mode === 'create') {
            const command: CreateTimelineEventCommand = {
                title: data.title,
                event_date: data.event_date,
                sort_date: format(data.sort_date, 'yyyy-MM-dd'),
                description_json: data.description_json,
                source_type: 'manual',
            };
            onSubmit(command);
        } else {
            const command: UpdateTimelineEventCommand = {
                title: data.title,
                event_date: data.event_date,
                sort_date: format(data.sort_date, 'yyyy-MM-dd'),
                description_json: data.description_json,
            };
            onSubmit(command);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Event title" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="event_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>In-Game Date (Display)</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. 15 Mirtul, 1492 DR" {...field} />
                                </FormControl>
                                <FormDescription>
                                    How the date appears in the timeline.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="sort_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Sorting Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            captionLayout="dropdown"
                                            fromYear={1900}
                                            toYear={2100}
                                            disabled={(date) =>
                                                date > new Date("2100-01-01") || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>
                                    Used strictly for chronological sorting.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description_json"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <RichTextEditor
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    campaignId={campaignId}
                                    placeholder="Event description with @mentions..."
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {mode === 'create' ? 'Create Event' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
