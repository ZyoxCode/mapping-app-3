export function resizeCanvas(canvas: HTMLCanvasElement) {
	canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
}