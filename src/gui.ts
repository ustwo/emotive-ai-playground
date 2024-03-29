import "./gui-style.css"
import {App} from "./app"
import { CardChoiceInterface } from "./cards"
import { RefinementInterface } from "./refinement"

const cardChoiceInterface: CardChoiceInterface = new CardChoiceInterface()
const refinementInterface: RefinementInterface = new RefinementInterface(new App())