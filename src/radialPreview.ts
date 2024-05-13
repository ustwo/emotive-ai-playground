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
    dividerAxes: NodeList

    keywordText: NodeList
    axisLabels: NodeList
    
    isDragging: Boolean = false
    activeHandle: HTMLDivElement = null!
    touchStartCoordinates: {x: number, y: number} = {x: 0, y: 0}

    interfaceCenterpoint:  {x: number, y: number} = {x: 0, y: 0}
    containerDimensions: {x: number, y: number} = {x: 0, y: 0}
    
    adjustmentStartValue = 0

    constructor(prompt: Prompt, container: HTMLDivElement) {
        
        this.prompt = prompt
        
        this.container = container
        this.dividerAxes = container.querySelectorAll(".divider-axes .axis")
        this.handles = container.querySelectorAll(".handle")!
        this.axisLabels = container.querySelectorAll(".axis-label")
        this.keywordText = document.querySelectorAll(".page.two span.keyword")

        this.updateContainerDimensions()
        this.setKeywords()
        
//        this.axisLabels.forEach( node => {
//            let label: HTMLDivElement = node as HTMLDivElement
//            label.addEventListener("click", this.toggleParameter.bind(this))
//        })

        this.setupHandles()

    }
    
    setKeywords() {
        
        // This set of parameters is a percentage for positioning handles.

        Object.keys(this.parameters).forEach( key => {
            let parameter: keyof KeywordParams = key as keyof KeywordParams
            this.parameters[parameter] = this.prompt.parameters[parameter] * 50
        })
        
        Object.entries(this.parameters).forEach( ([key, value]) => {
            // capitalizes the keyword
            key = key.charAt(0).toUpperCase() + key.slice(1);

            if (value > 50) {
                this.axisLabels.forEach( node => {
                    let label: HTMLDivElement = node as HTMLDivElement
                    if (label.innerText === key.toUpperCase()) {
                        label.parentElement!.classList.add("active")
                        this.dividerAxes.forEach(node => {
                            let axis: HTMLDivElement = node as HTMLDivElement
                            axis.classList.contains(label.innerText) && axis.classList.add("visible")
                        })
                    }
                })
            }
            
        })

        
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
            let param: keyof KeywordParams = handle.id as keyof KeywordParams

            // check if new value is greater or less than previous, show trend icon
            // wait and generate new sample text

        }

        const updateHandlePosition = (e: PointerEvent, handle: HTMLDivElement) => {
            e.preventDefault()
            e.stopPropagation()

            if (!this.isDragging) return

            let currentCoordinates: {x: number, y: number} = {x: e.clientX, y: e.clientY}
            let delta: number = calculateDistance(this.interfaceCenterpoint, currentCoordinates)
            let percentage: number = (delta / (this.containerDimensions.y * 0.5)) * 100

            percentage >= 75 ? percentage = 75 : null // clamp percentage at 100
            handle.style.height = `${percentage}%`
            handle.style.width = `${percentage}%`

            let param: keyof KeywordParams = handle.id as keyof KeywordParams
            this.parameters[param] = percentage
        }

        this.handles.forEach( handleNode => {

            let handle: HTMLDivElement = handleNode as HTMLDivElement

            handle.addEventListener("pointerdown", e => {
                e.preventDefault()
                this.touchStartCoordinates = {x: e.clientX, y: e.clientY}
                handle.classList.add("active")
                this.activeHandle = handle
                this.isDragging = true

                let param: keyof KeywordParams = handle.id as keyof KeywordParams
                this.adjustmentStartValue = this.parameters[param]
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
    
    updateContainerDimensions() {
        
        // calculate overall dimensions and centerpoint of the DOM container
        // that holds the radial interface, and set the height of the container
        // element to match its width to force concentric circles
        
        let rect = this.container.getBoundingClientRect()
        let largest: number
        rect.width > rect.height ? largest = rect.width : largest = rect.height
        
        this.containerDimensions = {x: largest, y: largest} // trust me bro
        this.interfaceCenterpoint.x = (rect.width + (rect.x * 2)) * 0.5
        this.interfaceCenterpoint.y = (rect.height * 0.5) + rect.y
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

            let paramValue: number
            if (this.parameters[param] >= 60) { paramValue = 2 }
            else if (this.parameters[param] < 60 && this.parameters[param] >= 20) { paramValue = 1 }
            else { paramValue = 0 }

            newParameters[param] = paramValue

        })

        return new Prompt(this.prompt.agentType, newParameters)

    }
}