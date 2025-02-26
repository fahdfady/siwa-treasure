// src/js/player.js
import * as THREE from 'three';

export default class Player {
    constructor(scene, playerId, isMainPlayer = false) {
        this.scene = scene;
        this.id = playerId;
        this.isMainPlayer = isMainPlayer;
        this.moveSpeed = 0.1;
        this.rotateSpeed = 0.05;
        this.moveDirection = { forward: false, backward: false, left: false, right: false };
        this.mesh = null;
        this.cameraTarget = null;

        // Create player mesh
        this.createPlayerMesh(isMainPlayer);

        if (isMainPlayer) {
            this.setupControls();
        }
    }

    createPlayerMesh(isMainPlayer) {
        // Create player body (use a more detailed mesh for the local player)
        const color = isMainPlayer ? 0xff0000 : 0x0000ff;

        // Create player group
        this.mesh = new THREE.Group();

        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.75;
        body.castShadow = true;
        this.mesh.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xf8d8c0 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.8;
        head.castShadow = true;
        this.mesh.add(head);

        // Hat (Egyptian style)
        const hatGeometry = new THREE.CylinderGeometry(0.35, 0.5, 0.4, 8);
        const hatMaterial = new THREE.MeshStandardMaterial({ color: 0xf0c000 });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = 2.1;
        hat.castShadow = true;
        this.mesh.add(hat);

        // Direction pointer
        const pointerGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.5);
        const pointerMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const pointer = new THREE.Mesh(pointerGeometry, pointerMaterial);
        pointer.position.set(0, 1.5, -0.7);
        this.mesh.add(pointer);

        // Add name tag if not main player
        if (!isMainPlayer) {
            this.addNameTag(`Player ${this.id.substring(0, 5)}`);
        }

        // Add to scene
        this.scene.add(this.mesh);

        // Camera target for the main player
        if (isMainPlayer) {
            this.cameraTarget = new THREE.Object3D();
            this.cameraTarget.position.set(0, 2, 0);
            this.mesh.add(this.cameraTarget);
        }
    }

    addNameTag(name) {
        // Create canvas for the name tag
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;

        // Draw name tag background
        context.fillStyle = '#444444';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#ffffff';
        context.font = '30px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(name, canvas.width / 2, canvas.height / 2);

        // Create sprite
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(0, 2.5, 0);
        sprite.scale.set(2, 0.5, 1);

        this.mesh.add(sprite);
    }

    setupControls() {
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

    update() {
        if (!this.isMainPlayer) return;

        // Movement
        if (this.moveDirection.forward) {
            this.mesh.translateZ(-this.moveSpeed);
        }
        if (this.moveDirection.backward) {
            this.mesh.translateZ(this.moveSpeed);
        }
        if (this.moveDirection.left) {
            this.mesh.rotation.y += this.rotateSpeed;
        }
        if (this.moveDirection.right) {
            this.mesh.rotation.y -= this.rotateSpeed;
        }

        // Check boundaries
        const boundary = 50;
        if (Math.abs(this.mesh.position.x) > boundary) {
            this.mesh.position.x = Math.sign(this.mesh.position.x) * boundary;
        }
        if (Math.abs(this.mesh.position.z) > boundary) {
            this.mesh.position.z = Math.sign(this.mesh.position.z) * boundary;
        }
    }

    getPosition() {
        return {
            position: {
                x: this.mesh.position.x,
                y: this.mesh.position.y,
                z: this.mesh.position.z
            },
            rotation: {
                x: this.mesh.rotation.x,
                y: this.mesh.rotation.y,
                z: this.mesh.rotation.z
            }
        };
    }

    updateFromServer(data) {
        if (this.isMainPlayer) return;

        // Update position and rotation
        this.mesh.position.set(data.position.x, data.position.y, data.position.z);
        this.mesh.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
    }
}