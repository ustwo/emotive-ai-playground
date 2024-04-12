import "./radial-interfaces.css"
import { Prompt } from "./promptBuilder.ts"
import { Emotions, Agent, KeywordParams } from "./typeUtils.ts"

export class RadialPreview {
    
    prompt: Prompt
    parameters: KeywordParams = {
        assertive: 0,
        compassionate: 0,
        curious: 0,
        excited: 0,
        optimistic: 0,
        playful: 0
    }
    
    container: HTMLDivElement
    handles: NodeList
    
    keywordText: NodeList
    axisLabels: NodeList
    
    isDragging: Boolean = false
    activeHandle: HTMLDivElement = null!
    touchStartCoordinates: {x: number, y: number} = {x: 0, y: 0}

    editButton: HTMLDivElement = document.querySelector(".page-two-content .edit-button")!

    interfaceCenterpoint:  {x: number, y: number} = {x: 0, y: 0}
    containerDimensions: {x: number, y: number} = {x: 0, y: 0}
    
    polygonSVG: SVGSVGElement
    polygon: SVGPolygonElement = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
    
    constructor(prompt: Prompt, container: HTMLDivElement) {
        
        this.prompt = prompt
        
        this.container = container
        this.handles = container.querySelectorAll(".handle")!
        this.axisLabels = container.querySelectorAll(".axis-label")
        this.polygonSVG = this.container.querySelector("svg")!

        this.keywordText = document.querySelectorAll(".page.two span.keyword")

        this.updateContainerDimensions()
        this.drawPolygon()
        this.setKeywords()
        
        this.axisLabels.forEach( node => {
            let label: HTMLDivElement = node as HTMLDivElement
            label.addEventListener("click", this.toggleParameter.bind(this))
        })

        this.setupHandles()

    }
    
    setKeywords() {
        
        // This set of parameters is a percentage for positioning handles.

        Object.keys(this.parameters).forEach( key => {
            let parameter: keyof KeywordParams = key as keyof KeywordParams
            this.parameters[parameter] = this.prompt.parameters[parameter] * 50
        })
        
        let highest: string[] = []
        
        Object.entries(this.parameters).forEach( ([key, value]) => {
            // capitalizes the keyword
            key = key.charAt(0).toUpperCase() + key.slice(1);

            if (value > 50) {
                highest.push(key)
                this.axisLabels.forEach( node => {
                    let label: HTMLDivElement = node as HTMLDivElement
                    label.innerText === key.toUpperCase() && label.classList.add("active")
                })
            }
            
        })
        
        this.keywordText.forEach((node) => {
            let textSpan: HTMLSpanElement = node as HTMLSpanElement
            const randomIndex = Math.floor(Math.random() * highest.length);
            textSpan.innerText = highest[randomIndex]
            
            // remove entry to prevent duplicates
            highest.splice(randomIndex, 1)
            
        })
        
        this.setHandlePositions()
        
    }
    
    setupHandles() {

        const calculateDistance = (start: {x: number, y: number}, end: {x: number, y: number}): number => {
            return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        }

        const clearActiveHandle = (e: Event, handle: HTMLDivElement) => {
            e.preventDefault()
            handle.classList.remove("active")
            this.activeHandle = null!
            this.isDragging = false
        }

        const updateHandlePosition = (e: PointerEvent, handle: HTMLDivElement) => {
            e.preventDefault()
            e.stopPropagation()

            if (!this.isDragging) return

            let currentCoordinates: {x: number, y: number} = {x: e.clientX, y: e.clientY}
            let delta: number = calculateDistance(this.interfaceCenterpoint, currentCoordinates)
            let percentage: number = (delta / (this.containerDimensions.y * 0.5)) * 100

            percentage >= 100 ? percentage = 100 : null // clamp percentage at 100
            handle.style.bottom = `${percentage}%`
            this.drawPolygon()
        }

        this.handles.forEach( handleNode => {

            let handle: HTMLDivElement = handleNode as HTMLDivElement

            handle.addEventListener("pointerdown", e => {
                e.preventDefault()
                this.touchStartCoordinates = {x: e.clientX, y: e.clientY}
                handle.classList.add("active")
                this.activeHandle = handle
                this.isDragging = true
            }, true)

            handle.addEventListener("pointermove", e => { updateHandlePosition(e, handle) }, true)

            handle.addEventListener("pointerup", e => { clearActiveHandle(e, handle) }, true)
            handle.addEventListener("pointerleave", e => {
                if (!this.isDragging) { clearActiveHandle(e, handle) }
            }, true)

        })

        this.container.addEventListener("pointerup", e => {
            if (!this.isDragging) return
            else {
                clearActiveHandle(e, this.activeHandle)
            }
        })

        this.container.addEventListener("pointermove", e => {
            if (this.isDragging) { updateHandlePosition(e, this.activeHandle) }
        })

    }

