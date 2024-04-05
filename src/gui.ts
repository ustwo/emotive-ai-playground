import "./gui-style.css"
import {Emotions, KeywordParams} from "./typeUtils.ts"
import {Prompt} from "./promptBuilder.ts"
import {CardChoiceInterface} from "./cardSelector.ts"
import {Card} from "./card.ts"
import {RadialPreview} from "./radialPreview.ts"
import {RefinementInterface} from "./refinement"

// MAIN entry to application.

let parameters: KeywordParams = null!
let prompt: Prompt = null!

const cardChoiceInterface: CardChoiceInterface = new CardChoiceInterface()
let shapePreviewInterface: RadialPreview = null!
let refinementInterface: RefinementInterface = null!

const pageOne: HTMLDivElement = document.querySelector(".page.one")!
const pageTwo: HTMLDivElement = document.querySelector(".page.two")!
const pageThree: HTMLDivElement = document.querySelector(".page.three")!
const nextButtonPageOne: HTMLDivElement = document.querySelector("input#page-one-next")!
const nextButtonPageTwo: HTMLDivElement = document.querySelector("input#page-two-next")!
const nextButtonPageThree: HTMLDivElement = document.querySelector("input#page-three-next")!

// Unload page one and load page two

nextButtonPageOne.addEventListener("click", () => {
    pageOne.classList.add("hidden")
    pageTwo.classList.remove("hidden")
    pageThree.classList.add("hidden")

    let card: Card = cardChoiceInterface.activeCard
    parameters = {
        assertive: card.keywords.includes(Emotions.Assertive) ? 2 : 0,
        compassionate: card.keywords.includes(Emotions.Compassionate) ? 2 : 0,
        curious: card.keywords.includes(Emotions.Curious) ? 2 : 0,
        excited: card.keywords.includes(Emotions.Excited) ? 2 : 0,
        optimistic: card.keywords.includes(Emotions.Optimistic) ? 2 : 0,
        playful: card.keywords.includes(Emotions.Playful) ? 2 : 0,
    }

    prompt = new Prompt(card.agentType, parameters)

    setTimeout( () => {shapePreviewInterface = new RadialPreview(prompt) }, 1000)

})
// Unload page two and load page three

nextButtonPageTwo.addEventListener("click", () => {
    pageOne.classList.add("hidden")
    pageTwo.classList.add("hidden")
    pageThree.classList.remove("hidden")

    setTimeout( () => { }, 1000)
})