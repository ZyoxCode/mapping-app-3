export interface StyleOptions {
    fillStyle?: string;
    strokeStyle?: string;
    lineWidth?: number;
    textAlign?: CanvasTextAlign;
    font?: string;
    dashed?: number[];
    radius?: number;
  }
  
const DEFAULT_STYLE: StyleOptions = {
    fillStyle: '#ffffff',
    strokeStyle: '#000000',
    lineWidth: 1,
    textAlign: 'center',
    font: '700 11px "Inter", sans-serif',
    dashed: [],
  };
  
export class Style {
    style: StyleOptions;
  
    constructor(style: StyleOptions) {
      this.style = { ...DEFAULT_STYLE, ...style };
    }
  
    apply(ctx: CanvasRenderingContext2D, scale: number): void {
      const { fillStyle, strokeStyle, lineWidth, textAlign, font, dashed } = this.style;
  
      if (dashed && dashed.length > 0) {
        ctx.setLineDash(dashed.map(d => d / scale));
      } else {
        ctx.setLineDash([]);
      }
  
      if (fillStyle != null) ctx.fillStyle = fillStyle;
      if (strokeStyle != null) ctx.strokeStyle = strokeStyle;
      if (lineWidth != null) ctx.lineWidth = lineWidth / scale;
      if (textAlign != null) ctx.textAlign = textAlign;
      if (font != null) ctx.font = font;
      // radius intentionally left out — nothing here uses it yet, that's for the Point handler later
    }
}