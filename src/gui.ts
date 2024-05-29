import "./colors.css"
import "./desktop-breakpoints.css"
import "./mobile-breakpoints.css"
import "./gui-style.css"
import { Agent, Emotions, KeywordParams } from "./typeUtils.ts"
import { Prompt } from "./promptBuilder.ts"
import { CardChoiceInterface } from "./cardSelector.ts"
import { Card } from "./card.ts"
import { RadialPreview } from "./radialPreview.ts"
import { Conversation } from "./conversation.ts"
import { ShapeGenerator } from "./shapePreview.ts";

// MAIN entry to application.

let parameters: KeywordParams = null!
let prompt: Prompt = null!

let cardChoiceInterface: CardChoiceInterface = new CardChoiceInterface()
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
const shareButton: HTMLDivElement = document.querySelector(".button.share") as HTMLDivElement

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

const queryString = window.location.search
if (queryString.length > 0) { parseQuery(queryString) }

// Unload landing page and load page one

nextButtonLandingPage.addEventListener("click", () => {

    landingPage.classList.add("hidden")
    pageOne.classList.remove("hidden")
    cardChoiceInterface.interfaceExists = true
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
    let traitClouds: NodeList = document.querySelectorAll(".page.three .shape-avatar-preview .card-backgrounds div")

    let agentTitle: HTMLSpanElement = document.querySelector(".page.three .page-title span.job") as HTMLSpanElement
    let agentCode: HTMLSpanElement = document.querySelector(".page.three .page-title span.trait-code") as HTMLSpanElement

    let traits: string = ""
    let icon: HTMLDivElement = document.querySelector(".page.three .agent-icon") as HTMLDivElement

    Object.keys(shapePreviewInterface.parameters).forEach( key => {

        let param: keyof KeywordParams = key as keyof KeywordParams
        if (shapePreviewInterface.parameters[param] < 1) return

        traits += key[0]

        fullPageGradients.container.classList.remove("active")
        let meter: HTMLDivElement = traitMeters.querySelector(`.trait.${key.toLowerCase()}`) as HTMLDivElement
        if (meter) {
            meter.classList.add("selected")
            let progressBar: HTMLDivElement = meter.querySelector(".progress-bar") as HTMLDivElement
            let color: string
            switch (shapePreviewInterface.prompt.agentType) {
                case Agent.Health:
                    color = "var(--primary-health)"
                    icon.innerHTML = `<svg width="21" height="21" xmlns="http://www.w3.org/2000/svg"><use href="#sym-wellness"></use></svg>`
                    break
                case Agent.Financial:
                    color = "var(--primary-financial)"
                    icon.innerHTML = `<svg width="21" height="21" xmlns="http://www.w3.org/2000/svg"><use href="#sym-financial"></use></svg>`
                    break
                case Agent.Sales:
                    color = "var(--primary-sales)"
                    icon.innerHTML = `<svg width="21" height="21" xmlns="http://www.w3.org/2000/svg"><use href="#sym-sales"></use></svg>`
                    break
                case Agent.Productivity:
                default:
                    color = "var(--primary-productivity)"
                    icon.innerHTML = `<svg width="21" height="21" xmlns="http://www.w3.org/2000/svg"><use href="#sym-productivity"></use></svg>`
                    break
            }
            progressBar.style.background = `conic-gradient(${color} ${shapePreviewInterface.parameters[param]}%, #00000011 0% 100%)`
        }

        traitClouds.forEach( node => {
            let cloud: HTMLDivElement = node as HTMLDivElement
            if (cloud.classList[0] === key) cloud.classList.add("visible")
        })

    })

    agentTitle.innerText = shapePreviewInterface.prompt.agentType
    agentCode.innerText = traits

    const shapeContainer: HTMLDivElement = document.querySelector(".shape-avatar-preview .constructed-shape") as HTMLDivElement
    const shapeGenerator: ShapeGenerator = new ShapeGenerator(shapeContainer, shapePreviewInterface.parameters)

    // auto-load page four after animations

    setTimeout( () => {
        pageThree.classList.add("hidden")
        pageFour.classList.remove("hidden")
        conversationInterface = new Conversation(shapePreviewInterface.prompt)
    }, 3500)

})

// reload all

reshapeButton.addEventListener("click", () => {

    let currentAgentType = conversationInterface.prompt.agentType
    let agentId: number = null!
    let queryString: string = ""

    switch (currentAgentType) {
        case Agent.Health:
            agentId = 0
            break
        case Agent.Financial:
            agentId = 1
            break
        case Agent.Sales:
            agentId = 2
            break
        case Agent.Productivity:
            agentId = 3
            break
        default:
    }

    if (agentId !== null) {
        queryString = `?agent=${agentId}`
    }

    window.location.href = `https://emotive-ai.ustwo.com/${queryString}`

})

function assignBackgroundColors(card: Card) {

    fullPageGradients.container.classList.add( card.cardRepresentation.id.toLowerCase(), "active" )
    fullPageGradients.primary.classList.add( card.keywords[0].toLowerCase() )
    fullPageGradients.secondary.classList.add( card.keywords[1].toLowerCase() )
    fullPageGradients.tertiary.classList.add( card.keywords[2].toLowerCase() )

}

/*

URL Query Format

?agent=0&as=0&co=0&cu=0&ex=0&op=0&pl=0&refer=0&chat=1

agent: 0-3 mapped to Agent type
as: assertive 0-75
co: compassionate 0-75
cu: curious 0-75
ex: excited 0-75
op: optimistic 0-75
pl: playful 0-75
date: Month-0 date for quote
refer: 0 shared, 1 from creator

test string should create sales rep with 45 assertive, 75 curious and 60 optimistic: ?agent=2&as=45&cu=75&op=60&refer=1

*/

