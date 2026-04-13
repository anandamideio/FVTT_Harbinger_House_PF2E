import type { HarbingerScene } from './types';

export const CHAPTER_2_SCENES: HarbingerScene[] = [
  {
  "id": "scene-bridge-castle",
  "name": "Near Ecstasy",
  "img": "modules/harbinger-house-pf2e/dist/assets/maps/bridge-and-castle-map-background.webm",
  "foreground": "modules/harbinger-house-pf2e/dist/assets/maps/bridge-and-castle-map-foreground.webp",
  "background": {
    "src": "modules/harbinger-house-pf2e/dist/assets/maps/bridge-and-castle-map-background.webm",
  },
  "grid": {
    "type": 1,
    "size": 100,
    "distance": 5,
    "units": "ft",
  },
  "initial": {
    "x": 3037,
    "y": 1879,
    "scale": 0.46202754475411406
  },
  "width": 3000,
  "height": 3000,
  "navigation": true,
  "navOrder": 1,
  "folder": "Chapter 2",
  "sort": 0,
  "globalLightThreshold": 1,
  "environment": {
    "cycle": true,
    "dark": {
      "hue": 0.7138888888888889,
      "luminosity": -0.25
    }
  },
  // "sounds": [
  //   {
  //     "path": "modules/harbinger-house-pf2e/dist/assets/sounds/Paizo/river2.ogg",
  //     "x": 1350,
  //     "y": 3400,
  //     "radius": 36,
  //     "easing": true,
  //     "walls": true,
  //     "volume": 0.35,
  //     "darkness": {
  //       "min": 0,
  //       "max": 1
  //     },
  //     "repeat": false,
  //     "hidden": false,
  //     "flags": {},
  //     "elevation": 0,
  //     "effects": {
  //       "base": {
  //         "intensity": 5
  //       },
  //       "muffled": {
  //         "intensity": 5
  //       }
  //     }
  //   },
  //   {
  //     "path": "modules/harbinger-house-pf2e/dist/assets/sounds/Paizo/river1.ogg",
  //     "x": 1570,
  //     "y": 3191,
  //     "radius": 18,
  //     "easing": true,
  //     "walls": true,
  //     "volume": 0.2,
  //     "darkness": {
  //       "min": 0,
  //       "max": 1
  //     },
  //     "repeat": false,
  //     "hidden": false,
  //     "flags": {},
  //     "elevation": 0,
  //     "effects": {
  //       "base": {
  //         "intensity": 5
  //       },
  //       "muffled": {
  //         "intensity": 5
  //       }
  //     }
  //   },
  //   {
  //     "path": "modules/harbinger-house-pf2e/dist/assets/sounds/Paizo/river2.ogg",
  //     "x": 1449,
  //     "y": 2692,
  //     "radius": 30,
  //     "easing": true,
  //     "walls": true,
  //     "volume": 0.3,
  //     "darkness": {
  //       "min": 0,
  //       "max": 1
  //     },
  //     "repeat": false,
  //     "hidden": false,
  //     "flags": {},
  //     "elevation": 0,
  //     "effects": {
  //       "base": {
  //         "intensity": 5
  //       },
  //       "muffled": {
  //         "intensity": 5
  //       }
  //     }
  //   },
  //   {
  //     "path": "modules/harbinger-house-pf2e/dist/assets/sounds/Paizo/river2.ogg",
  //     "x": 1350,
  //     "y": 1750,
  //     "radius": 27.14,
  //     "easing": true,
  //     "walls": true,
  //     "volume": 0.3,
  //     "darkness": {
  //       "min": 0,
  //       "max": 1
  //     },
  //     "repeat": false,
  //     "hidden": false,
  //     "flags": {},
  //     "elevation": 0,
  //     "effects": {
  //       "base": {
  //         "intensity": 5
  //       },
  //       "muffled": {
  //         "intensity": 5
  //       }
  //     }
  //   },
  //   {
  //     "path": "modules/harbinger-house-pf2e/dist/assets/sounds/Paizo/river2.ogg",
  //     "x": 1150,
  //     "y": 1250,
  //     "radius": 20.96,
  //     "easing": true,
  //     "walls": true,
  //     "volume": 0.3,
  //     "darkness": {
  //       "min": 0,
  //       "max": 1
  //     },
  //     "repeat": false,
  //     "hidden": false,
  //     "flags": {},
  //     "elevation": 0,
  //     "effects": {
  //       "base": {
  //         "intensity": 5
  //       },
  //       "muffled": {
  //         "intensity": 5
  //       }
  //     }
  //   }
  // ],
  // "tiles": [
  //   {
  //     "width": 600,
  //     "height": 300,
  //     "x": 1500,
  //     "y": 800,
  //     "rotation": 0,
  //     "alpha": 1,
  //     "hidden": false,
  //     "locked": false,
  //     "occlusion": {
  //       "mode": 1,
  //       "alpha": 0
  //     },
  //     "video": {
  //       "loop": true,
  //       "autoplay": true,
  //       "volume": 0
  //     },
  //     "flags": {},
  //     "texture": {
  //       "src": "modules/harbinger-house-pf2e/dist/assets/tiles/bridge-tile-tree2.webp",
  //       "tint": "#ffffff",
  //       "scaleX": 1,
  //       "scaleY": 1,
  //       "offsetX": 0,
  //       "offsetY": 0,
  //       "rotation": 0,
  //       "anchorX": 0.5,
  //       "anchorY": 0.5,
  //       "fit": "fill",
  //       "alphaThreshold": 0.75
  //     },
  //     "elevation": 20,
  //     "restrictions": {
  //       "light": false,
  //       "weather": false
  //     }
  //   },
  //   {
  //     "width": 600,
  //     "height": 800,
  //     "x": 1500,
  //     "y": 1000,
  //     "rotation": 0,
  //     "alpha": 1,
  //     "hidden": false,
  //     "locked": false,
  //     "occlusion": {
  //       "mode": 1,
  //       "alpha": 0
  //     },
  //     "video": {
  //       "loop": true,
  //       "autoplay": true,
  //       "volume": 0
  //     },
  //     "flags": {},
  //     "texture": {
  //       "src": "modules/harbinger-house-pf2e/dist/assets/tiles/bridge-tile-tree3.webp",
  //       "tint": "#ffffff",
  //       "scaleX": 1,
  //       "scaleY": 1,
  //       "offsetX": 0,
  //       "offsetY": 0,
  //       "rotation": 0,
  //       "anchorX": 0.5,
  //       "anchorY": 0.5,
  //       "fit": "fill",
  //       "alphaThreshold": 0.75
  //     },
  //     "elevation": 20,
  //     "restrictions": {
  //       "light": false,
  //       "weather": false
  //     }
  //   },
  //   {
  //     "width": 600,
  //     "height": 600,
  //     "x": 800,
  //     "y": 1400,
  //     "rotation": 0,
  //     "alpha": 1,
  //     "hidden": false,
  //     "locked": false,
  //     "occlusion": {
  //       "mode": 1,
  //       "alpha": 0
  //     },
  //     "video": {
  //       "loop": true,
  //       "autoplay": true,
  //       "volume": 0
  //     },
  //     "flags": {},
  //     "texture": {
  //       "src": "modules/harbinger-house-pf2e/dist/assets/tiles/bridge-tile-tree1.webp",
  //       "tint": "#ffffff",
  //       "scaleX": 1,
  //       "scaleY": 1,
  //       "offsetX": 0,
  //       "offsetY": 0,
  //       "rotation": 0,
  //       "anchorX": 0.5,
  //       "anchorY": 0.5,
  //       "fit": "fill",
  //       "alphaThreshold": 0.75
  //     },
  //     "elevation": 20,
  //     "restrictions": {
  //       "light": false,
  //       "weather": false
  //     }
  //   },
  //   {
  //     "width": 700,
  //     "height": 700,
  //     "x": 2100,
  //     "y": 2600,
  //     "rotation": 0,
  //     "alpha": 1,
  //     "hidden": false,
  //     "locked": false,
  //     "occlusion": {
  //       "mode": 1,
  //       "alpha": 0
  //     },
  //     "video": {
  //       "loop": true,
  //       "autoplay": true,
  //       "volume": 0
  //     },
  //     "flags": {},
  //     "texture": {
  //       "src": "modules/harbinger-house-pf2e/dist/assets/tiles/bridge-tile-tree4.webp",
  //       "tint": "#ffffff",
  //       "scaleX": 1,
  //       "scaleY": 1,
  //       "offsetX": 0,
  //       "offsetY": 0,
  //       "rotation": 0,
  //       "anchorX": 0.5,
  //       "anchorY": 0.5,
  //       "fit": "fill",
  //       "alphaThreshold": 0.75
  //     },
  //     "elevation": 20,
  //     "restrictions": {
  //       "light": false,
  //       "weather": false
  //     }
  //   },
  //   {
  //     "width": 600,
  //     "height": 800,
  //     "x": 3200,
  //     "y": 2500,
  //     "rotation": 0,
  //     "alpha": 1,
  //     "hidden": false,
  //     "locked": false,
  //     "occlusion": {
  //       "mode": 1,
  //       "alpha": 0
  //     },
  //     "video": {
  //       "loop": true,
  //       "autoplay": true,
  //       "volume": 0
  //     },
  //     "flags": {},
  //     "texture": {
  //       "src": "modules/harbinger-house-pf2e/dist/assets/tiles/bridge-tile-tree5.webp",
  //       "tint": "#ffffff",
  //       "scaleX": 1,
  //       "scaleY": 1,
  //       "offsetX": 0,
  //       "offsetY": 0,
  //       "rotation": 0,
  //       "anchorX": 0.5,
  //       "anchorY": 0.5,
  //       "fit": "fill",
  //       "alphaThreshold": 0.75
  //     },
  //     "elevation": 20,
  //     "restrictions": {
  //       "light": false,
  //       "weather": false
  //     }
  //   },
  //   {
  //     "texture": {
  //       "src": "modules/harbinger-house-pf2e/dist/assets/tiles/beehive.webm",
  //       "scaleX": 1,
  //       "scaleY": 1,
  //       "tint": "#ffffff",
  //       "offsetX": 0,
  //       "offsetY": 0,
  //       "rotation": 0,
  //       "anchorX": 0.5,
  //       "anchorY": 0.5,
  //       "fit": "fill",
  //       "alphaThreshold": 0.75
  //     },
  //     "x": 2485,
  //     "y": 2534,
  //     "width": 200,
  //     "height": 200,
  //     "rotation": 240,
  //     "alpha": 1,
  //     "occlusion": {
  //       "mode": 0,
  //       "alpha": 0
  //     },
  //     "video": {
  //       "loop": true,
  //       "autoplay": true,
  //       "volume": 0
  //     },
  //     "flags": {
  //       "monks-active-tiles": {
  //         "active": true,
  //         "record": false,
  //         "restriction": "all",
  //         "controlled": "all",
  //         "trigger": [
  //           "enter"
  //         ],
  //         "allowpaused": false,
  //         "usealpha": false,
  //         "pointer": false,
  //         "pertoken": false,
  //         "minrequired": 0,
  //         "chance": 100,
  //         "fileindex": 0,
  //         "actions": [],
  //         "files": []
  //       }
  //     },
  //     "hidden": false,
  //     "locked": false,
  //     "restrictions": {
  //       "light": false,
  //       "weather": false
  //     },
  //     "elevation": 0
  //   },
  //   {
  //     "texture": {
  //       "src": "modules/harbinger-house-pf2e/dist/assets/tiles/bees.webm",
  //       "scaleX": 1,
  //       "scaleY": 1,
  //       "tint": "#ffffff",
  //       "offsetX": 0,
  //       "offsetY": 0,
  //       "rotation": 0,
  //       "anchorX": 0.5,
  //       "anchorY": 0.5,
  //       "fit": "fill",
  //       "alphaThreshold": 0.75
  //     },
  //     "x": 2650,
  //     "y": 2550,
  //     "width": 200,
  //     "height": 200,
  //     "rotation": 0,
  //     "alpha": 1,
  //     "occlusion": {
  //       "mode": 0,
  //       "alpha": 0
  //     },
  //     "video": {
  //       "loop": true,
  //       "autoplay": true,
  //       "volume": 0
  //     },
  //     "flags": {
  //       "monks-active-tiles": {
  //         "active": true,
  //         "record": false,
  //         "restriction": "all",
  //         "controlled": "all",
  //         "trigger": [
  //           "enter"
  //         ],
  //         "allowpaused": false,
  //         "usealpha": false,
  //         "pointer": false,
  //         "pertoken": false,
  //         "minrequired": 0,
  //         "chance": 100,
  //         "fileindex": -1,
  //         "actions": [],
  //         "files": []
  //       }
  //     },
  //     "hidden": false,
  //     "locked": false,
  //     "restrictions": {
  //       "light": false,
  //       "weather": false
  //     },
  //     "elevation": 0
  //   },
  //   {
  //     "texture": {
  //       "src": "modules/harbinger-house-pf2e/dist/assets/tiles/smokeLite.webm",
  //       "scaleX": 1,
  //       "scaleY": 1,
  //       "tint": "#ffffff",
  //       "offsetX": 0,
  //       "offsetY": 0,
  //       "rotation": 0,
  //       "anchorX": 0.5,
  //       "anchorY": 0.5,
  //       "fit": "fill",
  //       "alphaThreshold": 0.75
  //     },
  //     "x": 3000,
  //     "y": 2200,
  //     "width": 100,
  //     "height": 100,
  //     "rotation": 0,
  //     "alpha": 1,
  //     "occlusion": {
  //       "mode": 0,
  //       "alpha": 0
  //     },
  //     "video": {
  //       "loop": true,
  //       "autoplay": true,
  //       "volume": 0
  //     },
  //     "flags": {
  //       "monks-active-tiles": {
  //         "active": true,
  //         "record": false,
  //         "restriction": "all",
  //         "controlled": "all",
  //         "trigger": [
  //           "enter"
  //         ],
  //         "allowpaused": false,
  //         "usealpha": false,
  //         "pointer": false,
  //         "pertoken": false,
  //         "minrequired": 0,
  //         "chance": 100,
  //         "fileindex": -1,
  //         "actions": [],
  //         "files": []
  //       }
  //     },
  //     "hidden": false,
  //     "locked": false,
  //     "restrictions": {
  //       "light": false,
  //       "weather": false
  //     },
  //     "elevation": 0
  //   }
  // ],
  "walls": [
    {
      "c": [
        2684,
        1400,
        2683,
        1512
      ],
      "move": 20,
      "sound": 20,
      "dir": 0,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2683,
        1512,
        2481,
        1511
      ],
      "move": 20,
      "sound": 20,
      "dir": 0,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2481,
        1511,
        2481,
        972
      ],
      "move": 20,
      "sound": 20,
      "dir": 0,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2481,
        972,
        3130,
        972
      ],
      "move": 20,
      "sound": 20,
      "dir": 0,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        3130,
        972,
        3131,
        1513
      ],
      "move": 20,
      "sound": 20,
      "dir": 0,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        3131,
        1513,
        2818,
        1512
      ],
      "move": 20,
      "sound": 20,
      "dir": 0,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2818,
        1512,
        2818,
        1399
      ],
      "move": 20,
      "sound": 20,
      "dir": 0,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2682,
        1499,
        2818,
        1499
      ],
      "move": 20,
      "sound": 20,
      "dir": 0,
      "door": 1,
      "ds": 1,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2481,
        1193,
        2208,
        1193
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2208,
        1193,
        2210,
        1990
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2210,
        1991,
        2511,
        1991
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2511,
        1991,
        2513,
        2059
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2513,
        2059,
        2544,
        2091
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2544,
        2091,
        2578,
        2090
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2578,
        2090,
        2607,
        2058
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2607,
        2058,
        2609,
        1893
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2609,
        1893,
        2453,
        1893
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        3291,
        1292,
        3130,
        1292
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        3290,
        1292,
        3290,
        1990
      ],
      "move": 20,
      "sound": 20,
      "dir": 1,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        3290,
        1990,
        2893,
        1989
      ],
      "move": 20,
      "sound": 20,
      "dir": 1,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2893,
        1989,
        2891,
        2061
      ],
      "move": 20,
      "sound": 20,
      "dir": 1,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2891,
        2061,
        2864,
        2090
      ],
      "move": 20,
      "sound": 20,
      "dir": 1,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2864,
        2090,
        2824,
        2089
      ],
      "move": 20,
      "sound": 20,
      "dir": 1,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2824,
        2089,
        2794,
        2055
      ],
      "move": 20,
      "sound": 20,
      "dir": 1,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2794,
        2055,
        2794,
        1892
      ],
      "move": 20,
      "sound": 20,
      "dir": 1,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2794,
        1892,
        2948,
        1892
      ],
      "move": 20,
      "sound": 20,
      "dir": 1,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2607,
        2017,
        2793,
        2017
      ],
      "move": 20,
      "sound": 20,
      "dir": 0,
      "door": 1,
      "ds": 1,
      "flags": {},
      "sight": 0,
      "light": 0,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        1725,
        1837,
        1762,
        1212
      ],
      "move": 20,
      "sound": 20,
      "dir": 1,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        1762,
        1212,
        1755,
        979
      ],
      "move": 20,
      "sound": 20,
      "dir": 1,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        1755,
        979,
        1619,
        890
      ],
      "move": 20,
      "sound": 20,
      "dir": 1,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        1619,
        890,
        1347,
        915
      ],
      "move": 20,
      "sound": 20,
      "dir": 1,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        1347,
        915,
        1299,
        800
      ],
      "move": 20,
      "sound": 20,
      "dir": 1,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        1725,
        1837,
        1798,
        1947
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        1798,
        1947,
        1915,
        2036
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        1915,
        2036,
        1912,
        2606
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        1912,
        2606,
        2007,
        2688
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2007,
        2688,
        2574,
        2704
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2574,
        2704,
        2679,
        2747
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2679,
        2747,
        2752,
        2902
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2752,
        2902,
        2708,
        3021
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2708,
        3021,
        2700,
        3100
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        2700,
        3100,
        3000,
        3200
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        3012,
        2825,
        3131,
        2896
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        3131,
        2896,
        3272,
        2918
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        3272,
        2918,
        3407,
        3014
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        3407,
        3014,
        3460,
        3191
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        3460,
        3191,
        3593,
        3220
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        3593,
        3220,
        3800,
        3196
      ],
      "move": 20,
      "sound": 20,
      "dir": 2,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        3000,
        3800,
        3000,
        3200
      ],
      "move": 0,
      "sound": 20,
      "dir": 0,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        800,
        800,
        3800,
        800
      ],
      "move": 20,
      "sound": 20,
      "dir": 0,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        3800,
        800,
        3800,
        3800
      ],
      "move": 20,
      "sound": 20,
      "dir": 0,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        3800,
        3800,
        800,
        3800
      ],
      "move": 20,
      "sound": 20,
      "dir": 0,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    },
    {
      "c": [
        800,
        3800,
        800,
        800
      ],
      "move": 20,
      "sound": 20,
      "dir": 0,
      "door": 0,
      "ds": 0,
      "flags": {},
      "sight": 20,
      "light": 20,
      "threshold": {
        "light": null,
        "sight": null,
        "sound": null,
        "attenuation": false
      },
      "animation": null
    }
  ]
}];
