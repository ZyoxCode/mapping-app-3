import type {Point, Bounds} from '../types';
import type {Style} from '../style';

export interface ProcessedGeometry {
    coordinates: any;
    bbox: Bounds;
    centroid: Point | null;
}

// GeometryType is the structure before it is processed and then ProcessedGeometryType is after
export interface GeometryHandler<GeometryType, ProcessedGeometryType extends ProcessedGeometry> {
    process(geometry: GeometryType): ProcessedGeometryType | null;
    appendToPath(path: Path2D, processed: ProcessedGeometryType, scale: number, style: Style): void;
}