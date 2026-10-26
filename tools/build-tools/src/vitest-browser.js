import { playwright } from '@vitest/browser-playwright';

const ALL_BROWSERS = ['chromium', 'firefox', 'webkit'];

// Component dependencies to pre-bundle; add new ones here to avoid mid-run Vite reloads.
const COMPONENT_DEPS = [
  'lit',
  'lit/decorators.js',
  'lit/directives/class-map.js',
  'lit/directives/if-defined.js',
  'lit/directives/live.js',
  '@floating-ui/dom',
];

// Unique port per package (tests run in parallel); 127.0.0.1 avoids Firefox's IPv6 localhost.
export function browserTest({ port, include, depsFrom, prebundle = true }) {
  const browsers = (process.env.ELO_BROWSERS ?? ALL_BROWSERS.join(','))
    .split(',')
    .map((browser) => browser.trim());

  const unknown = browsers.filter((browser) => !ALL_BROWSERS.includes(browser));
  if (unknown.length > 0) {
    throw new Error(`ELO_BROWSERS: unknown browser(s) ${unknown.join(', ')}`);
  }

  return {
    optimizeDeps: {
      include: prebundle
        ? COMPONENT_DEPS.map((dep) => (depsFrom ? `${depsFrom} > ${dep}` : dep))
        : [],
    },
    test: {
      include,
      // Files share one page per browser, so parallel files steal each other's focus and hover.
      fileParallelism: false,
      api: { port, strictPort: true, host: '127.0.0.1' },
      browser: {
        enabled: true,
        headless: true,
        provider: playwright(),
        instances: browsers.map((browser) => ({ browser })),
      },
    },
  };
}
