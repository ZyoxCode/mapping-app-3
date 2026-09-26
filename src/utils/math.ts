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
        x: clampLon(mercatorX(x)),
        y: clampLat(mercatorY(y))
    };
}

export function updateBounds({maxCorner, minCorner}: Bounds, x: number, y: number) {
    minCorner.x = Math.min(minCorner.x, x);
    minCorner.y = Math.min(minCorner.y, y);
    maxCorner.x = Math.max(maxCorner.x, x);
    maxCorner.y = Math.max(maxCorner.y, y);
}