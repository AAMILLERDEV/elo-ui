import { svg, type SVGTemplateResult } from 'lit';

export type StatusVariant = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

const paths: Record<StatusVariant | 'close', SVGTemplateResult> = {
  info: svg`<circle cx="8" cy="8" r="6.25"></circle><path d="M8 7.25v3.5M8 5.25v.01"></path>`,
  neutral: svg`<circle cx="8" cy="8" r="6.25"></circle><path d="M8 7.25v3.5M8 5.25v.01"></path>`,
  success: svg`<circle cx="8" cy="8" r="6.25"></circle><path d="M5.5 8.25l1.75 1.75 3.25-3.75"></path>`,
  warning: svg`<path d="M8 2.25l6 10.5H2z"></path><path d="M8 6.75v2.5M8 11v.01"></path>`,
  danger: svg`<circle cx="8" cy="8" r="6.25"></circle><path d="M5.75 5.75l4.5 4.5M10.25 5.75l-4.5 4.5"></path>`,
  close: svg`<path d="M4 4l8 8M12 4l-8 8"></path>`,
};

/** A decorative 16px stroke icon. */
export function icon(name: StatusVariant | 'close', className = 'icon'): SVGTemplateResult {
  return svg`<svg class=${className} viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}
