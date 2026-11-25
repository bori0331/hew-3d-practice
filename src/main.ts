import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

if (new URLSearchParams(window.location.search).get('screen') === 'H02') {
  await import('./h02')
} else {

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
  <main class="waiting-screen">
    <header class="topbar">
      <div class="brand-frame" aria-label="ロゴ">
        <span class="brand-name">HOLO HOUSE</span>
      </div>
    </header>
    <section class="content-panel" aria-label="待機画面">
      <div class="model-frame"><div id="model-view" aria-label="カメラが周囲を回る家モデル"></div></div>
      <button class="detect-button" id="detect-button" type="button"><span class="step-number">01</span><span class="button-label">手を検出</span><span class="button-note" id="detect-status">タップして検出を開始</span></button>
    </section>
  </main>
`

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x9fd7f4)
const view = document.querySelector<HTMLDivElement>('#model-view')!
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
camera.position.set(9.4, 6.8, 13.2)
camera.lookAt(0, 1.45, 0)
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.15
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
view.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.enablePan = false
controls.enableZoom = false
controls.autoRotate = true
controls.autoRotateSpeed = 0.35
controls.target.set(0, 1.45, 0)

scene.add(new THREE.HemisphereLight(0xc9eaff, 0x786d5d, 2.0))
const sunLight = new THREE.DirectionalLight(0xfff0d5, 3.4)
sunLight.position.set(-9, 16, 10)
sunLight.castShadow = true
sunLight.shadow.mapSize.set(2048, 2048)
sunLight.shadow.camera.left = -15
sunLight.shadow.camera.right = 15
sunLight.shadow.camera.top = 15
sunLight.shadow.camera.bottom = -15
sunLight.shadow.camera.near = 0.5
sunLight.shadow.camera.far = 45
sunLight.shadow.bias = -0.00025
sunLight.shadow.normalBias = 0.025
sunLight.shadow.radius = 4
sunLight.shadow.camera.updateProjectionMatrix()
scene.add(sunLight)
const fillLight = new THREE.DirectionalLight(0x9edfff, 1.0)
fillLight.position.set(-5, 3, -4)
scene.add(fillLight)

const sunDisc = new THREE.Mesh(
  new THREE.SphereGeometry(0.72, 24, 16),
  new THREE.MeshBasicMaterial({ color: 0xfff2c2 })
)
sunDisc.position.set(-12, 20, -14)
scene.add(sunDisc)

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(2000, 2000),
  new THREE.MeshStandardMaterial({ color: 0xeaf4f8, roughness: 1 })
)
ground.rotation.x = -Math.PI / 2
ground.position.y = -0.025
ground.receiveShadow = true
scene.add(ground)

const house = new THREE.Group()
house.scale.setScalar(1.75)
scene.add(house)
const room = new THREE.Group()
room.scale.set(2.2, 1, 2.2)
house.add(room)

const exterior = new THREE.MeshStandardMaterial({ color: 0x454b52, roughness: 0.82, side: THREE.DoubleSide })
const interior = new THREE.MeshStandardMaterial({ color: 0xf5f4f0, roughness: 0.9, side: THREE.DoubleSide })
const birchCanvas = document.createElement('canvas')
birchCanvas.width = 512
birchCanvas.height = 512
const birchContext = birchCanvas.getContext('2d')!
birchContext.fillStyle = '#f1e8d8'
birchContext.fillRect(0, 0, 512, 512)
for (let line = 0; line < 54; line++) {
  const y = line * 9.5 + Math.sin(line * 1.7) * 2.5
  birchContext.beginPath()
  birchContext.moveTo(0, y)
  for (let x = 0; x <= 512; x += 32) {
    birchContext.lineTo(x, y + Math.sin(x * 0.035 + line) * 2.2 + Math.sin(x * 0.011 + line * 2) * 1.8)
  }
  birchContext.strokeStyle = line % 4 === 0 ? 'rgba(151, 111, 67, 0.30)' : 'rgba(181, 144, 99, 0.20)'
  birchContext.lineWidth = line % 4 === 0 ? 1.8 : 1.1
  birchContext.stroke()
}
for (const [x, y] of [[110, 145], [362, 372], [275, 55]]) {
  birchContext.beginPath()
  birchContext.ellipse(x, y, 12, 3, -0.04, 0, Math.PI * 2)
  birchContext.strokeStyle = 'rgba(157, 116, 70, 0.22)'
  birchContext.lineWidth = 1.2
  birchContext.stroke()
}
const birchTexture = new THREE.CanvasTexture(birchCanvas)
birchTexture.colorSpace = THREE.SRGBColorSpace
birchTexture.wrapS = THREE.RepeatWrapping
birchTexture.wrapT = THREE.RepeatWrapping
birchTexture.repeat.set(3, 2)
birchTexture.anisotropy = 8
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, map: birchTexture, roughness: 0.9 })
const trimMaterial = new THREE.MeshStandardMaterial({ color: 0x363a3d, roughness: 0.78 })
const glassMaterial = new THREE.MeshPhysicalMaterial({ color: 0xc3e8e9, roughness: 0.12, metalness: 0.02, transmission: 0.78, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false })
const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x343b3d, roughness: 0.76, side: THREE.DoubleSide })
const frameMaterial = new THREE.MeshStandardMaterial({ color: 0xe9eceb, roughness: 0.55 })
const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x63d9e5, roughness: 0.42, metalness: 0.08 })
const wood = new THREE.MeshStandardMaterial({ color: 0x9a7255, roughness: 0.75 })
const woodLight = new THREE.MeshStandardMaterial({ color: 0xb28b69, roughness: 0.72 })
const wardrobeWood = new THREE.MeshStandardMaterial({ color: 0x806148, roughness: 0.76 })
const wardrobeFace = new THREE.MeshStandardMaterial({ color: 0xa27b57, roughness: 0.7 })
const brass = new THREE.MeshStandardMaterial({ color: 0xd7bd7a, metalness: 0.62, roughness: 0.3 })
const bedding = new THREE.MeshStandardMaterial({ color: 0xf4f0e8, roughness: 0.95 })
const blanket = new THREE.MeshStandardMaterial({ color: 0x718d92, roughness: 0.9 })
const rugMaterial = new THREE.MeshStandardMaterial({ color: 0xb9d0cc, roughness: 1 })
const cushion = new THREE.MeshStandardMaterial({ color: 0xd5b69a, roughness: 0.95 })

function addBox(parent: THREE.Group, size: [number, number, number], position: [number, number, number], material: THREE.Material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material)
  mesh.position.set(...position)
  parent.add(mesh)
  return mesh
}

// Room shell and openings; a broad glazed front keeps the enclosed interior visible.
addBox(room, [2.42, 0.14, 1.92], [0, 0.07, 0], trimMaterial)
addBox(room, [2.18, 0.08, 1.62], [0, 0.18, -0.02], floorMaterial)
const wallBottom = 0.22
const wallTop = 1.72
const wallHeight = wallTop - wallBottom
const wallCenterY = (wallBottom + wallTop) / 2

// Back wall with a large glazed window.
addBox(room, [0.82, wallHeight, 0.12], [-0.69, wallCenterY, -0.86], exterior)
addBox(room, [0.36, wallHeight, 0.12], [0.86, wallCenterY, -0.86], exterior)
addBox(room, [0.96, 0.46, 0.12], [0.20, 0.45, -0.86], exterior)
addBox(room, [0.96, 0.30, 0.12], [0.20, 1.57, -0.86], exterior)
addBox(room, [0.82, wallHeight, 0.025], [-0.69, wallCenterY, -0.78], interior)
addBox(room, [0.36, wallHeight, 0.008], [0.86, wallCenterY, -0.794], interior)
addBox(room, [0.96, 0.46, 0.025], [0.20, 0.45, -0.78], interior)
addBox(room, [0.96, 0.30, 0.025], [0.20, 1.57, -0.78], interior)
addBox(room, [0.78, 0.72, 0.025], [0.20, 1.04, -0.78], glassMaterial)
for (const x of [-0.21, 0.61]) addBox(room, [0.045, 0.78, 0.08], [x, 1.04, -0.80], frameMaterial)
for (const y of [0.65, 1.43]) addBox(room, [0.86, 0.045, 0.08], [0.20, y, -0.80], frameMaterial)
addBox(room, [0.035, 0.72, 0.035], [0.20, 1.04, -0.755], frameMaterial)

// Left wall with a second window; the front remains open like a dollhouse display.
addBox(room, [0.12, wallHeight, 0.54], [-1.10, wallCenterY, -0.58], exterior)
addBox(room, [0.12, 0.46, 0.78], [-1.10, 0.45, 0.08], exterior)
addBox(room, [0.12, 0.30, 0.78], [-1.10, 1.57, 0.08], exterior)
addBox(room, [0.12, wallHeight, 0.33], [-1.10, wallCenterY, 0.635], exterior)
addBox(room, [0.12, wallHeight, 0.12], [-1.10, wallCenterY, 0.86], exterior)
addBox(room, [0.008, wallHeight, 0.54], [-1.036, wallCenterY, -0.58], interior)
addBox(room, [0.008, 0.46, 0.78], [-1.036, 0.45, 0.08], interior)
addBox(room, [0.008, 0.30, 0.78], [-1.036, 1.57, 0.08], interior)
addBox(room, [0.008, wallHeight, 0.33], [-1.036, wallCenterY, 0.635], interior)
addBox(room, [0.008, wallHeight, 0.12], [-1.036, wallCenterY, 0.86], interior)
addBox(room, [0.025, 0.72, 0.72], [-1.025, 1.04, 0.08], glassMaterial)
for (const z of [-0.33, 0.49]) addBox(room, [0.08, 0.78, 0.045], [-1.045, 1.04, z], frameMaterial)
for (const y of [0.65, 1.43]) addBox(room, [0.08, 0.045, 0.78], [-1.045, y, 0.08], frameMaterial)

// Right wall has a doorway near the open front; the door is left slightly ajar.
addBox(room, [0.12, wallHeight, 1.15], [1.10, wallCenterY, -0.275], exterior)
addBox(room, [0.12, wallHeight, 0.31], [1.10, wallCenterY, 0.695], exterior)
addBox(room, [0.12, 0.36, 0.24], [1.10, 1.54, 0.42], exterior)
addBox(room, [0.008, wallHeight, 1.15], [1.036, wallCenterY, -0.275], interior)
addBox(room, [0.008, wallHeight, 0.31], [1.036, wallCenterY, 0.695], interior)
addBox(room, [0.008, 0.36, 0.24], [1.036, 1.54, 0.42], interior)
const door = addBox(room, [0.055, 1.12, 0.24], [1.07, 0.78, 0.42], doorMaterial)
door.rotation.y = 0
const doorHandle = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), new THREE.MeshStandardMaterial({ color: 0xe5c878, metalness: 0.65, roughness: 0.32 }))
doorHandle.position.set(1.12, 0.78, 0.34)
room.add(doorHandle)


// South wall window sits on the east half, clear of the wardrobes inside.
addBox(room, [1.06, wallHeight, 0.12], [-0.51, wallCenterY, 0.86], exterior)
addBox(room, [0.22, wallHeight, 0.12], [0.93, wallCenterY, 0.86], exterior)
addBox(room, [0.80, 0.48, 0.12], [0.42, 0.46, 0.86], exterior)
addBox(room, [0.80, 0.36, 0.12], [0.42, 1.54, 0.86], exterior)
addBox(room, [1.06, wallHeight, 0.008], [-0.51, wallCenterY, 0.794], interior)
addBox(room, [0.22, wallHeight, 0.008], [0.93, wallCenterY, 0.794], interior)
addBox(room, [0.80, 0.48, 0.008], [0.42, 0.46, 0.794], interior)
addBox(room, [0.80, 0.36, 0.008], [0.42, 1.54, 0.794], interior)
addBox(room, [0.76, 0.62, 0.025], [0.42, 1.03, 0.785], glassMaterial)
for (const x of [0.01, 0.83]) addBox(room, [0.045, 0.70, 0.08], [x, 1.03, 0.78], frameMaterial)
for (const y of [0.68, 1.38]) addBox(room, [0.86, 0.045, 0.08], [0.42, y, 0.78], frameMaterial)
addBox(room, [0.035, 0.62, 0.035], [0.42, 1.03, 0.745], frameMaterial)

// Both roof slopes are divided around true glazed skylight openings.
for (const slope of [-1, 1]) {
  const roofSlope = new THREE.Group()
  roofSlope.position.set(0, 2.07, slope * 0.48)
  roofSlope.rotation.x = slope * 0.63
  room.add(roofSlope)
  const windowCenters = [-0.54, 0.42]
  const windowWidth = 0.58
  const windowDepth = 0.38
  const windowZ = -0.05
  const roofMinX = -1.275
  const roofMaxX = 1.275
  const roofMinZ = -0.61
  const roofMaxZ = 0.61
  const roofBoxes: Array<[number, number, number, number]> = []
  let lastX = roofMinX
  for (const centerX of windowCenters) {
    const windowMinX = centerX - windowWidth / 2
    const windowMaxX = centerX + windowWidth / 2
    roofBoxes.push([lastX, windowMinX, roofMinZ, roofMaxZ])
    roofBoxes.push([windowMinX, windowMaxX, roofMinZ, windowZ - windowDepth / 2])
    roofBoxes.push([windowMinX, windowMaxX, windowZ + windowDepth / 2, roofMaxZ])
    lastX = windowMaxX
  }
  roofBoxes.push([lastX, roofMaxX, roofMinZ, roofMaxZ])
  for (const [minX, maxX, minZ, maxZ] of roofBoxes) {
    const width = maxX - minX
    const depth = maxZ - minZ
    if (width <= 0 || depth <= 0) continue
    addBox(roofSlope, [width, 0.10, depth], [(minX + maxX) / 2, 0, (minZ + maxZ) / 2], roofMaterial)
  }
  for (const x of windowCenters) {
    addBox(roofSlope, [windowWidth, 0.025, windowDepth], [x, 0.055, windowZ], glassMaterial)
    for (const side of [-1, 1]) {
      addBox(roofSlope, [0.035, 0.035, windowDepth + 0.06], [x + side * (windowWidth / 2 + 0.0175), 0.07, windowZ], trimMaterial)
      addBox(roofSlope, [windowWidth + 0.06, 0.035, 0.035], [x, 0.07, windowZ + side * (windowDepth / 2 + 0.0175)], trimMaterial)
    }
  }
}

function addGableEnd(x: number, material: THREE.Material) {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([
    x, 1.72, -0.96,
    x, 1.72, 0.96,
    x, 2.46, 0,
  ], 3))
  geometry.computeVertexNormals()
  room.add(new THREE.Mesh(geometry, material))
}
addGableEnd(-1.16, exterior)
addGableEnd(-1.15, interior)
addGableEnd(1.16, exterior)
addGableEnd(1.15, interior)
const furniture = new THREE.Group()
furniture.scale.set(1.35, 1, 1.35)
furniture.position.set(-0.35, 0, -0.30)
house.add(furniture)

// Bed and bedside details on the left side.
addBox(furniture, [0.72, 0.20, 1.18], [-0.61, 0.34, -0.15], wood)
addBox(furniture, [0.68, 0.18, 1.12], [-0.61, 0.52, -0.15], bedding)
addBox(furniture, [0.66, 0.10, 0.52], [-0.61, 0.63, 0.14], blanket)
addBox(furniture, [0.25, 0.10, 0.28], [-0.78, 0.65, -0.48], cushion)
addBox(furniture, [0.76, 0.58, 0.09], [-0.61, 0.52, -0.77], wood)
addBox(furniture, [0.35, 0.26, 0.34], [-0.83, 0.35, 0.61], woodLight)
addBox(furniture, [0.35, 0.035, 0.34], [-0.83, 0.49, 0.61], wood)

// Soft rug, desk, chair, and a small monitor make the one-room layout legible.
addBox(furniture, [1.06, 0.025, 0.96], [0.05, 0.235, 0.22], rugMaterial)
addBox(furniture, [0.78, 0.09, 0.42], [0.55, 0.92, -0.56], woodLight)
for (const x of [0.23, 0.87]) for (const z of [-0.72, -0.40]) addBox(furniture, [0.045, 0.69, 0.045], [x, 0.56, z], wood)
addBox(furniture, [0.32, 0.20, 0.035], [0.55, 1.075, -0.68], trimMaterial)
addBox(furniture, [0.27, 0.14, 0.035], [0.55, 1.08, -0.657], glassMaterial)
addBox(furniture, [0.38, 0.10, 0.38], [0.55, 0.55, 0.02], cushion)
for (const x of [0.40, 0.70]) for (const z of [-0.13, 0.17]) addBox(furniture, [0.035, 0.33, 0.035], [x, 0.34, z], wood)
addBox(furniture, [0.38, 0.62, 0.07], [0.55, 0.88, 0.205], wood)
addBox(furniture, [0.25, 0.08, 0.27], [0.55, 0.48, -0.30], woodLight)
for (const x of [0.44, 0.66]) addBox(furniture, [0.035, 0.42, 0.035], [x, 0.25, -0.30], wood)

// Two roomy wardrobes sit side by side against the west end of the south wall.
for (const x of [-1.145, -0.566]) {
  addBox(furniture, [0.58, 1.15, 0.34], [x, 0.795, 1.32], wardrobeWood)
  addBox(furniture, [0.60, 0.08, 0.36], [x, 0.255, 1.32], trimMaterial)
  for (const side of [-1, 1]) {
    addBox(furniture, [0.276, 1.06, 0.025], [x + side * 0.145, 0.795, 1.506], wardrobeFace)
    const handle = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), brass)
    handle.position.set(x + side * 0.035, 0.79, 1.50)
    furniture.add(handle)
  }
}

// South flower bed and an east-side lawn garden fitted directly to the house footprint.
const landscape = new THREE.Group()
house.add(landscape)
const brickPalette = [
  new THREE.MeshStandardMaterial({ color: 0x9e4936, roughness: 0.9 }),
  new THREE.MeshStandardMaterial({ color: 0xad513b, roughness: 0.9 }),
  new THREE.MeshStandardMaterial({ color: 0x8f3d30, roughness: 0.9 }),
  new THREE.MeshStandardMaterial({ color: 0xb45a42, roughness: 0.9 }),
]
const brickMortar = new THREE.MeshStandardMaterial({ color: 0xd0c5b6, roughness: 1 })
const soilCanvas = document.createElement('canvas')
soilCanvas.width = 256
soilCanvas.height = 256
const soilContext = soilCanvas.getContext('2d')!
soilContext.fillStyle = '#594535'
soilContext.fillRect(0, 0, 256, 256)
for (let i = 0; i < 1800; i++) {
  const x = (i * 97) % 256
  const y = (i * 151) % 256
  const size = 1 + (i % 3)
  soilContext.fillStyle = i % 2 ? 'rgba(195, 157, 111, .28)' : 'rgba(36, 27, 21, .24)'
  soilContext.fillRect(x, y, size, size)
}
const soilTexture = new THREE.CanvasTexture(soilCanvas)
soilTexture.colorSpace = THREE.SRGBColorSpace
soilTexture.wrapS = THREE.RepeatWrapping
soilTexture.wrapT = THREE.RepeatWrapping
soilTexture.repeat.set(4, 1)
const soilMaterial = new THREE.MeshStandardMaterial({ map: soilTexture, roughness: 1 })
const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x477646, roughness: 0.92 })
const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x5d914d, roughness: 0.9 })
const petalMaterials = [
  new THREE.MeshStandardMaterial({ color: 0xe58d9b, roughness: 0.78 }),
  new THREE.MeshStandardMaterial({ color: 0xe7c15e, roughness: 0.78 }),
  new THREE.MeshStandardMaterial({ color: 0xa991d0, roughness: 0.78 }),
]
const flowerCenterMaterial = new THREE.MeshStandardMaterial({ color: 0xf0d779, roughness: 0.82 })
const planterLength = 4.9
const southFoundationEdge = (1.92 / 2) * 2.2
const planterDepth = 0.72
const planterZ = southFoundationEdge + planterDepth / 2 - 0.025
addBox(landscape, [planterLength - 0.1, 0.07, planterDepth - 0.08], [0, 0.035, planterZ], brickMortar)
const brickWidth = 0.32
for (const side of [-1, 1]) {
  const z = planterZ + side * (planterDepth / 2 - 0.045)
  for (let row = 0; row < 2; row++) {
    const y = 0.082 + row * 0.082
    for (let i = 0; i < 15; i++) {
      const x = -2.24 + i * brickWidth + (row ? 0.16 : 0)
      if (Math.abs(x) + brickWidth / 2 > planterLength / 2 - 0.04) continue
      addBox(landscape, [brickWidth - 0.018, 0.072, 0.09], [x, y, z], brickPalette[(i + row) % brickPalette.length])
    }
  }
}
for (const side of [-1, 1]) {
  for (let row = 0; row < 2; row++) {
    const y = 0.082 + row * 0.082
    for (let i = 0; i < 3; i++) {
      const z = planterZ - 0.24 + i * 0.24
      addBox(landscape, [0.09, 0.072, 0.22], [side * (planterLength / 2 - 0.045), y, z], brickPalette[(i + row + 1) % brickPalette.length])
    }
  }
}
// Two raised brick dividers form three separate planting sections.
for (const dividerX of [-0.82, 0.82]) {
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 3; i++) {
      const z = planterZ - 0.24 + i * 0.24
      addBox(landscape, [0.10, 0.072, 0.22], [dividerX, 0.082 + row * 0.082, z], brickPalette[(i + row + 2) % brickPalette.length])
    }
  }
}
const sectionLength = (planterLength - 0.32) / 3
for (const section of [-1, 0, 1]) {
  const sectionCenter = section * 1.63
  addBox(landscape, [sectionLength, 0.035, planterDepth - 0.16], [sectionCenter, 0.21, planterZ], soilMaterial)
}
for (const section of [-1, 0, 1]) {
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 10; i++) {
      const x = section * 1.63 - 0.585 + i * 0.13
      const z = planterZ + (row ? 0.14 : -0.14)
      const stemHeight = 0.27 + (i % 3) * 0.025
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.019, stemHeight, 7), stemMaterial)
      stem.position.set(x, 0.205 + stemHeight / 2, z)
      landscape.add(stem)
      const headY = 0.205 + stemHeight + 0.035
      const petalMaterial = petalMaterials[(i + row + section) % petalMaterials.length]
      for (let petal = 0; petal < 5; petal++) {
        const angle = (petal / 5) * Math.PI * 2
        const petalMesh = new THREE.Mesh(new THREE.SphereGeometry(0.047, 8, 6), petalMaterial)
        petalMesh.scale.set(1, 0.72, 0.82)
        petalMesh.position.set(x + Math.cos(angle) * 0.047, headY, z + Math.sin(angle) * 0.047)
        landscape.add(petalMesh)
      }
      const center = new THREE.Mesh(new THREE.SphereGeometry(0.031, 8, 6), flowerCenterMaterial)
      center.position.set(x, headY + 0.008, z)
      landscape.add(center)
      for (const side of [-1, 1]) {
        const leaf = addBox(landscape, [0.11, 0.014, 0.035], [x + side * 0.045, 0.31 + (i % 2) * 0.04, z], leafMaterial)
        leaf.rotation.y = side * 0.42
      }
    }
  }
}

const eastFoundationEdge = (2.42 / 2) * 2.2
const lawnWest = eastFoundationEdge + 0.025
const lawnEast = lawnWest + 2.9
const lawnNorth = -2.22
const lawnSouth = 2.22
const lawnDepth = lawnSouth - lawnNorth
const lawnCenterX = (lawnWest + lawnEast) / 2
const lawnCenterZ = (lawnNorth + lawnSouth) / 2

const grassCanvas = document.createElement('canvas')
grassCanvas.width = 512
grassCanvas.height = 512
const grassContext = grassCanvas.getContext('2d')!
grassContext.fillStyle = '#78aa61'
grassContext.fillRect(0, 0, 512, 512)
let grassSeed = 48621
const nextGrassRandom = () => {
  grassSeed = (grassSeed * 16807) % 2147483647
  return (grassSeed - 1) / 2147483646
}
for (let i = 0; i < 6500; i++) {
  const x = nextGrassRandom() * 512
  const y = nextGrassRandom() * 512
  const length = 2 + nextGrassRandom() * 7
  const tone = Math.floor(78 + nextGrassRandom() * 75)
  grassContext.strokeStyle = `rgba(${tone}, ${tone + 48}, ${Math.floor(tone * 0.66)}, ${0.18 + nextGrassRandom() * 0.28})`
  grassContext.lineWidth = 0.6 + nextGrassRandom() * 1.1
  grassContext.beginPath()
  grassContext.moveTo(x, y)
  grassContext.lineTo(x + (nextGrassRandom() - 0.5) * 2, y - length)
  grassContext.stroke()
}
const grassTexture = new THREE.CanvasTexture(grassCanvas)
grassTexture.colorSpace = THREE.SRGBColorSpace
grassTexture.wrapS = THREE.RepeatWrapping
grassTexture.wrapT = THREE.RepeatWrapping
grassTexture.repeat.set(2, 3)
const grassMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, map: grassTexture, roughness: 1 })
addBox(landscape, [lawnEast - lawnWest, 0.035, lawnDepth], [lawnCenterX, 0.012, lawnCenterZ], grassMaterial)

// Short instanced blades add the requested fine, roughly 2 cm grass texture.
const bladeGeometry = new THREE.BufferGeometry()
bladeGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
  -0.004, 0, 0,  0.001, 1, 0,  0.005, 0.18, 0,
  0, 0, -0.004,  0, 1, 0.001,  0, 0.18, 0.005,
], 3))
bladeGeometry.computeVertexNormals()
const bladeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, roughness: 1 })
const bladeCount = 24000
const grassBlades = new THREE.InstancedMesh(bladeGeometry, bladeMaterial, bladeCount)
const bladeMatrix = new THREE.Matrix4()
const bladePosition = new THREE.Vector3()
const bladeRotation = new THREE.Quaternion()
const bladeScale = new THREE.Vector3()
const bladeColor = new THREE.Color()
for (let i = 0; i < bladeCount; i++) {
  const x = lawnWest + 0.05 + nextGrassRandom() * (lawnEast - lawnWest - 0.1)
  const z = lawnNorth + 0.05 + nextGrassRandom() * (lawnDepth - 0.1)
  if (Math.abs(z - 0.92) < 0.43) {
    i--
    continue
  }
  bladePosition.set(x, 0.031, z)
  bladeRotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), nextGrassRandom() * Math.PI)
  const bladeHeight = 0.008 + nextGrassRandom() * 0.006
  bladeScale.set(0.8 + nextGrassRandom() * 0.9, bladeHeight, 0.8 + nextGrassRandom() * 0.9)
  bladeMatrix.compose(bladePosition, bladeRotation, bladeScale)
  grassBlades.setMatrixAt(i, bladeMatrix)
  bladeColor.setHSL(0.27 + nextGrassRandom() * 0.035, 0.34 + nextGrassRandom() * 0.12, 0.36 + nextGrassRandom() * 0.17)
  grassBlades.setColorAt(i, bladeColor)
}
grassBlades.instanceMatrix.needsUpdate = true
if (grassBlades.instanceColor) grassBlades.instanceColor.needsUpdate = true
landscape.add(grassBlades)

// Stepping stones lead from the east door to the yard gate.
const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0xd7d4cb, roughness: 0.9 })
const doorPathZ = 0.42 * 2.2
for (const x of [lawnWest + 0.18, lawnWest + 0.82, lawnWest + 1.46, lawnWest + 2.10, lawnEast - 0.12]) {
  addBox(landscape, [0.42, 0.055, 0.52], [x, 0.052, doorPathZ], stoneMaterial)
}

// White ranch-style split-rail fencing, with a gate opening aligned to the path.
const fenceWood = new THREE.MeshStandardMaterial({ color: 0xf4f2e9, roughness: 0.82 })
const fenceNorth = lawnNorth
const fenceSouth = lawnSouth
const fenceEast = lawnEast
function fencePost(x: number, z: number) {
  addBox(landscape, [0.10, 0.78, 0.10], [x, 0.40, z], fenceWood)
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.082, 0.12, 4), fenceWood)
  cap.rotation.y = Math.PI / 4
  cap.position.set(x, 0.84, z)
  landscape.add(cap)
}
function fenceRailsAlongZ(zStart: number, zEnd: number) {
  const length = zEnd - zStart
  const center = (zStart + zEnd) / 2
  for (const y of [0.22, 0.43, 0.64]) addBox(landscape, [0.07, 0.065, length], [fenceEast, y, center], fenceWood)
}
const gateStart = doorPathZ - 0.38
const gateEnd = doorPathZ + 0.38
fenceRailsAlongZ(fenceNorth, gateStart)
fenceRailsAlongZ(gateEnd, fenceSouth)
for (const z of [-1.4, -0.55, gateStart, gateEnd, 1.45]) fencePost(fenceEast, z)
for (const z of [fenceNorth, fenceSouth]) {
  for (const y of [0.22, 0.43, 0.64]) addBox(landscape, [lawnEast - lawnWest, 0.065, 0.07], [lawnCenterX, y, z], fenceWood)
  for (const x of [lawnWest, lawnWest + 0.95, lawnWest + 1.90, fenceEast]) fencePost(x, z)
}

const grid = new THREE.GridHelper(2000, 4000, 0xd0d4d8, 0xe5e8eb)
grid.position.y = -0.018
for (const material of Array.isArray(grid.material) ? grid.material : [grid.material]) {
  material.transparent = true
  material.opacity = 0.72
  material.depthWrite = false
}
scene.add(grid)

scene.traverse((object) => {
  if (!(object as THREE.Mesh).isMesh) return
  const mesh = object as THREE.Mesh
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
  const isTransparent = materials.some((material) => material.transparent)
  mesh.castShadow = mesh !== ground && mesh !== sunDisc && mesh !== grassBlades && !isTransparent
  mesh.receiveShadow = mesh !== sunDisc && mesh !== grassBlades && !isTransparent
})

function resize() {
  const { width, height } = view.getBoundingClientRect()
  if (!width || !height) return
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height, false)
}
new ResizeObserver(resize).observe(view)
resize()
window.addEventListener('resize', resize)

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
animate()

// センサー実装を後から差し込めるよう、画面表示と検出処理を分離しています。
type HandDetector = { start: () => Promise<boolean> }
const handDetector: HandDetector = {
  async start() {
    // TODO: カメラ / 手検出センサー接続後、検出開始処理を実装する。
    return false
  },
}
const detectButton = document.querySelector<HTMLButtonElement>('#detect-button')!
const detectStatus = document.querySelector<HTMLSpanElement>('#detect-status')!
detectButton.addEventListener('click', async () => {
  detectButton.disabled = true
  detectStatus.textContent = 'センサー接続待ち'
  const detected = await handDetector.start()
  detectStatus.textContent = detected ? '手を検出しました' : '手検出センサー未接続'
  detectButton.disabled = false
})
}

