import * as THREE from "three"

export class App {

    // handles three.js scene setup boilerplate.
    // see https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene

    windowGeometry: {width: number, height: number} = {
        width: window.innerWidth,
        height: window.innerHeight
    }
    canvas: HTMLCanvasElement = document.querySelector("#gui")!
    scene: THREE.Scene
    camera: THREE.OrthographicCamera
    renderer: THREE.WebGLRenderer
    frustumMultiplier: number

    constructor(frustumMultiplier: number = 0.0075) {

        this.canvas = document.querySelector("#gui")!
        this.scene = new THREE.Scene()
        this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, alpha: true})

        this.frustumMultiplier = frustumMultiplier
        this.renderer.setSize(this.windowGeometry.width, this.windowGeometry.height)

        this.camera = new THREE.OrthographicCamera(
            frustumMultiplier / - 2 * this.windowGeometry.width,
            frustumMultiplier / 2 * this.windowGeometry.width,
            frustumMultiplier / 2 * this.windowGeometry.height,
            frustumMultiplier / - 2 * this.windowGeometry.height,
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