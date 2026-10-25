import '@angular/compiler';
import '@elo-ui/core/theme.css';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import type { EloCheckbox, EloInput, EloRadioGroup } from '@elo-ui/components';
import { beforeAll, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { ELO_UI_DIRECTIVES } from './public-api';

beforeAll(() => {
  try {
    TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
  } catch {
    // Already initialized by another test file in this browser.
  }
});

async function render<T>(component: new () => T) {
  const fixture = TestBed.createComponent(component);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('Angular forms', () => {
  it('binds elo-input with ngModel both ways', async () => {
    @Component({
      imports: [FormsModule, ELO_UI_DIRECTIVES],
      template: `<elo-input label="Name" name="name" [(ngModel)]="name"></elo-input>`,
    })
    class Host {
      name = signal('Ada');
    }

    const fixture = await render(Host);
    const el: EloInput = fixture.nativeElement.querySelector('elo-input');
    await fixture.whenStable();
    expect(el.value).toBe('Ada');

    await userEvent.type(el.shadowRoot!.querySelector('input')!, ' L');
    expect(fixture.componentInstance.name()).toBe('Ada L');

    fixture.componentInstance.name.set('Grace');
    await fixture.whenStable();
    expect(el.value).toBe('Grace');
  });

  it('binds elo-checkbox to a FormControl and follows disable()', async () => {
    @Component({
      imports: [ReactiveFormsModule, ELO_UI_DIRECTIVES],
      template: `<elo-checkbox label="Subscribe" [formControl]="subscribe"></elo-checkbox>`,
    })
    class Host {
      subscribe = new FormControl(true, { nonNullable: true });
    }

    const fixture = await render(Host);
    const el: EloCheckbox = fixture.nativeElement.querySelector('elo-checkbox');
    const control = fixture.componentInstance.subscribe;
    expect(el.checked).toBe(true);

    await userEvent.click(el.shadowRoot!.querySelector('input')!);
    expect(control.value).toBe(false);

    control.setValue(true);
    expect(el.checked).toBe(true);

    control.disable();
    expect(el.disabled).toBe(true);
  });

  it('marks a control touched on blur', async () => {
    @Component({
      imports: [ReactiveFormsModule, ELO_UI_DIRECTIVES],
      template: `<elo-input label="Email" [formControl]="email"></elo-input><button>Next</button>`,
    })
    class Host {
      email = new FormControl('');
    }

    const fixture = await render(Host);
    const el: EloInput = fixture.nativeElement.querySelector('elo-input');
    expect(fixture.componentInstance.email.touched).toBe(false);
    await userEvent.click(el.shadowRoot!.querySelector('input')!);
    await userEvent.tab();
    expect(fixture.componentInstance.email.touched).toBe(true);
  });

  it('binds elo-radio-group with formControlName', async () => {
    @Component({
      imports: [ReactiveFormsModule, ELO_UI_DIRECTIVES],
      template: `
        <form [formGroup]="form">
          <elo-radio-group label="Plan" formControlName="plan">
            <elo-radio value="monthly">Monthly</elo-radio>
            <elo-radio value="yearly">Yearly</elo-radio>
          </elo-radio-group>
        </form>
      `,
    })
    class Host {
      form = new FormGroup({ plan: new FormControl('yearly') });
    }

    const fixture = await render(Host);
    const el: EloRadioGroup = fixture.nativeElement.querySelector('elo-radio-group');
    await el.updateComplete;
    expect(el.value).toBe('yearly');

    await userEvent.click(el.querySelector('elo-radio[value="monthly"]')!);
    expect(fixture.componentInstance.form.value.plan).toBe('monthly');
  });
});
