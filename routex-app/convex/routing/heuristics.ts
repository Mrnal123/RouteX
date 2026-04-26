/**
 * Computes the Euclidean (straight-line) distance between two lat/lng coordinates.
 * Good for drone deliveries or highly connected grids.
 */
export function euclideanDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2));
}

/**
 * Computes the Manhattan (taxicab) distance between two lat/lng coordinates.
 * Operates well as a heuristic for grid-based city blocks.
 */
export function manhattanDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  return Math.abs(lat1 - lat2) + Math.abs(lng1 - lng2);
}
