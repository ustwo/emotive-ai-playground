import "./conversation-style.css"
import { Prompt } from "./promptBuilder.ts"
import { Agent, CompletionMessage } from "./typeUtils.ts"

export class Conversation {
    
    prompt: Prompt
    messageScrollArea: HTMLDivElement
    
    initialQuestionCardArea: HTMLDivElement
    initialQuestionCards: NodeList
    
    inputField: HTMLDivElement
    inputTextbox: HTMLInputElement
    inputSendButton: HTMLDivElement
    
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
    
    
    constructor(prompt: Prompt) {
        
        this.prompt = prompt
        this.messageScrollArea = document.querySelector(".page.four .conversation-interface .message-scroll-area") as HTMLDivElement
        this.initialQuestionCardArea = document.querySelector(".page.four .conversation-interface .input-area .preselected-input-messages") as HTMLDivElement
        this.initialQuestionCards = document.querySelectorAll(".page.four .conversation-interface .input-area .preselected-input-messages .message")
        this.inputField = document.querySelector(".page.four .conversation-interface .input-area .custom-input-field") as HTMLDivElement
        this.inputTextbox = document.querySelector(".page.four .conversation-interface .input-area .custom-input-field #prompt-input") as HTMLInputElement
        this.inputSendButton = document.querySelector(".page.four .conversation-interface .input-area .custom-input-field .send-button") as HTMLDivElement
        
        this.initialQuestionPrompts.set(Agent.Health, this.wellnessCoachInitialQuestions)
        this.initialQuestionPrompts.set(Agent.Financial, this.financialAdviserInitialQuestions)
        this.initialQuestionPrompts.set(Agent.Sales, this.salesRepresentativeInitialQuestions)
        this.initialQuestionPrompts.set(Agent.Productivity, this.productivityPartnerInitialQuestions)
        
        this.initialQuestionCards.forEach( (node, index) => {
            let card: HTMLDivElement = node as HTMLDivElement
            let textArray: string[] = this.initialQuestionPrompts.get(this.prompt.agentType)!
            card.innerText = `${textArray[index]}`
            
            card.addEventListener("click", () => { this.chooseCard(card) })
        })
        
        this.insertMessage( this.getLastCompletion() )
        
        this.inputField.addEventListener("click", () => {this.inputField.classList.add("active")})
        
        this.inputTextbox.addEventListener("change", () => {
            let outboundMessage: string = this.inputTextbox.value
            this.inputTextbox.value = ""
            this.insertMessage(outboundMessage, true)
            this.prompt.makeLLMRequest("user", outboundMessage).then( () => {
                this.insertMessage(this.getLastCompletion())
            })
            this.inputTextbox.blur()
        })
        
        this.inputSendButton.addEventListener("click", () => {
            let outboundMessage: string = this.inputTextbox.value
            this.inputTextbox.value = ""
            if (outboundMessage.length > 0) {
                this.insertMessage(outboundMessage, true)
                this.prompt.makeLLMRequest("user", outboundMessage).then( () => {
                    this.insertMessage(this.getLastCompletion())
                })
            }
        })
    }
    
    chooseCard(selectedCard: HTMLDivElement) {
        
        this.initialQuestionCards.forEach( node => {
            let card: HTMLDivElement = node as HTMLDivElement
            
            if (card == selectedCard) {card.classList.add("selected")}
            else { card.classList.add("unselected")}
        })
        
        setTimeout( () => {
            this.initialQuestionCardArea.classList.add("hidden")
            this.inputField.classList.add("active")
            this.insertMessage(selectedCard.innerText, true)
            this.prompt.makeLLMRequest("user", selectedCard.innerText).then( () => {
                this.insertMessage(this.getLastCompletion())
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