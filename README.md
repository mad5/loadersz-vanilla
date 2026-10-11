# loadersz

Canvas loading animations as a single JavaScript file. No build step, no npm, no dependencies. One script tag registers the `<loadersz-loader>` custom element.

```html
<script src="loadersz.js"></script>
<loadersz-loader state="racing" size="96"></loadersz-loader>
```

This is a vanilla JavaScript port of [loadersz](https://github.com/lumberjacque/loadersz-core) by lumberjacque. The original library and its interactive reference site:

- Demo and documentation: [loadersz.vercel.app](https://loadersz.vercel.app/)
- Source: [github.com/lumberjacque/loadersz-core](https://github.com/lumberjacque/loadersz-core)
- npm package: [loadersz](https://www.npmjs.com/package/loadersz)

The original ships as an ESM package with optional adapters for React, Vue, Svelte, and Angular. This repository is only `loadersz.js`. All 160 motions are included and selected with the `state` attribute.

## Install

Place `loadersz.js` next to the HTML file and load it before the first loader:

```html
<script src="loadersz.js"></script>

<loadersz-loader
  state="calibrating"
  size="144"
  speed="1.15"
  density="1"
  theme="dark"
  aria-label="Calibrating"
></loadersz-loader>
```

The script defines the element exactly once. Attributes can be changed in the DOM afterwards. The loader applies the new values without being recreated.

## Attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `state` | state name | `working` | Selects one of the 160 motions. |
| `size` | number | `96` | Square canvas side in CSS pixels. Values below `16` are raised. |
| `speed` | number | `1` | Timeline multiplier. |
| `density` | number | `1` | Amount of detail, clamped to `0.35`–`2`. |
| `particle-radius` | number | `1` | Stroke and dot thickness, clamped to `0.5`–`2.5`. |
| `theme` | `auto`, `dark`, `light` | `auto` | Colour scheme. `auto` follows `prefers-color-scheme`. |
| `hue` | `0`–`360` | unset | Recolours the motion with one hue. |
| `color` | CSS colour | unset | One exact colour. Takes precedence over `hue`. Accepts hex, `rgb`, `oklch`, and `var(--token)`. |
| `paused` | boolean attribute | unset | Stops the animation and keeps the current frame visible. |
| `force-motion` | boolean attribute | unset | Overrides `prefers-reduced-motion`. Set it only when motion is required. |
| `aria-label` | string | `Loading` | Accessible label applied to the internal canvas. |

Omit both `hue` and `color` to keep each motion's own palette. That palette can be multicolour or deliberately grey. When both are set, `color` wins.

A boolean attribute is on when it is present. `paused="false"` and `force-motion="false"` count as off.

`size` is the visible size. Use `64` for a status indicator, `144` inside a card, or `280` for a large area.

## States

There are 160 names, for example `loading`, `racing`, `searching`, and `settling`. After the script loads, the complete ordered list is `loadersz.LOADER_STATES`. The groups match the [original site](https://loadersz.vercel.app/):

| `id` | Label | Count |
| --- | --- | --- |
| `loaders` | Loaders | 14 |
| `systems` | Systems | 12 |
| `data` | Data visualizations | 51 |
| `reasoning` | Reasoning | 26 |
| `atmosphere` | Atmosphere | 11 |
| `motion` | Motion studies | 46 |

```html
<script src="loadersz.js"></script>
<script>
  loadersz.LOADER_CATEGORIES.forEach(function (category) {
    console.log(category.label, category.states);
  });
</script>
```

## Imperative API

When the page owns the canvas:

```html
<canvas id="loader"></canvas>
<script src="loadersz.js"></script>
<script>
  var canvas = document.querySelector("#loader");
  var loader = new loadersz.LoaderszLoader(canvas, {
    state: "solving",
    size: 160,
    speed: 1.1,
    theme: "dark",
    ariaLabel: "Solving",
  });

  loader.setOptions({ state: "forging", size: 200, hue: 28 });
  loader.destroy();
</script>
```

`setOptions` applies only the fields you pass and does not reset the timeline. `destroy` stops the animation and removes its listeners. JavaScript option names are camel case: `particleRadius`, `forceMotion`, `ariaLabel`. In HTML they stay `particle-radius`, `force-motion`, and `aria-label`.

`loadersz` exposes three properties:

| Property | Contents |
| --- | --- |
| `LoaderszLoader` | Constructor for a canvas you own. |
| `LOADER_STATES` | All 160 state names, in a fixed order. |
| `LOADER_CATEGORIES` | The six groups, each with `id`, `label`, and `states`. |

## Behaviour

- Motion pauses while the tab is hidden.
- `prefers-reduced-motion: reduce` stops the animation unless `force-motion` is set.
- Canvas resolution follows the device pixel ratio, capped at 2.
- No runtime libraries are loaded.

## Demo

The `demo/` folder is a playground: live preview, controls, colour mode, search, every state grouped by category, and a snippet you can copy. Cards stay still and start moving on hover or focus.

Open the demo locally, for example with a small web server in the project folder:

```sh
python3 -m http.server 8765
```

Then visit [http://127.0.0.1:8765/demo/](http://127.0.0.1:8765/demo/).

## License

[MIT](LICENSE) © 2026 lumberjacque

This file is the same code packaged as one script. Keep the copyright notice when you redistribute it.
