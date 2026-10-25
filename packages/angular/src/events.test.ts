import '@angular/compiler';
import '@elo-ui/core/theme.css';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import type { DropdownSelectDetail } from '@elo-ui/components';
import { beforeAll, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { ELO_UI_DIRECTIVES } from './public-api';

beforeAll(() => {
  try {
    TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
  } catch {
    // Already initialized by another test file in this browser.
  }
});

it('emits custom events as typed outputs', async () => {
  @Component({
    imports: [ELO_UI_DIRECTIVES],
    template: `
      <elo-dropdown (eloSelect)="chosen = $event.detail.value" (eloOpen)="opened = opened + 1">
        <elo-button slot="trigger">Actions</elo-button>
        <elo-menu-item value="edit">Edit</elo-menu-item>
      </elo-dropdown>
    `,
  })
  class Host {
    chosen: DropdownSelectDetail['value'] = '';
    opened = 0;
  }

  const fixture = TestBed.createComponent(Host);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  const root: HTMLElement = fixture.nativeElement;

  await userEvent.click(root.querySelector('elo-button')!);
  await userEvent.click(root.querySelector('elo-menu-item')!);
  expect(fixture.componentInstance.opened).toBe(1);
  expect(fixture.componentInstance.chosen).toBe('edit');
});
