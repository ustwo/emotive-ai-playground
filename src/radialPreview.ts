import "./radial-interfaces.css"
import {Prompt} from "./promptBuilder.ts"
import {CompletionMessage, KeywordParams} from "./typeUtils.ts"

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
    
    dragInstructions: HTMLDivElement

    container: HTMLDivElement
    handles: NodeList
    dividerAxes: NodeList

    keywordText: NodeList
    axisLabels: NodeList
    trendIcons: HTMLDivElement
    conversationText: HTMLDivElement
    conversationSpinner: HTMLDivElement

    isDragging: Boolean = false
    activeHandle: HTMLDivElement = null!
    touchStartCoordinates: {x: number, y: number} = {x: 0, y: 0}

    interfaceCenterpoint:  {x: number, y: number} = {x: 0, y: 0}
    containerDimensions: {x: number, y: number} = {x: 0, y: 0}
    
    adjustmentStartValue = 0

    requestPromises: Promise<any>[] = []

    constructor(prompt: Prompt, container: HTMLDivElement) {
        
        this.prompt = prompt

        this.container = container
        this.dividerAxes = container.querySelectorAll(".divider-axes .axis")
        this.handles = container.querySelectorAll(".handle")
        this.axisLabels = container.querySelectorAll(".axis-label")
        this.keywordText = document.querySelectorAll(".page.two span.keyword")
        this.trendIcons = document.querySelector(".conversation-sample .trend-icons") as HTMLDivElement
        this.conversationText = document.querySelector(".conversation-sample .conversation-text") as HTMLDivElement
        this.conversationSpinner = document.querySelector(".conversation-sample .conversation-spinner") as HTMLDivElement

        this.updateContainerDimensions()

        this.dragInstructions = document.querySelector(".error.drag-instruction") as HTMLDivElement
        this.dragInstructions.addEventListener("click", () => {
            this.setKeywords()
            this.setupHandles()
            this.promptWithParameters()
            this.dragInstructions.classList.add("disabled")
        })
    }

    promptWithParameters() {

        let promptMessage: string = "set personality keyword values to: "

        Object.keys(this.parameters).forEach( key => {
            let parameter: keyof KeywordParams = key as keyof KeywordParams
            if (this.parameters[parameter] > 0) {
                let parameterValue = Math.floor((this.parameters[parameter] / 15) * 0.5)
                promptMessage += `${key} ${parameterValue} `
            }
        })

        // clears previous messages to reduce token usage

        this.prompt.completion.messages = [this.prompt.completion.messages[0]]

        let request = this.prompt.makeLLMRequest("user", promptMessage).then( () => {

            this.conversationText.innerText = this.prompt.completion.messages[this.prompt.completion.messages.length -1].content
            this.requestPromises = this.requestPromises.filter(p => { return p !== request } )
            if (this.requestPromises.length === 0) {
                this.conversationText.classList.remove("adjusting")
                this.conversationSpinner.classList.remove("adjusting")
                let icons: NodeList = this.trendIcons.querySelectorAll(".trait-icon")
                icons.forEach(node => {
                    let icon: HTMLDivElement = node as HTMLDivElement
                    icon.classList.remove("up", "dn")
                })
            }

        })

        this.requestPromises.push(request)

    }
    
    setKeywords() {
        
        // This set of parameters is a percentage for positioning handles.

        const possiblePercentages = [30, 45, 60]

        Object.keys(this.parameters).forEach( key => {
            let parameter: keyof KeywordParams = key as keyof KeywordParams
            if (this.prompt.parameters[parameter] > 0) {
                this.parameters[parameter] = this.prompt.parameters[parameter] * possiblePercentages.shift()!
            } else { this.parameters[parameter] = 0 }
        })
        
        Object.entries(this.parameters).forEach( ([key, value]) => {
            // capitalizes the keyword
            key = key.charAt(0).toUpperCase() + key.slice(1);

            if (value >= 30) {
                this.axisLabels.forEach( node => {
                    let label: HTMLDivElement = node as HTMLDivElement
                    if (label.innerText === key.toUpperCase()) {
                        label.parentElement!.classList.add("active")
                        let handle: HTMLDivElement = label.parentElement!.querySelector(".handle") as HTMLDivElement
                        handle.style.width = `${value}%`
                        handle.style.height = `${value}%`
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

        const clampToNearest20 = (percentage: number) => {
            let index = Math.round(percentage / 15);
            switch (index) {
                case 0: return 0;
                case 1: return 15;
                case 2: return 30;
                case 3: return 45;
                case 4: return 60;
                case 5: return 75;
                default: return 75;
            }
        }

        const clearActiveHandle = (e: Event, handle: HTMLDivElement) => {
            e.preventDefault()
            this.setParameter(this.activeHandle)
            handle.classList.remove("active")
            this.activeHandle = null!
            this.isDragging = false
            let param: keyof KeywordParams = handle.id as keyof KeywordParams

        }

        const updateHandlePosition = (e: PointerEvent, handle: HTMLDivElement) => {
            e.preventDefault()
            e.stopPropagation()

            if (!this.isDragging) return

            let currentCoordinates: {x: number, y: number} = {x: e.clientX, y: e.clientY}
            let delta: number = calculateDistance(this.interfaceCenterpoint, currentCoordinates)
            let percentage: number = (delta / (this.containerDimensions.y * 0.5)) * 100

            handle.style.height = `${ clampToNearest20(percentage) }%`
            handle.style.width = `${ clampToNearest20(percentage) }%`

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
    
    setParameter(handle: HTMLDivElement) {

        if (!handle) return

        const areNearlyEqual = (previous: number, current: number, tolerance: number = 10) => {
            return Math.abs(previous - current) <= tolerance
        }

        const commitUpdates = () => {
            this.conversationText.classList.add("adjusting")
            this.conversationSpinner.classList.add("adjusting")
            this.parameters[id as keyof KeywordParams] = percentage
            this.updatePrompt()
            this.promptWithParameters()

        }

        let id: string = handle.id
        let percentage: number = Number(handle.style.width.replace('%', ''))
        let trendIcon: HTMLDivElement = this.trendIcons.querySelector(`.trait-icon.${id}`) as HTMLDivElement

        if (areNearlyEqual(this.adjustmentStartValue, percentage)) { /* no op */ }

        else if (this.adjustmentStartValue > percentage) {
            trendIcon.classList.remove("up")
            trendIcon.classList.add("dn")
            commitUpdates()
        }
        else if (this.adjustmentStartValue < percentage) {
            trendIcon.classList.remove("dn")
            trendIcon.classList.add("up")
            commitUpdates()
        }

    }

    updatePrompt() {

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

        this.prompt.parameters = newParameters

    }
}