// src/js/treasures.js
import * as THREE from 'three';

export default class TreasureManager {
    constructor(scene) {
        this.scene = scene;
        this.treasures = [];
        this.loader = new THREE.TextureLoader();
        this.goldTexture = null;
        this.hieroglyphTexture = null;

        // Preload textures
        this.loadTextures();
    }

    loadTextures() {
        // In a real implementation, load actual texture files
        // For now, we'll create procedural textures
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Gold texture
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(0, 0, 128, 128);

        // Add some variation
        ctx.fillStyle = '#FFC107';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 128;
            const y = Math.random() * 128;
            const size = 5 + Math.random() * 15;
            ctx.fillRect(x, y, size, size);
        }

        this.goldTexture = new THREE.CanvasTexture(canvas);

        // Hieroglyph texture
        const hieroglyphCanvas = document.createElement('canvas');
        hieroglyphCanvas.width = 128;
        hieroglyphCanvas.height = 128;
        const hierCtx = hieroglyphCanvas.getContext('2d');

        hierCtx.fillStyle = '#D2B48C';
        hierCtx.fillRect(0, 0, 128, 128);

        // Add simple hieroglyph-like symbols
        hierCtx.fillStyle = '#8B4513';
        hierCtx.fillRect(20, 20, 10, 40);
        hierCtx.fillRect(40, 20, 30, 10);
        hierCtx.fillRect(80, 30, 10, 30);
        hierCtx.fillRect(60, 60, 40, 10);
        hierCtx.fillRect(30, 80, 20, 20);

