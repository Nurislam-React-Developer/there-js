import './style.css'
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'

// Загрузчик текстур
const textureLoader = new THREE.TextureLoader()

// Scene initialization
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000) // Space background

// Add stars
const starsGeometry = new THREE.BufferGeometry()
const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.1 })

const starsVertices = []
for(let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000
    const y = (Math.random() - 0.5) * 2000
    const z = (Math.random() - 0.5) * 2000
    starsVertices.push(x, y, z)
}

starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3))
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

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
directionalLight.position.set(100, 100, 100)
directionalLight.castShadow = true
scene.add(directionalLight)

// Add hemisphere light for better ambient illumination
const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1)
scene.add(hemisphereLight)

// Создание солнца с реалистичной текстурой и свечением
const sunGeometry = new THREE.SphereGeometry(50, 64, 64)
const sunTexture = textureLoader.load('textures/sun.jpg')
const sunMaterial = new THREE.MeshBasicMaterial({
    map: sunTexture,
    emissive: 0xffff00,
    emissiveIntensity: 2
})

// Добавляем свечение вокруг солнца
const sunLight = new THREE.PointLight(0xffffff, 2, 1000)
sunLight.position.set(0, 0, 0)
scene.add(sunLight)
const sun = new THREE.Mesh(sunGeometry, sunMaterial)
scene.add(sun)

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
    { name: 'mercury', size: 3.8, orbit: 80, speed: 0.004, texturePath: 'textures/mercury.jpg' },
    { name: 'venus', size: 9.5, orbit: 110, speed: 0.0035, texturePath: 'textures/Venus.jpg' },
    { name: 'earth', size: 10, orbit: 150, speed: 0.003, texturePath: 'textures/earth.jpg' },
    { name: 'mars', size: 5.3, orbit: 190, speed: 0.0025, texturePath: 'textures/mars.jpg' },
    { name: 'jupiter', size: 25, orbit: 280, speed: 0.002, texturePath: 'textures/jupiter.jpg' },
    { name: 'saturn', size: 20, orbit: 340, speed: 0.0015, texturePath: 'textures/saturn.jpg' },
    { name: 'uranus', size: 15, orbit: 390, speed: 0.001, texturePath: 'textures/uranus.jpg' },
    { name: 'neptune', size: 14, orbit: 440, speed: 0.0008, texturePath: 'textures/neptune.jpg' }
]

planetData.forEach(data => {
    const planetGeometry = new THREE.SphereGeometry(data.size, 32, 32)
    const planetTexture = textureLoader.load(data.texturePath)
    const planetMaterial = new THREE.MeshStandardMaterial({
        map: planetTexture,
        metalness: 0,
        roughness: 0.8
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

    // Smoother camera movement
    const time = Date.now() * 0.00003
    camera.position.x = Math.cos(time) * 1000
    camera.position.y = 250 + Math.sin(time * 0.5) * 50
    camera.position.z = Math.sin(time) * 1000
    camera.lookAt(scene.position)

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

// Start animation
animate()
