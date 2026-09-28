export interface ZoomLevel {
    upperBound: number;
    minArea: number;
}

export const DEFAULT_ZOOM_LEVELS: ZoomLevel[] = [
    {upperBound: 2, minArea: 0.7},
    {upperBound: 3, minArea: 0.35},
    {upperBound: 4, minArea: 0.1},
    {upperBound: 6, minArea: 0.01},
    {upperBound: 8, minArea: 0.001},
    {upperBound: 11, minArea: 0.0001},
    {upperBound: 14, minArea: 0.00001},
    {upperBound: Infinity, minArea: 0}
]

export function zoomLevelIndex(webMercZoom: number, levels: ZoomLevel[]): number {
    const index = levels.findIndex(level => webMercZoom <= level.upperBound);
    return index === -1 ? levels.length -1 : index;
}