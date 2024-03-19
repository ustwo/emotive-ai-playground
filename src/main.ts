import './style.css'

enum Sender {
  console = "console",
  system = "system",
  error = "error",
  user = "user",
  api = "api",
  gpt = "gpt"
}

let terminal: HTMLElement = document.querySelector(".terminal")!

interface CompletionObject {
  messages: CompletionMessage[],
  model: string
}

interface CompletionMessage {
  role: string,
  content: string
}

let completionObject: CompletionObject = {
  messages: [],
  model: "gpt-3.5-turbo",
}

function print(message: string, sender: Sender): void {

  let previousLine = terminal.children[terminal.children.length - 1]
  if (previousLine !== undefined && previousLine.classList.contains("prompt")) {
    previousLine.remove()
  }

  let newLine: HTMLElement = document.createElement("div")
  newLine.classList.add("terminal-line")

  let senderCol: HTMLElement = document.createElement("div")
  senderCol.classList.add("sender")
  senderCol.classList.add(sender)
  senderCol.innerText = sender

  let messageCol: HTMLElement = document.createElement("div")
  messageCol.classList.add("message")
  messageCol.innerText = message

  newLine.append(senderCol, messageCol)
  terminal.appendChild(newLine)
  
  prompt()
  window.scrollTo({top: window.innerHeight, behavior: 'smooth'})

}

function prompt(): void {

  let newLine: HTMLElement = document.createElement("div")
  newLine.classList.add("terminal-line")
  newLine.classList.add("prompt")

  let senderCol: HTMLElement = document.createElement("div")
  senderCol.classList.add("sender")
  senderCol.classList.add("user")
  senderCol.innerText = ">_"

  let messageCol: HTMLElement = document.createElement("div")
  messageCol.classList.add("message")
  let textbox: HTMLElement = document.createElement("textarea")
  textbox.setAttribute("rows", "1")
  textbox.setAttribute("placeholder", "prompt")
  messageCol.appendChild(textbox)

  newLine.append(senderCol, messageCol)
  terminal.appendChild(newLine)
  
  textbox.addEventListener('input', (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    target.style.height = 'auto'
    target.style.height = `${target.scrollHeight}px`
  })
  
  textbox.addEventListener('keydown', (event: KeyboardEvent) => {
    // Check if Enter is pressed without Shift
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent the default action (new line)
      const target = event.target as HTMLTextAreaElement;
      let message: string = target.value
      newLine.remove()
      print(message, Sender.user)
      process(message)
    }
  })

}

function process(message: string): void {

  switch (message) {
    case "clear":
      terminal.innerHTML = ""
      prompt()
      break
    case "test api":
      makeTestRequest()
      break
      default:
        makeLLMRequest("user", message)

  }

}

async function makeTestRequest() {
  try {
    const response = await fetch('/api/hello');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.text(); // or response.json() for JSON response
    console.log(data); // Handle the data
    print(data, Sender.api)
  } catch (error) {
    console.error('There was a problem with your fetch operation:', error);
  }
}

async function makeLLMRequest(sender: string, outgoingMessage: string) {

  let newInput: CompletionMessage = { role: sender, content: outgoingMessage }
  completionObject.messages.push(newInput)

  let msg: string = JSON.stringify(completionObject)

  try {
    const response = await fetch(`/api/openai?msg=${encodeURIComponent(msg)}`)
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.text() // or response.json() for JSON response
    console.log(data) // Handle the data
    let reply: CompletionMessage = { role: "assistant", content: data }
    completionObject.messages.push(reply)
    print(data, Sender.gpt)
  } catch (error) {
    console.error('There was a problem with your fetch operation:', error);
  }
}

// // // // // // // //

print("Front-end client script is running.", Sender.system)

let setup: string = "You are a digital assistant at a company called Ustwo. End every response with 'have an ustwo-tiful day!'"
print(setup, Sender.system)
makeLLMRequest("system", setup)