import "./gui-style.css"
import "./colors.css"
import { Emotions, KeywordParams } from "./typeUtils.ts"
import { Prompt } from "./promptBuilder.ts"
import { CardChoiceInterface } from "./cardSelector.ts"
import { Card } from "./card.ts"
import { RadialPreview } from "./radialPreview.ts"

import "./conversation-style.css"

// MAIN entry to application.

let parameters: KeywordParams = null!
let prompt: Prompt = null!

const cardChoiceInterface: CardChoiceInterface = new CardChoiceInterface()
let shapePreviewInterface: RadialPreview = null!

const landingPage: HTMLDivElement = document.querySelector(".page.landing")!
const pageOne: HTMLDivElement = document.querySelector(".page.one")!
const pageTwo: HTMLDivElement = document.querySelector(".page.two")!
const pageThree: HTMLDivElement = document.querySelector(".page.three")!
const pageFour: HTMLDivElement = document.querySelector(".page.four")!

const nextButtonLandingPage: HTMLDivElement = document.querySelector(".next-button#page-landing-next")!
const nextButtonPageOne: HTMLDivElement = document.querySelector(".next-button#page-one-next")!
const nextButtonPageTwo: HTMLDivElement = document.querySelector(".next-button#page-two-next")!

interface gradientStack {
    container: HTMLDivElement,
    primary: HTMLDivElement,
    secondary: HTMLDivElement,
    tertiary: HTMLDivElement
}

const fullPageGradients: gradientStack = {
    container: document.querySelector(".full-page-gradients")!,
    primary: document.querySelector(".full-page-gradients .primary")!,
    secondary: document.querySelector(".full-page-gradients .secondary")!,
    tertiary: document.querySelector(".full-page-gradients .tertiary")!
}

const screen: HTMLDivElement = document.querySelector(".screen") as HTMLDivElement
screen.style.opacity = "1";

// Unload landing page and load page one

nextButtonLandingPage.addEventListener("click", () => {

    landingPage.classList.add("hidden")
    pageOne.classList.remove("hidden")
    cardChoiceInterface.setActiveCard(cardChoiceInterface.activeCard.cardRepresentation)

})

// Unload page one and load page two

nextButtonPageOne.addEventListener("click", () => {
    pageOne.classList.add("hidden")
    pageTwo.classList.remove("hidden")
    pageThree.classList.add("hidden")

    let card: Card = cardChoiceInterface.activeCard
    parameters = {
        assertive: card.keywords.includes(Emotions.Assertive) ? 1 : 0,
        compassionate: card.keywords.includes(Emotions.Compassionate) ? 1 : 0,
        curious: card.keywords.includes(Emotions.Curious) ? 1 : 0,
        excited: card.keywords.includes(Emotions.Excited) ? 1 : 0,
        optimistic: card.keywords.includes(Emotions.Optimistic) ? 1 : 0,
        playful: card.keywords.includes(Emotions.Playful) ? 1 : 0,
    }

    prompt = new Prompt(card.agentType, parameters)
    let refinementContainer: HTMLDivElement = document.querySelector(".radial-interface")!

    // need to wait for animations to complete so the container is the correct size at init
    setTimeout( () => {shapePreviewInterface = new RadialPreview(prompt, refinementContainer) }, 1000)

    assignBackgroundColors(card)

})
// Unload page two and load page three

nextButtonPageTwo.addEventListener("click", () => {

    pageOne.classList.add("hidden")
    pageTwo.classList.add("hidden")
    pageThree.classList.remove("hidden")

    let traitPercentages: NodeList = document.querySelectorAll(".page.three .parameters-block .trait")
    let lineIndex: number = 0

    Object.keys(shapePreviewInterface.parameters).forEach( key => {

        let param: keyof KeywordParams = key as keyof KeywordParams

        if (shapePreviewInterface.parameters[param] > 0) {
            let keywordPercentageLines: HTMLDivElement[] = Array.from(traitPercentages) as HTMLDivElement[]

            let traitLine: HTMLDivElement = keywordPercentageLines.find(
                node => node.querySelector('.keyword')!.textContent === key) as HTMLDivElement

            if (traitLine) {
                let percentageSpan: HTMLSpanElement = traitLine.querySelector('.percentage')!
                traitLine.querySelector('.percentage')!.textContent = shapePreviewInterface.parameters[param].toString()
                traitLine.classList.add("selected")

                switch (lineIndex) {
                    case 0: traitLine.classList.add("first-visible")
                    break
                    case 1: traitLine.classList.add("second-visible")
                    break
                    case 2: traitLine.classList.add("third-visible")
                    break
                }

                lineIndex++

            }
        }
    })

    setTimeout( () => {
        pageThree.classList.add("hidden")
        pageFour.classList.remove("hidden")
    }, 3500)

})

function assignBackgroundColors(card: Card) {

    fullPageGradients.container.classList.add( card.cardRepresentation.id.toLowerCase(), "active" )
    fullPageGradients.primary.classList.add( card.keywords[0].toLowerCase() )
    fullPageGradients.secondary.classList.add( card.keywords[1].toLowerCase() )
    fullPageGradients.tertiary.classList.add( card.keywords[2].toLowerCase() )

}