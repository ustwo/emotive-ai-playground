[![Netlify Status](https://api.netlify.com/api/v1/badges/ecd6f972-1619-4e6e-b278-eef5e3a3b36e/deploy-status)](https://app.netlify.com/sites/emotive-ai/deploys)

# Emotive AI Agent Builder

The Agent Builder is a technical and UX demonstration of the emotional range of LLM-based chat agents. We've built a responsive web interface for visually constructing prompts, which connects to an OpenAI GPT-4 completion endpoint to return example messages in-character.

### Ustwo Team

- [Steve Caruso](https://github.com/smcarustwo) - Development
- [Maz Karimian](mailto:maz@ustwo.com) - Strategy
- [Yuqiao Qin](https://github.com/yuqiaoqin) - Design

## User Flow

```
+--------------------------------------------+       +-------------------------------------+
|  URL Entry: https://emotive-ai.ustwo.com/  |       | URL With Search Query ?agent=[0-3]  |
+----------------------|---------------------+       +-------------------------------------+
            |                                                  |
            |                                                  |
            |                                    For referring from Share Card
            |                                    Bypasses Landing and selects
    +-------------------------+                   agent type   |
    |                         |                                |                     +--------------------------+
    |  Creator Landing Page   |                                |         +-----------| Edit:                    |
    |                         |                                |         |           |                          |
    +-------------------------+              +------------------------------------+  |  Expands card to show    |
        |     |                              |                                    |  |  all possible parameters |-----+
        |     |                              | Card Selector Interface            |  |  for custom selection    |     |
        |     +-------------------------------                                    |  |                          |     |
        |         Start Button               |  - Choose Agent Type               |  +--------------------------+     |
        |                                    |  - Choose Emotional Parameters     |  +--------------------------+     |
        |                                    |                                    |  |                          |     |
        |                                    +------------------------------------+  |  Shuffle:                |     |
        |                                             |         |        |           |                          |     |
        |                                             |         |        |           |   Randomly chooses       |-----+
        |                                             |         |        +-----------|   three parameters       |
        |                   --------------------------+         |                    |                          |
        |                   |                                   |                    +--------------------------+
        |                   |                                   |
        |                   |                                   |
        |                   |                                   |
        |                   |                                   |
        |                   |               +---------------------------------------+
        |                   |               |                                       |
        |                   |               |  Radial Adjustment Interface          |
        |                   |               |                                       |
        |                   |               |    - Choose Intensity of Parameters   |
        |                   |               |    - Verify Generated Preview Text    |
        |                   |               |                                       |
        |                   |               +---------------------------------------+
        |                   |                                   | Shape Agent
        |                   |                                   |
        |                   |                  +----------------------------------+
        |                   |                  |                                  |
        |                   |                  |  Shape Creation                  |
        |                   |                  |                                  |
        |                   |                  |    - See constructed shape       |
        |                   |                  |      determined by parameters    |
        |                   |                  |                                  |
        |                   |                  +----------------------------------+
        |                   |                                    |
        |                   |                                    | Automatically Clears
        |                   |                                    | after animations
        |                   |                                    |
        |                   |              +-----------------------------------------+        Loads Separate Page
        |                   |              |                                         |        +--------------------------------------------+
        |                   |              |  Conversation Preview                   |        |                                            |
        |                   |              |                                         |        |   Share Card                               |
        |                   |              |    - Brief conversation with            |        |                                            |
        |                   +------------- |      generated agent                    | -------|    - Saveable and Shareable link           |
        |                    Restart       |                                         |  Share |      to summary card with agent details    |
        |                                  |    - Select pre-written conversation    |        |                                            |
        |                                  |      prompts or write custom            |        +--------------------------------------------+
        |                                  |                                         |                               |
        |                                  +-----------------------------------------+                               | Share
        |                                                       |                                                    |
        |                                                       | Chat with Me                 +-------------------------------------------+
        |                                                       +------------------------------|                                           |
        |  Create Your Own                                                                     |   Shared Card - URL with Search Query     |
        +------------------------------------------------------------------------------------- |                                           |
                                                                                               +-------------------------------------------+
```

---

## Architecture

Emotive AI Agent Builder is written in Typescript and deployed to Netlify. The main entry for the application is `gui.ts`. The main classes of the application are as follows, roughly in order of appearance:

### `gui.ts` — Main Entry

This is a classless script that handles UI element selections, transitions between pages, and search query parsing.
Within it, instances of `CardChoiceInterface`, `RadialPreview` and `Conversation` are created and connected to the DOM for interaction.
An instance of `Prompt` is created here, using the agent and parameter choices made in `cardChoiceInterface` and passed into `shapePreviewInterface: RadialPreview`, which then passes it along to `conversationInterface: Conversation` for use. This script does not directly make further adjustments to the prompt.

### `ChardChoiceInterface` — cardSelector.ts

This class constructor takes no arguments and makes its own DOM selections. Each `.card` element selected from the DOM is mapped to an instance of `Card` (card.ts). `CardChoiceInterface` manages events that set the active card, and tracks the active selection for use by `gui.ts` when assigning the `Prompt` immediately before the transition to `.page.two`.

### `Card` — card.ts

`Card`'s constructor takes in an `HTMLDivElement` of a `.card` element within the selector interface, assigns it to `this.cardRepresentation` and selects elements within it from there. This class manages functionality of the edit and shuffle buttons, and holds references to which parameters have been chosen.

### `RadialPreview` — radialPreview.ts

This class manages the appearance and functionality of the radial / pie-slice adjustment interface. Its constructor takes in a `Prompt` object and an `HTMLDivElement` of class `.radial-interface` selected by `gui.ts`, which is then assigned to `this.container`. Additional interface elements are selected within this class for the construction of the visual interface.

The `setKeywords()` and `setupHandles()` manage inital setup of the interface, iterating through `prompt.parameters` to activate the correct interface controls. While `Prompt` uses a 0-2 scale for its `parameters: KeywordParameters`, `RadialPreview` uses a 0-75 scale to allow for more responsive interactions with the UI.

`setParameter(handle: HTMLDivElement)` is called at the end of a pointer interaction to commit updates made to the parameters list, convert the scale, and assign it to the `prompt.parameters` object with `updatePrompt()`. It then calls `promptWithParameters()` to make a completion request from the LLM and update the UI with new preview text.

### `Prompt` — promptBuilder.ts

`Prompt` manages the system prompt delivered to OpenAI, the `Completion` list that the LLM uses to generate new text from, and a `makeLLMRequest(sender: string, outgoingMessage: string)` function that makes HTTP requests to a Vercel serverless function that then interfaces with the OpenAI API.

### `ShapeGenerator` — shapePreview.ts

This class draws a unique SVG shape onto the screen based on the `promptParameters` passed into the constructor. The constructor also takes an `HTMLDivElement` of the containing element, and a `boolean` value `onShareCard`, false by default, which scales the graphic differently when it appears on the share card.

Like `RadialPreview`, this feature uses a more granular 0-75 scale for the `KeywordParameters` in order to create a wider variety of unique shapes.

To find and draw points in the shape, a radial arrangement of colored gradient circles in the same order as the adjustment interface is selectively shown or hidden based on the chosen `promptParameters`. The center points of those "clouds" are calculated and then scaled along an axis to the centerpoint of the entire containing element based on the value of the associated parameter. Then, an `SVGCircleElement` is drawn at that location. Connecting lines are drawn between those calculated points. Connecting lines are also drawn between the calculated points and "tangent" control points selected separately from the DOM.

### `Conversation` — conversation.ts

The constructor for this class takes in a `Prompt`, and manages textual interactions with the prompt in the conversation preview interface. The interface's inputs (`initialQuestionCards` ,`inputTextBox` and `inputSendButton`) and `messageScrollArea` are selected inside the class. Lists of initial questions to start preview conversations with different `Agent` types are stored in arrays and populated into `.preselected-input-messages .message` card elements when the class is constructed.

` insertMessage(messageContent: string, user: boolean = false)` populates an arbitrary string of text into the `messageScrollArea` with alternative styling for user-entered text. This is used both to directly mirror input text and also display generated text from the LLM. Generated text is retrieved by using `getLastCompletion(role: string)` when the HTTP request from OpenAI is received. The API works by appending a `Completion` object with a `role` and `content` to an array, and this function finds the most recent entry to display.

### `share.ts` — Share Card Entry

This is a classless script that handles UI element selections and interactions on the share card page accessed at `emotive-ai.ustwo.com/sharecard/`. It fist looks for a valid URL query string, and will redirect to the main Agent Builder page if not found. It will then iterate through the query and populate information about the agent into the card.

The `refer=1` query flags pages that are loaded from the "share" button in the last step of the Agent Builder, and shows a card with a large shape preview and a historical quote along with another "share" control. That "share" control creates a unique link that allows the agent to be replicated by another visitor to the site.

---

## Types

`typeUtils.ts` contains definitions of a few additonal types used throughout the app.

### `Agent` (enum)

This type enumerates the four Agent jobs that can be customized.

```
Health = "Wellness Coach",
Financial = "Financial Adviser",
Sales = "Sales Representative",
Productivity = "Productivity Partner"
```

### `Emotions` (enum)

This type enumerates the six emotional trait parameters and is used to iterate through iterface elements in multiple instances.

```
Assertive = "Assertive",
Compassionate = "Compassionate",
Curious = "Curious",
Excited = "Excited",
Optimistic = "Optimistic",
Playful = "Playful"
```

### `CompletionMessage` (interface)

This is a definition of the completion object that OpenAI returns from its API.

```
role: string,
content: string
```

### `KeywordParams` (interface)

This is an object that is a primary feature of `Prompt` and is reused in other areas of the interface to iterate through UI selections and map elements to prompt parameters.

```
assertive: number,
compassionate: number,
curious: number,
excited: number,
optimistic: number,
playful: number
```

---

## API

Scripts within the `/api` directory are run by Vercel as an API endpoint in Node. `openai.js` is used to handle requests to OpenAI's Completions API and is accessible at `emotive-ai.ustwo.com/openai`.

Our OpenAI API key is securely stored in Vercel and accessed only by this function.

---

## URL Query Format

Sample query string: `?agent=0&as=0&co=0&cu=0&ex=0&op=0&pl=0&refer=0`

- `agent`: 0-3 mapped to Agent type
- `as`: assertive 0-75
- `co`: compassionate 0-75
- `cu`: curious 0-75
- `ex`: excited 0-75
- `op`: optimistic 0-75
- `pl`: playful 0-75
- `date`: Month-0 date for quote
- `refer`: 0 shared, 1 from creator

---

## Roadmap

### Testing and Validation

- QA and design feedback is being tracked [in this Miro board](https://miro.com/app/board/uXjVNkeh3wA=/?share_link_id=499903228725). All are welcome to provide comments.

### Features

- Responsive style is being refined. Mobile is optimized, Desktop sizes are working and supported, smaller tablet sizes are still problematic.
