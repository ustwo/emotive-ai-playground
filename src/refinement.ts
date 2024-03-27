import {App} from "./app"
import * as THREE from "three"

export class RefinementInterface {

    app: App
    axisEndpoints: THREE.Vector3[] = [
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(-0.87, 0.5, 0),
        new THREE.Vector3(-0.87, -0.5, 0),
        new THREE.Vector3(0, -1 ,0),
        new THREE.Vector3(0.87, -0.5, 0),
        new THREE.Vector3(0.87, 0.5, 0)
    ]
    axisLabels: NodeListOf<HTMLDivElement> = document.querySelectorAll(".axis-label")
    axisHandlePairs: Map<THREE.Mesh, THREE.Line> = new Map()
    axisLines: THREE.Line[]
    handles: THREE.Mesh[] = []

    activeHandles: Set<number> = new Set()

    axisIntersects: any[] = []
    handleIntersects: any[] = []
    isDragging: Boolean = false

    constructor(app: App, initialHandles: number[] = [0, 2, 4]) {

        this.app = app
        this.axisLines = this.constructAxes()

        this.axisLines.forEach( axis => {
            this.app.scene.add(axis)
        })

        // default active handles:
        initialHandles.forEach( handle => {
            this.activeHandles.add(handle)
        })

        this.setupAxisLabels()
        
        const backgroundShape = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.25, 4, 32), new THREE.MeshBasicMaterial({color: "#bbbbff"}))
        backgroundShape.position.set(0, 0, -0.5)
        this.app.scene.add(backgroundShape)
    }

    constructAxes(): THREE.Line[] {

        let axes: THREE.Line[] = []

        for (let i = 0; i < 6; i++) {
            const axisGeo = new THREE.BufferGeometry().setFromPoints([ new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)])
            const axis = new THREE.Line(axisGeo, new THREE.LineBasicMaterial({color: "#555555"}))
            axis.layers.set(1)
            axis.rotateZ((Math.PI / 3) * i)
            axes.push(axis)   
        }
        return axes

    }

    setupAxisLabels() {
        for (let i = 0; i < 6; i++) {

            this.activeHandles.has(i) ?
                this.axisLabels[i].classList.add("active") :
                this.axisLabels[i].classList.remove("active")

            let projectedPoint = new THREE.Vector3(0, 0, 0).copy(this.axisEndpoints[i])
            projectedPoint.project(this.app.camera)
            projectedPoint.x *= 1.3
            projectedPoint.y *= 1.1
            let x = ( projectedPoint.x * .5 + .5) * this.app.canvas.clientWidth
            let y = (-projectedPoint.y * .5 + .5) * this.app.canvas.clientHeight

            this.axisLabels[i].style.left = `${x}px`
            this.axisLabels[i].style.top = `${y}px`
        
            this.axisLabels[i].addEventListener("pointerup", () => {
                this.updateAxisLabels(i)
            })
        }
    }

    updateAxisLabels(i: number) {
        this.activeHandles.has(i) ? this.activeHandles.delete(i) : this.activeHandles.add(i)
        console.log(this.activeHandles)
        this.axisLabels.forEach( (label, index) => {
            this.activeHandles.has(index) ?
            label.classList.add("active") :
            label.classList.remove("active")
        })
    }

}

            // const handle = new THREE.Mesh(handleGeo, new THREE.MeshBasicMaterial({color: "#ffffff"}))

            // handle.layers.set(2)

            // let newHandlePosition = new THREE.Vector3(0, 0, 0)
            // newHandlePosition.lerp(axisEndpoints[i], Math.random())
            // handle.position.set(newHandlePosition.x, newHandlePosition.y, 0)

            // handles[i] = handle

            // axisHandlePairs.set(handle, axis)

            // app.scene.add(handle)

// const axisRay = new THREE.Raycaster()
// const handleRay = new THREE.Raycaster()

// axisRay.layers.set(1)
// axisRay.params.Line.threshold = 3;

// handleRay.layers.set(2)

// const normalizedPointerPosition = new THREE.Vector2();

// let isDragging: Boolean = false

// const handleGeo = new THREE.SphereGeometry(0.025, 1, 6)

// const handleColor = new THREE.Color("#ffffff")

// let axisHandlePairs = new Map<THREE.Mesh, THREE.Line>()

// let axisLines: THREE.Line[] = []
// let handles: THREE.Mesh[] = []

// let axisIntersects: any[] = []
// let handleIntersects: any[] = []

