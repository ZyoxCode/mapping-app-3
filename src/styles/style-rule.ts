import type {Style} from './style';
export interface StyleRule<P = Record<string, any>> {
    when(properties: P, webMercZoom: number): boolean;
    style: Style;
}

export function resolveStyle<P>(rules: StyleRule<P>[], properties: P, webMercZoom: number): Style | null {
    const match = rules.find(rule => rule.when(properties, webMercZoom));
    return match ? match.style : null;
}

export function always(style: Style): StyleRule[] {
    return [{ when: () => true, style }];
}