function parseQuery(query: string) {

    const urlParams = new URLSearchParams(query)
    let chat: number = Number(urlParams.get("chat"))
    let agentQueryCode: number = Number(urlParams.get("agent"))

    if (chat > 0 && agentQueryCode <= 3) {

        // load only conversataion page with set parameters

        nextButtonLandingPage.remove()
        const landingMessage: HTMLDivElement = document.querySelector(".page.landing .subtitle") as HTMLDivElement
        landingMessage.innerHTML = `
            <div class="conversation-spinner adjusting">
                <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <use href="#spinner"></use>
                </svg>
                Regenerating your agent.
            </div>
        `

        const agentTypes: Map<number, Agent> = new Map()
        agentTypes.set(0, Agent.Health)
        agentTypes.set(1, Agent.Financial)
        agentTypes.set(2, Agent.Sales)
        agentTypes.set(3, Agent.Productivity)

        const queryParameters: KeywordParams = {
            assertive: urlParams.get("as") ? Number(urlParams.get("as")) : 0 ,
            compassionate: urlParams.get("co") ? Number(urlParams.get("co")) : 0 ,
            curious: urlParams.get("cu") ? Number(urlParams.get("cu")) : 0 ,
            excited: urlParams.get("ex") ? Number(urlParams.get("ex")) : 0 ,
            optimistic: urlParams.get("op") ? Number(urlParams.get("op")) : 0 ,
            playful: urlParams.get("pl") ? Number(urlParams.get("pl")) : 0
        }

        let queryAgent: Agent = agentTypes.get(agentQueryCode) as Agent
        let queryPrompt = new Prompt(queryAgent, queryParameters)

        let promptMessage: string = "set personality keyword values to: "

        Object.keys(queryParameters).forEach( key => {
            let parameter: keyof KeywordParams = key as keyof KeywordParams
            if (queryParameters[parameter] > 0) {
                let parameterValue = Math.floor((queryParameters[parameter] / 15) * 0.5)
                promptMessage += `${key} ${parameterValue} `
            }
        })

        let request = queryPrompt.makeLLMRequest("user", promptMessage).then( () => {
            landingPage.classList.add("hidden")
            pageFour.classList.remove("hidden")

            shareButton.remove()

            const screenContainer: HTMLDivElement = document.querySelector(".screen") as HTMLDivElement
            let screenClass: string = ""

            switch (queryAgent) {
                case Agent.Health:
                    screenClass = "health-coach-bg"
                    break
                case Agent.Financial:
                    screenClass = "financial-adviser-bg"
                    break
                case Agent.Sales:
                    screenClass = "sales-representative-bg"
                    break
                case Agent.Productivity:
                    screenClass = "productivity-partner-bg"
                    break
                default: break
            }

            screenContainer.classList.add(screenClass)

            conversationInterface = new Conversation(queryPrompt)
        })

    }

    else if (chat < 1 && agentQueryCode <= 3) {

        // skip landing page and select agent card

        let newCard: HTMLDivElement = null!

        switch (agentQueryCode) {
            case 0:
                newCard = document.querySelector(".card#Health") as HTMLDivElement
                break
            case 1:
                newCard = document.querySelector(".card#Financial") as HTMLDivElement
                break
            case 2:
                newCard = document.querySelector(".card#Sales") as HTMLDivElement
                break
            case 3:
                newCard = document.querySelector(".card#Productivity") as HTMLDivElement
                break
            default:
        }

        landingPage.classList.add("hidden")
        pageOne.classList.remove("hidden")
        cardChoiceInterface.setActiveCard(newCard)

        if (newCard !== null) { newCard.scrollIntoView({ behavior: "instant", block: "nearest", inline: "center" }) }

    }

    if (agentQueryCode > 3) { return }

}

shareButton.addEventListener("click", () => {
    window.open(`http://emotive-ai.ustwo.com/sharecard/${makeSharedURLQuery()}`, "_blank")
})

function makeSharedURLQuery(refer: boolean = true): string {

    let sharedURLQuery: string = "?"

    let agentQueryCode: number = 0
    switch (prompt.agentType) {
        case Agent.Health:
            agentQueryCode = 0
            break
        case Agent.Financial:
            agentQueryCode = 1
            break
        case Agent.Sales:
            agentQueryCode = 2
            break
        case Agent.Productivity:
           agentQueryCode = 3
           break
    }

    sharedURLQuery += `agent=${agentQueryCode}&`
    if (shapePreviewInterface.parameters.assertive > 10) { sharedURLQuery += `as=${shapePreviewInterface.parameters.assertive}&` }
    if (shapePreviewInterface.parameters.compassionate > 10) { sharedURLQuery += `co=${shapePreviewInterface.parameters.compassionate}&` }
    if (shapePreviewInterface.parameters.curious > 10) { sharedURLQuery += `cu=${shapePreviewInterface.parameters.curious}&` }
    if (shapePreviewInterface.parameters.excited > 10) { sharedURLQuery += `ex=${shapePreviewInterface.parameters.excited}&` }
    if (shapePreviewInterface.parameters.optimistic > 10) { sharedURLQuery += `op=${shapePreviewInterface.parameters.optimistic}&` }
    if (shapePreviewInterface.parameters.playful > 10) { sharedURLQuery += `pl=${shapePreviewInterface.parameters.playful}&` }

    let stringDate: string = new Date().toDateString()
    let split: string[] = stringDate.split(" ")
    sharedURLQuery += `date=${split[1]}-${split[2]}&`

    if (refer) { sharedURLQuery += `refer=0`}

    return sharedURLQuery

}