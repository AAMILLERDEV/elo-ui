# @elo-ui/angular

Standalone Angular directives for [Elo UI](https://github.com/AAMILLERDEV/elo-ui) components, with typed inputs for strict templates. Supports Angular 20+.

```sh
npm install @elo-ui/core @elo-ui/angular
```

Add the theme to `angular.json` `styles` (`node_modules/@elo-ui/core/theme.css`), then import directives where you use them:

```ts
import { Component, signal } from '@angular/core';
import { EloButton } from '@elo-ui/angular';

@Component({
  selector: 'app-save',
  imports: [EloButton],
  template: `<elo-button variant="primary" [loading]="saving()">Save</elo-button>`,
})
export class Save {
  saving = signal(false);
}
```

`ELO_UI_DIRECTIVES` imports every directive at once. Boolean inputs accept bare attributes (`<elo-button disabled>`).

## Forms

Form controls implement `ControlValueAccessor`, so `ngModel`, `formControl`, and `formControlName` work. Add `@angular/forms` as usual.

```html
<elo-input label="Email" formControlName="email" />
<elo-checkbox label="Subscribe" [(ngModel)]="subscribe" />
```

## License

MIT
