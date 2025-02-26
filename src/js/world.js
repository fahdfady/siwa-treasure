// src/js/world.js
import * as THREE from 'three';

export default class EgyptianWorld {
    constructor(scene) {
        this.scene = scene;
        this.textureLoader = new THREE.TextureLoader();
        this.sandTexture = null;
        this.stoneTexture = null;

        // Load textures
        this.loadTextures();

        // Create world
        this.createSky();
        this.createGround();
        this.createOasis();
        this.createPyramid();
        this.createTempleRuins();
        this.createStonePillars();
        this.createPalmTrees();
        this.createAmbientElements();
    }

    loadTextures() {
        // In real implementation, load actual textures
        // For simplicity, we'll create procedural textures

        // Create sand texture
        const sandCanvas = document.createElement('canvas');
        sandCanvas.width = 256;
        sandCanvas.height = 256;
        const sandCtx = sandCanvas.getContext('2d');

        // Base color
        sandCtx.fillStyle = '#e0c080';
        sandCtx.fillRect(0, 0, 256, 256);

        // Add noise
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = Math.random() * 2;
            const shade = Math.random() * 30 - 15;
            const color = 224 + shade;
            sandCtx.fillStyle = `rgb(${color}, ${192 + shade}, ${128 + shade})`;
            sandCtx.fillRect(x, y, size, size);
        }

        this.sandTexture = new THREE.CanvasTexture(sandCanvas);
        this.sandTexture.wrapS = THREE.RepeatWrapping;
        this.sandTexture.wrapT = THREE.RepeatWrapping;
        this.sandTexture.repeat.set(10, 10);

        // Create stone texture
        const stoneCanvas = document.createElement('canvas');
        stoneCanvas.width = 256;
        stoneCanvas.height = 256;
        const stoneCtx = stoneCanvas.getContext('2d');

        // Base color
        stoneCtx.fillStyle = '#d0d0d0';
        stoneCtx.fillRect(0, 0, 256, 256);

        // Add brick pattern
        stoneCtx.fillStyle = '#c0c0c0';
        for (let y = 0; y < 256; y += 32) {
            const offset = (y % 64 === 0) ? 0 : 32;
            for (let x = offset; x < 256; x += 64) {
                stoneCtx.fillRect(x, y, 30, 30);
            }
        }

        // Add noise/cracks
        stoneCtx.fillStyle = '#a0a0a0';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            stoneCtx.fillRect(x, y, Math.random() * 5, Math.random() * 20);
        }

        this.stoneTexture = new THREE.CanvasTexture(stoneCanvas);
        this.stoneTexture.wrapS = THREE.RepeatWrapping;
        this.stoneTexture.wrapT = THREE.RepeatWrapping;
    }

    createSky() {
        // Create sky dome
        const skyGeometry = new THREE.SphereGeometry(100, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);

        // Add sun
        const sunGeometry = new THREE.SphereGeometry(5, 32, 16);
        const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffffcc });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.set(50, 70, -50);
        this.scene.add(sun);

        // Add a few clouds
        this.addClouds();
    }

    addClouds() {
        const cloudGeometry = new THREE.SphereGeometry(1, 8, 8);
        const cloudMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });

        // Create a few cloud formations
        for (let i = 0; i < 10; i++) {
            const cloudCluster = new THREE.Group();

            // Random position in sky
            cloudCluster.position.set(
                (Math.random() - 0.5) * 150,
                40 + Math.random() * 30,
                (Math.random() - 0.5) * 150
            );

            // Create cloud from multiple spheres
            const numElements = 5 + Math.floor(Math.random() * 10);
            for (let j = 0; j < numElements; j++) {
                const element = new THREE.Mesh(cloudGeometry, cloudMaterial);

                // Randomize element size and position
                const scale = 2 + Math.random() * 3;
                element.scale.set(scale, scale * 0.6, scale);
                element.position.set(
                    (Math.random() - 0.5) * 5,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 5
                );

                cloudCluster.add(element);
            }

            // Add to scene
            this.scene.add(cloudCluster);
        }
    }

    createGround() {
        // Desert ground
        const groundGeometry = new THREE.PlaneGeometry(200, 200, 32, 32);
        const groundMaterial = new THREE.MeshStandardMaterial({
            map: this.sandTexture,
            color: 0xe0c080,
            roughness: 0.8
        });

        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;

        // Create slight terrain variations
        const vertices = ground.geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            // Skip the very edges of the terrain
            const x = vertices[i];
            const z = vertices[i + 2];
            const distanceFromCenter = Math.sqrt(x * x + z * z);

            if (distanceFromCenter < 90) {
                // Add some height variation
                vertices[i + 1] = (Math.random() * 0.5) * (1 - distanceFromCenter / 90);
            }
        }

        ground.geometry.attributes.position.needsUpdate = true;
        ground.geometry.computeVertexNormals();

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
        water.receiveShadow = true;
        this.scene.add(water);

        // Add small rocks around the oasis
        const rockGeometry = new THREE.SphereGeometry(1, 6, 6);
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080,
            roughness: 0.9
        });

        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const x = -15 + Math.cos(angle) * (5 + Math.random() * 1.5);
            const z = -15 + Math.sin(angle) * (5 + Math.random() * 1.5);

            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(x, 0.3, z);

            // Randomize rock size and shape
            const scaleX = 0.2 + Math.random() * 0.4;
            const scaleY = 0.2 + Math.random() * 0.2;
            const scaleZ = 0.2 + Math.random() * 0.4;
            rock.scale.set(scaleX, scaleY, scaleZ);

            // Randomize rotation
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            rock.castShadow = true;
            rock.receiveShadow = true;
            this.scene.add(rock);
        }
    }

    createPalmTrees() {
        // Create palm trees around oasis
        this.addPalmTreeCluster(-15, -15, 5, 8);

        // Add a few scattered palm trees
        for (let i = 0; i < 10; i++) {
            const x = (Math.random() - 0.5) * 160;
            const z = (Math.random() - 0.5) * 160;

            // Don't place trees too close to structures
            const distanceToOasis = Math.sqrt((x + 15) * (x + 15) + (z + 15) * (z + 15));
            const distanceToPyramid = Math.sqrt((x - 20) * (x - 20) + (z + 20) * (z + 20));
            const distanceToTemple = Math.sqrt(x * x + z * z);

            if (distanceToOasis > 10 && distanceToPyramid > 15 && distanceToTemple > 15) {
                this.createPalmTree(x, z);
            }
        }
    }

    addPalmTreeCluster(centerX, centerZ, radius, count) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * (radius + Math.random() * 2);
            const z = centerZ + Math.sin(angle) * (radius + Math.random() * 2);

            this.createPalmTree(x, z);
        }
    }

    createPalmTree(x, z) {
        const treeGroup = new THREE.Group();
        treeGroup.position.set(x, 0, z);

        // Tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 4, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.8
        });

        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Palm leaves
        const leav