    toggleParameter(e: Event) {

        let label: HTMLDivElement = e.target as HTMLDivElement
        let parameterID: keyof KeywordParams = label.innerText.toLowerCase() as keyof KeywordParams

        // how many values are over 2?
        let maxedParamCount: number = 0
        Object.keys(this.prompt.parameters).forEach( key => {
            let param: keyof KeywordParams = key as keyof KeywordParams
            if (this.prompt.parameters[param] > 1) { maxedParamCount++ }
        })

        // if there are already 3, remove the first one
        if (maxedParamCount > 2 && !label.classList.contains("active")) {
            let firstKeyword: HTMLDivElement = this.keywordText[0] as HTMLDivElement
            let paramKey: keyof KeywordParams = firstKeyword.innerText.toLowerCase() as keyof KeywordParams
            this.prompt.parameters[paramKey] = 0
            this.axisLabels.forEach( node => {
                let label: HTMLDivElement = node as HTMLDivElement
                if (label.innerText.toLowerCase() == paramKey) { label.classList.remove("active")}
            })
        }

        // turning one off? need to find one to turn back on.

        if (label.classList.contains("active")) {
            let didToggle: Boolean = false
            Object.keys(this.prompt.parameters).forEach( key => {
                if (didToggle) return
                let param: keyof KeywordParams = key as keyof KeywordParams
                let value = this.prompt.parameters[param]
                if (value < 1) {
                    this.prompt.parameters[param] = 2
                    didToggle = true
                }
            })
            this.prompt.parameters[parameterID] = 0
            label.classList.remove("active")
        }

        else {
            this.prompt.parameters[parameterID] = 2
            label.classList.add("active")
        }
        this.setKeywords()
    }
    
    setHandlePositions() {
        
        this.handles.forEach( node => {
            let handle: HTMLDivElement = node as HTMLDivElement
            let idKey: keyof KeywordParams = handle.id as keyof KeywordParams
            handle.style.bottom = `${this.parameters[idKey] * 0.5}%`
        })
        
        this.drawPolygon()
    }
    updateContainerDimensions() {
        
        // calculate overall dimensions and centerpoint of the DOM container
        // that holds the radial interface, and set the height of the container
        // element to match its width to force concentric circles
        
        let rect = this.container.getBoundingClientRect()
        let largest: number
        rect.width > rect.height ? largest = rect.width : largest = rect.height
        
        this.containerDimensions = {x: largest, y: largest} // trust me bro
        this.interfaceCenterpoint.x = (rect.width + (rect.x * 2)) * 0.5
        this.interfaceCenterpoint.y = (rect.height + (rect.y * 2)) * 0.5

    }
    
    drawPolygon() {
        
        let points: string = ""
        
        this.handles.forEach( node => {
            const handle = node as HTMLDivElement
            let idKey: keyof KeywordParams = handle.id as keyof KeywordParams

//            if (idKey.includes("_") { idkey.pop() }

//            if (this.parameters && this.parameters[idKey] < 50) return
            let rect =  handle.getBoundingClientRect()
            let x: number = rect.x + (rect.width * 0.5)
            let y: number = rect.y + (rect.height * 0.5)
            points += `${x.toFixed(0)},${y.toFixed(0)} `
        })
        
        this.polygon.setAttribute("points", points);
        
        this.polygonSVG.appendChild(this.polygon);
        
    }

    returnPrompt() {

        let newParameters: KeywordParams = {
            assertive: 0,
            compassionate: 0,
            curious: 0,
            excited: 0,
            optimistic: 0,
            playful: 0
        }

        Object.keys(this.parameters).forEach( key => {

            // convert percentages to 0-2 values

            let param: keyof KeywordParams = key as keyof KeywordParams
            let paramValue: number = this.parameters[param]
            newParameters[param] = paramValue * 0.02

        })

        return new Prompt(this.prompt.agentType, newParameters)

    }
}