import './h02.css'
import * as THREE from 'three'

type Genre = {
  name: string
  description: string
  style: 'modern' | 'natural' | 'japanese'
}

const genres: Genre[] = [
  {
    name: 'モダン',
    description: '直線的でシンプルなデザイン。大きな窓と落ち着いた色合いで、開放感のある空間を表現します。',
    style: 'modern',
  },
  {
    name: 'ナチュラル',
    description: '木の温もりと自然素材を活かしたデザイン。明るく、ゆったりと過ごせる空間をイメージしています。',
    style: 'natural',
  },
  {
    name: '和風',
    description: '落ち着いた色と和の要素を取り入れたデザイン。伝統的な雰囲気と暮らしやすさを両立します。',
    style: 'japanese',
  },
]

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
  <main class="genre-screen">
    <header class="genre-header">
      <div class="genre-logo"><span>HOLO HOUSE</span></div>
      <div class="genre-heading">
        <h1>ジャンル選択</h1>
        <p>理想の住まいのスタイルを選んでください</p>
      </div>
      <span class="screen-code">H-02 / GENRE SELECT</span>
    </header>

    <div class="model-stage" id="model-stage" aria-label="ジャンルモデル選択">
      <button class="arrow-button arrow-left" id="previous-button" aria-label="前のジャンル">‹</button>
      <button class="arrow-button arrow-right" id="next-button" aria-label="次のジャンル">›</button>
      <span class="model-label label-left" id="left-name"></span>
      <span class="model-label label-center" id="center-name"></span>
      <span class="model-label label-right" id="right-name"></span>
      <div class="swipe-hint">← 左右にスワイプ / 矢印キーで切り替え →</div>
    </div>

    <section class="description-panel">
      <div class="description-heading">
        <span class="description-number" id="description-number">02</span>
        <span>GENRE INFORMATION</span>
      </div>
      <h2 id="description-title">ナチュラル</h2>
      <p id="description-text"></p>
      <div class="hold-guide"><span class="hold-dot"></span> 中央のモデルを1秒以上ホールドして選択</div>
    </section>
    <p class="screen-message" id="screen-message" aria-live="polite"></p>
  </main>
