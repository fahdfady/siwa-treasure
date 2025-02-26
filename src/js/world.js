import * as THREE from 'three';

export default class EgyptianWorld {
    constructor(scene) {
        this.scene = scene;
        this.textureLoader = new THREE.TextureLoader();
        this.sandTexture = null;
        this.stoneTexture = null;
        this.treasures = [];

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
        this.placeTreasures();
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
        const leafMaterial = new THREE.MeshStandardMaterial({
            color: 0x2E8B57,
            roughness: 0.7,
            side: THREE.DoubleSide
        });

        // Create 6-8 leaves in a radial pattern at the top
        const numLeaves = 6 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numLeaves; i++) {
            const leafGroup = new THREE.Group();
            leafGroup.position.y = 4;

            // Create leaf geometry
            const leafShape = new THREE.Shape();
            leafShape.moveTo(0, 0);
            leafShape.bezierCurveTo(0.2, 0.5, 0.5, 1.5, 0.5, 2.5);
            leafShape.bezierCurveTo(0.3, 2.7, 0.2, 2.9, 0, 3);
            leafShape.bezierCurveTo(-0.2, 2.9, -0.3, 2.7, -0.5, 2.5);
            leafShape.bezierCurveTo(-0.5, 1.5, -0.2, 0.5, 0, 0);

            const leafGeometry = new THREE.ShapeGeometry(leafShape);
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);

            // Rotate leaf to face outward
            leaf.rotation.x = -Math.PI / 2;
            leaf.rotation.z = (i / numLeaves) * Math.PI * 2;

            // Add slight droop and randomize
            leaf.rotation.y = Math.PI / 6 + Math.random() * 0.2;

            // Scale the leaf
            leaf.scale.set(1.5, 3.5, 1.5);

