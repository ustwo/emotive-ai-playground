import {App} from "./app"
import * as THREE from "three"

export class RefinementInterface {

    // References three.js scene constants
    app: App

    // UI constants
    axisEndpoints: THREE.Vector3[] = [
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(-0.87, 0.5, 0),
        new THREE.Vector3(-0.87, -0.5, 0),
        new THREE.Vector3(0, -1 ,0),
        new THREE.Vector3(0.87, -0.5, 0),
        new THREE.Vector3(0.87, 0.5, 0)
    ]
    axisLabels: NodeListOf<HTMLDivElement> = document.querySelectorAll(".page.three .axis-label")
    axisHandlePairs: Map<THREE.Points, THREE.Line> = new Map()
    axisLines: THREE.Line[]
    handles: THREE.Points[]
    handleHighlight: HTMLDivElement = document.querySelector(".handle-highlight")!

    // interaction
    activeHandles: Set<number> = new Set()

    axisRay: THREE.Raycaster = new THREE.Raycaster()
    handleRay: THREE.Raycaster = new THREE.Raycaster()
    axisIntersects: any[] = []
    handleIntersects: any[] = []
    normalizedPointerPosition = new THREE.Vector2()
    handleColors = {active: new THREE.Color("#634ef0"), default: new THREE.Color("#281696")}
    isDragging: Boolean = false

