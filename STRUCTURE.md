siwa-treasure/
│
├── public/                  # Static files served to clients
│   ├── index.html           # Main HTML entry point
│   ├── css/                 # CSS styles
│   │   └── style.css        # Main stylesheet
│   ├── js/                  # Client-side JavaScript
│   │   └── game.js          # Main game file (compiled/bundled)
│   └── assets/              # Game assets
│       ├── models/          # 3D models
│       │   ├── player.glb   # Player character model
│       │   └── treasures/   # Treasure chest models, etc.
│       ├── textures/        # Texture files
│       │   ├── sand.jpg     # Desert sand texture
│       │   └── stone.jpg    # Stone texture for ruins
│       └── sounds/          # Game sounds and music
│           ├── ambient.mp3  # Background music
│           └── collect.mp3  # Treasure collection sound
│
├── src/                     # Source files (pre-build)
│   ├── js/                  # JavaScript source files
│   │   ├── game.js          # Main game class
│   │   ├── player.js        # Player class
│   │   ├── world.js         # World generation
│   │   └── multiplayer.js   # Multiplayer functionality
│   └── components/          # Reusable components
│       ├── treasures.js     # Treasure handling
│       └── ui.js            # User interface elements
│
├── server/                  # Server-side code
│   ├── server.js            # Main server file
│   └── gameState.js         # Server-side game state management
│
├── package.json             # Project dependencies and scripts
├── vite.config.js           # vite configuration
├── README.md                # Project documentation
└── STRUCTURE.md             # Directory structure 