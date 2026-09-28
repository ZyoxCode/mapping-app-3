import { triangleArea } from "../utils/math";

class IndexedMinHeap {
    private heap: number[];   // heap[k] = original index at heap position k
    private pos: number[];    // pos[i] = current heap position of original index i (-1 once removed)
    private values: number[]; // values[i] = current importance of original index i

    constructor(initialValues: number[]) {
        this.values = initialValues.slice();
        this.heap = initialValues.map((_, i) => i);
        this.pos = initialValues.map((_, i) => i);
        for (let k = (this.heap.length >> 1) - 1; k >= 0; k--) this.siftDown(k);
    }

    popMin(): { index: number; value: number } {
        const minIndex = this.heap[0];
        const minValue = this.values[minIndex];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.pos[last] = 0;
            this.siftDown(0);
        }
        this.pos[minIndex] = -1;
        return { index: minIndex, value: minValue };
    }

    update(index: number, newValue: number): void {
        const oldValue = this.values[index];
        this.values[index] = newValue;
        const k = this.pos[index];
        if (k === -1) return; // already popped — ignore
        newValue < oldValue ? this.siftUp(k) : this.siftDown(k);
    }

    private siftUp(k: number): void {
        while (k > 0) {
            const parent = (k - 1) >> 1;
            if (this.values[this.heap[parent]] <= this.values[this.heap[k]]) break;
            this.swap(parent, k);
            k = parent;
        }
    }

    private siftDown(k: number): void {
        const n = this.heap.length;
        while (true) {
            const l = 2 * k + 1, r = 2 * k + 2;
            let smallest = k;
            if (l < n && this.values[this.heap[l]] < this.values[this.heap[smallest]]) smallest = l;
            if (r < n && this.values[this.heap[r]] < this.values[this.heap[smallest]]) smallest = r;
            if (smallest === k) break;
            this.swap(k, smallest);
            k = smallest;
        }
    }

    private swap(a: number, b: number): void {
        [this.heap[a], this.heap[b]] = [this.heap[b], this.heap[a]];
        this.pos[this.heap[a]] = a;
        this.pos[this.heap[b]] = b;
    }
}

export function computeRemovalAreas(coords: number[][], closed=true): number[] {
    const n = coords.length;
    const minSurvivors = closed ? 3 : 2;
    if (n <= minSurvivors) return new Array(n).fill(Infinity);

    const removalArea = new Array(n).fill(Infinity);
    const prev = coords.map((_, i) => (i === 0 ? n - 1 : i - 1));
    const next = coords.map((_, i) => (i === n - 1 ? 0 : i + 1));
    const removable = (i: number) => closed || (i !== 0 && i !== n - 1);

    const importance = coords.map((_, i) =>
        removable(i) ? triangleArea(coords[prev[i]], coords[i], coords[next[i]]) : Infinity
    );
    const heap = new IndexedMinHeap(importance);

    let aliveCount = n;
    let floor = 0;

    while (aliveCount > minSurvivors) {
        const { index: i, value } = heap.popMin();
        floor = Math.max(floor, value);
        removalArea[i] = floor;
        aliveCount--;

        const p = prev[i], nx = next[i];
        next[p] = nx;
        prev[nx] = p;

        if (removable(p)) heap.update(p, Math.max(triangleArea(coords[prev[p]], coords[p], coords[next[p]]), floor));
        if (removable(nx)) heap.update(nx, Math.max(triangleArea(coords[prev[nx]], coords[nx], coords[next[nx]]), floor));
    }

    return removalArea;
}

export function filterByRemovalArea(ring: number[][], removalAreas: number[], minArea: number, excludeEnds = false): number[][] {
    if (!excludeEnds) return ring.filter((_, i) => removalAreas[i] >= minArea);
    return ring.filter((_, i) => (i == 0 || i == ring.length - 1) || removalAreas[i] >= minArea);
}
