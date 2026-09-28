import { Layer, type Feature } from './layer';
import { Style } from '../style';
import { processGeometry, buildGeometryForZoom } from '../geometry';
import { ShapefileLayer } from './shapefile-layer';
import { DEFAULT_ZOOM_LEVELS, type ZoomLevel } from '../geometry/zoom-levels';

function buildFeature(type: string, coordinates: number[][][], zoomLevels: ZoomLevel[] = DEFAULT_ZOOM_LEVELS): Feature | null {
    const prepared = processGeometry({ type, coordinates });
    if (!prepared) return null;

    const geometryByZoom = zoomLevels.map(level => buildGeometryForZoom(prepared, level.minArea));
    if (geometryByZoom.every(g => g === null)) return null;

    return { type, geometryByZoom };
}
const alwaysMaxDetail = [{upperBound: Infinity, minArea: 0}]

const oceanFeature = buildFeature('Polygon', [[
    [-180, -90], [180, -90], [180, 90], [-180, 90], 
]], alwaysMaxDetail);

// const testFeature = buildFeature('Polygon', [[
//     [-20, -20], [-20, 20], [0, 22], [20, 20], [20, -20]
// ]], alwaysMaxDetail);

export const allLayers: Layer[] = [
    new Layer(
        'Ocean',
        new Style({ fillStyle: '#4f86aa', lineWidth: 0 }),
        oceanFeature ? [oceanFeature] : [],
        alwaysMaxDetail,
        true,
        false,
    ),
    new ShapefileLayer(
        'Land', 
        new Style({fillStyle: '#92c592', lineWidth: 0}), 
        'ne_10m_land',
    ),
    new ShapefileLayer(
        'Glaciers', 
        new Style({fillStyle: '#f3f3f3', lineWidth: 0}), 
        'ne_10m_glaciated_areas',

    ),
    new ShapefileLayer(
        'Lakes', 
        new Style({fillStyle: '#4f86aa', lineWidth: 0}), 
        'ne_10m_lakes',
    ),
];