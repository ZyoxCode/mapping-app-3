import { registerGeometry } from '../registry';
import type { ProcessedGeometry } from '../types';
import type { BuiltRing, PreparedPolygon } from '../polygon-utils';

import {buildPolygonForZoom, processPolygonRings } from '../polygon-utils';
import { boundsIntersect } from '../../utils/math';

import {logger} from '../../utils/logging';

interface PolygonGeometry {
    type: 'Polygon';
    coordinates: number[][][]; // array of rings | rings are array of points | points are array of 2 numbers
}

interface ProcessedPolygonGeometry extends ProcessedGeometry {
    path: Path2D;
    holes: BuiltRing[];
}

registerGeometry<PolygonGeometry, PreparedPolygon, ProcessedPolygonGeometry>('Polygon', {
    process(geometry) {
        const processed = processPolygonRings(geometry.coordinates);
        //logger.logThrottled('Geometry Print', 1000, 'Processed Polygon', processed);
        return processed;
    },
    buildSimplified(prepared, minArea) {
        const built = buildPolygonForZoom(prepared, minArea);
        return built ? { path: built.path.path, holes: built.holes, bbox: built.bbox, centroid: null } : null;
    },
    appendToPath(mergedPath, processed, visibleBounds) {
        logger.increment('RingRenderCount', 1);
        mergedPath.addPath(processed.path);
        
        for (const hole of processed.holes) {    
            if (!boundsIntersect(visibleBounds, hole.bbox)) continue;
            mergedPath.addPath(hole.path);
            logger.increment('RingRenderCount', 1);
        }
    },
});
