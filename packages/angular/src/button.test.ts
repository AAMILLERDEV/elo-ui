import '@angular/compiler';
import '@elo-ui/core/theme.css';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { EloButton, ELO_UI_DIRECTIVES } from './public-api';

beforeAll(() => {
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true,
  });
});

async function render<T>(component: new () => T) {
  const fixture = TestBed.createComponent(component);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('EloButton (Angular)', () => {
  it('applies the directive and forwards inputs to element properties', async () => {
    @Component({
      imports: [EloButton],
      template: `<elo-button [variant]="variant()" size="sm" label="Save draft">Save</elo-button>`,
    })
    class Host {
      variant = signal<'primary' | 'danger'>('primary');
    }

    const fixture = await render(Host);
    const debugEl = fixture.debugElement.query(By.css('elo-button'));
    const directive = debugEl.injector.get(EloButton);
    expect(directive.element).toBe(debugEl.nativeElement);
    expect(directive.element.variant).toBe('primary');
    expect(directive.element.size).toBe('sm');
    expect(directive.element.label).toBe('Save draft');

    fixture.componentInstance.variant.set('danger');
    await fixture.whenStable();
    expect(directive.element.variant).toBe('danger');
  });

  it('coerces boolean attributes', async () => {
    @Component({
      imports: [ELO_UI_DIRECTIVES],
      template: `<elo-button disabled loading>Save</elo-button>`,
    })
    class Host {}

    const fixture = await render(Host);
    const el = fixture.debugElement.query(By.css('elo-button')).injector.get(EloButton).element;
    expect(el.disabled).toBe(true);
    expect(el.loading).toBe(true);
  });

  it('handles (click), and not while disabled', async () => {
    @Component({
      imports: [EloButton],
      template: `
        <elo-button id="on" (click)="clicked()">On</elo-button>
        <elo-button id="off" disabled (click)="clicked()">Off</elo-button>
      `,
    })
    class Host {
      clicked = vi.fn();
    }

    const fixture = await render(Host);
    const root: HTMLElement = fixture.nativeElement;
    root.querySelector<HTMLElement>('#on')!.click();
    root.querySelector<HTMLElement>('#off')!.click();
    expect(fixture.componentInstance.clicked).toHaveBeenCalledTimes(1);
  });

  it('submits an Angular template form with name and value', async () => {
    @Component({
      imports: [EloButton],
      template: `
        <form (submit)="submit($event)">
          <input name="title" value="Draft" />
          <elo-button type="submit" name="intent" value="publish">Publish</elo-button>
        </form>
      `,
    })
    class Host {
      submitted?: Record<string, FormDataEntryValue>;
      submit(event: SubmitEvent) {
        event.preventDefault();
        this.submitted = Object.fromEntries(
          new FormData(event.target as HTMLFormElement, event.submitter),
        );
      }
    }

    const fixture = await render(Host);
    const el = fixture.debugElement.query(By.css('elo-button')).injector.get(EloButton).element;
    await el.updateComplete;
    el.click();
    expect(fixture.componentInstance.submitted).toEqual({ title: 'Draft', intent: 'publish' });
  });
});
