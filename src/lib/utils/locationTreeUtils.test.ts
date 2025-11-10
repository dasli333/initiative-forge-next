import { describe, it, expect } from 'vitest';
import type { Location } from '@/types/locations';
import {
  buildLocationTree,
  canDropLocation,
  buildBreadcrumb,
  getAllDescendantIds,
} from './locationTreeUtils';

// Mock locations for testing
const mockLocations: Location[] = [
  {
    id: 'continent-1',
    campaign_id: 'campaign-1',
    name: 'Faerûn',
    location_type: 'kontynent',
    parent_location_id: null,
    description_json: null,
    image_url: null,
    coordinates_json: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'region-1',
    campaign_id: 'campaign-1',
    name: 'Sword Coast',
    location_type: 'królestwo',
    parent_location_id: 'continent-1',
    description_json: null,
    image_url: null,
    coordinates_json: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'city-1',
    campaign_id: 'campaign-1',
    name: 'Waterdeep',
    location_type: 'miasto',
    parent_location_id: 'region-1',
    description_json: null,
    image_url: null,
    coordinates_json: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'building-1',
    campaign_id: 'campaign-1',
    name: 'Yawning Portal',
    location_type: 'budynek',
    parent_location_id: 'city-1',
    description_json: null,
    image_url: null,
    coordinates_json: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'city-2',
    campaign_id: 'campaign-1',
    name: 'Baldur\'s Gate',
    location_type: 'miasto',
    parent_location_id: 'region-1',
    description_json: null,
    image_url: null,
    coordinates_json: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'continent-2',
    campaign_id: 'campaign-1',
    name: 'Kara-Tur',
    location_type: 'kontynent',
    parent_location_id: null,
    description_json: null,
    image_url: null,
    coordinates_json: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

describe('buildLocationTree', () => {
  it('should build a hierarchical tree from flat locations', () => {
    const tree = buildLocationTree(mockLocations);

    expect(tree).toHaveLength(2); // Two root continents
    expect(tree[0].location.name).toBe('Faerûn');
    expect(tree[1].location.name).toBe('Kara-Tur');
  });

  it('should correctly nest children', () => {
    const tree = buildLocationTree(mockLocations);

    const faerun = tree[0];
    expect(faerun.children).toHaveLength(1); // Sword Coast
    expect(faerun.childrenCount).toBe(1);

    const swordCoast = faerun.children[0];
    expect(swordCoast.location.name).toBe('Sword Coast');
    expect(swordCoast.children).toHaveLength(2); // Waterdeep and Baldur's Gate
    expect(swordCoast.childrenCount).toBe(2);

    const waterdeep = swordCoast.children.find((c) => c.location.name === 'Waterdeep');
    expect(waterdeep).toBeDefined();
    expect(waterdeep?.children).toHaveLength(1); // Yawning Portal
    expect(waterdeep?.childrenCount).toBe(1);
  });

  it('should sort children alphabetically', () => {
    const tree = buildLocationTree(mockLocations);

    const swordCoast = tree[0].children[0];
    expect(swordCoast.children[0].location.name).toBe('Baldur\'s Gate');
    expect(swordCoast.children[1].location.name).toBe('Waterdeep');
  });

  it('should respect expanded nodes', () => {
    const expandedNodes = new Set(['region-1', 'city-1']);
    const tree = buildLocationTree(mockLocations, expandedNodes);

    const swordCoast = tree[0].children[0];
    expect(swordCoast.isExpanded).toBe(true);

    const waterdeep = swordCoast.children.find((c) => c.location.name === 'Waterdeep');
    expect(waterdeep?.isExpanded).toBe(true);

    const baldursGate = swordCoast.children.find((c) => c.location.name === 'Baldur\'s Gate');
    expect(baldursGate?.isExpanded).toBe(false);
  });

  it('should handle orphaned nodes (missing parent)', () => {
    const orphanedLocations: Location[] = [
      ...mockLocations,
      {
        id: 'orphan-1',
        campaign_id: 'campaign-1',
        name: 'Orphaned City',
        location_type: 'miasto',
        parent_location_id: 'non-existent-parent',
        description_json: null,
        image_url: null,
        coordinates_json: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    const tree = buildLocationTree(orphanedLocations);

    // Orphaned node should be treated as root
    expect(tree).toHaveLength(3);
    expect(tree.some((node) => node.location.name === 'Orphaned City')).toBe(true);
  });

  it('should return empty array for empty locations', () => {
    const tree = buildLocationTree([]);
    expect(tree).toEqual([]);
  });
});

describe('canDropLocation', () => {
  it('should allow drop to root (null target)', () => {
    expect(canDropLocation('city-1', null, mockLocations)).toBe(true);
  });

  it('should not allow drop on itself', () => {
    expect(canDropLocation('city-1', 'city-1', mockLocations)).toBe(false);
  });

  it('should not allow drop on direct child', () => {
    // Cannot drop region-1 (Sword Coast) on city-1 (Waterdeep, its child)
    expect(canDropLocation('region-1', 'city-1', mockLocations)).toBe(false);
  });

  it('should not allow drop on indirect descendant', () => {
    // Cannot drop region-1 on building-1 (Yawning Portal, descendant of Waterdeep)
    expect(canDropLocation('region-1', 'building-1', mockLocations)).toBe(false);
  });

  it('should allow drop on sibling', () => {
    // Can drop city-1 (Waterdeep) on city-2 (Baldur's Gate)
    expect(canDropLocation('city-1', 'city-2', mockLocations)).toBe(true);
  });

  it('should allow drop on ancestor', () => {
    // Can drop city-1 (Waterdeep) on continent-1 (Faerûn, its ancestor)
    expect(canDropLocation('city-1', 'continent-1', mockLocations)).toBe(true);
  });

  it('should allow drop on unrelated location', () => {
    // Can drop city-1 (Waterdeep) on continent-2 (Kara-Tur)
    expect(canDropLocation('city-1', 'continent-2', mockLocations)).toBe(true);
  });
});

describe('buildBreadcrumb', () => {
  it('should build breadcrumb path for nested location', () => {
    const breadcrumb = buildBreadcrumb('building-1', mockLocations);

    expect(breadcrumb).toHaveLength(4);
    expect(breadcrumb[0].name).toBe('Faerûn');
    expect(breadcrumb[1].name).toBe('Sword Coast');
    expect(breadcrumb[2].name).toBe('Waterdeep');
    expect(breadcrumb[3].name).toBe('Yawning Portal');
  });

  it('should build breadcrumb for root location', () => {
    const breadcrumb = buildBreadcrumb('continent-1', mockLocations);

    expect(breadcrumb).toHaveLength(1);
    expect(breadcrumb[0].name).toBe('Faerûn');
  });

  it('should handle non-existent location', () => {
    const breadcrumb = buildBreadcrumb('non-existent', mockLocations);

    expect(breadcrumb).toEqual([]);
  });

  it('should handle orphaned location (broken parent chain)', () => {
    const locationsWithBrokenChain: Location[] = [
      {
        id: 'orphan-1',
        campaign_id: 'campaign-1',
        name: 'Orphaned City',
        location_type: 'miasto',
        parent_location_id: 'non-existent-parent',
        description_json: null,
        image_url: null,
        coordinates_json: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    const breadcrumb = buildBreadcrumb('orphan-1', locationsWithBrokenChain);

    // Should return path up to where chain breaks
    expect(breadcrumb).toHaveLength(1);
    expect(breadcrumb[0].name).toBe('Orphaned City');
  });
});

describe('getAllDescendantIds', () => {
  it('should get all descendant IDs for location with multiple levels', () => {
    const descendants = getAllDescendantIds('continent-1', mockLocations);

    expect(descendants.size).toBe(4); // region-1, city-1, building-1, city-2
    expect(descendants.has('region-1')).toBe(true);
    expect(descendants.has('city-1')).toBe(true);
    expect(descendants.has('building-1')).toBe(true);
    expect(descendants.has('city-2')).toBe(true);
  });

  it('should get direct children only', () => {
    const descendants = getAllDescendantIds('region-1', mockLocations);

    expect(descendants.size).toBe(3); // city-1, building-1, city-2
    expect(descendants.has('city-1')).toBe(true);
    expect(descendants.has('city-2')).toBe(true);
    expect(descendants.has('building-1')).toBe(true);
  });

  it('should return empty set for leaf location', () => {
    const descendants = getAllDescendantIds('building-1', mockLocations);

    expect(descendants.size).toBe(0);
  });

  it('should return empty set for non-existent location', () => {
    const descendants = getAllDescendantIds('non-existent', mockLocations);

    expect(descendants.size).toBe(0);
  });
});
