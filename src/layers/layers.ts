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
const testDetail = [
    {upperBound: 2, minArea: 0.7},
    {upperBound: 3, minArea: 0.35},
    {upperBound: 4, minArea: 0.1},
    {upperBound: 6, minArea: 0.01},
    {upperBound: 8, minArea: 0.001},
    {upperBound: 11, minArea: 0.0001},
    {upperBound: 14, minArea: 0.00001},
    // {upperBound: 2.5, minArea: 1.5}, 
    // {upperBound: 3, minArea: 1},
    // {upperBound: 3.5, minArea: 0.5},
    {upperBound: Infinity, minArea: 0}
]
const oceanFeature = buildFeature('Polygon', [[
    [-180, -90], [180, -90], [180, 90], [-180, 90], 
]], alwaysMaxDetail);

export const allLayers: Layer[] = [
    new Layer(
        'Ocean',
        new Style({ fillStyle: '#4f86aa', lineWidth: 0 }),
        oceanFeature ? [oceanFeature] : [],
        alwaysMaxDetail,
    ),
    new ShapefileLayer(
        'Land', 
        new Style({fillStyle: '#92c592', lineWidth: 0}), 
        'ne_10m_land',
        testDetail,
        true,
    ),
    new ShapefileLayer(
        'Glaciers', 
        new Style({fillStyle: '#f3f3f3', lineWidth: 0}), 
        'ne_10m_glaciated_areas',
        testDetail,
        true,
    ),
    new ShapefileLayer(
        'Lakes', 
        new Style({fillStyle: '#4f86aa', lineWidth: 0}), 
        'ne_10m_lakes',
        testDetail,
        true,
    ),
];