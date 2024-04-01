import "./gui-style.css"
import {App} from "./app"
import { CardChoiceInterface } from "./cards"
import { ShapePreview } from "./shapePreview"
import { RefinementInterface } from "./refinement"

const cardChoiceInterface: CardChoiceInterface = new CardChoiceInterface()
let threeJSApp: App
let shapePreviewInterface: ShapePreview
let refinementInterface: RefinementInterface

const pageOne: HTMLDivElement = document.querySelector(".page.one")!
const pageTwo: HTMLDivElement = document.querySelector(".page.two")!
const pageThree: HTMLDivElement = document.querySelector(".page.three")!
const nextButtonPageOne: HTMLDivElement = document.querySelector("input#page-one-next")!
const nextButtonPageTwo: HTMLDivElement = document.querySelector("input#page-two-next")!
const nextButtonPageThree: HTMLDivElement = document.querySelector("input#page-three-next")!

const pageTwoCanvas: HTMLCanvasElement = document.querySelector("canvas#shape-preview")!
const pageThreeCanvas: HTMLCanvasElement = document.querySelector("canvas#refinement-interface")!

// Unload page one and load page two

nextButtonPageOne.addEventListener("click", () => {
    pageOne.classList.add("hidden")
    pageTwo.classList.remove("hidden")
    pageThree.classList.add("hidden")

    setTimeout( () => {
        threeJSApp = new App(pageTwoCanvas)
        shapePreviewInterface = new ShapePreview(threeJSApp)
    }, 1000)

})

// Unload page two and load page three

nextButtonPageTwo.addEventListener("click", () => {
    pageOne.classList.add("hidden")
    pageTwo.classList.add("hidden")
    pageThree.classList.remove("hidden")
    setTimeout( () => {
        
        refinementInterface = new RefinementInterface(new App(pageThreeCanvas))
    }, 1000)
})