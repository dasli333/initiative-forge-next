import { RelatedEntity } from '@/types/timeline-view.types';
import { Json } from '@/types/database';
import { LucideIcon, User, MapPin, Scroll, Flag, Shield, Box, Calendar } from 'lucide-react';

export function parseRelatedEntities(json: Json | null): RelatedEntity[] {
    if (!json) return [];
    try {
        if (Array.isArray(json)) {
            return json.filter((e: any) => e.type && e.id && e.name);
        }
    } catch (error) {
        console.error('Failed to parse related entities:', error);
    }
    return [];
}

export function getEntityTypeIcon(type: string): LucideIcon {
    switch (type) {
        case 'npc':
            return User;
        case 'location':
            return MapPin;
        case 'quest':
            return Scroll;
        case 'faction':
            return Flag;
        case 'item':
            return Box;
        case 'arc':
            return Shield;
        case 'session':
            return Calendar;
        default:
            return Box;
    }
}

export function getEntityTypePath(type: string, campaignId: string, entityId: string): string {
    switch (type) {
        case 'npc':
            return `/campaigns/${campaignId}/npcs/${entityId}`;
        case 'location':
            return `/campaigns/${campaignId}/locations/${entityId}`;
        case 'quest':
            return `/campaigns/${campaignId}/quests/${entityId}`;
        case 'faction':
            return `/campaigns/${campaignId}/factions/${entityId}`;
        case 'item':
            return `/campaigns/${campaignId}/story-items/${entityId}`;
        case 'arc':
            return `/campaigns/${campaignId}/story-arcs/${entityId}`;
        case 'session':
            return `/campaigns/${campaignId}/sessions/${entityId}`;
        default:
            return `/campaigns/${campaignId}`;
    }
}
