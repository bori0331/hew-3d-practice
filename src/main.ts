import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
  <main class="waiting-screen">
    <header class="topbar">
      <div class="brand-frame" aria-label="ロゴ">
        <span class="brand-line brand-line-left"></span><span class="brand-name">ロゴ</span><span class="brand-line brand-line-right"></span>
      </div>
    </header>
    <section class="content-panel" aria-label="待機画面">
      <div class="model-frame"><div id="model-view" aria-label="回転する家モデル"></div><span class="frame-caption">回転する家モデル</span></div>
      <button class="detect-button" id="detect-button" type="button"><span class="step-number">1</span><span class="button-label">手を検出</span><span class="button-note" id="detect-status">タップして検出を開始</span></button>
    </section>
  </main>
`

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x333333)
const view = document.querySelector<HTMLDivElement>('#model-view')!
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
camera.position.set(4.4, 3.1, 6.2)
camera.lookAt(0, 0.7, 0)
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.15
view.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.enablePan = false
controls.enableZoom = false
controls.autoRotate = true
controls.autoRotateSpeed = 1.1
controls.target.set(0, 0.7, 0)

scene.add(new THREE.HemisphereLight(0xffffff, 0x58616a, 2.1))
const keyLight = new THREE.DirectionalLight(0xfff1dc, 3.2)
keyLight.position.set(4, 7, 5)
scene.add(keyLight)
const fillLight = new THREE.DirectionalLight(0x62d6c9, 1.4)
fillLight.position.set(-5, 3, -4)
scene.add(fillLight)

const house = new THREE.Group()
scene.add(house)
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xe8e1d1, roughness: 0.82 })
const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x238f87, roughness: 0.68 })
const trimMaterial = new THREE.MeshStandardMaterial({ color: 0x423e39, roughness: 0.75 })
const glassMaterial = new THREE.MeshStandardMaterial({ color: 0x82c8c1, roughness: 0.25, metalness: 0.1 })
const base = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.14, 1.9), trimMaterial)
base.position.y = 0.07
house.add(base)
const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.5, 1.65), wallMaterial)
body.position.y = 0.88
house.add(body)
// Gabled roof built from two sloped planes, with the ridge along the house length.
const roofShape = new THREE.BufferGeometry()
const roofVertices = new Float32Array([
  -1.28, 1.62, -1.02,  0, 2.55, -1.02,  0, 2.55, 1.02,
  -1.28, 1.62, -1.02,  0, 2.55, 1.02, -1.28, 1.62, 1.02,
   1.28, 1.62, -1.02,  1.28, 1.62, 1.02,  0, 2.55, 1.02,
   1.28, 1.62, -1.02,  0, 2.55, 1.02,  0, 2.55, -1.02,
])
roofShape.setAttribute('position', new THREE.BufferAttribute(roofVertices, 3))
roofShape.computeVertexNormals()
house.add(new THREE.Mesh(roofShape, roofMaterial))
const windowGeo = new THREE.BoxGeometry(0.48, 0.55, 0.045)
for (const x of [-0.62, 0.62]) {
  const windowMesh = new THREE.Mesh(windowGeo, glassMaterial)
  windowMesh.position.set(x, 0.95, 0.84)
  house.add(windowMesh)
}
const door = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.88, 0.06), trimMaterial)
door.position.set(0, 0.53, 0.86)
house.add(door)
const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), new THREE.MeshStandardMaterial({ color: 0xd4ad61, metalness: 0.7, roughness: 0.3 }))
knob.position.set(0.13, 0.5, 0.91)
house.add(knob)
const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.68, 0.3), trimMaterial)
chimney.position.set(0.68, 2.04, -0.27)
house.add(chimney)

const floor = new THREE.Mesh(new THREE.CircleGeometry(2.1, 64), new THREE.MeshBasicMaterial({ color: 0x3b3b3b }))
floor.rotation.x = -Math.PI / 2
floor.position.y = -0.025
scene.add(floor)

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
