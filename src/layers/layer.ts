import { appendToPath, type ProcessedGeometry } from "../geometry";
import type {Style} from '../style';


export interface Feature {
    type: string;
    geometry: ProcessedGeometry;
}

export class Layer {
    name: string;
    enabled: boolean;
    style: Style;
    features: Feature[];

	constructor(name: string, style: Style, features: Feature[], enabled: boolean = true) {
        this.name = name;
        this.style = style;
        this.features = features;
        this.enabled = enabled;
	}

    render(ctx: CanvasRenderingContext2D, scale: number): void {
        if (!this.enabled) return;
        const path = new Path2D();
            for (const feature of this.features) {
            appendToPath(path, feature.type, feature.geometry, scale, this.style);
            }

            this.style.apply(ctx, scale);
            
            ctx.fill(path);
            if (this.style.style.lineWidth != 0) {
                ctx.stroke(path);
            }
            
    }
}