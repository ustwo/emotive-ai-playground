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
refer: 0 shared, 1 from creator

test string should create sales rep with 45 assertive, 75 curious and 60 optimistic: ?agent=2&as=45&cu=75&op=60&refer=1

*/

import { Agent, KeywordParams } from "./typeUtils.ts"
import { ShapeGenerator } from "./shapePreview.ts";
import "./colors.css"
import "./cards.css"
import "./gui-style.css"
import "./share.css"

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)

let agentQueryCode: number = Number(urlParams.get("agent"))
if (!agentQueryCode) { window.location.href = 'https://emotive-ai.ustwo.com'; }

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

let agent: Agent = agentTypes.get(agentQueryCode) as Agent
let code: string = ""
let params: string = ""

const screenContainer: HTMLDivElement = document.querySelector(".screen") as HTMLDivElement
let screenClass: string = ""

switch (agent) {
    case Agent.Health:
        screenClass = "health-coach-bg"
        setThemeColor("#F0F1FA")
        break
    case Agent.Financial:
        screenClass = "financial-adviser-bg"
        setThemeColor("#FDFCF5")
        break
    case Agent.Sales:
        screenClass = "sales-representative-bg"
        setThemeColor("#FFF7F5")
        break
    case Agent.Productivity:
        screenClass = "productivity-parter-bg"
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
else { pageHeader.remove() }

function setUpSharedCard() {
    
    pageFooter.remove()
    
    const cardContent: HTMLDivElement = document.querySelector(".card-content#shared") as HTMLDivElement
    const agentCodeGreeting: HTMLSpanElement = cardContent.querySelector(".intro span.code") as HTMLSpanElement
    const agentJobGreeting: HTMLSpanElement = cardContent.querySelector(".intro span.job") as HTMLSpanElement
    const shapeContainer: HTMLDivElement = cardContent.querySelector(".shape-avatar-preview .constructed-shape") as HTMLDivElement
    const traitClouds: NodeList = cardContent.querySelectorAll(".shape-avatar-preview .card-backgrounds div")

    agentCodeGreeting.innerText = code
    agentJobGreeting.innerText = agent
    
    Object.keys(agentParameters).forEach( key => {
        if (agentParameters[key as keyof KeywordParams] < 10) return
        traitClouds.forEach( node => {
            let cloud: HTMLDivElement = node as HTMLDivElement
            if (cloud.classList[0] === key) cloud.classList.add("visible")
        })
    })
    
    const shapeGenerator: ShapeGenerator = new ShapeGenerator(shapeContainer, agentParameters)

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