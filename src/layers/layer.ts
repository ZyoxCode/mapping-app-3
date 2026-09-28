import { appendToPath, type ProcessedGeometry } from "../geometry";
import { DEFAULT_ZOOM_LEVELS, zoomLevelIndex, type ZoomLevel } from "../geometry/zoom-levels";
import type {Style} from '../style';
import type { Bounds } from "../types";
import { boundsIntersect } from "../utils/math";


export interface Feature {
    type: string;
    geometryByZoom: (ProcessedGeometry | null)[];
}

export class Layer {
    name: string;
    enabled: boolean;
    logged: boolean;
    style: Style;
    features: Feature[];
    ready: boolean;
    zoomLevels: ZoomLevel[];

	constructor(name: string, style: Style, features: Feature[] = [], zoomLevels: ZoomLevel[] = DEFAULT_ZOOM_LEVELS, enabled: boolean = true, logged: boolean = true) {
        this.name = name;
        this.style = style;
        this.features = features;
        this.enabled = enabled;
        this.zoomLevels = zoomLevels;
        this.ready = true;
        this.logged = logged;
	}

    async load(): Promise<void> {
        // no-op by default — features were already provided in the constructor
    }

    render(ctx: CanvasRenderingContext2D, scale: number, webMercZoom: number, visibleBounds: Bounds): void {
        if (!this.enabled || !this.ready) return;
        const index = zoomLevelIndex(webMercZoom, this.zoomLevels);
        const path = new Path2D();

        for (const feature of this.features) {
            const geometry = feature.geometryByZoom[index];
            if (!geometry) continue;
            if (!boundsIntersect(visibleBounds, geometry.bbox)) continue;
            appendToPath(path, feature.type, geometry, visibleBounds);
        }

        this.style.apply(ctx, scale);
        
        ctx.fill(path);
        if (this.style.style.lineWidth != 0) {
            ctx.stroke(path);
        }
    }
}