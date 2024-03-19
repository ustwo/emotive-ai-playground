import './style.css'

enum Sender {
  console = "console",
  system = "system",
  error = "error",
  user = "user",
  api = "api"
}

let terminal: HTMLElement = document.querySelector(".terminal")!

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

// // // // // // // //

print("Front-end client script is running.", Sender.system)
