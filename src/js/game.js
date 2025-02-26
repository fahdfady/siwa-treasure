// Main game file: game.js

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as io from 'socket.io-client';

class EgyptianTreasureHunt {
    constructor() {
        // Socket connection
        this.socket = io();
        this.players = {};
        this.playerId = null;
        this.treasures = [];
        this.score = 0;

        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xddddff); // Light blue sky

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 10);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Lights
        this.addLights();

        // Ground - Siwa desert
        this.createGround();

        // Add oasis
        this.createOasis();

        // Add Egyptian structures
        this.addEgyptianStructures();

        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Player movement controls
        this.moveDirection = { forward: false, backward: false, left: false, right: false };
        this.setupPlayerControls();

        // Player model and setup
        this.player = null;
        this.loadPlayerModel();

        // Setup multiplayer
        this.setupMultiplayer();

        // Spawn treasures
        this.spawnTreasures(10);

        // Start game loop
        this.animate();

        // UI Setup
        this.setupUI();
    }

    addLights() {
        // Sunlight - directional light
        const sunlight = new THREE.DirectionalLight(0xffffcc, 1);
        sunlight.position.set(5, 10, 7);
        sunlight.castShadow = true;
        sunlight.shadow.mapSize.width = 1024;
        sunlight.shadow.mapSize.height = 1024;
        sunlight.shadow.camera.near = 0.5;
        sunlight.shadow.camera.far = 50;
        this.scene.add(sunlight);

        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
    }

    createGround() {
        // Desert sand texture
        const textureLoader = new THREE.TextureLoader();
        const sandTexture = textureLoader.load('/assets/textures/sand.jpg');
        sandTexture.wrapS = THREE.RepeatWrapping;
        sandTexture.wrapT = THREE.RepeatWrapping;
        sandTexture.repeat.set(10, 10);

        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({
            map: sandTexture,
            color: 0xe0c080,
            roughness: 0.8
        });

        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    createOasis() {
        // Water
        const waterGeometry = new THREE.CircleGeometry(5, 32);
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x40a0ff,
            metalness: 0.1,
            roughness: 0.3
        });

        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.set(-15, 0.1, -15);
        this.scene.add(water);

        // Add palm trees around oasis (simplified for now)
        this.addPalmTrees(-15, -15, 5);
    }

    addPalmTrees(centerX, centerZ, radius) {
        // Simple palm tree representation
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * (radius + 1);
            const z = centerZ + Math.sin(angle) * (radius + 1);

            // Tree trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 3, 8);
            const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.set(x, 1.5, z);
            trunk.castShadow = true;
            this.scene.add(trunk);

            // Palm leaves (simplified)
            const leavesGeometry = new THREE.ConeGeometry(1.5, 1.5, 8);
            const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x2E8B57 });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.set(x, 3.5, z);
            leaves.castShadow = true;
            this.scene.add(leaves);
        }
    }

    addEgyptianStructures() {
        // Simple pyramid
        const pyramidGeometry = new THREE.ConeGeometry(5, 8, 4);
        const pyramidMaterial = new THREE.MeshStandardMaterial({
            color: 0xe0c080,
            roughness: 0.7
        });

        const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
        pyramid.position.set(20, 4, -20);
        pyramid.castShadow = true;
        pyramid.receiveShadow = true;
        this.scene.add(pyramid);

        // Temple ruins
        this.createTempleRuins(0, 0);

        // Stone pillars
        this.createStonePillars(10, -10);
    }

    createTempleRuins(x, z) {
        // Base platform
        const baseGeometry = new THREE.BoxGeometry(12, 1, 8);
        const stoneMaterial = new THREE.MeshStandardMaterial({
            color: 0xd0d0d0,
            roughness: 0.7
        });

        const base = new THREE.Mesh(baseGeometry, stoneMaterial);
        base.position.set(x, 0.5, z);
        base.receiveShadow = true;
        this.scene.add(base);

        // Columns
        const columnPositions = [
            [-5, 0], [-5, -3], [5, 0], [5, -3],
            [-5, 3], [5, 3]
        ];

        columnPositions.forEach(pos => {
            const columnGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5, 16);
            const column = new THREE.Mesh(columnGeometry, stoneMaterial);
            column.position.set(x + pos[0], 3, z + pos[1]);
            column.castShadow = true;
            this.scene.add(column);
        });
    }

    createStonePillars(x, z) {
        const stoneMaterial = new THREE.MeshStandardMaterial({
            color: 0xd0d0d0,
            roughness: 0.8
        });

        // Create a row of 5 pillars
        for (let i = 0; i < 5; i++) {
            const height = 2 + Math.random() * 3; // Varied heights
            const pillarGeometry = new THREE.CylinderGeometry(0.4, 0.4, height, 8);
            const pillar = new THREE.Mesh(pillarGeometry, stoneMaterial);

            pillar.position.set(x + i * 2, height / 2, z);
            pillar.castShadow = true;
            this.scene.add(pillar);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    setupPlayerControls() {
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW':
                    this.moveDirection.forward = true;
                    break;
                case 'KeyS':
                    this.moveDirection.backward = true;
                    break;
                case 'KeyA':
                    this.moveDirection.left = true;
                    break;
                case 'KeyD':
                    this.moveDirection.right = true;
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'KeyW':
                    this.moveDirection.forward = false;
                    break;
                case 'KeyS':
                    this.moveDirection.backward = false;
                    break;
                case 'KeyA':
                    this.moveDirection.left = false;
                    break;
                case 'KeyD':
                    this.moveDirection.right = false;
                    break;
            }
        });
    }

    loadPlayerModel() {
        // For now, use a simple colored cone as player avatar
        const playerGeometry = new THREE.ConeGeometry(0.5, 1.5, 16);
        const playerMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        this.player = new THREE.Mesh(playerGeometry, playerMaterial);
        this.player.position.set(0, 1, 0);
        this.player.castShadow = true;
        this.scene.add(this.player);

        // Add a pointer to show direction
        const pointerGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.5);
        const pointerMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const pointer = new THREE.Mesh(pointerGeometry, pointerMaterial);
        pointer.position.set(0, 0, -0.5);
        this.player.add(pointer);

        // Camera follows player
        this.cameraTarget = new THREE.Object3D();
        this.cameraTarget.position.set(0, 2, 0);
        this.player.add(this.cameraTarget);
    }

    setupMultiplayer() {
        // Connect to server
        this.socket.on('connect', () => {
            console.log('Connected to server with ID:', this.socket.id);
            this.playerId = this.socket.id;

            // Initial player position
            this.socket.emit('playerJoin', {
                position: this.player.position,
                rotation: this.player.rotation
            });
        });

        // Handle other players
        this.socket.on('players', (players) => {
            // Update existing players and add new ones
            Object.keys(players).forEach(id => {
                // Skip self
                if (id === this.playerId) return;

                if (!this.players[id]) {
                    // Create new player
                    const otherPlayerGeometry = new THREE.ConeGeometry(0.5, 1.5, 16);
                    const otherPlayerMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
                    const otherPlayer = new THREE.Mesh(otherPlayerGeometry, otherPlayerMaterial);
                    otherPlayer.castShadow = true;
                    this.scene.add(otherPlayer);
                    this.players[id] = otherPlayer;
                }

                // Update position and rotation
                this.players[id].position.copy(players[id].position);
                this.players[id].rotation.copy(players[id].rotation);
            });

            // Remove disconnected players
            Object.keys(this.players).forEach(id => {
                if (!players[id]) {
                    this.scene.remove(this.players[id]);
                    delete this.players[id];
                }
            });
        });

        // Treasure updates
        this.socket.on('treasureUpdate', (treasureData) => {
            this.updateTreasures(treasureData);
        });

        // Score updates
        this.socket.on('scoreUpdate', (scores) => {
            // Update UI with scores
            this.updateScoreUI(scores);
        });
    }

    spawnTreasures(count) {
        for (let i = 0; i < count; i++) {
            // Random position within game area
            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;

            // Create treasure geometry
            const treasureGeometry = new THREE.BoxGeometry(1, 1, 1);
            const treasureMaterial = new THREE.MeshStandardMaterial({
                color: 0xffd700, // Gold color
                metalness: 1,
                roughness: 0.3
            });

            const treasure = new THREE.Mesh(treasureGeometry, treasureMaterial);
            treasure.position.set(x, 0.5, z);
            treasure.rotation.y = Math.random() * Math.PI * 2;
            treasure.castShadow = true;

            // Add to scene and treasures array
            this.scene.add(treasure);
            this.treasures.push({
                id: `treasure-${i}`,
                mesh: treasure,
                collected: false
            });
        }
    }

    updateTreasures(treasureData) {
        treasureData.forEach(data => {
            const treasure = this.treasures.find(t => t.id === data.id);
            if (treasure) {
                treasure.collected = data.collected;
                treasure.mesh.visible = !data.collected;
            }
        });
    }

    updatePlayerPosition() {
        const moveSpeed = 0.1;
        const rotateSpeed = 0.05;

        // Movement
        if (this.moveDirection.forward) {
            this.player.translateZ(-moveSpeed);
        }
        if (this.moveDirection.backward) {
            this.player.translateZ(moveSpeed);
        }
        if (this.moveDirection.left) {
            this.player.rotation.y += rotateSpeed;
        }
        if (this.moveDirection.right) {
            this.player.rotation.y -= rotateSpeed;
        }

        // Check boundaries
        const boundary = 50;
        if (Math.abs(this.player.position.x) > boundary) {
            this.player.position.x = Math.sign(this.player.position.x) * boundary;
        }
        if (Math.abs(this.player.position.z) > boundary) {
            this.player.position.z = Math.sign(this.player.position.z) * boundary;
        }

        // Update camera position
        this.camera.position.copy(this.player.position).add(new THREE.Vector3(0, 5, 10));
        this.camera.lookAt(this.player.position);

        // Emit position to server
        this.socket.emit('playerMove', {
            position: this.player.position,
            rotation: this.player.rotation
        });

        // Check for treasure collection
        this.checkTreasureCollection();
    }

    checkTreasureCollection() {
        const collectionDistance = 1.5;

        this.treasures.forEach(treasure => {
            if (!treasure.collected) {
                const distance = this.player.position.distanceTo(treasure.mesh.position);

                if (distance < collectionDistance) {
                    // Collect treasure
                    treasure.collected = true;
                    treasure.mesh.visible = false;
                    this.score += 10;

                    // Update UI
                    document.getElementById('score').textContent = `Score: ${this.score}`;

                    // Notify server
                    this.socket.emit('treasureCollected', treasure.id);
                }
            }
        });
    }

    setupUI() {
        // Create UI container
        const uiContainer = document.createElement('div');
        uiContainer.style.position = 'absolute';
        uiContainer.style.top = '10px';
        uiContainer.style.left = '10px';
        uiContainer.style.color = 'white';
        uiContainer.style.fontFamily = 'Arial, sans-serif';
        uiContainer.style.padding = '10px';
        uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        uiContainer.style.borderRadius = '5px';
        document.body.appendChild(uiContainer);

        // Score display
        const scoreElement = document.createElement('div');
        scoreElement.id = 'score';
        scoreElement.textContent = `Score: ${this.score}`;
        uiContainer.appendChild(scoreElement);

        // Player list
        const playerListElement = document.createElement('div');
        playerListElement.id = 'playerList';
        playerListElement.innerHTML = '<h3>Players</h3><ul id="players"></ul>';
        uiContainer.appendChild(playerListElement);

        // Instructions
        const instructionsElement = document.createElement('div');
        instructionsElement.innerHTML = '<h3>Controls</h3><p>W, A, S, D to move</p>';
        uiContainer.appendChild(instructionsElement);
    }

    updateScoreUI(scores) {
        const playersList = document.getElementById('players');
        playersList.innerHTML = '';

        Object.keys(scores).forEach(id => {
            const listItem = document.createElement('li');
            const isCurrentPlayer = id === this.playerId;
            listItem.textContent = `${isCurrentPlayer ? 'You' : 'Player ' + id.substr(0, 5)}: ${scores[id]}`;
            if (isCurrentPlayer) {
                listItem.style.fontWeight = 'bold';
            }
            playersList.appendChild(listItem);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Update player position
        this.updatePlayerPosition();

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game when the page loads
window.onload = () => {
    new EgyptianTreasureHunt();
};