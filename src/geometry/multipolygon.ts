import { registerGeometry } from './registry';
import type { ProcessedGeometry } from './types';
import type { Bounds } from '../types';
import { processPolygonRings, buildPolygonForZoom, type PreparedPolygon, type PolygonRings } from './polygon-utils';
import { boundsIntersect, unionBounds } from '../utils/math';

import {logger} from '../utils/logging';

interface MultiPolygonGeometry {
    type: 'MultiPolygon';
    coordinates: number[][][][];
}

interface PreparedMultiPolygon {
    polygons: PreparedPolygon[];
    bbox: Bounds;
} 

interface ProcessedMultiPolygonGeometry extends ProcessedGeometry {
    polygons: PolygonRings[];
}

registerGeometry<MultiPolygonGeometry, PreparedMultiPolygon, ProcessedMultiPolygonGeometry>('MultiPolygon', {
    process(geometry) {
        const polygons = geometry.coordinates.map(
            rings => processPolygonRings(rings)
        ).filter(
            (p): p is PreparedPolygon => p !== null
        );

        if (polygons.length === 0) return null;
        return { polygons, bbox: unionBounds(polygons.map((p) => {
            return p.bbox;
        }))};
    },
    buildSimplified(prepared, minArea) {
        
        const polygons = prepared.polygons.map(
            p => buildPolygonForZoom(p, minArea)
        ).filter(
            (p): p is PolygonRings => p !== null
        );

        return polygons.length > 0 ? { polygons, bbox: prepared.bbox, centroid: null } : null;
    },
    appendToPath(mergedPath, processed, visibleBounds) {

        for (const { path, holes, bbox } of processed.polygons) {
            if (!boundsIntersect(bbox, visibleBounds)) continue;

            logger.increment('RingRenderCount', 1);
            mergedPath.addPath(path.path);
            for (const hole of holes) {
                if (!boundsIntersect(hole.bbox, visibleBounds)) continue;
                mergedPath.addPath(hole.path);
                logger.increment('RingRenderCount', 1);
            }
        }
    },
});