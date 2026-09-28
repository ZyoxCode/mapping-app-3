import { appendToPath, type ProcessedGeometry } from "../geometry";
import { DEFAULT_ZOOM_LEVELS, zoomLevelIndex, type ZoomLevel } from "../geometry/zoom-levels";
import type {Style} from '../styles/style';
import { resolveStyle, type StyleRule } from "../styles/style-rule";
import type { Bounds } from "../types";
import { boundsIntersect } from "../utils/math";


export interface Feature {
    type: string;
    properties: Record<string, any>;
    geometryByZoom: (ProcessedGeometry | null)[];
}

export class Layer {
    name: string;
    enabled: boolean;
    logged: boolean;
    styleRules: StyleRule[];
    features: Feature[];
    ready: boolean;
    zoomLevels: ZoomLevel[];

	constructor(name: string, styleRules: StyleRule[], features: Feature[] = [], zoomLevels: ZoomLevel[] = DEFAULT_ZOOM_LEVELS, enabled: boolean = true, logged: boolean = true) {
        this.name = name;
        this.styleRules = styleRules;
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
        const buckets = new Map<Style, Path2D>();

        for (const feature of this.features) {
            const geometry = feature.geometryByZoom[index];
            if (!geometry) continue;
            if (!boundsIntersect(visibleBounds, geometry.bbox)) continue;

            const style = resolveStyle(this.styleRules, feature.properties, webMercZoom);
            if (!style) continue;

            let path = buckets.get(style);
            if (!path) {
                path = new Path2D();
                buckets.set(style, path);
            }
            appendToPath(path, feature.type, geometry, visibleBounds);
        }

        for (const [style, path] of buckets) {
            style.apply(ctx, scale);
            if (style.fill) ctx.fill(path);
        
            if (style.style.lineWidth != 0) ctx.stroke(path);
        }   
    }
}