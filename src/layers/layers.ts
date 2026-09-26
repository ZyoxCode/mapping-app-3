import { Layer, type Feature } from './layer';
import { Style } from '../style';
import { processGeometry } from '../geometry';

function buildFeature(type: string, coordinates: number[][][]): Feature | null {
  const geometry = processGeometry({ type, coordinates });
  return geometry ? { type, geometry } : null;
}

const oceanFeature = buildFeature('Polygon', [[
  [-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85],
]]);

export const oceanLayer = new Layer(
  'Ocean',
  new Style({ fillStyle: '#4f86aa', lineWidth: 0 }),
  oceanFeature ? [oceanFeature] : [],
);

export const allLayers: Layer[] = [oceanLayer];