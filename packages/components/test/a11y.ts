import axe from 'axe-core';
import { expect } from 'vitest';

/** Fails the test with a readable report if axe finds any violations inside `root`. */
export async function expectNoA11yViolations(root: Element): Promise<void> {
  const { violations } = await axe.run(root, { resultTypes: ['violations'] });
  const report = violations.map(
    (v) =>
      `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => n.target.join(' ')).join('\n  ')}`,
  );
  expect(report, 'axe violations').toEqual([]);
}
