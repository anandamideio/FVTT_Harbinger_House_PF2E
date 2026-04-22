# DD2VTT Importer

Config-driven importer for Dungeondraft Universal VTT files (.dd2vtt).

This tool:
1. Reads one or more .dd2vtt files from a TypeScript config file.
2. Decodes each embedded base64 image into src/assets/maps.
3. Converts walls, portals, and lights into scene placeables.
4. Writes generated scene data to src/data/scenes-imported.ts.

## Commands

Run using the explicit dd2vtt config alias:

```bash
pnpm import:dd2maps
```

Dry-run (parse and convert, but do not write files):

```bash
pnpm import:dd2maps -- --dry-run
```

Allow partial imports when some configured source files are missing:

```bash
pnpm import:dd2maps -- --allow-missing
```


## Default Behavior for Missing Inputs

The importer is strict by default.

If any configured source file is missing, it fails fast before writing output.

Use `--allow-missing` only when you intentionally want partial output.

## Config File

Config Interface Shape:

```ts
export default defineDD2VTTImporterConfig({
  paths: {
    repoRoot: "/absolute/or/relative/root",
    mapsDir: "src/assets/maps",
    outputFile: "src/data/scenes-imported.ts",
    modulePrefix: "modules/harbinger-house-pf2e/dist/assets/maps"
  },
  defaults: {
    scene: {
      gridDistance: 5,
      defaultFolder: "Chapter 1",
      defaultSort: 0,
      defaultGlobalLight: true,
      defaultGlobalLightThreshold: 0.749
    },
    wall: {
      light: 20,
      sight: 20,
      sound: 20,
      move: 20,
      doorType: "swing",
      doorDirection: 1,
      doorDuration: 750,
      doorStrength: 1,
      doorSound: ""
    },
    light: {
      alphaScale: 0.05,
      attenuation: 0.5,
      luminosity: 0.5,
      coloration: 1,
      saturation: 0,
      contrast: 0,
      animationSpeed: 5,
      animationIntensity: 5
    }
  },
  imports: [
    {
      input: "/absolute/or/repo-relative/source.dd2vtt",
      imageName: "Map Name.png",
      sceneId: "scene-id",
      sceneName: "Scene Name",
      navOrder: 10,
      folder: "Chapter 1",
      sort: 100,
      darkness: 0,
      globalLight: true,
      globalLightThreshold: 0.749,
      environment: {
        cycle: true,
        dark: {
          hue: 0.71,
          luminosity: -0.25
        }
      }
    }
  ]
});
```

## Architecture

- config-loader.ts: loads and validates config.
- dd2vtt-parser.ts: validates dd2vtt payloads and decodes image bytes.
- scene-placeable-converter.ts: maps dd2vtt geometry/lights to Foundry scene placeables.
- scene-asset-writer.ts: writes extracted image assets.
- scenes-module-emitter.ts: renders and writes generated TypeScript scene module.
- dd2vtt-import-pipeline.ts: orchestrates import flow and logging.

## Tests

The importer test suite lives in:

- src/__tests__/scripts/

Run only importer tests:

```bash
pnpm vitest run src/__tests__/scripts
```
