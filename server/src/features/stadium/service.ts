// Stadium feature logic: facility lookup for the client's quick actions and
// the grounding context injected into every Gemini prompt.
import type { Amenity, AmenityKind } from './types.js';
import { ARENA } from './venue-data.js';

/**
 * Returns venue facilities, optionally filtered by category.
 *
 * @param category - When provided, only facilities of this category.
 */
export function getAmenities(category?: AmenityKind): Amenity[] {
  if (category === undefined) {
    return ARENA.facilities;
  }
  return ARENA.facilities.filter((facility) => facility.category === category);
}

function formatEntryPoints(): string {
  return ARENA.gates
    .map((gate) => `- ${gate.name}: serves ${gate.serves}${gate.accessible ? ' (step-free)' : ''}`)
    .join('\n');
}

function formatAmenities(): string {
  return ARENA.facilities
    .map(
      (facility) =>
        `- ${facility.name} [${facility.category}] — ${facility.location}. ${facility.details}`,
    )
    .join('\n');
}

function formatTravelOptions(): string {
  return ARENA.transit
    .map((route) => `- ${route.name} (${route.mode}): ${route.guidance}`)
    .join('\n');
}

/**
 * Builds the compact venue description that grounds assistant answers,
 * so the model answers from real venue data instead of inventing it.
 */
export function assembleVenueContext(): string {
  return [
    `Venue: ${ARENA.name}, ${ARENA.city} — ${ARENA.tournament}. Capacity ${String(ARENA.capacity)}.`,
    'GATES:',
    formatEntryPoints(),
    'FACILITIES:',
    formatAmenities(),
    'TRANSPORT:',
    formatTravelOptions(),
  ].join('\n');
}
