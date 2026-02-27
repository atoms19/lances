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
import { examples } from "./examples"
import { Memory } from "./lances-engine/Memory"

const Program = state("")
const assembly = state(new Uint32Array())
const isHelperOpen = state(false)

export const currentInstruction = state({
	name: "",
	type: "",
	opcode: 0,
})

export let instructionAddress = state(0)

let sim: Simulator;
let registerStates = state(new Uint32Array(32))
let jar;
// const instMemory = new InstructionMemory();
let sp = state(0)
let memory = new Memory(4 * 1024)

let lastChnagedMemory = state(-2)
let memoryStates = state(new Uint8Array(4 * 1024)) // 64KB of memory

memory.registerOnUpdate((address: number, value: number) => {
			memoryStates.value[address] = value
			lastChnagedMemory.value = address
			memoryStates.value = [...memoryStates.value]
		})

const loadProgramToMemory = () => {
   if(choosenProgram.value != 'default'){
		  Program.value = examples[choosenProgram.value]
		  jar.updateCode(Program.value)
	}
	let code = Assembler(Program.value,memory)
	assembly.value = code
}
let lastChangedRegister = state(-1)
let isEditingRegistor = state(false)
let choosenProgram = state('default')

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
	message: "This table provides a reference for RISC-V assembly instructions, detailing their syntax, description, and usage examples. It serves as a quick guide for programmers to understand and utilize various RISC-V instructions effectively.",
	isOpen: isHelperOpen,
	component: () => div(guideTable(), registerDescription())
})


const simulateRISC = () => {
	sim = new Simulator();
	registerStates.value = new Uint32Array(32)
//	memoryStates.value = new Uint8Array(4 * 1024)
	sim.dataMemory = memory
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
			}, 1000)
	console.log("Program loaded into instruction memory.")
}

div(
	navbar(),
	div({ class: "container" },
		div(
			div({ class: "flex-btw" }, h3("register view "), button("set register", { class: "small" }).on("click", () => isEditingRegistor.value = true)),
			registerTable(registerStates, lastChangedRegister),
			h3("memory view ")
			, memoryTable(memoryStates, sp, lastChnagedMemory)
		),
		div(
			h1("Welcome to Lances!"),
			p("Lances is a RISC V simulator built with TypeScript and Runs in the Browser."),
			div({ class: "btn-grid" },

			 div({class:'selectbtn'},
				select(

				  Object.keys(examples).map(key => option(key, { value: key }))
				  ).model(choosenProgram),
				button("LOAD PROGRAM").on("click", loadProgramToMemory)), button("SIMULATE").on("click", simulateRISC)

				, div(button("Step").on("click", () => sim.stepForward())),
			),
			codearea(),
			instructionCurrent(instructionAddress,currentInstruction),
			p(button("click here", { href: "#" }).on("click", () => isHelperOpen.value = !isHelperOpen.value), () => isHelperOpen.value ? " to hide" : " to show", " assembly refrence")
			, instructionViewer(assembly).showIf(() => assembly.value.length > 0),

		),
		registerEditDialog,
		guideDialog
	)).addTo(document.querySelector("#app")!)



function codearea() {
	return div({ class: "code-area dracula" }).withRef((el: HTMLElement) => {
		 jar = CodeJar(el, withLineNumbers(highlight), { tab: "\t", })
		setTimeout(() => jar.updateCode(`# Write your RISC V code here \n \n \n \n 
 `), 100)
		jar.onUpdate(code => Program.value = code)
	})
}





