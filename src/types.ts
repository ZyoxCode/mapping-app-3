export interface Point {
	x: number;
	y: number;
}

export interface Bounds {
	maxCorner: Point;
	minCorner: Point;
}

export interface Viewport {
    offset: Point;
    last: Point;

    isDragging: boolean;
    scale: number;
}