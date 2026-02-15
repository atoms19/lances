import { div, input, h1, select, p, a, button, state, img, h3, option } from "dominity"
import { CodeJar } from "codejar"
import { guideTable, registerDescription } from "./components/guideTable"
import { withLineNumbers } from "codejar-linenumbers"
import { highlight } from "./highligher"
import { Assembler } from "./lances-engine/assembler"
import { Simulator } from "./lances-engine/simulator"
import { registerTable } from "./components/registerTable"
import { instructionCurrent, instructionViewer } from "./components/instructionViewer"
import { memoryTable } from "./components/memoryTable"
import { dialogBox } from "./components/dialogbox"
import { navbar } from "./components/navbar"

const Program = state("")
const assembly = state(new Uint32Array())
const isHelperOpen = state(false)

export const currentInstruction = state({
	name: "",
	type: "",
	opcode: 0,
})
let sim: Simulator;
let registerStates = state(new Uint32Array(32))
// const instMemory = new InstructionMemory();
let sp = state(0)
let memoryStates = state(new Uint8Array(4 * 1024)) // 64KB of memory
const loadProgramToMemory = () => {
	let code = Assembler(Program.value)
	assembly.value = code
}
let lastChangedRegister = state(-1)
let lastChnagedMemory = state(-2)
let isEditingRegistor = state(false)



const registerToedit = state(0)
const registerEditDialog = dialogBox({
	title: "Edit Register",
	message: "Modify the value of the selected register.",
	isOpen: isEditingRegistor,
	component: () => {
		return div(
			select(
				...Array.from({ length: 32 }, (_, i) => i).map(i =>
					option(`x${i}`, { value: i })
				)
			).model(registerToedit),
			input().on("input", (e: any) => {
				const val = parseInt(e.target.value)
				if (!isNaN(val)) {
					sim.registers.writeRegister(registerToedit.value, val)
				}
			})
		)

	}
})


const guideDialog = dialogBox({
	 title: "Assembly Reference",
	 message : "This table provides a reference for RISC-V assembly instructions, detailing their syntax, description, and usage examples. It serves as a quick guide for programmers to understand and utilize various RISC-V instructions effectively.",
	 isOpen: isHelperOpen,
	  component: () => div( guideTable(), registerDescription())
})


const simulateRISC = () => {
	sim = new Simulator();
	registerStates.value = new Uint32Array(32)
	memoryStates.value = new Uint8Array(4 * 1024)
	lastChangedRegister.value = -1
	lastChnagedMemory.value = -2
	currentInstruction.value = {
		name: "",
		type: "",
		opcode: 0,
	}
	setTimeout(() => {
		sim.loadProgram(assembly.value)
		sim.registers.registerOnUpdate((index: number, value: number) => {
			registerStates.value[index] = value
			sp.value = registerStates.value[2]
			lastChangedRegister.value = index
			registerStates.value = [...registerStates.value]
		})

		sim.dataMemory.registerOnUpdate((address: number, value: number) => {
			memoryStates.value[address] = value
			lastChnagedMemory.value = address
			memoryStates.value = [...memoryStates.value]
		})



	}, 1000)
	console.log("Program loaded into instruction memory.")
}

div(
navbar(),
div({ class: "container" },
	div(
		div({class:"flex-btw"},h3("register view "),button("set register",{class:"small"}).on("click", () => isEditingRegistor.value = true)),
		registerTable(registerStates, lastChangedRegister),
		h3("memory view ")
		, memoryTable(memoryStates, sp, lastChnagedMemory)
	),
	div(
		h1("Welcome to Lances!"),
		p("Lances is a RISC V simulator built with TypeScript and Runs in the Browser."),
		div({ class: "btn-grid" }, button("LOAD PROGRAM").on("click", loadProgramToMemory), button("SIMULATE").on("click", simulateRISC)

		,div(button("Step").on("click", () => sim.stepForward())),
			),
		codearea(),
		instructionCurrent(currentInstruction),
		p(button("click here", { href: "#" }).on("click", () => isHelperOpen.value = !isHelperOpen.value), () => isHelperOpen.value ? " to hide" : " to show", " assembly refrence")
	//	, guideTable().showIf(isHelperOpen)
	//	, registerDescription().showIf(isHelperOpen),
		,instructionViewer(assembly).showIf(() => assembly.value.length > 0),

	),
  registerEditDialog,
  guideDialog
)).addTo(document.querySelector("#app")!)



function codearea() {
	return div({ class: "code-area dracula" }).withRef((el: HTMLElement) => {
		let jar = CodeJar(el, withLineNumbers(highlight), { tab: "\t", })
		setTimeout(() => jar.updateCode(`# Write your RISC V code here \n \n \n \n 

    addi x1, x0, 5      # n = 5
    addi x2, x0, 1      # result = 1

    addi x4, x0, 0      # acc = 0
    add  x5, x2, x0     # temp = result
    add  x6, x1, x0     # counter = n

    add  x4, x4, x5     # acc += temp
    addi x6, x6, -1     # counter--
    bne  x6, x0, -8     # repeat inner loop

    add  x2, x4, x0     # result = acc
    addi x1, x1, -1     # n--
    bne  x1, x0, -32    # repeat outer loop
 `), 100)
		jar.onUpdate(code => Program.value = code)
	})
}





