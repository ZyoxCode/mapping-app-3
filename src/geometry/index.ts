import './polygon'; // runs polygon.ts top-to-bottom, which calls registerGeometry — nothing is used from it directly
import './multipolygon';

export { processGeometry, buildGeometryForZoom, appendToPath } from './registry';
export type { ProcessedGeometry } from './types';