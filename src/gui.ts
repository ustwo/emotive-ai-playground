import "./gui-style.css"
import "./colors.css"
import { Agent, Emotions, KeywordParams } from "./typeUtils.ts"
import { Prompt } from "./promptBuilder.ts"
import { CardChoiceInterface } from "./cardSelector.ts"
import { Card } from "./card.ts"
import { RadialPreview } from "./radialPreview.ts"
import { Conversation } from "./conversation.ts"

// MAIN entry to application.

let parameters: KeywordParams = null!
let prompt: Prompt = null!

const cardChoiceInterface: CardChoiceInterface = new CardChoiceInterface()
let shapePreviewInterface: RadialPreview = null!
let conversationInterface: Conversation = null!

const landingPage: HTMLDivElement = document.querySelector(".page.landing") as HTMLDivElement
const pageOne: HTMLDivElement = document.querySelector(".page.one") as HTMLDivElement
const pageTwo: HTMLDivElement = document.querySelector(".page.two") as HTMLDivElement
const pageThree: HTMLDivElement = document.querySelector(".page.three") as HTMLDivElement
const pageFour: HTMLDivElement = document.querySelector(".page.four") as HTMLDivElement

const nextButtonLandingPage: HTMLDivElement = document.querySelector(".next-button#page-landing-next") as HTMLDivElement
const nextButtonPageOne: HTMLDivElement = document.querySelector(".next-button#page-one-next") as HTMLDivElement
const nextButtonPageTwo: HTMLDivElement = document.querySelector(".next-button#page-two-next") as HTMLDivElement

const reshapeButton: HTMLDivElement = document.querySelector(".button.shape") as HTMLDivElement

const refinementContainer: HTMLDivElement = document.querySelector(".radial-interface")!


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

    // need to wait for animations to complete so the container is the correct size at init
    setTimeout( () => {shapePreviewInterface = new RadialPreview(prompt, refinementContainer) }, 1000)

    assignBackgroundColors(card)

})

// Unload page two and load page three with interstitial

nextButtonPageTwo.addEventListener("click", () => {

    pageOne.classList.add("hidden")
    pageTwo.classList.add("hidden")
    pageThree.classList.remove("hidden")

    let traitMeters: HTMLDivElement = document.querySelector(".page.three .parameters-block") as HTMLDivElement
    let lineIndex: number = 0

    Object.keys(shapePreviewInterface.parameters).forEach( key => {

        let param: keyof KeywordParams = key as keyof KeywordParams
        fullPageGradients.container.classList.remove("active")

        if (shapePreviewInterface.parameters[param] > 0) {
            
            let meter: HTMLDivElement = traitMeters.querySelector(`.trait.${key.toLowerCase()}`) as HTMLDivElement

            if (meter) {
                meter.classList.add("selected")

                switch (lineIndex) {
                    case 0: meter.classList.add("first-visible")
                    break
                    case 1: meter.classList.add("second-visible")
                    break
                    case 2: meter.classList.add("third-visible")
                    break
                }

                lineIndex++

            }
        }
    })

    // auto-load page four after animations

    setTimeout( () => {
        pageThree.classList.add("hidden")
        pageFour.classList.remove("hidden")
        conversationInterface = new Conversation(shapePreviewInterface.prompt)
    }, 3500)

})

// reload all

reshapeButton.addEventListener("click", () => {

    let dividers = refinementContainer.querySelectorAll(".divider-axes .axis")
    let axes = refinementContainer.querySelectorAll(".axes .axis")
    let previewText = document.querySelector(".conversation-text") as HTMLDivElement
    let chatMessages = document.querySelector(".message-scroll-area") as HTMLDivElement
    let chatCards = document.querySelector(".preselected-input-messages") as HTMLDivElement

    dividers.forEach( divider => { divider.classList.remove("visible") })
    axes.forEach( axis => { axis.classList.remove("active") })
    previewText.innerText = "Generating new preview text."
    previewText.classList.add("adjusting")
    chatMessages.innerHTML = ``
    chatCards.classList.remove("hidden")
    chatCards.innerHTML = ``
    for (let i = 0; i < 4; i++) {
        let newMessageCard = document.createElement("div")
        newMessageCard.classList.add("message")
        chatCards.append(newMessageCard)
    }

    parameters = null!
    prompt = null!
    shapePreviewInterface = null!

    let currentAgentType = conversationInterface.prompt.agentType
    let newCard: HTMLDivElement

    switch (currentAgentType) {
        case Agent.Financial:
            newCard = document.querySelector(".card#Financial") as HTMLDivElement
            break
        case Agent.Sales:
            newCard = document.querySelector(".card#Sales") as HTMLDivElement
            break
        case Agent.Productivity:
            newCard = document.querySelector(".card#Productivity") as HTMLDivElement
            break
        case Agent.Health:
        default:
            newCard = document.querySelector(".card#Health") as HTMLDivElement
    }


    pageTwo.classList.add("hidden")
    pageThree.classList.add("hidden")
    pageFour.classList.add("hidden")
    pageOne.classList.remove("hidden")



    if (newCard) { newCard.scrollIntoView({ behavior: "instant", block: "nearest", inline: "center" }) }

})

function assignBackgroundColors(card: Card) {

    fullPageGradients.container.classList.add( card.cardRepresentation.id.toLowerCase(), "active" )
    fullPageGradients.primary.classList.add( card.keywords[0].toLowerCase() )
    fullPageGradients.secondary.classList.add( card.keywords[1].toLowerCase() )
    fullPageGradients.tertiary.classList.add( card.keywords[2].toLowerCase() )

}