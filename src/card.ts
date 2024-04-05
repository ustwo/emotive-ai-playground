import { Agent, Emotions, KeywordParams } from "./typeUtils.ts"

export class Card {
    
    cardRepresentation: HTMLDivElement
    traitKeywordsElements: NodeList
    shuffleButton: HTMLDivElement
    editButton: HTMLDivElement
    anText: HTMLDivElement
    
    agentType: Agent
    keywords: [Emotions, Emotions, Emotions] = [null!, null!, null!]
    
    constructor(card: HTMLDivElement) {

        this.cardRepresentation = card
        this.traitKeywordsElements = this.cardRepresentation.querySelectorAll(".trait-keyword span.keyword")
        this.shuffleButton = this.cardRepresentation.querySelector(".button.shuffle")!
        this.editButton = this.cardRepresentation.querySelector(".button.edit")!
        this.anText = this.cardRepresentation.querySelector(".an")!
        
        this.shuffleKeywords()
        
        let agentKey: keyof typeof Agent = card.id as keyof typeof Agent
        this.agentType = Agent[agentKey]
        
        this.setCardText()
        
        this.shuffleButton.addEventListener("click", this.shuffleKeywords)
        this.editButton.addEventListener("click", () => { alert("Keyword Picker") })
        
    }

    shuffleKeywords() {
        
        const enumValues = Object.values(Emotions);
        
        for (let i = 0; i <= 2; i++) {
            const randomIndex = Math.floor(Math.random() * enumValues.length);
            const randomKeyword = enumValues[randomIndex];
            this.keywords[i] = Emotions[randomKeyword]
            
            // remove entry to prevent duplicates
            enumValues.splice(randomIndex, 1)
        }
        
    }
    
    setCardText() {
        
        this.traitKeywordsElements.forEach( (node, index) => {
            let element: HTMLSpanElement = node as HTMLSpanElement
            element.innerText = this.keywords[index]
            element.addEventListener("click", () => { alert("Keyword Picker") })
            

            if (index === 0) {
                let firstCharacterInString = this.keywords[index].charAt(0)
                if (firstCharacterInString === "C" || firstCharacterInString === "P") {
                    this.anText.innerText = "A"
                } else { this.anText.innerText = "An"}
            }
        })
        
    }
}