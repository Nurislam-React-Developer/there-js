import './style.css'
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'

// Scene initialization
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x87ceeb) // Sky blue background

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 5, 10)
camera.lookAt(0, 0, 0)

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(5, 5, 5)
directionalLight.castShadow = true
scene.add(directionalLight)

// Ground
const groundGeometry = new THREE.PlaneGeometry(100, 100)
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1e824c,
    roughness: 0.8,
    metalness: 0.2
})
const ground = new THREE.Mesh(groundGeometry, groundMaterial)
ground.rotation.x = -Math.PI / 2
ground.receiveShadow = true
scene.add(ground)

// Car creation
const car = new THREE.Group()

// Car body
const bodyGeometry = new THREE.BoxGeometry(2, 1, 4)
const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 })
const carBody = new THREE.Mesh(bodyGeometry, bodyMaterial)
carBody.position.y = 1
carBody.castShadow = true
car.add(carBody)

// Wheels
const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.4, 32)
const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 })

const wheels = [
    { x: -1, y: 0.4, z: 1.5 },
    { x: 1, y: 0.4, z: 1.5 },
    { x: -1, y: 0.4, z: -1.5 },
    { x: 1, y: 0.4, z: -1.5 }
]

wheels.forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
    wheel.position.set(pos.x, pos.y, pos.z)
    wheel.rotation.z = Math.PI / 2
    wheel.castShadow = true
    car.add(wheel)
})

scene.add(car)

// Car movement variables
const carState = {
    speed: 0,
    rotation: 0,
    acceleration: 0.005,
    deceleration: 0.0025,
    maxSpeed: 0.3,
    rotationSpeed: 0.03
}

// Keyboard controls
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
}

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true
    }
})

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false
    }
})

// Animation
function animate() {
    requestAnimationFrame(animate)

    // Update car movement
    if (keys.ArrowUp) {
        carState.speed = Math.min(carState.speed + carState.acceleration, carState.maxSpeed)
    } else if (keys.ArrowDown) {
        carState.speed = Math.max(carState.speed - carState.acceleration, -carState.maxSpeed)
    } else {
        carState.speed *= 0.95 // Natural slowdown
    }

    if (Math.abs(carState.speed) > 0.001) {
        if (keys.ArrowLeft) carState.rotation += carState.rotationSpeed
        if (keys.ArrowRight) carState.rotation -= carState.rotationSpeed
    }

    // Apply movement
    car.position.x += Math.sin(carState.rotation) * carState.speed
    car.position.z += Math.cos(carState.rotation) * carState.speed
    car.rotation.y = carState.rotation

    // Update camera position
    const cameraOffset = new THREE.Vector3(-Math.sin(carState.rotation) * 10, 5, -Math.cos(carState.rotation) * 10)
    camera.position.copy(car.position).add(cameraOffset)
    camera.lookAt(car.position)

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
