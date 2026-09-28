// logger.ts
export type LogCategory = string; // deliberately loose — see note below

export class Logger {

    private enabled: Set<LogCategory>;
    private throttleTimestamps: Map<string, number>;
    private counters: Map<string, number>;

    constructor(enabledCategories: LogCategory[] = []) {
        this.enabled = new Set(enabledCategories);
        this.throttleTimestamps = new Map();
        this.counters = new Map();
    }

    enable(category: LogCategory): void {
        this.enabled.add(category);
    }

    disable(category: LogCategory): void {
        this.enabled.delete(category);
    }

    increment(counter: string, amount: number = 1): void {
        this.counters.set(counter, (this.counters.get(counter) ?? 0) + amount);
    }

    getCounter(counter: string): number {
        return this.counters.get(counter) ?? 0;
    }

    resetCounter(counter: string): void {
        this.counters.set(counter, 0);
    }

    resetAllCounters(): void {
        this.counters.clear();
    }

    log(category: LogCategory, ...args: unknown[]): void {
        if (this.enabled.has(category)) {
            console.log(`[${category}]`, ...args);
        }
    }

    logThrottled(category: LogCategory, intervalMs: number, ...args: unknown[]): void {
        if (!this.enabled.has(category)) return;

        const now = performance.now();
        const last = this.throttleTimestamps.get(category) ?? 0;
        if (now - last >= intervalMs) {
            this.throttleTimestamps.set(category, now);
            console.log(`[${category}]`, ...args);
        }
    }
}

export const logger = new Logger(['Feature Count', 'Geometry Print']);