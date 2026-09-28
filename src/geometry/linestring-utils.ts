import type { Bounds } from "../types";
import { lonLatToMercator } from "../utils/math";
import { computeRemovalAreas, filterByRemovalArea } from "./augmentation";
import { computeCoordsBounds, coordsToPath } from "./general-utils";

export interface ProcessedLine {
    coords: number[][];
    length: number;
    removalAreas: number[];
    bbox: Bounds;
}

export interface PreparedLineString {
    path: ProcessedLine;
    bbox: Bounds;
}

export interface BuiltLine {
    path: Path2D;
    bbox: Bounds;
}

function coordsEqual(a: number[], b: number[], epsilon = 1e-5): boolean {
    return Math.abs(a[0] - b[0]) < epsilon && Math.abs(a[1] - b[1]) < epsilon;
}

function isClosedLine(coords: number[][]): boolean {
    return coords.length >= 3 && coordsEqual(coords[0], coords[coords.length - 1]);
}


export function processLine(line: number[][]): PreparedLineString {
    const closed = isClosedLine(line);
    const processed = {
        coords: line,
        length: 0, // placeholder
        removalAreas: computeRemovalAreas(line, closed),
        bbox: computeCoordsBounds(line),
    }
    return {path: processed, bbox: processed.bbox};
}

export function buildLineForZoom(processed: ProcessedLine, minArea: number): BuiltLine {
    const path = coordsToPath(filterByRemovalArea(processed.coords, processed.removalAreas, minArea, true));
    return { path, bbox: processed.bbox };
}