import { Layer, type Feature } from './layer';
import { Style } from '../styles/style';
import { processGeometry, buildGeometryForZoom } from '../geometry';
import { ShapefileLayer } from './shapefile-layer';
import { DEFAULT_ZOOM_LEVELS, type ZoomLevel } from '../geometry/zoom-levels';
import { always, type StyleRule } from '../styles/style-rule';

function buildFeature(type: string, coordinates: number[][][], properties: Record<string, any> = {}, zoomLevels: ZoomLevel[] = DEFAULT_ZOOM_LEVELS): Feature | null {
    const prepared = processGeometry({ type, coordinates });
    if (!prepared) return null;

    const geometryByZoom = zoomLevels.map(level => buildGeometryForZoom(prepared, level.minArea));
    if (geometryByZoom.every(g => g === null)) return null;

    return { type, properties, geometryByZoom };
}
const alwaysMaxDetail = [{upperBound: Infinity, minArea: 0}]

const oceanFeature = buildFeature('Polygon', [[
    [-180, -90], [180, -90], [180, 90], [-180, 90], 
]], alwaysMaxDetail);

// const testFeature = buildFeature('Polygon', [[
//     [-20, -20], [-20, 20], [0, 22], [20, 20], [20, -20]
// ]], alwaysMaxDetail);

const disputedStyle = new Style({strokeStyle: '#000000', lineWidth: 0.5, dashed: [5, 5]}, false)

const boundaryStyleRules: StyleRule[] = [
    { when: (props) => props.FEATURECLA === 'Disputed (please verify)', style: disputedStyle},
    { when: () => true, style: new Style({ strokeStyle: '#000000', lineWidth: 0.5 }, false) },
]


export const allLayers: Layer[] = [
    new Layer(
        'Ocean',
        always(new Style({ fillStyle: '#4f86aa', lineWidth: 0 })),
        oceanFeature ? [oceanFeature] : [],
        alwaysMaxDetail,
        true,
        false,
    ),
    new ShapefileLayer(
        'Land', 
        always(new Style({fillStyle: '#92c592', lineWidth: 0})), 
        'ne_10m_land',
    ),
    new ShapefileLayer(
        'Glaciers', 
        always (new Style({fillStyle: '#f3f3f3', lineWidth: 0})), 
        'ne_10m_glaciated_areas',

    ),
    new ShapefileLayer(
        'Lakes', 
        always (new Style({fillStyle: '#4f86aa', lineWidth: 0})), 
        'ne_10m_lakes',
    ),
    new ShapefileLayer(
        'Boundaries', 
        boundaryStyleRules, 
        'ne_10m_admin_0_boundary_lines_land',
    ),
];