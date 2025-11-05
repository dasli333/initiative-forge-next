import type { Location, LocationDTO } from '@/types/locations';

/**
 * Type representing the minimal location fields needed for tree operations
 */
type TreeLocation = Pick<Location, 'id' | 'name' | 'parent_location_id' | 'location_type'>;

/**
 * Tree node data structure for hierarchical location display
 */
export interface LocationTreeData<T extends TreeLocation = TreeLocation> {
  location: T;
  children: LocationTreeData<T>[];
  isExpanded: boolean;
  childrenCount: number;
}

/**
 * Builds a hierarchical tree structure from a flat array of locations
 * @param locations - Flat array of all locations
 * @param expandedNodes - Set of location IDs that should be expanded
 * @returns Array of root LocationTreeData nodes
 */
export function buildLocationTree<T extends TreeLocation>(
  locations: T[],
  expandedNodes: Set<string> = new Set()
): LocationTreeData<T>[] {
  // Create a map for quick lookup
  const map = new Map<string, LocationTreeData<T>>();

  // Initialize map with all locations
  locations.forEach((loc) => {
    map.set(loc.id, {
      location: loc,
      children: [],
      isExpanded: expandedNodes.has(loc.id),
      childrenCount: 0,
    });
  });

  // Build the tree structure
  const roots: LocationTreeData<T>[] = [];

  locations.forEach((loc) => {
    const node = map.get(loc.id)!;

    if (loc.parent_location_id) {
      // This location has a parent
      const parent = map.get(loc.parent_location_id);
      if (parent) {
        parent.children.push(node);
        parent.childrenCount++;
      } else {
        // Parent not found (orphaned node), treat as root
        roots.push(node);
      }
    } else {
      // This is a root location
      roots.push(node);
    }
  });

  // Sort children by name within each level
  const sortChildren = (node: LocationTreeData<T>) => {
    node.children.sort((a, b) => a.location.name.localeCompare(b.location.name));
    node.children.forEach(sortChildren);
  };

  roots.forEach(sortChildren);

  // Sort roots by name
  roots.sort((a, b) => a.location.name.localeCompare(b.location.name));

  return roots;
}

/**
 * Validates if a location can be dropped onto a target location
 * Prevents circular references by checking if target is a descendant of dragged location
 * @param draggedId - ID of the location being dragged
 * @param targetId - ID of the target parent location (null for root)
 * @param locations - All locations for validation
 * @returns true if the drop is valid, false otherwise
 */
export function canDropLocation<T extends TreeLocation>(
  draggedId: string,
  targetId: string | null,
  locations: T[]
): boolean {
  // Can always drop to root
  if (targetId === null) {
    return true;
  }

  // Cannot drop on itself
  if (draggedId === targetId) {
    return false;
  }

  // Check if target is a descendant of dragged location (circular reference)
  const isDescendant = (parentId: string, childId: string): boolean => {
    // Find all children of the parent
    const children = locations.filter((loc) => loc.parent_location_id === parentId);

    // If any child is the target, we found a circular reference
    if (children.some((child) => child.id === childId)) {
      return true;
    }

    // Recursively check children's descendants
    return children.some((child) => isDescendant(child.id, childId));
  };

  // If target is a descendant of dragged, it would create a circular reference
  return !isDescendant(draggedId, targetId);
}

/**
 * Builds a breadcrumb path from root to the specified location
 * @param locationId - ID of the target location
 * @param locations - All locations for path building
 * @returns Array of breadcrumb items from root to target
 */
export function buildBreadcrumb<T extends TreeLocation>(
  locationId: string,
  locations: T[]
): Array<{ id: string; name: string }> {
  const breadcrumb: Array<{ id: string; name: string }> = [];
  const locationMap = new Map(locations.map((loc) => [loc.id, loc]));

  let currentId: string | null = locationId;

  // Walk up the parent chain
  while (currentId) {
    const location = locationMap.get(currentId);
    if (!location) break;

    // Add to front of breadcrumb (we're walking backwards)
    breadcrumb.unshift({
      id: location.id,
      name: location.name,
    });

    currentId = location.parent_location_id;
  }

  return breadcrumb;
}

/**
 * Gets all descendant IDs of a location (recursive)
 * @param locationId - ID of the parent location
 * @param locations - All locations
 * @returns Set of all descendant location IDs
 */
export function getAllDescendantIds<T extends TreeLocation>(locationId: string, locations: T[]): Set<string> {
  const descendants = new Set<string>();

  const addDescendants = (parentId: string) => {
    const children = locations.filter((loc) => loc.parent_location_id === parentId);
    children.forEach((child) => {
      descendants.add(child.id);
      addDescendants(child.id);
    });
  };

  addDescendants(locationId);
  return descendants;
}
