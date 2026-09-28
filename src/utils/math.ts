import type {Bounds, Point} from '../types';

function clampLat(lat: number): number {
    return Math.max(-85.05112878, Math.min(85.05112878, lat));
}

function clampLon(lon: number): number {
    return Math.max(-180, Math.min(180, lon));
}

function mercatorX(lon: number): number {
    return lon * Math.PI / 180;
}

function mercatorY(lat: number): number {
    const latRad = lat * Math.PI / 180;
    return Math.log(Math.tan(Math.PI / 4 + latRad / 2));
}

export function lonLatToMercator({ x, y }: Point): Point {
    return {
        x: mercatorX(clampLon(x)),
        y: mercatorY(clampLat(y))
    };
}

export function scaleToWebMercatorZoom(currentScale: number, tileSize: number = 256): number {
    if (currentScale <= 0) return 0;
    
    const zoom = Math.log2(currentScale / tileSize);
    
    return Math.max(0, zoom);
}

export function updateBounds({maxCorner, minCorner}: Bounds, x: number, y: number) {
    minCorner.x = Math.min(minCorner.x, x);
    minCorner.y = Math.min(minCorner.y, y);
    maxCorner.x = Math.max(maxCorner.x, x);
    maxCorner.y = Math.max(maxCorner.y, y);
}

export function boundsIntersect({maxCorner: maxCorner1, minCorner: minCorner1}: Bounds, {maxCorner: maxCorner2, minCorner: minCorner2}: Bounds) {

    return maxCorner1.x >= minCorner2.x && maxCorner2.x >= minCorner1.x && maxCorner1.y >= minCorner2.y && maxCorner2.y >= minCorner1.y
}

export function unionBounds(boxes: Bounds[]): Bounds {
    const result: Bounds = { maxCorner: { x: -Infinity, y: -Infinity }, minCorner: { x: Infinity, y: Infinity } };
    for (const b of boxes) {
        result.minCorner.x = Math.min(result.minCorner.x, b.minCorner.x);
        result.minCorner.y = Math.min(result.minCorner.y, b.minCorner.y);
        result.maxCorner.x = Math.max(result.maxCorner.x, b.maxCorner.x);
        result.maxCorner.y = Math.max(result.maxCorner.y, b.maxCorner.y);
    }
    return result;
}

export function vectorFromTo([x1, y1]: number[], [x2, y2]: number[]): number[] {
    return [x2 - x1, y2 - y1];
}

export function getVectorMagnitude([x, y]: number[]): number {
    return Math.sqrt(x * x + y * y);
}
export function getVectorAngle([x1, y1]: number[], [x2, y2]: number[]): number {
    const cos = (x1 * x2 + y1 * y2) / (getVectorMagnitude([x1, y1]) * getVectorMagnitude([x2, y2]));
    return Math.acos(Math.max(-1, Math.min(1, cos)));
}

export function degreesToRadians(degrees: number): number {
    return degrees * Math.PI / 180;
}

export function radiansToDegrees(radians: number): number {
    return radians * 180 / Math.PI;
}

export function triangleArea(a: number[], b: number[], c: number[]): number {
    return Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) / 2;
}