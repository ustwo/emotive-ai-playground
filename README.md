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
