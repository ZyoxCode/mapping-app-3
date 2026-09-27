import { Layer, type Feature } from './layer';
import { Style } from '../style';
import { processGeometry } from '../geometry';
import { loadShapefile } from '../utils/shapefile';

export class ShapefileLayer extends Layer {
    path: string;

    constructor(name: string, style: Style, path: string, enabled: boolean = true) {
        super(name, style, [], enabled);
        this.ready = false;
        this.path = path;
    }

    async load(): Promise<void> {
        const geojson = await loadShapefile(this.path);

        this.features = geojson.features
            .map((feature): Feature | null => {
                const geometry = processGeometry(feature.geometry);
                return geometry ? { type: feature.geometry.type, geometry } : null;
            })
            .filter((f): f is Feature => f !== null);
        this.ready = true;
    }
}