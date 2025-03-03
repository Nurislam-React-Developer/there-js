import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import TWEEN from '@tweenjs/tween.js'

// Загрузчик текстур
const textureLoader = new THREE.TextureLoader()

// Scene initialization
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000) // Space background

// Add stars with colors and sizes variation
const starsGeometry = new THREE.BufferGeometry()
const starsMaterial = new THREE.PointsMaterial({
    size: 2.5,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    map: createStarTexture()
})

const starsVertices = []
const starsColors = []
const starsSizes = []

// Create a canvas texture for stars
function createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Create radial gradient for glow effect
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    return new THREE.CanvasTexture(canvas);
}

for(let i = 0; i < 15000; i++) {
    const radius = Math.random() * 1500;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    starsVertices.push(x, y, z);
    
    // Enhanced color variation
    const color = new THREE.Color();
    const colorRand = Math.random();
    if (colorRand > 0.8) {
        color.setHSL(0.6, 0.9, 0.9); // Blue-white stars
    } else if (colorRand > 0.6) {
        color.setHSL(0.1, 0.9, 0.9); // Yellow-white stars
    } else if (colorRand > 0.4) {
        color.setHSL(0.0, 0.8, 0.9); // Red-tinted stars
    } else {
        color.setHSL(0.7, 0.8, 0.9); // Pure white stars
    }
    starsColors.push(color.r, color.g, color.b);
}

starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3))
starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3))
const starField = new THREE.Points(starsGeometry, starsMaterial)
scene.add(starField)

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
camera.position.set(0, 100, 300)
camera.lookAt(0, 0, 0)

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true // Add smooth damping effect
controls.dampingFactor = 0.05
controls.screenSpacePanning = false
controls.minDistance = 100 // Minimum zoom distance
controls.maxDistance = 1000 // Maximum zoom distance
controls.maxPolarAngle = Math.PI // Limit vertical rotation

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 2.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 5)
directionalLight.position.set(0, 200, 200)
directionalLight.castShadow = true
scene.add(directionalLight)

// Add additional directional lights for better coverage
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 4)
directionalLight2.position.set(-200, 0, -200)
scene.add(directionalLight2)

const directionalLight3 = new THREE.DirectionalLight(0xffffff, 4)
directionalLight3.position.set(200, -200, -200)
scene.add(directionalLight3)

// Add hemisphere light for better ambient illumination
const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1.75)
scene.add(hemisphereLight)

// Создание солнца с реалистичной текстурой и свечением
const sunGeometry = new THREE.SphereGeometry(50, 64, 64)
const sunTexture = textureLoader.load('textures/sun.svg')
const sunMaterial = new THREE.MeshBasicMaterial({
    map: sunTexture,
    color: 0xffaa00,
    transparent: true,
    opacity: 1
})

// Add enhanced glow effect to the sun
const sunGlowGeometry = new THREE.SphereGeometry(55, 64, 64)
const sunGlowMaterial = new THREE.ShaderMaterial({
    uniforms: {
        viewVector: { value: camera.position },
        sunColor: { value: new THREE.Color(0xffaa00) },
        glowStrength: { value: 1.5 }
    },
    vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
            vec3 vNormal = normalize(normalMatrix * normal);
            vec3 vNormalized = normalize(normalMatrix * viewVector);
            intensity = pow(1.0 - abs(dot(vNormal, vNormalized)), 3.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 sunColor;
        uniform float glowStrength;
        varying float intensity;
        void main() {
            vec3 glow = sunColor * intensity * glowStrength;
            gl_FragColor = vec4(glow, 1.0);
        }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
})

const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial)

// Добавляем свечение вокруг солнца
// Создаем несколько источников света вокруг солнца для равномерного освещения
const sunLightIntensity = 2;
const sunLightDistance = 1000;

const sunLights = [
    new THREE.PointLight(0xffffff, sunLightIntensity, sunLightDistance),
    new THREE.PointLight(0xffffff, sunLightIntensity, sunLightDistance),
    new THREE.PointLight(0xffffff, sunLightIntensity, sunLightDistance),
    new THREE.PointLight(0xffffff, sunLightIntensity, sunLightDistance)
];

// Размещаем источники света вокруг солнца
sunLights[0].position.set(100, 0, 0);
sunLights[1].position.set(-100, 0, 0);
sunLights[2].position.set(0, 100, 0);
sunLights[3].position.set(0, -100, 0);

