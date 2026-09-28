import type { Bounds } from "../types";
import { lonLatToMercator, updateBounds } from "../utils/math";

export function computeCoordsBounds(coords: number[][]): Bounds {
    const bounds: Bounds = {maxCorner: {x: -Infinity, y: -Infinity}, minCorner: {x: Infinity, y: Infinity}};

    coords.forEach(([lon, lat]) => {
        const {x, y} = lonLatToMercator({x: lon, y: lat});
        updateBounds(bounds, x, y);
       
    });
    return bounds;
}

export function coordsToPath(coords: number[][]): Path2D {
    const path = new Path2D();
    coords.forEach(([lon, lat], i) => {
        const {x, y} = lonLatToMercator({x: lon, y: lat});
        i === 0 ? path.moveTo(x, y) : path.lineTo(x, y);
    });
    return path;
}