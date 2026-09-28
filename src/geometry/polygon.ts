import { registerGeometry } from './registry';
import type { ProcessedGeometry } from './types';
import type { Bounds } from '../types';
import type { PreparedPolygon } from './polygon-utils';

import {buildPolygonForZoom, processPolygonRings } from './polygon-utils';




interface PolygonGeometry {
    type: 'Polygon';
    coordinates: number[][][]; // array of rings | rings are array of points | points are array of 2 numbers
}

interface ProcessedPolygonGeometry extends ProcessedGeometry {
    path: Path2D;
    holes: Path2D[];
}

registerGeometry<PolygonGeometry, PreparedPolygon, ProcessedPolygonGeometry>('Polygon', {
    process(geometry) {
        return processPolygonRings(geometry.coordinates);
    },
    buildSimplified(prepared, minArea) {
        const bbox: Bounds = {minCorner: {x: Infinity, y: Infinity}, maxCorner: {x: -Infinity, y: -Infinity}};
        const built = buildPolygonForZoom(prepared, minArea, bbox);
        return built ? { path: built.path, holes: built.holes, bbox, centroid: null } : null;
    },
    appendToPath(mergedPath, processed) {
        mergedPath.addPath(processed.path);
        for (const hole of processed.holes) {
            mergedPath.addPath(hole);
        }
    },
});
