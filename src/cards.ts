export class CardChoiceInterface {

    screen: HTMLDivElement = document.querySelector(".screen")!
    page: HTMLDivElement = document.querySelector(".page.one")!
    container: HTMLDivElement = document.querySelector(".card-interface")!
    cards: NodeList = document.querySelectorAll(".card")
    isScrolling: Boolean = false

    constructor() {

        this.container.addEventListener( "scroll", this.clearActiveCards.bind(this) )
        this.container.addEventListener( "scroll", this.debounce(this.scrollContainer.bind(this), 25) )

        this.cards.forEach( cardNode => {
            let card = cardNode as HTMLDivElement
            card.addEventListener("click", () => {
                card.scrollIntoView({ behavior: "instant", block: "nearest", inline: "center" })
                this.clearActiveCards()
                this.setActiveCard(card)
                this.isScrolling = false
            })
        })

    }

    // debounce function generated by chatGPT

    debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...funcArgs: Parameters<T>) => void {

        let timeoutId: ReturnType<typeof setTimeout> | null = null
      
        return function(...args: Parameters<T>): void {

            const later = () => {
                timeoutId = null
                func(...args)
            }

            if (timeoutId !== null) { clearTimeout(timeoutId) }
            timeoutId = setTimeout(later, wait)

        }

    }

    clearActiveCards() {

        if (this.isScrolling) return

        this.isScrolling = true
        this.cards.forEach(cardNode => {
            let card: HTMLDivElement = cardNode as HTMLDivElement
            card.classList.remove("active")
        })
    }

    scrollContainer() {

        const containerRect: {left: number, right: number} = this.container.getBoundingClientRect();

        this.cards.forEach(cardNode => {
            let card: HTMLDivElement = cardNode as HTMLDivElement
            const cardRect: {left: number, right: number} = card.getBoundingClientRect();
    
            const isFullyVisible = cardRect.left >= containerRect.left && cardRect.right <= containerRect.right;
            if (isFullyVisible) { this.setActiveCard(card) }
            else { card.classList.remove("active") }
            this.isScrolling = false
        })

    }

    setActiveCard(card: HTMLDivElement) {
        card.classList.add("active")
        switch (card.id) {
            case "health-coach":
                this.screen.classList.add("health-coach-bg")
                this.screen.classList.remove("financial-adviser-bg")
                this.screen.classList.remove("sales-representative-bg")
                this.screen.classList.remove("productivity-partner-bg")
                break
            case "financial-adviser":
                this.screen.classList.remove("health-coach-bg")
                this.screen.classList.add("financial-adviser-bg")
                this.screen.classList.remove("sales-representative-bg")
                this.screen.classList.remove("productivity-partner-bg")
                break
            case "sales-representative":
                this.screen.classList.remove("health-coach-bg")
                this.screen.classList.remove("financial-adviser-bg")
                this.screen.classList.add("sales-representative-bg")
                this.screen.classList.remove("productivity-partner-bg")
                break
            case "productivity-partner":
                this.screen.classList.remove("health-coach-bg")
                this.screen.classList.remove("financial-adviser-bg")
                this.screen.classList.remove("sales-representative-bg")
                this.screen.classList.add("productivity-partner-bg")
                break
        }
    }

}