// let polygonPoints: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)]
// let polygonGeometry = new THREE.BufferGeometry().setFromPoints( polygonPoints )
// let polygonMaterial = new THREE.LineBasicMaterial({color: "#666666"})
// let polygon: THREE.LineLoop = new THREE.LineLoop(polygonGeometry, polygonMaterial)
// app.scene.add(polygon)

// let bezierMaterial = new THREE.LineBasicMaterial({color: "#00ffee"})
// let bezierCalc = new THREE.SplineCurve( polygonPoints as any )
// let bezierPoints = bezierCalc.getPoints( 50 );
// let bezierGeometry = new THREE.BufferGeometry().setFromPoints( bezierPoints );
// let bezier = new THREE.Line( bezierGeometry, bezierMaterial );
// app.scene.add(bezier)

// for (let i = 0; i < 6; i++) {

//     const axisGeo = new THREE.BufferGeometry().setFromPoints([ new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)])

//     const axis = new THREE.Line(axisGeo, new THREE.LineBasicMaterial({color: "#885588"}))
//     const handle = new THREE.Mesh(handleGeo, new THREE.MeshBasicMaterial({color: "#ffffff"}))

//     axis.layers.set(1)
//     handle.layers.set(2)

//     axis.rotateZ((Math.PI / 3) * i)
//     let newHandlePosition = new THREE.Vector3(0, 0, 0)
//     newHandlePosition.lerp(axisEndpoints[i], Math.random())
//     handle.position.set(newHandlePosition.x, newHandlePosition.y, 0)

//     axisLines[i] = axis
//     handles[i] = handle

//     axisHandlePairs.set(handle, axis)

//     app.scene.add(axis)
//     app.scene.add(handle)
    
// }


// updatePolygon()



// function updatePolygon() {

//     polygon.removeFromParent()
//     bezier.removeFromParent()

//     polygonPoints = []
    
//     handles.forEach( handle => {
//         polygonPoints.push(handle.position)
//     })
//     polygonGeometry = new THREE.BufferGeometry().setFromPoints( polygonPoints )
//     polygon.geometry.attributes.position.needsUpdate = true;
//     polygon = new THREE.LineLoop( polygonGeometry, polygonMaterial );

//     scene.add(polygon)

//     let controlPoints: THREE.Vector2[] = []
//     polygonPoints.forEach( point => {
//         let newPoint = new THREE.Vector2(point.x * 0.75, point.y * 0.75)
//         controlPoints.push(newPoint)
//     })
//     controlPoints.push(new THREE.Vector2(polygonPoints[0].x * 0.75, polygonPoints[0].y * 0.75))

//     bezierCalc = new THREE.SplineCurve( controlPoints );

//     bezierPoints = bezierCalc.getPoints( 50 );
//     bezierGeometry = new THREE.BufferGeometry().setFromPoints( bezierPoints );

//     bezier = new THREE.Line( bezierGeometry, bezierMaterial );
//     scene.add(bezier)
// }

// pageCanvas.addEventListener("pointermove", e => {

//     e.preventDefault()

// 	normalizedPointerPosition.x = ( e.clientX / window.innerWidth ) * 2 - 1;
// 	normalizedPointerPosition.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

//     if (!isDragging) return

//     let activeHandle = handleIntersects[0].object as THREE.Mesh

//     axisRay.setFromCamera(normalizedPointerPosition, camera)
//     axisIntersects = axisRay.intersectObject( axisHandlePairs.get(activeHandle) as THREE.Line )
    
//     let point: THREE.Vector3 = axisIntersects[0].point as THREE.Vector3
//     activeHandle.position.copy(point)

//     updatePolygon()
// }, {passive: false})

// pageCanvas.addEventListener("pointerdown", e => {

//     e.preventDefault()

//     handleRay.setFromCamera(normalizedPointerPosition, camera)

// 	handleIntersects = handleRay.intersectObjects(handles, false)

//     if (handleIntersects.length <= 0) return

//     let grabbedHandle: THREE.Mesh = handleIntersects[0].object as THREE.Mesh

//     let handleMaterial: THREE.MeshBasicMaterial = grabbedHandle.material as THREE.MeshBasicMaterial
//     handleMaterial.color = new THREE.Color("#00ff00")

//     if (grabbedHandle) isDragging = true
// }, {passive: false})

// pageCanvas.addEventListener("pointerup", e => {

//     e.preventDefault()

//     handles.forEach(handle => {
//         let material: THREE.MeshBasicMaterial = handle.material as THREE.MeshBasicMaterial
//         material.color = handleColor
//     })

//     isDragging = false
// }, {passive: false})