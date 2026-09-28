import { registerGeometry } from './registry';
import type { ProcessedGeometry } from './types';
import type { Bounds } from '../types';
import { processPolygonRings, buildPolygonForZoom, type PreparedPolygon, type PolygonRings } from './polygon-utils';

interface MultiPolygonGeometry {
    type: 'MultiPolygon';
    coordinates: number[][][][];
}

type PreparedMultiPolygon = PreparedPolygon[];

interface ProcessedMultiPolygonGeometry extends ProcessedGeometry {
    polygons: PolygonRings[];
}

registerGeometry<MultiPolygonGeometry, PreparedMultiPolygon, ProcessedMultiPolygonGeometry>('MultiPolygon', {
    process(geometry) {
        const prepared = geometry.coordinates
            .map(rings => processPolygonRings(rings))
            .filter((p): p is PreparedPolygon => p !== null);
        return prepared.length > 0 ? prepared : null;
    },
    buildSimplified(prepared, minArea) {
        const bbox: Bounds = { minCorner: { x: Infinity, y: Infinity }, maxCorner: { x: -Infinity, y: -Infinity } };
        const polygons = prepared
            .map(p => buildPolygonForZoom(p, minArea, bbox))
            .filter((p): p is PolygonRings => p !== null);
        return polygons.length > 0 ? { polygons, bbox, centroid: null } : null;
    },
    appendToPath(mergedPath, processed) {
        for (const { path, holes } of processed.polygons) {
            mergedPath.addPath(path);
            for (const hole of holes) {
                mergedPath.addPath(hole);
            }
        }
    },
});