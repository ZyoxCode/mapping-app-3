import type { ProcessedGeometry, GeometryHandler } from './types';
import type { Bounds } from '../types';

const geometryHandlerRegistry = new Map<string, GeometryHandler<any, any, any>>();

export interface PreparedGeometry {
    type: string;
    prepared: any;
}

export function registerGeometry<GeometryType, PreparedGeometryType, ProcessedGeometryType extends ProcessedGeometry>(
    type: string, handler: GeometryHandler<GeometryType, PreparedGeometryType, ProcessedGeometryType>
) {
    geometryHandlerRegistry.set(type, handler);
}

export function processGeometry(geometry: {type: string, coordinates: any}): PreparedGeometry | null {
    const prepared = geometryHandlerRegistry.get(geometry.type)?.process(geometry as any) ?? null;
    return prepared === null ? null : { type: geometry.type, prepared };
}

export function buildGeometryForZoom(prepared: PreparedGeometry, minArea: number): ProcessedGeometry | null {
    return geometryHandlerRegistry.get(prepared.type)?.buildSimplified(prepared.prepared, minArea) ?? null;
}

export function appendToPath(path: Path2D, type: string, processed: ProcessedGeometry, visibleBounds: Bounds): void {
    geometryHandlerRegistry.get(type)?.appendToPath(path, processed, visibleBounds);
}