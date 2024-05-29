import "./conversation-style.css"
import { Prompt } from "./promptBuilder.ts"
import { Agent, CompletionMessage } from "./typeUtils.ts"

export class Conversation {
    
    conversationPasses: number = 0

    prompt: Prompt
    messageScrollArea: HTMLDivElement
    
    initialQuestionCardArea: HTMLDivElement
    initialQuestionCards: NodeList
    
    inputField: HTMLDivElement
    inputTextbox: HTMLInputElement
    inputSendButton: HTMLDivElement
    
    pageOne: HTMLDivElement
    pageFour: HTMLDivElement

    initialQuestionPrompts: Map<Agent, string[]> = new Map()
    wellnessCoachInitialQuestions: string[] = [
        "I want to develop healthier eating habits",
        "I want to focus on my mental health",
        "I need help building an exercise regimen",
        "I'm overwhelmed and don't know where to start"
    ]
    financialAdviserInitialQuestions: string[] = [
        "I need help with money management",
        "I need help with setting financial goals",
        "I want to get started with investing",
        "I'm overwhelmed and don't know where to start"
    ]
    salesRepresentativeInitialQuestions: string[] = [
        "I want to upgrade my work from home setup",
        "I want to refresh my wardrobe",
        "I want to do some home renovation",
        "I want to treat myself"
    ]
    productivityPartnerInitialQuestions: string[] = [
        "I need help with time management",
        "I need help with my morning routine",
        "I need to stop procrastinating",
        "I’m overwhelmed and don’t know where to start"
    ]

    listeners: any[] = []
    
    constructor(prompt: Prompt) {
        
        this.prompt = prompt
        this.messageScrollArea = document.querySelector(".page.four .conversation-interface .message-scroll-area") as HTMLDivElement
        this.initialQuestionCardArea = document.querySelector(".page.four .conversation-interface .input-area .preselected-input-messages") as HTMLDivElement
        this.initialQuestionCards = document.querySelectorAll(".page.four .conversation-interface .input-area .preselected-input-messages .message")
        this.inputField = document.querySelector(".page.four .conversation-interface .input-area .custom-input-field") as HTMLDivElement
        this.inputTextbox = document.querySelector(".page.four .conversation-interface .input-area .custom-input-field #prompt-input") as HTMLInputElement
        this.inputSendButton = document.querySelector(".page.four .conversation-interface .input-area .custom-input-field .send-button") as HTMLDivElement
        
        this.pageOne = document.querySelector(".page.one") as HTMLDivElement
        this.pageFour = document.querySelector(".page.four") as HTMLDivElement

        this.initialQuestionPrompts.set(Agent.Health, this.wellnessCoachInitialQuestions)
        this.initialQuestionPrompts.set(Agent.Financial, this.financialAdviserInitialQuestions)
        this.initialQuestionPrompts.set(Agent.Sales, this.salesRepresentativeInitialQuestions)
        this.initialQuestionPrompts.set(Agent.Productivity, this.productivityPartnerInitialQuestions)
        
        this.initialQuestionCards.forEach( (node, index) => {
            let card: HTMLDivElement = node as HTMLDivElement
            let textArray: string[] = this.initialQuestionPrompts.get(this.prompt.agentType)!
            card.innerText = `${textArray[index]}`
            
            let listener = card.addEventListener("click", this.chooseCard.bind(this))
            this.listeners.push(listener)
        })
        
        this.insertMessage( this.getLastCompletion() )
        
        this.inputField.addEventListener("click", () => {this.inputField.classList.add("active")})
        
        this.inputTextbox.addEventListener("change", this.customInputOrReply.bind(this))
        this.inputSendButton.addEventListener("click", this.customInputOrReply.bind(this))

        let shape: HTMLDivElement = document.getElementById("shape") as HTMLDivElement
        let shapeIcon: HTMLDivElement = document.getElementById("conversation-shape") as HTMLDivElement
        let newShape = shape.cloneNode(true)
        shapeIcon.append(newShape)

    }

    customInputOrReply() {
        this.inputField.classList.add("disabled")
        this.messageScrollArea.classList.add("regenerating")
        let outboundMessage: string = this.inputTextbox.value
        this.inputTextbox.value = ""
        this.insertMessage(outboundMessage, true)
        this.conversationPasses++
        this.prompt.makeLLMRequest("user", outboundMessage).then( () => {
            this.insertMessage(this.getLastCompletion())
            this.inputField.classList.remove("disabled")
            this.messageScrollArea.classList.remove("regenerating")
            if (this.conversationPasses >= 4) {
                this.inputField.classList.add("disabled")
            }
        })
        this.inputTextbox.blur()
        this.initialQuestionCardArea.classList.add("hidden")
        
    }

    chooseCard(event: Event) {
        
        let selectedCard: HTMLDivElement = event.target as HTMLDivElement
        this.conversationPasses++

        this.initialQuestionCards.forEach( node => {
            let card: HTMLDivElement = node as HTMLDivElement
            
            if (card == selectedCard) {card.classList.add("selected")}
            else { card.classList.add("unselected")}
        })

        
        setTimeout( () => {
            this.initialQuestionCardArea.classList.add("hidden")
            this.inputField.classList.add("active", "disabled")
            this.messageScrollArea.classList.add("regenerating")
            this.insertMessage(selectedCard.innerText, true)
            this.prompt.makeLLMRequest("user", selectedCard.innerText).then( () => {
                this.insertMessage(this.getLastCompletion())
                this.inputField.classList.remove("disabled")
                this.messageScrollArea.classList.remove("regenerating")
            })
        }, 1000)
        
    }
    
    insertMessage(messageContent: string, user: boolean = false) {
        if (messageContent.length < 1) { return }
        
        let newMessage: HTMLDivElement = document.createElement("div")
        newMessage.classList.add("message")
        
        if (user) { newMessage.classList.add("user") }
        
        newMessage.innerText = messageContent
        this.messageScrollArea.appendChild(newMessage)
        this.messageScrollArea.scrollTop = this.messageScrollArea.scrollHeight
        
    }
    
    getLastCompletion(role: string = "assistant"): string {
        
        let messageListLastIndex = this.prompt.completion.messages.length - 1
        
        for (let index = messageListLastIndex; index >= 0; index--) {
            
            let message: CompletionMessage = this.prompt.completion.messages[index]
            if ( message.role === role ) { return message.content }
            
        }
        
        return ""
        
    }

}