        this.hieroglyphTexture = new THREE.CanvasTexture(hieroglyphCanvas);
    }

    createTreasure(id, position) {
        // Create treasure group
        const treasureGroup = new THREE.Group();
        treasureGroup.position.copy(position);

        // Determine treasure type
        const treasureType = Math.floor(Math.random() * 3);

        let treasureMesh;

        switch (treasureType) {
            case 0: // Chest
                treasureMesh = this.createChest();
                break;
            case 1: // Gold scarab
                treasureMesh = this.createScarab();
                break;
            case 2: // Ancient tablet
                treasureMesh = this.createTablet();
                break;
        }

        treasureGroup.add(treasureMesh);

        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffdd44,
            transparent: true,
            opacity: 0.2
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        treasureGroup.add(glow);

        // Animation
        treasureGroup.userData = {
            originalY: position.y,
            rotationSpeed: 0.01 + Math.random() * 0.01,
            floatSpeed: 0.5 + Math.random() * 0.5,
            floatHeight: 0.2 + Math.random() * 0.3,
            time: Math.random() * Math.PI * 2
        };

        // Add to scene and treasures array
        this.scene.add(treasureGroup);

        this.treasures.push({
            id,
            mesh: treasureGroup,
            collected: false,
            value: 10 * (treasureType + 1)  // Different treasures worth different points
        });

        return this.treasures[this.treasures.length - 1];
    }

    createChest() {
        // Create a simple treasure chest
        const group = new THREE.Group();

        // Chest body
        const bodyGeometry = new THREE.BoxGeometry(0.8, 0.5, 0.6);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            map: this.goldTexture,
            roughness: 0.3,
            metalness: 0.7
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.25;
        body.castShadow = true;
        group.add(body);

        // Chest lid
        const lidGeometry = new THREE.BoxGeometry(0.85, 0.3, 0.65);
        const lid = new THREE.Mesh(lidGeometry, bodyMaterial);
        lid.position.y = 0.65;
        lid.castShadow = true;
        group.add(lid);

        // Decorative elements
        const detailGeometry = new THREE.BoxGeometry(0.9, 0.05, 0.05);
        const detailMaterial = new THREE.MeshStandardMaterial({
            color: 0xb8860b,
            roughness: 0.5,
            metalness: 0.8
        });

        // Add bands around chest
        const topBand = new THREE.Mesh(detailGeometry, detailMaterial);
        topBand.position.set(0, 0.65, 0);
        group.add(topBand);

        const frontDetail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.65), detailMaterial);
        frontDetail.position.set(-0.4, 0.65, 0);
        group.add(frontDetail);

        return group;
    }

    createScarab() {
        // Create a golden scarab beetle
        const group = new THREE.Group();

        // Body
        const bodyGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            map: this.goldTexture,
            roughness: 0.2,
            metalness: 0.8
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.scale.set(1, 0.7, 1.3);
        body.castShadow = true;
        group.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0, 0.1, 0.35);
        head.scale.set(1, 0.7, 1);
        head.castShadow = true;
        group.add(head);

        // Wings
        const wingGeometry = new THREE.CircleGeometry(0.25, 16);
        const wingMaterial = new THREE.MeshStandardMaterial({
            map: this.goldTexture,
            roughness: 0.3,
            metalness: 0.7,
            side: THREE.DoubleSide
        });

        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.rotation.y = Math.PI / 2;
        leftWing.rotation.z = -Math.PI / 5;
        leftWing.position.set(-0.2, 0.2, 0);
        leftWing.castShadow = true;
        group.add(leftWing);

        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.rotation.y = -Math.PI / 2;
        rightWing.rotation.z = Math.PI / 5;
        rightWing.position.set(0.2, 0.2, 0);
        rightWing.castShadow = true;
        group.add(rightWing);

        return group;
    }

    createTablet() {
        // Create an ancient tablet with hieroglyphs
        const group = new THREE.Group();

        // Tablet body
        const tabletGeometry = new THREE.BoxGeometry(0.7, 0.1, 0.9);
        const tabletMaterial = new THREE.MeshStandardMaterial({
            map: this.hieroglyphTexture,
            roughness: 0.8,
            metalness: 0.2
        });
        const tablet = new THREE.Mesh(tabletGeometry, tabletMaterial);
        tablet.castShadow = true;
        group.add(tablet);

        // Add a border
        const borderGeometry = new THREE.BoxGeometry(0.8, 0.12, 1);
        const borderMaterial = new THREE.MeshStandardMaterial({
            map: this.goldTexture,
            roughness: 0.4,
            metalness: 0.7
        });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.y = -0.01;
        border.castShadow = true;
        group.add(border);

        return group;
    }

    update(deltaTime) {
        // Animate treasures
        this.treasures.forEach(treasure => {
            if (!treasure.collected) {
                const userData = treasure.mesh.userData;

                // Update time
                userData.time += deltaTime;

                // Rotate and float
                treasure.mesh.rotation.y += userData.rotationSpeed;
                const newY = userData.originalY + Math.sin(userData.time * userData.floatSpeed) * userData.floatHeight;
                treasure.mesh.position.y = newY;

                // Pulse glow
                if (treasure.mesh.children.length > 1) {
                    const glow = treasure.mesh.children[1];
                    glow.material.opacity = 0.2 + Math.sin(userData.time * 2) * 0.1;
                }
            }
        });
    }

    checkCollision(playerPosition, collectionDistance = 1.5) {
        const collectedTreasures = [];

        this.treasures.forEach(treasure => {
            if (!treasure.collected) {
                const distance = playerPosition.distanceTo(treasure.mesh.position);

                if (distance < collectionDistance) {
                    // Mark as collected
                    treasure.collected = true;
                    treasure.mesh.visible = false;

                    collectedTreasures.push({
                        id: treasure.id,
                        value: treasure.value
                    });
                }
            }
        });

        return collectedTreasures;
    }

    updateFromServer(treasureData) {
        treasureData.forEach(data => {
            const treasure = this.treasures.find(t => t.id === data.id);

            if (treasure) {
                treasure.collected = data.collected;
                treasure.mesh.visible = !data.collected;
            } else if (!data.collected) {
                // New treasure - create it
                const position = new THREE.Vector3(
                    data.position.x || ((Math.random() - 0.5) * 80),
                    data.position.y || 0.5,
                    data.position.z || ((Math.random() - 0.5) * 80)
                );
                this.createTreasure(data.id, position);
            }
        });
    }
}