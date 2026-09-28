import { appendToPath, type ProcessedGeometry } from "../geometry";
import { DEFAULT_ZOOM_LEVELS, zoomLevelIndex, type ZoomLevel } from "../geometry/zoom-levels";
import type {Style} from '../style';


export interface Feature {
    type: string;
    geometryByZoom: (ProcessedGeometry | null)[];
}

export class Layer {
    name: string;
    enabled: boolean;
    style: Style;
    features: Feature[];
    ready: boolean;
    zoomLevels: ZoomLevel[];

	constructor(name: string, style: Style, features: Feature[] = [], zoomLevels: ZoomLevel[] = DEFAULT_ZOOM_LEVELS, enabled: boolean = true) {
        this.name = name;
        this.style = style;
        this.features = features;
        this.enabled = enabled;
        this.zoomLevels = zoomLevels;
        this.ready = true;
	}

    async load(): Promise<void> {
        // no-op by default — features were already provided in the constructor
    }

    render(ctx: CanvasRenderingContext2D, scale: number, webMercZoom: number): void {
        if (!this.enabled || !this.ready) return;
        const index = zoomLevelIndex(webMercZoom, this.zoomLevels);
        const path = new Path2D();

            for (const feature of this.features) {
                const geometry = feature.geometryByZoom[index];
                if (!geometry) continue;
                appendToPath(path, feature.type, geometry, scale, this.style);
            }

            this.style.apply(ctx, scale);
            
            ctx.fill(path);
            if (this.style.style.lineWidth != 0) {
                ctx.stroke(path);
            }
            
    }
}