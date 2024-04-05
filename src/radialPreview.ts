import "./radialTest.css"
import { Prompt } from "./promptBuilder.ts"
import { Emotions, Agent, KeywordParams } from "./typeUtils.ts"

export class RadialPreview {
    
    prompt: Prompt
    parameters: KeywordParams = null!
    
    container: HTMLDivElement = document.querySelector(".polygon-preview")!
    handles: NodeList = document.querySelectorAll(".handle")!
    
    keywordText: NodeList = document.querySelectorAll(".page.two span.keyword")
    axisLabels: NodeList = document.querySelectorAll(".page.two .axis-label")
    
    isDragging: Boolean = false
    activeHandle: HTMLDivElement = null!
    touchStartCoordinates: {x: number, y: number} = {x: 0, y: 0}
    interfaceCenterpoint:  {x: number, y: number} = {x: 0, y: 0}
    containerDimensions: {x: number, y: number} = {x: 0, y: 0}
    
    polygonSVG: SVGSVGElement = document.querySelector("#polygon")!
    polygon: SVGPolygonElement = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
    
    constructor(prompt: Prompt) {
        
        this.prompt = prompt
        
        this.updateContainerDimensions()
        this.setupHandles()
        this.drawPolygon()
        this.setKeywords()
        
    }
    
    setKeywords() {
        
        // This set of parameters is a percentage for positioning handles.
        
        this.parameters = {
            assertive: this.prompt.assertive * 50,
            compassionate: this.prompt.compassionate * 50,
            curious: this.prompt.curious * 50,
            excited: this.prompt.excited * 50,
            optimistic: this.prompt.optimistic * 50,
            playful: this.prompt.playful * 50
        }
        
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
    
    setHandlePositions() {
        
        this.handles.forEach( node => {
            let handle: HTMLDivElement = node as HTMLDivElement
            let idKey: keyof KeywordParams = handle.id as keyof KeywordParams
            handle.style.bottom = `${this.parameters[idKey] * 0.75}%`
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
//        this.container.style.width = `${this.containerDimensions.x}px`
//        this.container.style.height = `${this.containerDimensions.y}px`
    }
    
    drawPolygon() {
        
        let points: string = ""
        
        this.handles.forEach( node => {
            const handle = node as HTMLDivElement
            let rect =  handle.getBoundingClientRect()
            let x: number = rect.x + (rect.width * 0.5)
            let y: number = rect.y + (rect.height * 0.5)
            points += `${x.toFixed(0)},${y.toFixed(0)} `
        })
        
        this.polygon.remove()
        this.polygon.setAttribute("points", points);
        
        this.polygonSVG.appendChild(this.polygon);
        
    }
}