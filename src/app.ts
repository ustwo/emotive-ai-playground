import * as THREE from "three"

export class App {

    // handles three.js scene setup boilerplate.
    // see https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene

    windowGeometry: {width: number, height: number} = {
        width: window.innerWidth,
        height: window.innerHeight
    }
    canvasGeometry: {x: number, y: number, width: number, height: number, bottom: number, right: number}
    canvas: HTMLCanvasElement
    scene: THREE.Scene
    camera: THREE.OrthographicCamera
    renderer: THREE.WebGLRenderer
    frustumMultiplier: number

    constructor(canvas: HTMLCanvasElement) {
        
        this.canvas = canvas
        this.scene = new THREE.Scene()
        this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, alpha: true, antialias: true})
        
        this.canvasGeometry = this.canvas.getBoundingClientRect()
        this.canvasGeometry.width > 500 ? this.frustumMultiplier = 0.005 : this.frustumMultiplier = 0.0075

        this.renderer.setSize(this.canvasGeometry.width, this.canvasGeometry.height)

        this.camera = new THREE.OrthographicCamera(
            this.frustumMultiplier / - 2 * this.canvasGeometry.width,
            this.frustumMultiplier / 2 * this.canvasGeometry.width,
            this.frustumMultiplier / 2 * this.canvasGeometry.height,
            this.frustumMultiplier / - 2 * this.canvasGeometry.height,
            0.1,
            100
        )
        this.camera.position.set(0, 0, 1)
        this.camera.lookAt(0, 0, 0)
        this.camera.layers.enableAll()

        // const previewCube: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), new THREE.MeshBasicMaterial({color: "#00ff00"}))
        // this.scene.add(previewCube)

        this.render()

    }

    render() {
        this.renderer.render(this.scene,this.camera);
        requestAnimationFrame(this.render.bind(this));
    }

}