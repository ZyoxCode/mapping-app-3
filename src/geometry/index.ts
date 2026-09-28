import './geometryTypes/polygon';
import './geometryTypes/multipolygon';
import './geometryTypes/linestring';
import './geometryTypes/multilinestring';

export { processGeometry, buildGeometryForZoom, appendToPath } from './registry';
export type { ProcessedGeometry } from './types';