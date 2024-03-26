import "./gui-style.css"
import * as THREE from "three"

// const page: HTMLDivElement = document.querySelector(".page")!
const pageCanvas: HTMLCanvasElement = document.querySelector("#gui")!
const windowGeometry = {
    width: window.innerWidth,
    height: window.innerHeight
}

// three.js scene boilerplate

const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer({canvas: pageCanvas})
renderer.setSize(windowGeometry.width, windowGeometry.height)

const frustumMultiplier: number = 0.004

const camera = new THREE.OrthographicCamera(
    frustumMultiplier / - 2 * windowGeometry.width,
    frustumMultiplier / 2 * windowGeometry.width,
    frustumMultiplier / 2 * windowGeometry.height,
    frustumMultiplier / - 2 * windowGeometry.height,
    0.1,
    100
)

camera.position.set(0, 0, 1)
camera.lookAt(0, 0, 0)
camera.layers.enableAll()

const axisRay = new THREE.Raycaster()
const handleRay = new THREE.Raycaster()

axisRay.layers.set(1)
axisRay.params.Line.threshold = 3;

handleRay.layers.set(2)

const normalizedPointerPosition = new THREE.Vector2();

const backgroundShape = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.25, 4, 32), new THREE.MeshBasicMaterial({color: "#bbbbff"}))
backgroundShape.position.set(0, 0, -0.5)
scene.fog = new THREE.Fog( "#000000", 0.8, 1.5)
scene.add(backgroundShape)

// draggable geometry

let isDragging: Boolean = false

const handleGeo = new THREE.SphereGeometry(0.025, 1, 6)

const handleColor = new THREE.Color("#ffffff")

const axisEndpoints: THREE.Vector3[] = [
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(-0.87, 0.5, 0),
    new THREE.Vector3(-0.87, -0.5, 0),
    new THREE.Vector3(0, -1 ,0),
    new THREE.Vector3(0.87, -0.5, 0),
    new THREE.Vector3(0.87, 0.5, 0)
]

let axisHandlePairs = new Map<THREE.Mesh, THREE.Line>()

let axisLines: THREE.Line[] = []
let handles: THREE.Mesh[] = []

let axisIntersects: any[] = []
let handleIntersects: any[] = []

let polygonPoints: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)]
let polygonGeometry = new THREE.BufferGeometry().setFromPoints( polygonPoints )
let polygonMaterial = new THREE.LineBasicMaterial({color: "#666666"})
let polygon: THREE.LineLoop = new THREE.LineLoop(polygonGeometry, polygonMaterial)
scene.add(polygon)

let bezierMaterial = new THREE.LineBasicMaterial({color: "#00ffee"})
let bezierCalc = new THREE.SplineCurve( polygonPoints as any )
let bezierPoints = bezierCalc.getPoints( 50 );
let bezierGeometry = new THREE.BufferGeometry().setFromPoints( bezierPoints );
let bezier = new THREE.Line( bezierGeometry, bezierMaterial );
scene.add(bezier)

for (let i = 0; i < 6; i++) {

    const axisGeo = new THREE.BufferGeometry().setFromPoints([ new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)])

    const axis = new THREE.Line(axisGeo, new THREE.LineBasicMaterial({color: "#885588"}))
    const handle = new THREE.Mesh(handleGeo, new THREE.MeshBasicMaterial({color: "#ffffff"}))

    axis.layers.set(1)
    handle.layers.set(2)

    axis.rotateZ((Math.PI / 3) * i)
    let newHandlePosition = new THREE.Vector3(0, 0, 0)
    newHandlePosition.lerp(axisEndpoints[i], Math.random())
    handle.position.set(newHandlePosition.x, newHandlePosition.y, 0)

    axisLines[i] = axis
    handles[i] = handle

    axisHandlePairs.set(handle, axis)

    scene.add(axis)
    scene.add(handle)
    
}

