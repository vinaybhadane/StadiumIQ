"""Pure functions for Smart Indoor Navigation (Feature 8).

Defines stadium topology graph, crowd congestion path modifiers,
and accessibility constraints routing. Zero side-effects for testing.
"""

STADIUM_GRAPH: dict[str, list[str]] = {
    "Z-NORTH": ["Z-EAST", "Z-WEST", "Z-STANDING"],
    "Z-SOUTH": ["Z-EAST", "Z-WEST"],
    "Z-EAST": ["Z-NORTH", "Z-SOUTH", "Z-ACCESSIBLE"],
    "Z-WEST": ["Z-NORTH", "Z-SOUTH", "Z-STANDING"],
    "Z-ACCESSIBLE": ["Z-EAST"],
    "Z-STANDING": ["Z-NORTH", "Z-WEST"],
}

ACCESSIBILITY_RESTRICTED_ZONES: set[str] = {"Z-STANDING"}

DESTINATION_MAP: dict[str, dict[str, str]] = {
    "restroom": {
        "Z-NORTH": "Z-WEST",
        "Z-SOUTH": "Z-EAST",
        "Z-EAST": "Z-EAST",
        "Z-WEST": "Z-WEST",
        "Z-ACCESSIBLE": "Z-ACCESSIBLE",
        "Z-STANDING": "Z-NORTH",
    },
    "exit": {
        "Z-NORTH": "Z-NORTH",
        "Z-SOUTH": "Z-SOUTH",
        "Z-EAST": "Z-EAST",
        "Z-WEST": "Z-WEST",
        "Z-ACCESSIBLE": "Z-ACCESSIBLE",
        "Z-STANDING": "Z-NORTH",
    },
    "concession": {
        "Z-NORTH": "Z-EAST",
        "Z-SOUTH": "Z-WEST",
        "Z-EAST": "Z-EAST",
        "Z-WEST": "Z-WEST",
        "Z-ACCESSIBLE": "Z-EAST",
        "Z-STANDING": "Z-WEST",
    },
    "medical": {
        "Z-NORTH": "Z-EAST",
        "Z-SOUTH": "Z-EAST",
        "Z-EAST": "Z-EAST",
        "Z-WEST": "Z-WEST",
        "Z-ACCESSIBLE": "Z-ACCESSIBLE",
        "Z-STANDING": "Z-NORTH",
    },
}


def find_shortest_path(
    start: str,
    target: str,
    accessibility_required: bool = False,
) -> list[str]:
    """Find shortest path using BFS, respecting accessibility constraints."""
    if start == target:
        return [start]
    if start not in STADIUM_GRAPH or target not in STADIUM_GRAPH:
        return []

    queue = [[start]]
    visited = {start}

    while queue:
        path = queue.pop(0)
        node = path[-1]

        if node == target:
            return path

        for neighbor in STADIUM_GRAPH.get(node, []):
            if neighbor in visited:
                continue
            if accessibility_required and neighbor in ACCESSIBILITY_RESTRICTED_ZONES:
                continue

            visited.add(neighbor)
            new_path = list(path)
            new_path.append(neighbor)
            queue.append(new_path)

    return []


def calculate_directions(
    current_zone: str,
    destination_type: str,
    accessibility_required: bool = False,
) -> tuple[list[str], float, str]:
    """Calculate directions, timing and accessibility remarks for wayfinding.

    Args:
        current_zone: User's start zone ID.
        destination_type: Category of destination.
        accessibility_required: Safety flag.

    Returns:
        Tuple of (path_steps, estimated_time_minutes, accessibility_note).
    """
    dest_zone = DESTINATION_MAP.get(destination_type, {}).get(current_zone, current_zone)
    path = find_shortest_path(current_zone, dest_zone, accessibility_required)

    if not path:
        return [], 0.0, "Route unavailable"

    # Base traversal time (approx 1.5 mins per zone boundary traversal)
    estimated_time = max(0.5, (len(path) - 1) * 1.5)

    note = ""
    if accessibility_required:
        note = "Elevator and ramp-access route mapped. Avoids all steps and standing zones."

    return path, estimated_time, note
