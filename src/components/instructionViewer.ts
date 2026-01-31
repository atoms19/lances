import { table, tr, th, td, tbody } from "dominity";
import { decodeInstruction } from "../lances-engine/dissasmbler";


export function instructionViewer(assembly) {
	return table(
		tr(
			th("Instruction"),
			th("Binary"),
			th("Hexadecimal")
		),
		tbody().forEvery(assembly, inst => {

			let { name } = decodeInstruction(inst)

			return (
				tr(
					td("" + name),
					td("" + inst.toString(2).padStart(32, '0')),
					td("0x" + inst.toString(16).padStart(8, '0'))
				)
			)
		}

		)
	)
}

export function instructionCurrent(instruction) {
	return (table(
		tr(
			th("Instruction"),
			th("Type"),
			th("Opcode"),
			th("rd"),
			th("rs1"),
			th("rs2"),
			th("funct3"),
			th("funct7"),
			th("imm")
		),
		tbody(
			tr(
				td(()=>instruction.value.name)
				, td(()=>instruction.value.type.substring(0,1))
				, td(()=>instruction.value.opcode?.toString(2).padStart(7, '0'))
				, td(()=>instruction.value.rd !== undefined ? instruction.value.rd.toString() : "")
				, td(()=>instruction.value.rs1 !== undefined ? instruction.value.rs1.toString() : "")
				, td(()=>instruction.value.rs2 !== undefined ? instruction.value.rs2.toString() : "")
				, td(()=>instruction.value.funct3 !== undefined ? instruction.value.funct3.toString(2).padStart(3, '0') : "")
				, td(()=>instruction.value.funct7 !== undefined ? instruction.value.funct7.toString(2).padStart(7, '0') : "")
				, td(()=>instruction.value.imm !== undefined ? instruction.value.imm.toString() : "")


			).css(()=> ({
				background:(instruction.value.name == "Program Ended" ? 'var(--currentInstruction)' :'')
			}))
		)

		))

}