let axisLabels: NodeListOf<HTMLDivElement> = document.querySelectorAll(".axis-label")
for (let i = 0; i < 6; i++) {

    let projectedPoint: THREE.Vector3 = axisEndpoints[i].project(camera)
    projectedPoint.x *= 1.3
    projectedPoint.y *= 1.1
    let x = ( projectedPoint.x * .5 + .5) * pageCanvas.clientWidth
    let y = (-projectedPoint.y * .5 + .5) * pageCanvas.clientHeight
    
    axisLabels[i].style.left = `${x}px`
    axisLabels[i].style.top = `${y}px`

    axisLabels[i].addEventListener("pointerup", () => {
        axisLabels[i].classList.toggle("active")
    })
}

updatePolygon()
render()

function render() {
    requestAnimationFrame(render);
	renderer.render( scene, camera );
}

function updatePolygon() {

    polygon.removeFromParent()
    bezier.removeFromParent()

    polygonPoints = []
    
    handles.forEach( handle => {
        polygonPoints.push(handle.position)
    })
    polygonGeometry = new THREE.BufferGeometry().setFromPoints( polygonPoints )
    polygon.geometry.attributes.position.needsUpdate = true;
    polygon = new THREE.LineLoop( polygonGeometry, polygonMaterial );

    scene.add(polygon)

    let controlPoints: THREE.Vector2[] = []
    polygonPoints.forEach( point => {
        let newPoint = new THREE.Vector2(point.x * 0.75, point.y * 0.75)
        controlPoints.push(newPoint)
    })
    controlPoints.push(new THREE.Vector2(polygonPoints[0].x * 0.75, polygonPoints[0].y * 0.75))

    bezierCalc = new THREE.SplineCurve( controlPoints );

    bezierPoints = bezierCalc.getPoints( 50 );
    bezierGeometry = new THREE.BufferGeometry().setFromPoints( bezierPoints );

    bezier = new THREE.Line( bezierGeometry, bezierMaterial );
    scene.add(bezier)
}

pageCanvas.addEventListener("pointermove", e => {

	normalizedPointerPosition.x = ( e.clientX / window.innerWidth ) * 2 - 1;
	normalizedPointerPosition.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

    if (!isDragging) return

    let activeHandle = handleIntersects[0].object as THREE.Mesh

    axisRay.setFromCamera(normalizedPointerPosition, camera)
    axisIntersects = axisRay.intersectObject( axisHandlePairs.get(activeHandle) as THREE.Line )
    
    let point: THREE.Vector3 = axisIntersects[0].point as THREE.Vector3
    activeHandle.position.copy(point)

    updatePolygon()
})

pageCanvas.addEventListener("pointerdown", () => {
    handleRay.setFromCamera(normalizedPointerPosition, camera)

	handleIntersects = handleRay.intersectObjects(handles, false)

    if (handleIntersects.length <= 0) return

    let grabbedHandle: THREE.Mesh = handleIntersects[0].object as THREE.Mesh

    let handleMaterial: THREE.MeshBasicMaterial = grabbedHandle.material as THREE.MeshBasicMaterial
    handleMaterial.color = new THREE.Color("#00ff00")

    if (grabbedHandle) isDragging = true
})

pageCanvas.addEventListener("pointerup", () => {

    handles.forEach(handle => {
        let material: THREE.MeshBasicMaterial = handle.material as THREE.MeshBasicMaterial
        material.color = handleColor
    })

    isDragging = false
})

window.addEventListener("resize", () => {
    windowGeometry.width = window.innerWidth
    windowGeometry.height = window.innerHeight
    camera.left = frustumMultiplier / - 2 * windowGeometry.width
    camera.right = frustumMultiplier / 2 * windowGeometry.width
    camera.top = frustumMultiplier / 2 * windowGeometry.height
    camera.bottom = frustumMultiplier / - 2 * windowGeometry.height
    camera.updateProjectionMatrix()
    renderer.setSize(windowGeometry.width, windowGeometry.height)
})