    // dynamic UI
    polygonPoints: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)]
    polygonGeometry = new THREE.BufferGeometry().setFromPoints( this.polygonPoints )
    polygonMaterial = new THREE.LineBasicMaterial({color: "#666666"})
    polygon: THREE.LineLoop = new THREE.LineLoop(this.polygonGeometry, this.polygonMaterial)

    constructor(app: App, initialHandles: number[] = [0, 2, 4]) {

        this.app = app
        this.axisLines = this.constructAxes()
        this.handles = this.setupHandles()

        this.axisLines.forEach( (axis, index) => {
            this.axisHandlePairs.set(this.handles[index], axis)
            this.app.scene.add(axis)
        })

        // default active handles:
        initialHandles.forEach( handleIndex => {
            this.activeHandles.add(handleIndex)
        })

        this.axisRay.layers.set(1)
        this.handleRay.layers.set(2)
        this.axisRay.params.Line.threshold = 0.25;
        this.handleRay.params.Points.threshold = 0.1;

        this.setupAxisLabels()

        this.app.scene.add(this.polygon)
        this.updatePolygon()

        this.app.canvas.addEventListener("pointermove", this.updateRaycasts.bind(this), {passive: false})
        this.app.canvas.addEventListener("pointerdown", this.testRaycasts.bind(this), {passive: false})
        this.app.canvas.addEventListener("pointerup", this.finishRaycastUpdates.bind(this), {passive: false})

        this.app.canvas.addEventListener("touchstart", e => {e.preventDefault()}, {passive: false})
    }

    constructAxes(): THREE.Line[] {
        
        const concentricCircles = new THREE.Group()
        const concentricCircleMaterial = new THREE.LineBasicMaterial({color: "#B7C2FF"});
        for (let i = 1; i < 4; i++) {
            const circleGeometry = new THREE.CircleGeometry(0.3 * i, 64);
            const edges = new THREE.EdgesGeometry(circleGeometry);
            const circleLine = new THREE.Line(edges, concentricCircleMaterial);
            concentricCircles.add(circleLine);
        }
        this.app.scene.add(concentricCircles)

        let axes: THREE.Line[] = []

        for (let i = 0; i < 6; i++) {
            const axisGeo = new THREE.BufferGeometry().setFromPoints([ new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)])
            const axis = new THREE.Line(axisGeo, new THREE.LineBasicMaterial({color: "#443351"}))
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
            let x = ( projectedPoint.x * .5 + .5) * this.app.canvasGeometry.width
            let y = (-projectedPoint.y * .5 + .5) * this.app.canvasGeometry.height

            let computedwidth = (this.app.canvasGeometry.x * 2) + this.app.canvasGeometry.width
            
            this.axisLabels[i].style.left = `${x + this.app.canvasGeometry.x}px`
            this.axisLabels[i].style.top = `${y + this.app.canvasGeometry.y}px`
            this.updateHandles()
        
            this.axisLabels[i].addEventListener("pointerdown", () => {
                this.updateAxisLabels(i)
                this.updateHandles()
                this.updatePolygon()
            })
        }

    }

    updateAxisLabels(i: number) {

        this.activeHandles.has(i) ? this.activeHandles.delete(i) : this.activeHandles.add(i)
        this.axisLabels.forEach( (label, index) => {
            this.activeHandles.has(index) ?
            label.classList.add("active") :
            label.classList.remove("active")
        })

    }

    setupHandles(): THREE.Points[] {

        let handles: THREE.Points[] = []
        // const handleGeo = new THREE.SphereGeometry(0.1, 4, 8)
        const handleGeo = new THREE.BufferGeometry();
        const vertices = new Float32Array([0.0, 0.0,  0.0])
        handleGeo.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );


        for (let i = 0; i < 6; i++) {
            const handle = new THREE.Points(handleGeo, new THREE.PointsMaterial(
                {color: this.handleColors.default, size: 0, sizeAttenuation: false})
                )
            handle.layers.set(2)
            let newHandlePosition = new THREE.Vector3(0, 0, 0)
            newHandlePosition.lerp(this.axisEndpoints[i], Math.random())
            handle.position.set(newHandlePosition.x, newHandlePosition.y, 0)
            handles.push(handle)   
        }

        return handles

    }

    updateHandles() {

        this.handles.forEach((handle, index) => {
            this.activeHandles.has(index) ? this.app.scene.add(handle) : handle.removeFromParent()
        })

    }

    updatePolygon() {

            this.polygon.removeFromParent()
        
            this.polygonPoints = []
            
            this.handles.forEach( (handle, index) => {
                this.activeHandles.has(index) && this.polygonPoints.push(handle.position)
            })
            
            this.polygonGeometry = new THREE.BufferGeometry().setFromPoints( this.polygonPoints )
            this.polygon.geometry.attributes.position.needsUpdate = true;
            this.polygon = new THREE.LineLoop( this.polygonGeometry, this.polygonMaterial );
            
            let polyPoints: THREE.Vector2[] = []
            this.polygonPoints.forEach( point => {
                let newPoint: THREE.Vector2 = new THREE.Vector2(point.x, point.y)
                polyPoints.push(newPoint)
            })

            let poly = new THREE.Shape(polyPoints)
            const extrudeSettings = { 
                depth: 1, 
                bevelEnabled: true, 
                bevelSegments: 2, 
                steps: 2, 
                bevelSize: 1, 
                bevelThickness: 1 
            }
            
            const geometry = new THREE.ExtrudeGeometry( poly, extrudeSettings );
            const mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color: this.handleColors.default}) )

            this.app.scene.add(this.polygon, mesh)
        
    }

    updateRaycasts(e: PointerEvent) {

        e.preventDefault()
        
        let newX: number = e.clientX - this.app.canvasGeometry.x
        let newY: number = e.clientY - this.app.canvasGeometry.y

        this.normalizedPointerPosition.x = ( newX / this.app.canvasGeometry.width ) * 2 - 1;
        this.normalizedPointerPosition.y = - ( newY / this.app.canvasGeometry.height ) * 2 + 1;
    
        if (!this.isDragging) return
    
        let activeHandle = this.handleIntersects[0].object as THREE.Points
    
        this.axisRay.setFromCamera(this.normalizedPointerPosition, this.app.camera)
        this.axisIntersects = this.axisRay.intersectObject( this.axisHandlePairs.get(activeHandle) as THREE.Line )
        
        // if (this.axisIntersects.length < 1) return

        let point: THREE.Vector3 = this.axisIntersects[0].point as THREE.Vector3
        activeHandle.position.copy(point)

        let projectedPoint = new THREE.Vector3(0, 0, 0).copy(point)
        projectedPoint.project(this.app.camera)
        let x = ( projectedPoint.x * .5 + .5) * this.app.canvasGeometry.width
        let y = (-projectedPoint.y * .5 + .5) * this.app.canvasGeometry.height

        this.handleHighlight.style.left = `${x + this.app.canvasGeometry.x}px`
        this.handleHighlight.style.top = `${y + this.app.canvasGeometry.y}px`
    
        this.updatePolygon()

    }

    testRaycasts(e: PointerEvent) {

        e.preventDefault()
        this.updateRaycasts(e)

        this.handleRay.setFromCamera(this.normalizedPointerPosition, this.app.camera)
        this.handleIntersects = this.handleRay.intersectObjects(this.handles, false)
        
        if (this.handleIntersects.length <= 0) return
    
        let grabbedHandle: THREE.Mesh = this.handleIntersects[0].object as THREE.Mesh
        let handleMaterial: THREE.MeshBasicMaterial = grabbedHandle.material as THREE.MeshBasicMaterial
        handleMaterial.color = this.handleColors.active
        this.handleHighlight.classList.add("active")
    
        if (grabbedHandle) this.isDragging = true

    }

    finishRaycastUpdates(e: PointerEvent) {

        e.preventDefault()

        this.handles.forEach(handle => {
            let material: THREE.MeshBasicMaterial = handle.material as THREE.MeshBasicMaterial
            material.color = this.handleColors.default
        })
    
        this.isDragging = false
        this.handleHighlight.classList.remove("active")

    }

}