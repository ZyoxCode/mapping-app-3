import type { Bounds } from "../types";
import { logger } from "../utils/logging";
import { lonLatToMercator, updateBounds } from "../utils/math";
import { computeRemovalAreas, filterByRemovalArea } from "./augmentation";

export interface ProcessedRing {
    coords: number[][];
    area: number;
    removalAreas: number[];
    bbox: Bounds;
}

export interface PreparedPolygon {
    path: ProcessedRing;
    holes: ProcessedRing[];
    bbox: Bounds;
}

export interface BuiltRing {
    path: Path2D;
    bbox: Bounds;
}

export interface PolygonRings {
    path: BuiltRing;
    holes: BuiltRing[];
    bbox: Bounds;
}

export function ringToPath(ring: number[][]): Path2D {
    const path = new Path2D();
    ring.forEach(([lon, lat], i) => {
        const {x, y} = lonLatToMercator({x: lon, y: lat});
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

export function computeRingBounds(ring: number[][]): Bounds {
    const bounds: Bounds = {maxCorner: {x: -Infinity, y: -Infinity}, minCorner: {x: Infinity, y: Infinity}};

    ring.forEach(([lon, lat]) => {
        const {x, y} = lonLatToMercator({x: lon, y: lat});
        updateBounds(bounds, x, y);
       
    });

    return bounds;
}

export function processRing(ring: number[][]): ProcessedRing {
    return { 
        coords: ring, 
        area: ringArea(ring), 
        removalAreas: computeRemovalAreas(ring) ,
        bbox: computeRingBounds(ring),
    };
}

export function buildRingForZoom(processed: ProcessedRing, minArea: number): BuiltRing {
    const path = ringToPath(filterByRemovalArea(processed.coords, processed.removalAreas, minArea));
    return { path, bbox: processed.bbox };
}

export function processPolygonRings(rings: number[][][]): PreparedPolygon | null {
    const [outerRing, ...holeRings] = rings;
    if (!outerRing || outerRing.length === 0) return null;
    const outer = processRing(outerRing);
    return {
        path: outer,
        holes: holeRings.map(processRing),
        bbox: outer.bbox,
    }
}

export function buildPolygonForZoom(processed: PreparedPolygon, minArea: number): PolygonRings | null {
    if (processed.path.area < minArea) return null;

    const path = buildRingForZoom(processed.path, minArea);

    const holes = processed.holes.filter(
        hole => hole.area >= minArea
    ).map(
        hole => buildRingForZoom(hole, minArea)
    );

    return { path, holes, bbox: processed.bbox};
}