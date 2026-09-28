import type { Bounds } from "../types";
import { lonLatToMercator, updateBounds } from "../utils/math";
import { computeRemovalAreas, filterByRemovalArea } from "./augmentation";

export interface ProcessedRing {
    coords: number[][];
    area: number;
    removalAreas: number[];
}

export interface PreparedPolygon {
    path: ProcessedRing;
    holes: ProcessedRing[];
}

export interface PolygonRings {
    path: Path2D;
    holes: Path2D[];
}

export function ringToPath(ring: number[][], bbox: Bounds): Path2D {
    const path = new Path2D();
    ring.forEach(([lon, lat], i) => {
        const {x, y} = lonLatToMercator({x: lon, y: lat});
        updateBounds(bbox, x, y);
        i === 0 ? path.moveTo(x, y) : path.lineTo(x, y);
    });
    path.closePath();
    return path;
}

export function ringArea(ring: number[][]): number {
    let area = 0;
    for (let i = 0; i < ring.length; i++) {
        const [x0, y0] = ring[i];
        const [x1, y1] = ring[(i + 1) % ring.length];
        area += x0 * y1 - x1 * y0;
    }
    return Math.abs(area / 2);
}

export function processRing(ring: number[][]): ProcessedRing {
    return { coords: ring, area: ringArea(ring), removalAreas: computeRemovalAreas(ring) };
}

export function buildRingForZoom(processed: ProcessedRing, minArea: number, bbox: Bounds): Path2D {
    return ringToPath(filterByRemovalArea(processed.coords, processed.removalAreas, minArea), bbox);
}

export function processPolygonRings(rings: number[][][]): PreparedPolygon | null {
    const [outerRing, ...holeRings] = rings;
    if (!outerRing || outerRing.length === 0) return null;

    return {
        path: processRing(outerRing),
        holes: holeRings.map(processRing),
    }
}

export function buildPolygonForZoom(processed: PreparedPolygon, minArea: number, bbox: Bounds): PolygonRings | null {
    if (processed.path.area < minArea) return null;

    const path = ringToPath(
        filterByRemovalArea(processed.path.coords, processed.path.removalAreas, minArea),
        bbox
    );

    const holes = processed.holes.filter(
        hole => hole.area >= minArea
    ).map(
        hole => ringToPath(filterByRemovalArea(hole.coords, hole.removalAreas, minArea), bbox)
    );

    return { path, holes };
}