import * as THREE from "three"

export class App {

    // handles three.js scene setup boilerplate.
    // see https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene

    windowGeometry: {width: number, height: number} = {
        width: window.innerWidth,
        height: window.innerHeight
    }
    canvasGeometry: {x: number, y: number, width: number, height: number, bottom: number, right: number}
    canvas: HTMLCanvasElement = document.querySelector("#gui")!
    scene: THREE.Scene
    camera: THREE.OrthographicCamera
    renderer: THREE.WebGLRenderer
    frustumMultiplier: number

    constructor(frustumMultiplier: number = 0.0065) {

        this.canvas = document.querySelector("#gui")!
        this.scene = new THREE.Scene()
        this.canvasGeometry = this.canvas.getBoundingClientRect()
        this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, alpha: true, antialias: true})

        this.frustumMultiplier = frustumMultiplier

        this.renderer.setSize(this.canvasGeometry.width, this.canvasGeometry.height)

        this.camera = new THREE.OrthographicCamera(
            frustumMultiplier / - 2 * this.canvasGeometry.width,
            frustumMultiplier / 2 * this.canvasGeometry.width,
            frustumMultiplier / 2 * this.canvasGeometry.height,
            frustumMultiplier / - 2 * this.canvasGeometry.height,
            0.1,
            100
        )
        this.camera.position.set(0, 0, 1)
        this.camera.lookAt(0, 0, 0)
        this.camera.layers.enableAll()

        this.render()

    }

    render() {
        this.renderer.render(this.scene,this.camera);
        requestAnimationFrame(this.render.bind(this));
    }

}