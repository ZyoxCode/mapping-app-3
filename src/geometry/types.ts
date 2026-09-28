import type {Point, Bounds} from '../types';
import type {Style} from '../style';

export interface ProcessedGeometry {
    bbox: Bounds;
    centroid: Point | null;
}

// GeometryType is the structure before it is processed and then ProcessedGeometryType is after
export interface GeometryHandler<GeometryType, PreparedGeometryType, ProcessedGeometryType extends ProcessedGeometry> {
    process(geometry: GeometryType): PreparedGeometryType | null;
    buildSimplified(prepared: PreparedGeometryType, minArea: number): ProcessedGeometryType | null;
    appendToPath(path: Path2D, processed: ProcessedGeometryType, scale: number, style: Style): void;
}