import type { ProcessedGeometry, GeometryHandler } from './types';
import type { Style } from '../style';

const geometryHandlerRegistry = new Map<string, GeometryHandler<any, any>>();

export function registerGeometry<GeometryType, ProcessedGeometryType extends ProcessedGeometry>(type: string, handler: GeometryHandler<GeometryType, ProcessedGeometryType>) {
    geometryHandlerRegistry.set(type, handler);
}

export function processGeometry(geometry: {type: string, coordinates: any}): ProcessedGeometry | null {
    return geometryHandlerRegistry.get(geometry.type)?.process(geometry as any) ?? null;
}

export function appendToPath(path: Path2D, type: string, processed: ProcessedGeometry, scale: number, style: Style): void {
    geometryHandlerRegistry.get(type)?.appendToPath(path, processed, scale, style);
}