import { Layer, type Feature } from './layer';
import { Style } from '../style';
import { processGeometry } from '../geometry';
import { loadShapefile } from '../utils/shapefile';
import { DEFAULT_ZOOM_LEVELS, type ZoomLevel } from '../geometry/zoom-levels';
import { buildGeometryForZoom } from '../geometry/registry';

export class ShapefileLayer extends Layer {
    path: string;

    constructor(name: string, style: Style, path: string, zoomLevels: ZoomLevel[] = DEFAULT_ZOOM_LEVELS, enabled: boolean = true) {
        super(name, style, [], zoomLevels, enabled);
        this.ready = false;
        this.path = path;
    }

    async load(): Promise<void> {
        const geojson = await loadShapefile(this.path);

        this.features = geojson.features
            .map((feature): Feature | null => {
                const prepared = processGeometry(feature.geometry);
               
                if (!prepared) return null;
                const geometryByZoom = this.zoomLevels.map(level => {
                    const built = buildGeometryForZoom(prepared, level.minArea);
                    return built
                });
                if (geometryByZoom.every(g => g === null)) return null;
                
                return { type: feature.geometry.type, geometryByZoom };
            })
            .filter((f): f is Feature => f !== null);

        this.ready = true;
    }
}