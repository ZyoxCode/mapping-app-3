import { Layer, type Feature } from './layer';
import { Style } from '../style';
import { processGeometry } from '../geometry';
import { ShapefileLayer } from './shapefile-layer';

function buildFeature(type: string, coordinates: number[][][]): Feature | null {
  const geometry = processGeometry({ type, coordinates });
  return geometry ? { type, geometry } : null;
}

const oceanFeature = buildFeature('Polygon', [[
    [-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90],
]]);


export const allLayers: Layer[] = [
    new Layer(
        'Ocean',
        new Style({ fillStyle: '#4f86aa', lineWidth: 0 }),
        oceanFeature ? [oceanFeature] : [],
    ),
    new ShapefileLayer('Land', new Style({fillStyle: '#92c592', lineWidth: 0}), 'ne_110m_land'),
    new ShapefileLayer('Glaciers', new Style({fillStyle: '#f3f3f3', lineWidth: 0}), 'ne_110m_glaciated_areas'),
    new ShapefileLayer('Glaciers', new Style({fillStyle: '#4f86aa', lineWidth: 0}), 'ne_110m_lakes'),
];