`

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x333333)

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
camera.position.set(0, 4.5, 16.5)
camera.lookAt(0, 1.15, 0)

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.15

const stage = document.querySelector<HTMLDivElement>('#model-stage')!
stage.prepend(renderer.domElement)
renderer.domElement.className = 'stage-canvas'

scene.add(new THREE.HemisphereLight(0xffffff, 0x59636a, 2.1))
const keyLight = new THREE.DirectionalLight(0xfff1dc, 3)
keyLight.position.set(4, 8, 6)
scene.add(keyLight)
const fillLight = new THREE.DirectionalLight(0x55d8cc, 1.3)
fillLight.position.set(-5, 4, -4)
scene.add(fillLight)

function makeHouse(style: Genre['style']) {
  const group = new THREE.Group()

  let wallColor = 0xe7e2d8
  let roofColor = 0x283f48
  let trimColor = 0x343b3d
  if (style === 'natural') {
    wallColor = 0xd7bd91
    roofColor = 0x527b68
    trimColor = 0x594631
  }
  if (style === 'japanese') {
    wallColor = 0xd9d2c3
    roofColor = 0x343b43
    trimColor = 0x5a4537
  }

  const wall = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.8 })
  const roof = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.7 })
  const trim = new THREE.MeshStandardMaterial({ color: trimColor, roughness: 0.75 })
  const glass = new THREE.MeshStandardMaterial({ color: 0x83d7d0, roughness: 0.25, metalness: 0.1 })

  const base = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.16, 1.9), trim)
  base.position.y = 0.08
  group.add(base)

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.45, 1.65), wall)
  body.position.y = 0.88
  group.add(body)

  if (style === 'japanese') {
    const roofBox = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.18, 2.15), roof)
    roofBox.position.y = 1.72
    group.add(roofBox)
    const upperRoof = new THREE.Mesh(new THREE.ConeGeometry(1.85, 0.8, 4), roof)
    upperRoof.rotation.y = Math.PI / 4
    upperRoof.position.y = 2.18
    group.add(upperRoof)
  } else {
    const roofGeo = new THREE.BufferGeometry()
    const vertices = new Float32Array([
      -1.3, 1.62, -1.02, 0, 2.5, -1.02, 0, 2.5, 1.02,
      -1.3, 1.62, -1.02, 0, 2.5, 1.02, -1.3, 1.62, 1.02,
      1.3, 1.62, -1.02, 1.3, 1.62, 1.02, 0, 2.5, 1.02,
      1.3, 1.62, -1.02, 0, 2.5, 1.02, 0, 2.5, -1.02,
    ])
    roofGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    roofGeo.computeVertexNormals()
    group.add(new THREE.Mesh(roofGeo, roof))
  }

  const windowGeometry = new THREE.BoxGeometry(0.48, 0.55, 0.045)
  for (const x of [-0.62, 0.62]) {
    const windowMesh = new THREE.Mesh(windowGeometry, glass)
    windowMesh.position.set(x, 0.95, 0.84)
    group.add(windowMesh)
  }

  const door = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.88, 0.06), trim)
  door.position.set(0, 0.53, 0.86)
  group.add(door)

  if (style === 'natural') {
    const postMaterial = new THREE.MeshStandardMaterial({ color: 0x8c6845, roughness: 0.85 })
    for (const x of [-1.18, 1.18]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, 0.12), postMaterial)
      post.position.set(x, 0.88, 1.0)
      group.add(post)
    }
  }

  if (style === 'modern') {
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.12, 0.65), trim)
    canopy.position.set(0, 1.68, 1.05)
    group.add(canopy)
  }

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(1.9, 48),
    new THREE.MeshBasicMaterial({ color: 0x3c4141 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.015
  group.add(ground)

  return group
}

const models = genres.map((genre) => makeHouse(genre.style))

// 各モデルの移動先と明るさを保存する
// これらがないと画面更新時にエラーになり、3Dモデルが描画されない
const modelTargets = models.map((_, index) => ({
  x: index === 0 ? -4.1 : index === 1 ? 0 : 4.1,
  z: index === 1 ? 0.8 : -2.2,
  scale: index === 1 ? 1.45 : 0.78,
  rotation: 0,
  brightness: index === 1 ? 1 : 0.48,
}))
const modelBrightness = models.map((_, index) => index === 1 ? 1 : 0.48)

// 暗さをアニメーションで変更できるよう、元の色を保存する
models.forEach((model) => {
  model.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      materials.forEach((material) => {
        if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshBasicMaterial) {
          material.userData.baseColor = material.color.clone()
        }
      })
    }
  })
  scene.add(model)
})

let selectedIndex = 1
let isHolding = false
let holdTimer: number | undefined
let pointerStartX = 0
let pointerStartY = 0

const leftName = document.querySelector<HTMLSpanElement>('#left-name')!
const centerName = document.querySelector<HTMLSpanElement>('#center-name')!
const rightName = document.querySelector<HTMLSpanElement>('#right-name')!
const descriptionTitle = document.querySelector<HTMLHeadingElement>('#description-title')!
const descriptionText = document.querySelector<HTMLParagraphElement>('#description-text')!
const message = document.querySelector<HTMLParagraphElement>('#screen-message')!

function updateScreen() {
  const leftIndex = (selectedIndex + genres.length - 1) % genres.length
  const rightIndex = (selectedIndex + 1) % genres.length

  leftName.textContent = genres[leftIndex].name
  centerName.textContent = genres[selectedIndex].name
  rightName.textContent = genres[rightIndex].name
  descriptionTitle.textContent = genres[selectedIndex].name
  descriptionText.textContent = genres[selectedIndex].description
  const number = document.querySelector<HTMLSpanElement>('#description-number')
  if (number) number.textContent = String(selectedIndex + 1).padStart(2, '0')

  models.forEach((model, index) => {
    const distance = (index - selectedIndex + genres.length) % genres.length
    const target = modelTargets[index]

    if (distance === 0) {
      target.x = 0
      target.z = 0.8
      target.scale = 1.55
      target.rotation = 0
      target.brightness = 1
    } else if (distance === 1) {
      target.x = 4.1
      target.z = -2.2
      target.scale = 0.78
      target.rotation = -0.24
      target.brightness = 0.48
    } else {
      target.x = -4.1
      target.z = -2.2
      target.scale = 0.78
      target.rotation = 0.24
      target.brightness = 0.48
    }
  })

  message.textContent = ''
}

function selectGenre(index: number) {
  selectedIndex = (index + genres.length) % genres.length
  updateScreen()
}

 document.querySelector<HTMLButtonElement>('#previous-button')!.addEventListener('pointerdown', (event) => event.stopPropagation())
document.querySelector<HTMLButtonElement>('#previous-button')!.addEventListener('pointerup', (event) => event.stopPropagation())
document.querySelector<HTMLButtonElement>('#next-button')!.addEventListener('pointerdown', (event) => event.stopPropagation())
document.querySelector<HTMLButtonElement>('#next-button')!.addEventListener('pointerup', (event) => event.stopPropagation())
document.querySelector<HTMLButtonElement>('#previous-button')!.addEventListener('click', (event) => {
  event.stopPropagation()
  selectGenre(selectedIndex - 1)
})
document.querySelector<HTMLButtonElement>('#next-button')!.addEventListener('click', (event) => {
  event.stopPropagation()
  selectGenre(selectedIndex + 1)
})

stage.addEventListener('pointerdown', (event) => {
  pointerStartX = event.clientX
  pointerStartY = event.clientY
  isHolding = false

  const rect = stage.getBoundingClientRect()
  const relativeX = (event.clientX - rect.left) / rect.width
  const relativeY = (event.clientY - rect.top) / rect.height

  if (relativeY > 0.12 && relativeY < 0.88 && relativeX > 0.34 && relativeX < 0.66) {
    isHolding = true
    holdTimer = window.setTimeout(() => {
      if (isHolding) {
        message.textContent = 'ジャンルを決定しました。H-03への接続準備ができています。'
        isHolding = false
      }
    }, 1000)
  }
})

stage.addEventListener('pointerup', (event) => {
  if (holdTimer !== undefined) window.clearTimeout(holdTimer)
  const differenceX = event.clientX - pointerStartX
  const differenceY = event.clientY - pointerStartY
  if (Math.abs(differenceX) > 45 && Math.abs(differenceX) > Math.abs(differenceY)) {
    isHolding = false
    selectGenre(selectedIndex + (differenceX < 0 ? 1 : -1))
    return
  }

  if (isHolding) {
    const rect = stage.getBoundingClientRect()
    const relativeX = (event.clientX - rect.left) / rect.width
    if (relativeX < 0.34) selectGenre(selectedIndex - 1)
    else if (relativeX > 0.66) selectGenre(selectedIndex + 1)
  }
  isHolding = false
})

function cancelHold() {
  isHolding = false
  if (holdTimer !== undefined) window.clearTimeout(holdTimer)
}
stage.addEventListener('pointerleave', cancelHold)
stage.addEventListener('pointercancel', cancelHold)

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') selectGenre(selectedIndex - 1)
  if (event.key === 'ArrowRight') selectGenre(selectedIndex + 1)
})

function resize() {
  const { width, height } = stage.getBoundingClientRect()
  if (!width || !height) return
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height, false)
}
new ResizeObserver(resize).observe(stage)
resize()

function animate() {
  requestAnimationFrame(animate)
  models.forEach((model, index) => {
    const target = modelTargets[index]
    model.position.x += (target.x - model.position.x) * 0.085
    model.position.z += (target.z - model.position.z) * 0.085
    const currentScale = model.scale.x
    const nextScale = currentScale + (target.scale - currentScale) * 0.085
    model.scale.setScalar(nextScale)
    model.rotation.y += (target.rotation - model.rotation.y) * 0.085
    model.rotation.y += index === selectedIndex ? 0.0018 : 0.0008

    modelBrightness[index] += (target.brightness - modelBrightness[index]) * 0.09
    model.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => {
          if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshBasicMaterial) {
            const base = material.userData.baseColor as THREE.Color | undefined
            if (base) material.color.copy(base).multiplyScalar(modelBrightness[index])
          }
        })
      }
    })
  })
  renderer.render(scene, camera)
}

updateScreen()
animate()
