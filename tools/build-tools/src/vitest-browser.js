import { playwright } from '@vitest/browser-playwright';

const ALL_BROWSERS = ['chromium', 'firefox', 'webkit'];

// Unique port per package (tests run in parallel); 127.0.0.1 avoids Firefox's IPv6 localhost.
export function browserTest({ port, include }) {
  const browsers = (process.env.ELO_BROWSERS ?? ALL_BROWSERS.join(','))
    .split(',')
    .map((browser) => browser.trim());

  const unknown = browsers.filter((browser) => !ALL_BROWSERS.includes(browser));
  if (unknown.length > 0) {
    throw new Error(`ELO_BROWSERS: unknown browser(s) ${unknown.join(', ')}`);
  }

  return {
    include,
    api: { port, strictPort: true, host: '127.0.0.1' },
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: browsers.map((browser) => ({ browser })),
    },
  };
}
