import { registerGeometry } from './registry';
import type { ProcessedGeometry } from './types';
import type { Bounds } from '../types';
import { lonLatToMercator, updateBounds } from '../utils/math';


interface PolygonGeometry {
    type: 'Polygon';
    coordinates: number[][][]; // array of rings | rings are array of points | points are array of 2 numbers
}

interface ProcessedPolygonGeometry extends ProcessedGeometry {
    path: Path2D;
}

// Does not take into account multiple rings in a polygon
registerGeometry<PolygonGeometry, ProcessedPolygonGeometry>('Polygon', {
    process(geometry) {
        const ring = geometry.coordinates[0];
        if (!ring || ring.length === 0) return null;

        const path = new Path2D();
        const bbox: Bounds = {minCorner: {x: Infinity, y: Infinity}, maxCorner: {x: -Infinity, y: -Infinity}};

        ring.forEach(([lon, lat], i) => {
        const {x, y} = lonLatToMercator({x: lon, y: lat});
        updateBounds(bbox, x, y);
        i === 0 ? path.moveTo(x, y) : path.lineTo(x, y);
        });
        path.closePath();

        return { path, coordinates: geometry.coordinates, bbox, centroid: null };
    },
    appendToPath(mergedPath, prepared) {
        mergedPath.addPath(prepared.path);
    },
});