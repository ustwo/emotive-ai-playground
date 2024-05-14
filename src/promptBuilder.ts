import { Agent, KeywordParams, CompletionMessage } from "./typeUtils.ts"

export class Prompt {
    
    agentType: Agent
    parameters: KeywordParams = {
        assertive: 0,
        compassionate: 0,
        curious: 0,
        excited: 0,
        optimistic: 0,
        playful: 0
    }
    
    textPrompt: string = ""
    model: string = "gpt-4o"
    systemPrompt: string = ""
    completion: { messages: CompletionMessage[], model: string }
    
    constructor(agent: Agent, parameters: KeywordParams) {

        this.agentType = agent
        Object.keys(this.parameters).forEach( key => {
            let parameter: keyof KeywordParams = key as keyof KeywordParams
            this.parameters[parameter] = parameters[parameter]
        })
        
        this.systemPrompt = this.generateSystemPrompt()
        let initialMessage: CompletionMessage = {role: "system", content: this.systemPrompt}
        
        this.completion = { messages: [initialMessage], model: this.model }
        
    }
    
    generateSystemPrompt(): string {
        
        let jobDescription: string
        
        switch (this.agentType) {
            
            case Agent.Health:
                jobDescription = "coach a person seeking to achieve health goals through lifestyle and behavior adjustments; however, the Health Coach will not give medical advice"
                break
             
            case Agent.Financial:
                jobDescription = "advise a person seeking to improve their financial literacy and achieve financial goals; however, the Financial Adviser will not give investing advice."
                break
             
            case Agent.Sales:
                jobDescription = "assist a person who needs help figuring out what to buy and whether to actually buy it; however, the Sales Representative will not recommend specific brands."
                break
             
            case Agent.Productivity:
                jobDescription = "partner with a person seeking to realize personal and professional goals in their day to day life"
                break
        
        }
        
        return `
Play the role of an "AI agent personality builder and tester" tool. Here are the steps in the user experience:
        
1. The user will select the kind of agent they want to build. They have selected "${this.agentType}". Your job is to ${jobDescription}.
2. Then, the user will select 3 from a total of 6 potential Personality Keywords. The Personality Keywords denote the agent’s personality traits. The Personality Keywords are: Compassionate, Assertive, Excited, Curious, Playful, and Optimistic. For each Personality Keyword, there exists a scale of 0 to 2, where 0 is a minimum amount of the trait, 1 is a medium amount, and 2 is the maximum amount. By default, when a user selects a Personality Keyword, the Keyword’s value is set to 1. Keywords not explicitly defined are set to 0.
3. Once the user has completed steps 1 and 2, they have given the agent a "personality". Once the agent has been given a "personality", generate a message introducing yourself to the user "in character" in no more than 45 words. In your introductory messages, do not use or reference the Personality Keywords.
4. The user may then make adjustments to the values of the Personality Keywords, which in turn adjusts the agent’s personality. When the user makes an adjustment, you must generate a new message introducing yourself to the user "in character" in no more than 45 words. Do not comment on the user’s adjustment: simply generate a new message.
5. The user may not respond with adjustments to the values of Personality Keywords. Instead, they may send in-words messages. You must respond to these messages in character, according to the latest Personality Keyword values, in no more than 60 words.
Do not respond to this message or other messages with anything except "awaiting inputs" until you have the information required to produce an introductory message.
6. After receiving 4 in-words messages from the user, conclude the conversation and wish the user well.                            
`
        
    }
    
}

/*

*/