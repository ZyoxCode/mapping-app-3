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
    holes: Path2D[];
}

function ringToPath(ring: number[][], bbox: Bounds): Path2D {
    const path = new Path2D();
    ring.forEach(([lon, lat], i) => {
        const {x, y} = lonLatToMercator({x: lon, y: lat});
        updateBounds(bbox, x, y);
        i === 0 ? path.moveTo(x, y) : path.lineTo(x, y);
    });
    path.closePath();
    return path;
}

registerGeometry<PolygonGeometry, ProcessedPolygonGeometry>('Polygon', {
    process(geometry) {
        const [outerRing, ...holeRings] = geometry.coordinates;
        if (!outerRing || outerRing.length === 0) return null;

        const bbox: Bounds = {minCorner: {x: Infinity, y: Infinity}, maxCorner: {x: -Infinity, y: -Infinity}};
        const path = ringToPath(outerRing, bbox);
        const holes = holeRings.map((ring) => ringToPath(ring, bbox));

        return { path, holes, coordinates: geometry.coordinates, bbox, centroid: null };
    },
    appendToPath(mergedPath, processed) {
        mergedPath.addPath(processed.path);
        for (const hole of processed.holes) {
            mergedPath.addPath(hole);
        }
    },
});