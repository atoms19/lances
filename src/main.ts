import { div, h1, p, a, button, state, img } from "dominity"
import { CodeJar } from "codejar"
import { guideTable, registerDescription } from "./components/guideTable"
import { withLineNumbers } from "codejar-linenumbers"
import { highlight } from "./highligher"
import { Assembler } from "./lances-engine/assembler"
import { Simulator } from "./lances-engine/simulator"
import { registerTable } from "./components/registerTable"
import { instructionViewer } from "./components/instructionViewer"

const Program = state("")
const assembly = state(new Uint32Array())
const isHelperOpen = state(false)
let sim: Simulator;
let registerStates = state(new Uint32Array(32))
// const instMemory = new InstructionMemory();

const loadProgramToMemory = () => {
	let code = Assembler(Program.value)
	assembly.value = code
}




const simulateRISC = () => {
	sim = new Simulator();
	registerStates.value = new Uint32Array(32)
	setTimeout(()=>{
	sim.loadProgram(assembly.value)
	sim.registers.registerOnUpdate((index: number, value: number) => {
		registerStates.value[index] = value
		registerStates.value = [...registerStates.value]
	})
	},1000)
	console.log("Program loaded into instruction memory.")
}


div(
	h1("Welcome to Lances!"),
	p("Lances is a RISC V simulator built with TypeScript and Runs in the Browser."),
	div({ class: "btn-grid" }, button("LOAD PROGRAM").on("click", loadProgramToMemory), button("SIMULATE").on("click", simulateRISC)),
	codearea(),
	p(a("click here", { href: "#" }).on("click", () => isHelperOpen.value = !isHelperOpen.value), () => isHelperOpen.value ? " to hide" : " to show", " assembly refrence")
	, guideTable().showIf(isHelperOpen)
	, registerDescription().showIf(isHelperOpen),
		instructionViewer(assembly).showIf(() => assembly.value.length > 0), 
	div(button("Step").on("click", () => sim.stepForward()))
	, registerTable(registerStates)
).addTo(document.querySelector("#app")!)



function codearea() {
	return div({ class: "code-area dracula" }).withRef((el: HTMLElement) => {
		let jar = CodeJar(el, withLineNumbers(highlight), { tab: "\t", })
		setTimeout(() => jar.updateCode("# Write your RISC V code here \n \n \n \n"), 100)
		jar.onUpdate(code => Program.value = code)
	})
}





