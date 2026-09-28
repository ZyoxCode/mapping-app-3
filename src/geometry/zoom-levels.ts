export interface ZoomLevel {
    upperBound: number;
    minArea: number;
}

export const DEFAULT_ZOOM_LEVELS: ZoomLevel[] = [
    {upperBound: 2, minArea: 1},
    {upperBound: Infinity, minArea: 0},
];

export function zoomLevelIndex(webMercZoom: number, levels: ZoomLevel[]): number {
    const index = levels.findIndex(level => webMercZoom <= level.upperBound);
    return index === -1 ? levels.length -1 : index;
}