sunLights.forEach(light => {
    scene.add(light);
    light.castShadow = true;
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial)
scene.add(sun)
scene.add(sunGlow)

// Создание планет
const planets = []
// Create orbit lines
function createOrbitLine(radius) {
    const segments = 128;
    const orbitGeometry = new THREE.BufferGeometry();
    const points = [];
    
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(Math.cos(theta) * radius, 0, Math.sin(theta) * radius);
    }
    
    orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x666666, transparent: true, opacity: 0.8, linewidth: 2 });
    return new THREE.Line(orbitGeometry, orbitMaterial);
}

const planetData = [
    { name: 'mercury', size: 3.8, orbit: 80, speed: 0.004, texturePath: 'textures/mercury.svg' },
    { name: 'venus', size: 9.5, orbit: 110, speed: 0.0035, texturePath: 'textures/venus.svg' },
    { name: 'earth', size: 10, orbit: 150, speed: 0.003, texturePath: 'textures/earth.svg' },
    { name: 'mars', size: 5.3, orbit: 190, speed: 0.0025, texturePath: 'textures/mars.svg' },
    { name: 'jupiter', size: 25, orbit: 280, speed: 0.002, texturePath: 'textures/jupiter.svg' },
    { name: 'saturn', size: 20, orbit: 340, speed: 0.0015, texturePath: 'textures/saturn.svg' },
    { name: 'uranus', size: 15, orbit: 390, speed: 0.001, texturePath: 'textures/uranus.svg' },
    { name: 'neptune', size: 14, orbit: 440, speed: 0.0008, texturePath: 'textures/neptune.svg' }
]

planetData.forEach(data => {
    const planetGeometry = new THREE.SphereGeometry(data.size, 32, 32)
    const planetTexture = textureLoader.load(data.texturePath)
    const planetMaterial = new THREE.MeshStandardMaterial({
        map: planetTexture,
        metalness: 0.1,
        roughness: 0.6,
        emissive: 0x111111,
        emissiveIntensity: 0.2,
        side: THREE.DoubleSide
    })
    const planet = new THREE.Mesh(planetGeometry, planetMaterial)
    
    // Установка начальной позиции
    planet.position.x = data.orbit
    planet.position.y = 0
    planet.position.z = 0
    
    // Сохранение параметров орбиты
    planet.userData.orbitRadius = data.orbit
    planet.userData.angle = Math.random() * Math.PI * 2
    planet.userData.speed = data.speed
    
    // Add orbit line
    const orbitLine = createOrbitLine(data.orbit)
    scene.add(orbitLine)
    
    planets.push(planet)
    scene.add(planet)
})

// Animation
function animate() {
    requestAnimationFrame(animate)

    // Rotate star field
    starField.rotation.y += 0.002
    starField.rotation.x += 0.0015

    // Make stars twinkle
    const time = Date.now() * 0.005
    const positions = starsGeometry.attributes.position.array
    const colors = starsGeometry.attributes.color.array

    for(let i = 0; i < colors.length; i += 3) {
        const flicker = 0.7 + 0.3 * Math.sin(time + i)
        colors[i] = Math.max(0.5, colors[i] * flicker)
        colors[i + 1] = Math.max(0.5, colors[i + 1] * flicker)
        colors[i + 2] = Math.max(0.5, colors[i + 2] * flicker)
    }
    starsGeometry.attributes.color.needsUpdate = true

    // Rotate sun
    sun.rotation.y += 0.002

    // Update planets
    planets.forEach(planet => {
        planet.userData.angle += planet.userData.speed
        
        // Update planet position
        planet.position.x = Math.cos(planet.userData.angle) * planet.userData.orbitRadius
        planet.position.z = Math.sin(planet.userData.angle) * planet.userData.orbitRadius
        
        // Rotate planet
        planet.rotation.y += 0.01
    })

    // Update controls
    controls.update()

    TWEEN.update()
    renderer.render(scene, camera)
}

// Window resize handler
window.addEventListener('resize', () => {
    const width = window.innerWidth
    const height = window.innerHeight
    
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    
    renderer.setSize(width, height)
})

// Touch event handlers for mobile devices
let touchStartX = 0
let touchStartY = 0

document.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX
    touchStartY = event.touches[0].clientY
})

document.addEventListener('touchmove', (event) => {
    event.preventDefault()
    const touchX = event.touches[0].clientX
    const touchY = event.touches[0].clientY
    const deltaX = touchX - touchStartX
    const deltaY = touchY - touchStartY
    
    touchStartX = touchX
    touchStartY = touchY
})

// Start animation
animate()
