import { playwright } from '@vitest/browser-playwright';

const ALL_BROWSERS = ['chromium', 'firefox', 'webkit'];

/**
 * Shared Vitest browser-mode settings for Elo UI packages.
 *
 * Each package needs its own `port`: Turborepo runs package tests in parallel, and Vitest's
 * default browser port (63315) makes concurrent runs race for it, so one package's browsers can
 * connect to another package's server. `strictPort` turns a collision into a clear error.
 *
 * The host is pinned to 127.0.0.1: `localhost` can resolve to IPv6 (::1) in Firefox while the
 * server listens on IPv4, which shows up as intermittent NS_ERROR_CONNECTION_REFUSED.
 *
 * Set ELO_BROWSERS=chromium (comma-separated) to run a subset locally.
 *
 * @param {{ port: number, include: string[] }} options
 * @returns {import('vitest/config').ViteUserConfig['test']}
 */
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