            leafGroup.add(leaf);
            treeGroup.add(leafGroup);
        }

        this.scene.add(treeGroup);
    }

    createPyramid() {
        // Create a pyramid at (20, 0, 20)
        const pyramidHeight = 15;
        const pyramidBase = 20;
        const pyramidGeometry = new THREE.ConeGeometry(pyramidBase, pyramidHeight, 4);
        const pyramidMaterial = new THREE.MeshStandardMaterial({
            map: this.stoneTexture,
            color: 0xd0c090,
            roughness: 0.7
        });

        const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
        pyramid.position.set(20, pyramidHeight / 2, 20);
        pyramid.rotation.y = Math.PI / 4; // Rotate to align base corners with axes
        pyramid.castShadow = true;
        pyramid.receiveShadow = true;
        this.scene.add(pyramid);

        // Add steps to the pyramid
        const stepsCount = 5;
        const stepWidth = 1;

        for (let i = 0; i < stepsCount; i++) {
            const stepSize = pyramidBase - (i * stepWidth * 2);
            if (stepSize <= 0) continue;

            const stepHeight = 0.5;
            const stepY = (i * stepHeight);

            const stepGeometry = new THREE.BoxGeometry(stepSize, stepHeight, stepSize);
            const stepMaterial = new THREE.MeshStandardMaterial({
                map: this.stoneTexture,
                color: 0xd0c090,
                roughness: 0.8
            });

            const step = new THREE.Mesh(stepGeometry, stepMaterial);
            step.position.set(20, stepY, 20);
            step.castShadow = true;
            step.receiveShadow = true;
            this.scene.add(step);
        }

        // Add a small entrance at the base of the pyramid
        const entranceWidth = 2;
        const entranceHeight = 3;
        const entranceDepth = 2;

        const entranceGeometry = new THREE.BoxGeometry(entranceWidth, entranceHeight, entranceDepth);
        const entranceMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 1.0
        });

        const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
        entrance.position.set(20, entranceHeight / 2, 20 + pyramidBase - entranceDepth / 2);
        this.scene.add(entrance);
    }

    createTempleRuins() {
        const templeGroup = new THREE.Group();
        templeGroup.position.set(0, 0, 0);

        // Create temple base
        const baseGeometry = new THREE.BoxGeometry(20, 1, 15);
        const baseMaterial = new THREE.MeshStandardMaterial({
            map: this.stoneTexture,
            color: 0xd0d0d0,
            roughness: 0.8
        });

        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.5;
        base.castShadow = true;
        base.receiveShadow = true;
        templeGroup.add(base);

        // Create partial walls (to look ruined)
        this.createRuinedWall(templeGroup, -9, 2, 0, 2, 5, 15);
        this.createRuinedWall(templeGroup, 9, 2, 0, 2, 4, 15);
        this.createRuinedWall(templeGroup, 0, 2, -7, 16, 3, 1);

        // Add some fallen columns
        for (let i = 0; i < 3; i++) {
            const columnGeometry = new THREE.CylinderGeometry(0.7, 0.7, 6, 16);
            const columnMaterial = new THREE.MeshStandardMaterial({
                map: this.stoneTexture,
                color: 0xe0e0e0,
                roughness: 0.6
            });

            const column = new THREE.Mesh(columnGeometry, columnMaterial);

            // Position randomly on the ground near the temple
            const angle = Math.random() * Math.PI * 2;
            const distance = 5 + Math.random() * 8;
            column.position.set(
                Math.cos(angle) * distance,
                0.7,
                Math.sin(angle) * distance
            );

            // Rotate to look fallen
            column.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
            column.rotation.z = (Math.random() - 0.5) * 0.3;

            column.castShadow = true;
            column.receiveShadow = true;
            templeGroup.add(column);
        }

        this.scene.add(templeGroup);
    }

    createRuinedWall(group, x, y, z, width, height, depth) {
        // Create a "ruined" wall by making it irregular at the top
        const segments = 10;
        const segmentWidth = width / segments;

        for (let i = 0; i < segments; i++) {
            // Randomize height for each segment, making it more likely to be ruined at edges
            const distanceFromCenter = Math.abs(i - segments / 2) / (segments / 2);
            const maxHeightReduction = height * 0.8;
            const heightReduction = maxHeightReduction * distanceFromCenter * Math.random();
            const segmentHeight = height - heightReduction;

            if (segmentHeight <= 0) continue;

            const segmentGeometry = new THREE.BoxGeometry(segmentWidth, segmentHeight, depth);
            const segmentMaterial = new THREE.MeshStandardMaterial({
                map: this.stoneTexture,
                color: 0xd0d0d0,
                roughness: 0.8
            });

            const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
            segment.position.set(
                x - width / 2 + segmentWidth / 2 + i * segmentWidth,
                y + segmentHeight / 2,
                z
            );

            segment.castShadow = true;
            segment.receiveShadow = true;
            group.add(segment);
        }
    }

    createStonePillars() {
        const pillarPositions = [
            { x: -30, z: 20 },
            { x: -25, z: 20 },
            { x: -20, z: 20 }
        ];

        pillarPositions.forEach((pos, index) => {
            // Only create some pillars to look ruined
            if (index === 1 && Math.random() < 0.5) return;

            const height = 8 + Math.random() * 2;
            const pillarGeometry = new THREE.CylinderGeometry(1, 1, height, 16);
            const pillarMaterial = new THREE.MeshStandardMaterial({
                map: this.stoneTexture,
                color: 0xe0e0e0,
                roughness: 0.6
            });

            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(pos.x, height / 2, pos.z);

            // Add slight random tilt to some pillars
            if (Math.random() < 0.3) {
                pillar.rotation.z = (Math.random() - 0.5) * 0.2;
                pillar.rotation.x = (Math.random() - 0.5) * 0.2;
            }

            pillar.castShadow = true;
            pillar.receiveShadow = true;
            this.scene.add(pillar);

            // Add a capital to the top of each pillar
            this.createPillarCapital(pos.x, height, pos.z);
        });
    }

    createPillarCapital(x, height, z) {
        const capitalGeometry = new THREE.BoxGeometry(2.5, 0.8, 2.5);
        const capitalMaterial = new THREE.MeshStandardMaterial({
            map: this.stoneTexture,
            color: 0xe8e8e8,
            roughness: 0.6
        });

        const capital = new THREE.Mesh(capitalGeometry, capitalMaterial);
        capital.position.set(x, height + 0.4, z);
        capital.castShadow = true;
        capital.receiveShadow = true;

        this.scene.add(capital);
    }

    createAmbientElements() {
        // Create scattered stones
        for (let i = 0; i < 30; i++) {
            const x = (Math.random() - 0.5) * 180;
            const z = (Math.random() - 0.5) * 180;

            // Don't place stones too close to other structures
            const distanceToOasis = Math.sqrt((x + 15) * (x + 15) + (z + 15) * (z + 15));
            const distanceToPyramid = Math.sqrt((x - 20) * (x - 20) + (z + 20) * (z + 20));
            const distanceToTemple = Math.sqrt(x * x + z * z);

            if (distanceToOasis > 10 && distanceToPyramid > 15 && distanceToTemple > 15) {
                this.createStone(x, z);
            }
        }

        // Create a few ancient statues
        this.createStatue(-10, 10);
        this.createStatue(10, -25);

        // Create a small ancient wall
        this.createAncientWall(-35, -15);
    }

    createStone(x, z) {
        const size = 0.5 + Math.random() * 1.5;
        const stoneGeometry = new THREE.SphereGeometry(size, 6, 6);
        const stoneMaterial = new THREE.MeshStandardMaterial({
            color: 0xc0c0c0,
            roughness: 0.9
        });

        // Deform the geometry to make it look more like a natural stone
        const vertices = stoneGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i] += (Math.random() - 0.5) * 0.2 * size;
            vertices[i + 1] += (Math.random() - 0.5) * 0.2 * size;
            vertices[i + 2] += (Math.random() - 0.5) * 0.2 * size;
        }

        stoneGeometry.attributes.position.needsUpdate = true;
        stoneGeometry.computeVertexNormals();

        const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
        stone.position.set(x, size * 0.5, z);
        stone.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        stone.castShadow = true;
        stone.receiveShadow = true;
        this.scene.add(stone);
    }

    createStatue(x, z) {
        const statueGroup = new THREE.Group();
        statueGroup.position.set(x, 0, z);

        // Create base
        const baseGeometry = new THREE.BoxGeometry(3, 1, 3);
        const baseMaterial = new THREE.MeshStandardMaterial({
            map: this.stoneTexture,
            color: 0xd8d8d8,
            roughness: 0.7
        });

        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.5;
        base.castShadow = true;
        base.receiveShadow = true;
        statueGroup.add(base);

        // Create a simplified Sphinx-like statue
        const bodyGeometry = new THREE.BoxGeometry(2, 1.2, 1.5);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            map: this.stoneTexture,
            color: 0xe0e0e0,
            roughness: 0.7
        });

        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 1.6, 0);
        body.castShadow = true;
        body.receiveShadow = true;
        statueGroup.add(body);

        // Create head
        const headGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.8);
        const headMaterial = new THREE.MeshStandardMaterial({
            map: this.stoneTexture,
            color: 0xe8e8e8,
            roughness: 0.7
        });

        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 2.3, 0.7);
        head.castShadow = true;
        head.receiveShadow = true;
        statueGroup.add(head);

        this.scene.add(statueGroup);
    }

    createAncientWall(x, z) {
        const wallGroup = new THREE.Group();
        wallGroup.position.set(x, 0, z);

        // Create a long, low, ruined wall
        const wallLength = 15;
        const segments = 10;
        const segmentLength = wallLength / segments;

        for (let i = 0; i < segments; i++) {
            // Randomize height and condition for each segment
            const segmentHeight = 1 + Math.random() * 2;

            // Skip some segments to look ruined
            if (Math.random() < 0.3) continue;

            const segmentGeometry = new THREE.BoxGeometry(segmentLength, segmentHeight, 1);
            const segmentMaterial = new THREE.MeshStandardMaterial({
                map: this.stoneTexture,
                color: 0xc8c8c8,
                roughness: 0.9
            });

            const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
            segment.position.set(
                -wallLength / 2 + segmentLength / 2 + i * segmentLength,
                segmentHeight / 2,
                0
            );

            // Add some rotation to make it look more ruined
            segment.rotation.z = (Math.random() - 0.5) * 0.2;
            segment.rotation.y = (Math.random() - 0.5) * 0.1;

            segment.castShadow = true;
            segment.receiveShadow = true;
            wallGroup.add(segment);
        }

        this.scene.add(wallGroup);
    }

    placeTreasures() {
        // Define treasure locations (some hidden, some visible)
        const treasureLocations = [
            // Inside the pyramid
            { x: 20, y: 1, z: 20, hidden: true },
            // Near temple ruins
            { x: 5, y: 0.5, z: 3, hidden: false },
            // Under palm tree near oasis
            { x: -17, y: 0.5, z: -12, hidden: true },
            // Behind a pillar
            { x: -30, y: 0.5, z: 21, hidden: false },
            // Inside ancient wall
            { x: -32, y: 0.5, z: -15, hidden: true },
            // Near the statue
            { x: -8, y: 0.5, z: 12, hidden: false },
            // Random in desert
            { x: 35, y: 0.5, z: -25, hidden: false },
            // Inside oasis
            { x: -15, y: 0.2, z: -15, hidden: true }
        ];

        treasureLocations.forEach((loc, index) => {
            this.createTreasure(loc.x, loc.y, loc.z, loc.hidden, index);
        });

        return this.treasures;
    }

    createTreasure(x, y, z, hidden, id) {
        const treasureGroup = new THREE.Group();
        treasureGroup.position.set(x, y, z);
        treasureGroup.userData = {
            isCollectable: true,
            id: `treasure-${id}`,
            hidden: hidden,
            collected: false
        };

        // Create a treasure chest
        const chestBaseGeometry = new THREE.BoxGeometry(1, 0.7, 0.7);
        const chestLidGeometry = new THREE.BoxGeometry(1, 0.3, 0.7);

        const chestMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.7
        });

        const chestTrimMaterial = new THREE.MeshStandardMaterial({
            color: 0xD4AF37,
            metalness: 0.7,
            roughness: 0.3
        });

        // Chest base
        const chestBase = new THREE.Mesh(chestBaseGeometry, chestMaterial);
        