/*

URL Query Format

?agent=0&as=0&co=0&cu=0&ex=0&op=0&pl=0&refer=0

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

import {Agent, KeywordParams} from "./typeUtils.ts"
import {ShapeGenerator} from "./shapePreview.ts";
import "./colors.css"
import "./cards.css"
import "./gui-style.css"
import "./share.css"
import "./mobile-breakpoints.css"
import "./desktop-breakpoints.css"

interface Quote {
    quote: string,
    attribution: string
}

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)

let agentQueryCode: number = Number(urlParams.get("agent"))
//if (!agentQueryCode) { window.location.href = 'https://emotive-ai.ustwo.com' }
const referFromCreatorApp: boolean = Number(urlParams.get("refer")) == 1

const agentTypes: Map<number, Agent> = new Map()
agentTypes.set(0, Agent.Health)
agentTypes.set(1, Agent.Financial)
agentTypes.set(2, Agent.Sales)
agentTypes.set(3, Agent.Productivity)

const agentParameters: KeywordParams = {
    assertive: urlParams.get("as") ? Number(urlParams.get("as")) : 0 ,
    compassionate: urlParams.get("co") ? Number(urlParams.get("co")) : 0 ,
    curious: urlParams.get("cu") ? Number(urlParams.get("cu")) : 0 ,
    excited: urlParams.get("ex") ? Number(urlParams.get("ex")) : 0 ,
    optimistic: urlParams.get("op") ? Number(urlParams.get("op")) : 0 ,
    playful: urlParams.get("pl") ? Number(urlParams.get("pl")) : 0 
}

let cardDate: string
if (urlParams.get("date")) {
    let split: string[] = urlParams.get("date")!.split("-")
    cardDate = `${split[0]} ${split[1]}`
} else {
    let today = new Date()
    let stringDate: string = today.toDateString()
    let split: string[] = stringDate.split(" ")
    cardDate = `${split[1]} ${split[2]}`
}

let agent: Agent = agentTypes.get(agentQueryCode) as Agent
let code: string = ""
let params: string = ""

const screenContainer: HTMLDivElement = document.querySelector(".screen") as HTMLDivElement
const card: HTMLDivElement = document.querySelector(".card") as HTMLDivElement

let screenClass: string = ""
let iconSvgId: string = ""

switch (agent) {
    case Agent.Health:
        screenClass = "health-coach-bg"
        iconSvgId = "sym-wellness"
        setThemeColor("#F0F1FA")
        break
    case Agent.Financial:
        screenClass = "financial-adviser-bg"
        iconSvgId = "sym-financial"
        setThemeColor("#FDFCF5")
        break
    case Agent.Sales:
        screenClass = "sales-representative-bg"
        iconSvgId = "sym-sales"
        setThemeColor("#FFF7F5")
        break
    case Agent.Productivity:
        screenClass = "productivity-parter-bg"
        iconSvgId = "sym-productivity"
        setThemeColor("#F9FDF7")
        break
    default: break
}

Object.keys(agentParameters).forEach( key => {
    
    let keyword: keyof KeywordParams = key as keyof KeywordParams
    
    if (agentParameters[keyword] > 0) {
        code += key[0].toUpperCase()
        params += `${key}: ${agentParameters[keyword]}, `
    }
    
})

screenContainer.classList.add(screenClass)

const pageHeader: HTMLDivElement = document.querySelector(".page-title") as HTMLDivElement
const pageFooter: HTMLDivElement = document.querySelector(".footer") as HTMLDivElement

if (referFromCreatorApp) { setUpSharedCard() }
else { setUpCreatedCard() }

function setUpCreatedCard() {

    const unusedCard: HTMLDivElement = document.querySelector(".card-content#shared") as HTMLDivElement
    pageHeader.remove()
    unusedCard.remove()

    document.querySelector(".page.share")!.classList.add("reverse")

    const cardContent: HTMLDivElement = document.querySelector(".card-content#created") as HTMLDivElement
    const icon: HTMLDivElement = cardContent.querySelector(".cell.top.center#created-card-top-icon") as HTMLDivElement
    const shapeSection: HTMLDivElement = cardContent.querySelector(".shape-avatar-preview") as HTMLDivElement
    const traitContainer: HTMLDivElement = cardContent.querySelector(".shape-avatar-preview .card-backgrounds") as HTMLDivElement
    const shapeContainer: HTMLDivElement = cardContent.querySelector(".shape-avatar-preview .constructed-shape") as HTMLDivElement
    const traitClouds: NodeList = cardContent.querySelectorAll(".shape-avatar-preview .card-backgrounds div")
    const traitIcons: HTMLDivElement[] = Array.from(cardContent.querySelectorAll(".cell.icon"))
    const cardTitle: HTMLDivElement = cardContent.querySelector(".cell.top.left") as HTMLDivElement

    cardTitle.innerHTML = `${agent}<br>${code}`

    icon.innerHTML = `
        <svg width="21" height="21" xmlns="http://www.w3.org/2000/svg">
        <use href="#${iconSvgId}"></use>
        </svg>
    `

    Object.keys(agentParameters).forEach( key => {
        if (agentParameters[key as keyof KeywordParams] < 10) return

        traitClouds.forEach( node => {
            let cloud: HTMLDivElement = node as HTMLDivElement
            if (cloud.classList[0] === key) cloud.classList.add("visible")
        })

        traitIcons[0].innerHTML = `
            <div class="icon-with-label">
                <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                    <use href="#sym-${key}"></use>
                </svg>
                <span class="corner-label">${key}</span>
            </div>
        `
        traitIcons.shift()

    })

    let shapeGenerator: ShapeGenerator = null!

    function setupShape() {

        let shapeSize: DOMRect = shapeSection.getBoundingClientRect()
        shapeSection.style.height = `${shapeSize.width}px`
        traitContainer.style.height = `${shapeSize.width}px`
        shapeContainer.style.height = `${shapeSize.width}px`

        shapeGenerator = new ShapeGenerator(shapeContainer, agentParameters)

    }

    setTimeout(() => { setupShape() }, 50)

    window.addEventListener("resize", () => {
        shapeGenerator.svg.remove()
        shapeGenerator = null!
        setupShape()
    })

    const quoteBlock: HTMLDivElement = cardContent.querySelector(".quote") as HTMLDivElement
    const quoteDate: HTMLDivElement = cardContent.querySelector(".quote .date") as HTMLDivElement
    const quoteText: HTMLSpanElement = quoteBlock.querySelector("span#agent-quote") as HTMLSpanElement
    const quoteCredit: HTMLSpanElement = quoteBlock.querySelector("span#quote-attribution") as HTMLSpanElement

    const quote: Quote = getQuote(agent)
    quoteBlock.style.opacity = null!
    quoteDate.innerText = cardDate
    quoteText.innerText = quote.quote
    quoteCredit.innerText = quote.attribution

    const flipButton: HTMLDivElement = cardContent.querySelector(".flip-button") as HTMLDivElement
    flipButton.addEventListener("click", () => {card.classList.toggle("flipped")})

    const shareButton: HTMLDivElement = document.querySelector(".next-button#share") as HTMLDivElement
    shareButton.addEventListener("click", () => {
        navigator.share({ url: `https://emotive-ai.ustwo.com/sharecard/${makeSharedURLQuery()}` })
    })
}

function setUpSharedCard() {
    
    const unusedCard: HTMLDivElement = document.querySelector(".card-content#created") as HTMLDivElement
    pageFooter.remove()
    unusedCard.remove()

    
    const cardContent: HTMLDivElement = document.querySelector(".card-content#shared") as HTMLDivElement
    const icon: HTMLDivElement = cardContent.querySelector(".cell.top.center#share-card-top-icon") as HTMLDivElement
    const agentCodeGreeting: HTMLSpanElement = cardContent.querySelector(".intro span.code") as HTMLSpanElement
    const agentJobGreeting: HTMLSpanElement = cardContent.querySelector(".intro span.job") as HTMLSpanElement
    const shapeSection: HTMLDivElement = cardContent.querySelector(".shape-avatar-preview") as HTMLDivElement
    const traitContainer: HTMLDivElement = cardContent.querySelector(".shape-avatar-preview .card-backgrounds") as HTMLDivElement
    const shapeContainer: HTMLDivElement = cardContent.querySelector(".shape-avatar-preview .constructed-shape") as HTMLDivElement
    const traitClouds: NodeList = cardContent.querySelectorAll(".shape-avatar-preview .card-backgrounds div")
    const traitIcons: HTMLDivElement[] = Array.from(cardContent.querySelectorAll(".cell.icon"))

    agentCodeGreeting.innerText = code
    agentJobGreeting.innerText = agent
    
    icon.innerHTML = `
        <svg width="21" height="21" xmlns="http://www.w3.org/2000/svg">
        <use href="#${iconSvgId}"></use>
        </svg>
    `

    Object.keys(agentParameters).forEach( key => {
        if (agentParameters[key as keyof KeywordParams] < 10) return

        traitClouds.forEach( node => {
            let cloud: HTMLDivElement = node as HTMLDivElement
            if (cloud.classList[0] === key) cloud.classList.add("visible")
        })

        traitIcons[0].innerHTML = `
            <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <use href="#sym-${key}"></use>
            </svg>
        `
        traitIcons.shift()

    })

    let shapeGenerator: ShapeGenerator = null!

    function setupShape() {

        let shapeSize: DOMRect = shapeSection.getBoundingClientRect()
        shapeSection.style.width = `${shapeSize.height}px`
        traitContainer.style.width = `${shapeSize.height}px`
        shapeContainer.style.width = `${shapeSize.height}px`

        shapeGenerator = new ShapeGenerator(shapeContainer, agentParameters)

    }

    setupShape()
    
    window.addEventListener("resize", () => {
        shapeGenerator.svg.remove()
        shapeGenerator = null!
        setupShape()
    })

    const chatButton: HTMLDivElement = cardContent.querySelector(".chat-button") as HTMLDivElement
    const shapeButton: HTMLDivElement = cardContent.querySelector(".next-button#shape") as HTMLDivElement

    chatButton.addEventListener("click", () => { window.location.href= `https://emotive-ai.ustwo.com/${makeSharedURLQuery()}&chat=1` })
    shapeButton.addEventListener("click", () => { window.location.href = "https://emotive-ai.ustwo.com/" })

}
function setThemeColor(color: string) {

    let metaThemeColor: HTMLMetaElement = document.querySelector('meta[name="theme-color"]')!
        
    if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta')
        metaThemeColor.name = 'theme-color'
        document.getElementsByTagName('head')[0].appendChild(metaThemeColor)
    }

    metaThemeColor.setAttribute("content", color)
        
}

function makeSharedURLQuery(refer: boolean = true): string {

    let sharedURLQuery: string = "?"

    sharedURLQuery += `agent=${agentQueryCode}&`
    if (agentParameters.assertive > 10) { sharedURLQuery += `as=${agentParameters.assertive}&` }
    if (agentParameters.compassionate > 10) { sharedURLQuery += `co=${agentParameters.compassionate}&` }
    if (agentParameters.curious > 10) { sharedURLQuery += `cu=${agentParameters.curious}&` }
    if (agentParameters.excited > 10) { sharedURLQuery += `ex=${agentParameters.excited}&` }
    if (agentParameters.optimistic > 10) { sharedURLQuery += `op=${agentParameters.optimistic}&` }
    if (agentParameters.playful > 10) { sharedURLQuery += `pl=${agentParameters.playful}&` }
    if (cardDate) {
        let reSplit: string[] = cardDate.split(" ")
        sharedURLQuery += `date=${reSplit[0]}-${reSplit[1]}`
}
    if (refer) { sharedURLQuery += `&refer=1`}

    return sharedURLQuery

}

function getQuote(agentType: Agent): Quote {

    const healthQuotes: Quote[] = [
        {quote:"You can’t stop the waves, but you can learn to surf", attribution: "Jon Kabat-Zinn"},
        {quote: "Self-care is not selfish. You cannot serve from an empty vessel", attribution: "Eleanor Brown"},
        {quote: "The greatest wealth is health", attribution: "Virgil"}
    ]

    const financialQuotes: Quote[] = [
        {quote: "Expect the best. Prepare for the worst. Capitalize on what comes", attribution: "Zig Ziglar"},
        {quote: "Money grows on the tree of persistence", attribution: "Japanese proverb"},
        {quote: "Being rich is having money; being wealthy is having time", attribution: "Margaret Bonnano"}
    ]

    const salesQuotes: Quote[] = [
        {quote: "The golden rule for every business is this: Put yourself in your customer’s place", attribution: "Orison Swett Marden"},
        {quote: "Ninety percent of selling is conviction and ten percent is persuasion", attribution: "Shiv Khera"},
        {quote: "Don’t find customers for your products, find products for your customers", attribution: "Seth Godin"}
    ]

    const productivityQuotes: Quote[] = [
        {quote: "I am who I am today because of the choices I made yesterday", attribution: "Eleanor Roosevelt"},
        {quote: "Where your attention goes, your time goes", attribution: "Idowu Koyenikan"},
        {quote: "Fall in love with the process, and the results will come", attribution: "Eric Thomas"}
    ]

    const randomInt03: number = Math.floor(Math.random() * 3)

    switch (agentType) {
        case Agent.Health:
            return healthQuotes[randomInt03]
        case Agent.Financial:
            return financialQuotes[randomInt03]
        case Agent.Sales:
            return salesQuotes[randomInt03]
        case Agent.Productivity:
            return productivityQuotes[randomInt03]
    }

}