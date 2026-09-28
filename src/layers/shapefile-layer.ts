import { Layer, type Feature } from './layer';
import { Style } from '../styles/style';
import { processGeometry } from '../geometry';
import { loadShapefile } from '../utils/shapefile';
import { DEFAULT_ZOOM_LEVELS, type ZoomLevel } from '../geometry/zoom-levels';
import { buildGeometryForZoom } from '../geometry/registry';
import type { StyleRule } from '../styles/style-rule';

export class ShapefileLayer extends Layer {
    path: string;

    constructor(name: string, styleRules: StyleRule[], path: string, zoomLevels: ZoomLevel[] = DEFAULT_ZOOM_LEVELS, enabled: boolean = true) {
        super(name, styleRules, [], zoomLevels, enabled);
        this.ready = false;
        this.path = path;
    }

    async load(): Promise<void> {
        const geojson = await loadShapefile(this.path);

        this.features = geojson.features.map(
            (feature): Feature | null => {
                const prepared = processGeometry(feature.geometry);
               
                if (!prepared) return null;
                const geometryByZoom = this.zoomLevels.map(level => {
                    const built = buildGeometryForZoom(prepared, level.minArea);
                    return built
                });
                if (geometryByZoom.every(g => g === null)) return null;
                
                return { type: feature.geometry.type, properties: feature.properties, geometryByZoom };
            }).filter((f): f is Feature => f !== null);
        console.log(this.features);
        this.ready = true;
    }
}