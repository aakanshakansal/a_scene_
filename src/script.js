import GUI from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import firefliesVertexShader from '/shaders/fireflies/vertex.glsl'
import firefliesFragementShader from '/shaders/fireflies/fragement.glsl'
import portalVertexShader from '/shaders/portal/vertex.glsl'
import portalFragementShader from '/shaders/portal/fragement.glsl'


/**
 * Base
 */
// Debug
const debugObject= {}
const gui = new GUI({
    width: 400
})

debugObject.clearColor = '#5f4545'




// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Textures
 */
const bakedTexture = textureLoader.load('baked.jpg')
bakedTexture.flipY = false
bakedTexture.colorSpace = THREE.SRGBColorSpace

/**
 * Materials
 */

debugObject.portalColorStart = '#000000'
debugObject.portalColorEnd = '#ffffff'
// Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

// Pole light material
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 })

// Portal light material
const portalLightMaterial = new THREE.ShaderMaterial({
    uniforms:{
        uTime:{value:0},
        uColorStart: { value: new THREE.Color(debugObject.portalColorStart) },
        uColorEnd: { value: new THREE.Color(debugObject.portalColorEnd) }

    },
    vertexShader:portalVertexShader,
    fragmentShader: portalFragementShader
 })

 


/**
 * Model
 */
gltfLoader.load(
    'portal.glb',
    (gltf) =>
    {
        scene.add(gltf.scene)

        // Get each object
        const bakedMesh = gltf.scene.children.find((child) => child.name === 'baked')
        const portalLightMesh = gltf.scene.children.find((child) => child.name === 'portalLight')
        const poleLightAMesh = gltf.scene.children.find((child) => child.name === 'poleLightA')
        const poleLightBMesh = gltf.scene.children.find((child) => child.name === 'poleLightB')

        // Apply materials
        bakedMesh.material = bakedMaterial
        portalLightMesh.material = portalLightMaterial
        poleLightAMesh.material = poleLightMaterial
        poleLightBMesh.material = poleLightMaterial
    }
)


// fireflies

const fireFliesGeometry= new THREE.BufferGeometry()
const fireFliesCount= 150
const positionArray = new Float32Array(fireFliesCount * 3)
const scaleArray= new Float32Array(fireFliesCount)

for(let i=0; i<fireFliesCount; i++){
    positionArray[i *3 + 0] = (Math.random()-0.5) * 4
    positionArray[i *3 + 1] = Math.random() * 1.5
    positionArray[i *3 + 2] = (Math.random()-0.5) * 4 
    scaleArray[i]= Math.random()
}
fireFliesGeometry.setAttribute('position',new THREE.BufferAttribute(positionArray,3))
fireFliesGeometry.setAttribute('aScale',new THREE.BufferAttribute(scaleArray,3))

console.log(fireFliesCount)

// material
const firefliesmaterial = new THREE.ShaderMaterial({
    uniforms:{
        uPixelRatio: {value: Math.min(window.devicePixelRatio,2)},
        uSize:{ value: 100},
        uTime:{ value: 0}
    },
    transparent:true,
    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragementShader,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    // size:0.1,
    // sizeAttenuation: true
})

// points mesh 
const fireFlies= new THREE.Points(fireFliesGeometry, firefliesmaterial)

scene.add(fireFlies)


// gui controls
gui.addColor(debugObject,'clearColor').onChange(()=>{
    renderer.setClearColor(debugObject.clearColor)

    
})
gui.addColor(debugObject,'portalColorStart').onChange(()=>{
    portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)

    
})
gui.addColor(debugObject,'portalColorEnd').onChange(()=>{
    portalLightMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorStart)

    
})
gui.add(firefliesmaterial.uniforms.uSize, 'value').min(1).max(400).step(1).name('uSize')
// gui.add(firefliesmaterial .uniforms.uTime, 'value').min(0).max(10).step(0.001).name('uTime')



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}



window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // time animation 
    firefliesmaterial.uniforms.uTime.value= elapsedTime
    portalLightMaterial.uniforms.uTime.value= elapsedTime


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()