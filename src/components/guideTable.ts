import { table, tr, th, td, tbody } from "dominity";
export function guideTable() {
	return table(

		tr(th("Instruction"), th("Description")),
		tbody(
			tr(td("add rd, rs1, rs2"), td("Adds the values in registers rs1 and rs2 and stores the result in register rd.")),
			tr(td("addi rd, rs1, imm"), td("Adds the immediate value imm to the value in register rs1 and stores the result in register rd.")),
			tr(td("and rd, rs1, rs2"), td("Performs a bitwise AND operation between the values in registers rs1 and rs2 and stores the result in register rd.")),
			tr(td("andi rd, rs1, imm"), td("Performs a bitwise AND operation between the value in register rs1 and the immediate value imm and stores the result in register rd.")),
			tr(td("auipc rd, imm20"), td("Adds the immdediate value imm20 (shifted left by 12 bits) to the current program counter (PC) and stores the result in register rd.")),
			tr(td("beq rs1, rs2, label"), td("Branches to the instruction at label if the values in registers rs1 and rs2 are equal.")),
			tr(td("bne rs1, rs2, label"), td("Branches to the instruction at label if the values in registers rs1 and rs2 are not equal.")),
			tr(td("blt rs1, rs2, label"), td("Branches to the instruction at label if the value in register rs1 is less than the value in register rs2.")),
			tr(td("bge rs1, rs2, label"), td("Branches to the instruction at label if the value in register rs1 is greater than or equal to the value in register")),
			tr(td("bgeu rs1, rs2, label"), td("Branches to the instruction at label if the unsigned value in register rs1 is greater than or equal to the unsigned value in register rs2.")),
			tr(td("bltu rs1, rs2, label"), td("Branches to the instruction at label if the unsigned value in register rs1 is less than the unsigned value in register rs2.")),
			tr(td("ebreak"), td("Causes the program to break (used for debugging purposes).")),
			tr(td("ecall"), td("Causes an environment call (used for system calls and exceptions).")),
			tr(td("jal rd, label"), td("Jumps to the instruction at label and stores the address of the next instruction in register rd.(return address PC+4 before jumping )")),
			tr(td("jalr rd, rs1, imm"), td("Jumps to the address computed by adding the immediate value imm to the value in register rs1 and stores the address of the next instruction in register rd.(return address PC+4 before jumping )")),
			tr(td("lb rd, offset(rs1)"), td("Loads a byte from memory at the address computed by adding offset to the value in register rs1 into register rd and sign-extends it to 32 bits.")),
			tr(td("lbu rd, offset(rs1)"), td("Loads a byte from memory at the address computed by adding offset to the value in register rs1 into register rd and zero-extends it to 32 bits.")),
			tr(td("lh rd, offset(rs1)"), td("Loads a half-word (16 bits) from memory at the address computed by adding offset to the value in register rs1 into register rd and sign-extends it to 32 bits.")),
			tr(td("lhu rd , offset(rs1)"), td("Loads a half-word (16 bits) from memory at the address computed by adding offset to the value in register rs1 into register rd and zero-extends it to 32 bits.")),
			tr(td("lui rd, imm20"), td("Loads the immediate value imm20 (shifted left by 12 bits) into the upper 20 bits of register rd, setting the lower 12 bits to zero.")),
			tr(td("lw rd, offset(rs1)"), td("Loads a 32-bit word from memory at the address computed by adding offset to the value in register rs1 into register rd.")),
			tr(td("or rd, rs1, rs2"), td("Performs a bitwise OR operation between the values in registers rs1 and rs2 and stores the result in register rd.")),
			tr(td("ori rd, rs1, imm"), td("Performs a bitwise OR operation between the value in register rs1 and the immediate value imm and stores the result in register rd.")),
			tr(td("sw rs2, offset(rs1)"), td("Stores a 32-bit word from register rs2 into memory at the address computed by adding offset to the value in register rs1.")),
			tr(td("sb rs2, offset(rs1)"), td("Stores the least significant byte of register rs2 into memory at the address computed by adding offset to the value in register rs1.")),
			tr(td("sh rs2, offset(rs1)"), td("Stores the least significant half-word (16 bits) of register rs2 into memory at the address computed by adding offset to the value in register rs1.")),
			tr(td("sll rd, rs1, rs2"), td("Shifts the value in register rs1 left by the number of bits specified in the lower 5 bits of register rs2 and stores the result in register rd.")),
			tr(td("slli rd, rs1, shamt"), td("Shifts the value in register rs1 left by the immediate value shamt and stores the result in register rd.")),
			tr(td("slt rd, rs1, rs2"), td("Sets register rd to 1 if the value in register rs1 is less than the value in register rs2; otherwise, sets rd to 0.")),
			tr(td("slti rd, rs1, imm"), td("Sets register rd to 1 if the value in register rs1 is less than the immediate value imm; otherwise, sets rd to 0.")),
			tr(td("sltiu rd, rs1, imm"), td("Sets register rd to 1 if the unsigned value in register rs1 is less than the immediate value imm; otherwise, sets rd to 0.")),
			tr(td("sra rd, rs1, rs2"), td("Shifts the value in register rs1 right arithmetically by the number of bits specified in the lower 5 bits of register rs2 and stores the result in register rd.")),
			tr(td("srai rd, rs1, shamt"), td("Shifts the value in register rs1 right arithmetically by the immediate value shamt and stores the result in register rd.")),
			tr(td("srl rd, rs1, rs2"), td("Shifts the value in register rs1 right logically by the number of bits specified in the lower 5 bits of register rs2 and stores the result in register rd.")),
			tr(td("srli rd, rs1, shamt"), td("Shifts the value in register rs1 right logically by the immediate value shamt and stores the result in register rd.")),
			tr(td("sub rd, rs1, rs2"), td("Subtracts the value in register rs2 from the value in register rs1 and stores the result in register rd.")),
			tr(td("xor rd, rs1, rs2"), td("Performs a bitwise XOR operation between the values in registers rs1 and rs2 and stores the result in register rd.")),
			tr(td("xori rd, rs1, imm"), td("Performs a bitwise XOR operation between the value in register rs1 and the immediate value imm and stores the result in register rd.")),
		)
	)

}


export function registerDescription() {
	const descriptions: { [key: string]: string } = {
		"zero(0x0)": "Constant value 0",
		"ra": "Return address for function calls",
		"sp": "Stack pointer",
		"gp": "Global pointer",
		"tp": "Thread pointer",
		"t0-t6": "Temporary registers",
		"s0-s11": "Saved registers",
		"a0-a7": "Function arguments and return values",
	};

	return table(
	  		tr(th("Register"), th("Description")),
		tbody(
			...Object.entries(descriptions).map(([reg, desc]) =>
				tr(td(reg), td(desc))
			)
		)
	)


}
