function abiRegisterDecoder(register: string) {
	let registerMap = {
		"zero": "x0",
		"ra": "x1",
		"sp": "x2",
		"gp": "x3",
		"tp": "x4",
		"fp": "x8",
		"s0": "x8",
		"s1": "x9",
	}
	if (register in registerMap) return registerMap[register];

	if (register.startsWith("x")) return register;
	if (register.startsWith("s")) {
		return "x" + (16 + parseInt(register.substring(1))).toString();
	}
	if (register.startsWith("t")) {
		let tNum = parseInt(register.substring(1));
		if (tNum >= 3) {
			return "x" + (28 + (tNum - 3)).toString();
		} else {
			return "x" + (5 + tNum).toString();
		}
	}
	if (register.startsWith("a")) {
		return "x" + (10 + parseInt(register.substring(1))).toString();
	}
}

function getFunct3(operation: string): number {
	switch (operation) {
		case "add":
		case "addi":
		case "sub":
		case "lb":
		case "sb":
		case "beq":
			return 0;
		case "lh":
		case "sh":
		case "bne":
			return parseInt("0x1", 16);
		case "lw":
		case "sw":
			return parseInt("0x2", 16);
		case "lbu":
		case "lhu":
		case "xori":
		case "blt":
			return parseInt("0x4", 16);
		case "bge":
		   return parseInt("0x5",16);
		case "andi":
			return parseInt("0x7", 16);
		case "ori":
			return parseInt("0x6", 16);
		default:
			return 0;
	}
}

function getFunct7(operation: string): number {
	switch (operation) {
		case "add":
			return parseInt("0x00", 16);
		case "sub":
			return parseInt("0x20", 16);
		default:
			return 0;
	}
}



function convertInstructionToBytes(instruction: string): Uint32Array {
	let parts = instruction.split(" ");
	parts = parts.map(part => part.trim());
	let rd: number;
	let rs1: number;
	let rs2: number;
	let imm: number;
	let imm2: number;
	let opcode: number;
	let funct3: number;
	let funct7: number;
	let word = new Uint32Array(1);


	if (parts.length >= 1) {
		const operation = parts[0];
		funct3 = getFunct3(operation);
		funct7 = getFunct7(operation);
		switch (operation) {
			case "add":
			case "sub":
				{
					// R-Type instruction
					rd = parseInt(abiRegisterDecoder(parts[1].replace(",", "")).replace("x", ""));
					rs1 = parseInt(abiRegisterDecoder(parts[2].replace(",", "")).replace("x", ""));
					rs2 = parseInt(abiRegisterDecoder(parts[3].replace(",", "")).replace("x", ""));
					opcode = parseInt("0110011", 2);
					word[0] = funct7 << 25 | rs2 << 20 | rs1 << 15 | funct3 << 12 | rd << 7 | opcode;
					break
				}

			case "addi":
			case "andi":
			case "ori":
			case "xori":
				{
					// I-Type instruction
					rd = parseInt(abiRegisterDecoder(parts[1].replace(",", "")).replace("x", ""));
					rs1 = parseInt(abiRegisterDecoder(parts[2].replace(",", "")).replace("x", ""));
					imm = parseInt(parts[3].replace(",", ""));
					opcode = parseInt("0010011", 2);

					word[0] = imm << 20 | rs1 << 15 | funct3 << 12 | rd << 7 | opcode;
					break;
				}
			case "lw":
			case "lh":
			case "lb":
			case "lhu":
			case "lbu":
				{
					// I-Type load instruction
					rd = parseInt(abiRegisterDecoder(parts[1].replace(",", "")).replace("x", ""));
					const offsetAndReg = parts[2];
					const reg = offsetAndReg.substring(offsetAndReg.indexOf('(') + 1, offsetAndReg.indexOf(')'));
					rs1 = parseInt(abiRegisterDecoder(reg).replace("x", ""));
					let offset = parseInt(offsetAndReg.substring(0, offsetAndReg.indexOf('(')));
					imm = offset;
					opcode = parseInt("0000011", 2);
					word[0] = imm << 20 | rs1 << 15 | funct3 << 12 | rd << 7 | opcode;

					break;
				}
			case "sw":
			case "sh":
			case "sb":
				{
					// S-Type store instruction
					rs2 = parseInt(abiRegisterDecoder(parts[1].replace(",", "")).replace("x", ""));
					const offsetAndReg = parts[2];

					const reg = offsetAndReg.substring(offsetAndReg.indexOf('(') + 1, offsetAndReg.indexOf(')'));
					rs1 = parseInt(abiRegisterDecoder(reg).replace("x", ""));
					let offset = parseInt(offsetAndReg.substring(0, offsetAndReg.indexOf('(')));
					imm = offset;
					opcode = parseInt("0100011", 2);
					word[0] = ((imm >> 5) << 25) | (rs2 << 20) | (rs1 << 15) | (funct3 << 12) | ((imm & 0x1F) << 7) | opcode;
					break;
				}
		   case "beq":
		   case "blt":
			case "bge":
			case "bne":{
				  // B-Type branch instruction 
			     rs1= parseInt(abiRegisterDecoder(parts[1].replace(",","")).replace("x",""))
				  rs2 = parseInt(abiRegisterDecoder(parts[2].replace(",","")).replace("x",""))
				  imm = parseInt(parts[3])
				  opcode = parseInt("1100011",2)
				  const offset= imm >> 1
				  const imm12 = (offset >> 11) & 0x1
				  const imm10_5 = (offset >> 5) & 0x3F
				  const imm4_1 = (offset >> 1) & 0xF
				  const imm11= (offset >> 10 ) & 0x1

				  word[0]= (imm12 << 31) | (imm10_5 << 25) | (rs2 << 20 ) | ( rs1  << 15 ) | (funct3 << 12 ) | (imm4_1 << 8) | (imm11 << 7) | opcode
				  break;
			 }
		}
	}
	return word
}


export function Assembler(instructions: string) {
	const instructionSet = instructions.split("\n");
	let bytecode: Uint32Array = new Uint32Array(instructionSet.length);
	let c = 0;
	for (let instruction of instructionSet) {
		if (instruction.trim() !== "" && !instruction.startsWith("#")) {
		  
			const [byteInstruction] = convertInstructionToBytes(instruction.trim());
			bytecode[c++] = byteInstruction;
		}
	}
	return bytecode.subarray(0,c);
}
