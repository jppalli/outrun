// Check if Three.js is loaded
if (typeof THREE === 'undefined') {
    console.error('Three.js not loaded!');
    alert('Please make sure Three.js is loaded correctly.');
}

let scene, camera, renderer, road, car;
let marioGroup, peachGroup, hair;
let speed = 0;
let position = 0;
let playerX = 0;

// Game settings
const ROAD_SETTINGS = {
    LENGTH: 2000,          // Longer road segment
    WIDTH: 20,
    SEGMENTS: 3,          // Number of road segments to create infinite effect
    MAX_SPEED: 5
};

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 100, 1000);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 5, -10);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    createRoad();
    createCar();

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}

function createRoad() {
    road = new THREE.Group();
    
    for (let i = 0; i < ROAD_SETTINGS.SEGMENTS; i++) {
        const segment = createRoadSegment();
        segment.position.z = i * ROAD_SETTINGS.LENGTH;
        road.add(segment);
    }
    
    scene.add(road);
}

function createRoadSegment() {
    const segment = new THREE.Group();

    // Main road
    const roadGeometry = new THREE.PlaneGeometry(ROAD_SETTINGS.WIDTH, ROAD_SETTINGS.LENGTH);
    const roadMaterial = new THREE.MeshPhongMaterial({
        color: 0x404040,
        side: THREE.DoubleSide
    });
    const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.z = ROAD_SETTINGS.LENGTH / 2;
    roadMesh.receiveShadow = true;
    segment.add(roadMesh);

    // Road lines
    const lineGeometry = new THREE.BoxGeometry(0.3, 0.1, 5);
    const lineMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
    
    for(let i = 0; i < ROAD_SETTINGS.LENGTH; i += 20) {
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.z = i;
        line.position.y = 0.05;
        segment.add(line);
    }

    // Ground/grass
    const groundGeometry = new THREE.PlaneGeometry(200, ROAD_SETTINGS.LENGTH);
    const groundMaterial = new THREE.MeshPhongMaterial({
        color: 0x1ab82c,
        side: THREE.DoubleSide
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.position.z = ROAD_SETTINGS.LENGTH / 2;
    ground.receiveShadow = true;
    segment.add(ground);

    return segment;
}

function createCar() {
    car = new THREE.Group();

    // Ferrari body
    const bodyGeometry = new THREE.BoxGeometry(2.4, 0.5, 4.8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xFF0000,
        specular: 0x555555,
        shininess: 30 
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    car.add(body);

    // Windshield
    const windshieldGeometry = new THREE.BoxGeometry(2, 0.4, 1.8);
    const windshieldMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x222222,
        opacity: 0.7,
        transparent: true 
    });
    const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
    windshield.position.set(0, 1, -0.3);
    windshield.castShadow = true;
    car.add(windshield);

    // Mario (driver)
    marioGroup = new THREE.Group();
    
    // Mario's overalls
    const overallsGeometry = new THREE.BoxGeometry(0.4, 0.5, 0.4);
    const overallsMaterial = new THREE.MeshPhongMaterial({ color: 0x0000FF });
    const overalls = new THREE.Mesh(overallsGeometry, overallsMaterial);
    marioGroup.add(overalls);

    // Mario's shirt
    const shirtGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.4);
    const shirtMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
    const shirt = new THREE.Mesh(shirtGeometry, shirtMaterial);
    shirt.position.y = 0.3;
    marioGroup.add(shirt);

    // Mario's head
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const skinMaterial = new THREE.MeshPhongMaterial({ color: 0xFFC896 });
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.y = 0.6;
    marioGroup.add(head);

    // Mario's cap
    const capGeometry = new THREE.BoxGeometry(0.35, 0.12, 0.35);
    const capMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.position.y = 0.75;
    marioGroup.add(cap);

    marioGroup.position.set(-0.4, 1.0, 0);
    car.add(marioGroup);

    // Princess Peach
    peachGroup = new THREE.Group();

    // Peach's dress
    const dressGeometry = new THREE.ConeGeometry(0.3, 0.8, 8);
    const dressMaterial = new THREE.MeshPhongMaterial({ color: 0xFFB6C1 });
    const dress = new THREE.Mesh(dressGeometry, dressMaterial);
    peachGroup.add(dress);

    // Peach's crown
    const crownGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.15, 8);
    const crownMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD700 });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.y = 0.9;
    peachGroup.add(crown);

    peachGroup.position.set(0.4, 1.0, 0);
    car.add(peachGroup);

    car.position.set(0, 0, 0);
    scene.add(car);
}

function animateCharacters() {
    if (marioGroup && peachGroup && hair) {
        const time = Date.now() * 0.001;
        marioGroup.position.y = 1.0 + Math.sin(time * 2) * 0.05;
        peachGroup.position.y = 1.0 + Math.cos(time * 2) * 0.05;
        hair.position.z = -0.1 + Math.sin(time * 3) * 0.05;
    }
}

const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

function onKeyDown(event) {
    if (keys.hasOwnProperty(event.code)) {
        keys[event.code] = true;
    }
}

function onKeyUp(event) {
    if (keys.hasOwnProperty(event.code)) {
        keys[event.code] = false;
    }
}

function updateGame() {
    if (keys.ArrowUp) speed = Math.min(speed + 0.1, 5);
    if (keys.ArrowDown) speed = Math.max(speed - 0.1, 0);
    if (!keys.ArrowUp && !keys.ArrowDown) speed *= 0.95;

    if (keys.ArrowLeft) playerX = Math.max(playerX - 0.3, -8);
    if (keys.ArrowRight) playerX = Math.min(playerX + 0.3, 8);

    if (car) {
        car.position.x = playerX;
        position += speed;
        road.position.z = -(position % ROAD_SETTINGS.LENGTH);
    }

    camera.position.x = playerX * 0.5;
    camera.position.z = -10;
    camera.lookAt(playerX, 0, 20);

    document.getElementById('speed').textContent = `Speed: ${Math.round(speed * 50)} km/h`;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    updateGame();
    renderer.render(scene, camera);
}

// Start the game
init();
animate();