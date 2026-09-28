import { registerGeometry } from '../registry';
import type { ProcessedGeometry } from '../types';


import {logger} from '../../utils/logging';
import { buildLineForZoom, processLine, type BuiltLine, type PreparedLineString } from '../linestring-utils';
import type { Bounds } from '../../types';
import { boundsIntersect, unionBounds } from '../../utils/math';

interface MultiLineStringGeometry {
    type: 'MultiLineString';
    coordinates: number[][][]; // Array of points | points are array of 2 numbers
}

interface PreparedMultiLineString {
    lines: PreparedLineString[],
    bbox: Bounds;
}

interface ProcessedMultiLineStringGeometry extends ProcessedGeometry {
    lines: BuiltLine[];
}
type Coord = number[];

function coordKey(c: Coord, precision = 7): string {
    return `${c[0].toFixed(precision)},${c[1].toFixed(precision)}`;
}
export function mergeLineStrings(lines: Coord[][]): Coord[][] {
    const endpointMap = new Map<string, { lineIndex: number; end: 'start' | 'end' }[]>();

    lines.forEach((line, i) => {
        if (line.length < 2) return;
        const push = (key: string, entry: { lineIndex: number; end: 'start' | 'end' }) => {
            const list = endpointMap.get(key);
            list ? list.push(entry) : endpointMap.set(key, [entry]);
        };
        push(coordKey(line[0]), { lineIndex: i, end: 'start' });
        push(coordKey(line[line.length - 1]), { lineIndex: i, end: 'end' });
    });

    const used = new Array(lines.length).fill(false);
    const merged: Coord[][] = [];

    function nextAt(key: string, exclude: number) {
        const entries = endpointMap.get(key) ?? [];
        if (entries.length !== 2) return null; // 1 = dead end, 3+ = real junction — stop either way
        const other = entries.find(e => e.lineIndex !== exclude);
        return other && !used[other.lineIndex] ? other : null;
    }

    for (let i = 0; i < lines.length; i++) {
        if (used[i] || lines[i].length < 2) continue;
        used[i] = true;
        let chain = lines[i].slice();
        let tail = i;

        for (let next = nextAt(coordKey(chain[chain.length - 1]), tail); next; ) {
            const nextLine = lines[next.lineIndex];
            chain = chain.concat(next.end === 'start' ? nextLine.slice(1) : nextLine.slice(0, -1).reverse());
            used[next.lineIndex] = true;
            tail = next.lineIndex;
            next = nextAt(coordKey(chain[chain.length - 1]), tail);
        }

        let head = i;
        for (let prev = nextAt(coordKey(chain[0]), head); prev; ) {
            const prevLine = lines[prev.lineIndex];
            chain = (prev.end === 'end' ? prevLine.slice(0, -1) : prevLine.slice(1).reverse()).concat(chain);
            used[prev.lineIndex] = true;
            head = prev.lineIndex;
            prev = nextAt(coordKey(chain[0]), head);
        }

        merged.push(chain);
    }

    return merged;
}


registerGeometry<MultiLineStringGeometry, PreparedMultiLineString, ProcessedMultiLineStringGeometry>('MultiLineString', {
    process(geometry) {
        const mergedLines = mergeLineStrings(geometry.coordinates);
        const lines = mergedLines.map(
            line => processLine(line)
            
        ).filter(
            (line): line is PreparedLineString => line !== null
        );

        if (lines.length === 0) return null;
        return {lines, bbox: unionBounds(lines.map((p) => {
            return p.bbox;
        }))};
    },
    buildSimplified(prepared, minArea) {
        const lines = prepared.lines.map(
            line => buildLineForZoom(line.path, minArea)
        ).filter(
            (line): line is BuiltLine => line !== null
        )
        return lines.length > 0 ? { lines: lines, bbox: prepared.bbox, centroid: null } : null;
    },
    appendToPath(mergedPath, processed, visibleBounds) {
        for (const { path, bbox } of processed.lines) {
            if (!boundsIntersect(bbox, visibleBounds)) continue;

            logger.increment('RingRenderCount', 1);
            mergedPath.addPath(path);
        }
    },
});
