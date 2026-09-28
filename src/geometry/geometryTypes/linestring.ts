import { registerGeometry } from '../registry';
import type { ProcessedGeometry } from '../types';


import {logger} from '../../utils/logging';
import { buildLineForZoom, processLine, type PreparedLineString } from '../linestring-utils';

interface LineStringGeometry {
    type: 'LineString';
    coordinates: number[][]; // Array of points | points are array of 2 numbers
}

interface ProcessedLineStringGeometry extends ProcessedGeometry {
    path: Path2D;
}



registerGeometry<LineStringGeometry, PreparedLineString, ProcessedLineStringGeometry>('LineString', {
    process(geometry) {
        const processed = processLine(geometry.coordinates);
        return processed;
    },
    buildSimplified(prepared, minArea) {
        const built = buildLineForZoom(prepared.path, minArea);
        return built ? { path: built.path, bbox: built.bbox, centroid: null } : null;
    },
    appendToPath(mergedPath, processed, visibleBounds) {
        logger.increment('RingRenderCount', 1);
        mergedPath.addPath(processed.path);
    },
});
