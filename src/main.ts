import { resizeCanvas } from "./utils/canvas";
import type { Bounds, Viewport } from './types';
import { type Layer } from "./layers/layer.ts";
import { allLayers } from "./layers/layers";
import { scaleToWebMercatorZoom } from "./utils/math.ts";
import { Logger, logger } from "./utils/logging.ts";

class GeoMap {
	canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
	layers: Layer[] | null;
    viewport: Viewport;
    logger: Logger;

	constructor(canvas: HTMLCanvasElement, layers: Layer[] | null) {
		this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })!;
		this.layers = layers;
        this.viewport = {
            offset: { x: 0, y: 0 },
            last: { x: 0, y: 0 },
            isDragging: false,
            scale: 1
        }
        this.logger = logger;
        this.logger.enable('Feature Count')
	}

    getVisibleBounds(scale: number, translateX: number, translateY: number): Bounds {
        const xMin = (0 - (translateX)) / scale;
        const xMax = (this.canvas.width - (translateX)) / scale;
        
        const yMax = -(0 - (translateY)) / scale;
        const yMin = -(this.canvas.height - (translateY)) / scale;

        return {minCorner: {x: xMin, y: yMin}, maxCorner: {x: xMax, y: yMax}};
    }

	render() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.fillStyle = '#2d2e38';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.layers == null) {return;}

        const R = this.canvas.height / (2 * Math.PI);
        const scale = R * this.viewport.scale;
        const webMercScale = scaleToWebMercatorZoom(2 * Math.PI * scale);
        const translateX = this.canvas.width / 2 + this.viewport.offset.x;
        const translateY = this.canvas.height / 2 + this.viewport.offset.y;
        const visibleBounds = this.getVisibleBounds(scale, translateX, translateY);

        this.ctx.setTransform(scale, 0, 0, -scale, translateX, translateY);

        this.logger.resetCounter('RingRenderCount');
        
        for (const layer of this.layers) {
           layer.render(this.ctx, scale, webMercScale, visibleBounds);
        }

        this.logger.logThrottled('Feature Count', 1000, this.logger.getCounter('RingRenderCount') + " rings rendered.")
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
	}
}

for (const layer of allLayers) {
    layer.load();
}

const canvas = document.querySelector<HTMLCanvasElement>('#map')!;
if (!canvas || canvas == null) {
	throw new Error('No canvas found');
}

const map = new GeoMap(canvas, allLayers);

resizeCanvas(canvas);
window.addEventListener('resize', () => {
	resizeCanvas(canvas);
}, { passive: true });



function renderLoop(): void {
    map.render();
    requestAnimationFrame(renderLoop);
}
  
requestAnimationFrame(renderLoop);


canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
  
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
  
    const cx = map.canvas.width / 2;
    const cy = map.canvas.height / 2;
  
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
  
    map.viewport.offset.x = dx - (dx - map.viewport.offset.x) * zoomFactor;
    map.viewport.offset.y = dy - (dy - map.viewport.offset.y) * zoomFactor;
    map.viewport.scale *= zoomFactor;

}, { passive: false });
  
canvas.addEventListener('pointerdown', (e) => {
    map.viewport.isDragging = true;
    map.viewport.last = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
});
  
canvas.addEventListener('pointermove', (e) => {
    if (!map.viewport.isDragging) return;
  
    map.viewport.offset.x += e.clientX - map.viewport.last.x;
    map.viewport.offset.y += e.clientY - map.viewport.last.y;
    map.viewport.last = { x: e.clientX, y: e.clientY };
}, { passive: true });
  
function stopDrag(e: PointerEvent): void {
    if (map.viewport.isDragging) {
      map.viewport.isDragging = false;
      canvas.releasePointerCapture(e.pointerId);
    }
}
  
canvas.addEventListener('pointerup', stopDrag);
canvas.addEventListener('pointercancel', stopDrag);