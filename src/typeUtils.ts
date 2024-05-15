export enum Agent {
    Health = "Wellness Coach",
    Financial = "Financial Adviser",
    Sales = "Sales Representative",
    Productivity = "Productivity Partner"
}

export enum Emotions {
    Assertive = "Assertive",
    Compassionate = "Compassionate",
    Curious = "Curious",
    Excited = "Excited",
    Optimistic = "Optimistic",
    Playful = "Playful"
}

export interface CompletionMessage {
    role: string,
    content: string
}

export interface KeywordParams {
    assertive: number,
    compassionate: number,
    curious: number,
    excited: number,
    optimistic: number,
    playful: number
}