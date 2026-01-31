function abiRegisterDecoder(register: string) {
	let registerMap = {
		"zero": "0",
		"ra": "1",
		"sp": "2",
		"gp": "3",
		"tp": "4",
		"fp": "8",
		"s0": "8",
		"s1": "9",
	}
	if (register in registerMap) return registerMap[register];

	if (register.startsWith("x")) return register.substring(1);
	if (register.startsWith("s")) {
		return (16 + parseInt(register.substring(1))).toString();
	}
	if (register.startsWith("t")) {
		let tNum = parseInt(register.substring(1));
		if (tNum >= 3) {
			return (28 + (tNum - 3)).toString();
		} else {
			return + (5 + tNum).toString();
		}
	}
	if (register.startsWith("a")) {
		return (10 + parseInt(register.substring(1))).toString();
	}
}


function getFunct3(operation: string): number {
	switch (operation) {
		case "add":
		case "addi":
		case "sub":
		case "lb":
		case "sb":
		case "jalr":
		case "beq":
			return 0;
		case "lh":
		case "sh":
		case "bne":
		case "slli":
		case "sll":
			return 0x1;
		case "lw":
		case "sw":
			return 0x2;
		case "lbu":
		case "lhu":
		case "xori":
		case "xor":
		case "blt":
			return 0x4; 
		case "bge":
		case "srl":
			return 0x5; 
		case "andi":
		case "and":
			return  0x7;
		case "ori":
		case "or":
			return 0x6; 
		default:
			return 0;
	}
}

function getFunct7(operation: string): number {
	switch (operation) {
		case "add":
			return 0x00
		case "sub":
		case "sra":
			return 0x20;
		default:
			return 0;
	}
}



function convertInstructionToBytes(instruction: string): Uint32Array {
	let parts: RegExpMatchArray = tokenize(instruction);
	let rd: number;
	let rs1: number;
	let rs2: number;
	let imm: number;
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
			case "and":
			case "or":
			case "xor":
		   case "sll":
		   case "srl":
			case "sra":
				{
					// R-Type instruction
					rd = parseInt(abiRegisterDecoder(parts[1]));
					rs1 = parseInt(abiRegisterDecoder(parts[2]));
					rs2 = parseInt(abiRegisterDecoder(parts[3]))
					opcode = parseInt("0110011", 2);
					word[0] = funct7 << 25 | rs2 << 20 | rs1 << 15 | funct3 << 12 | rd << 7 | opcode;
					break
				}

			case "addi":
			case "andi":
			case "ori":
			case "xori":
			case "slli":
				{
					console.log(parts)
					// I-Type instruction
					console.log(abiRegisterDecoder(parts[1]))
					rd = parseInt(abiRegisterDecoder(parts[1]));
					rs1 = parseInt(abiRegisterDecoder(parts[2]));
					imm = parseInt(parts[3]);
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
					rd = parseInt(abiRegisterDecoder(parts[1]));
					if (parts.length == 3) {
						rs1 = parseInt(parts[2]);
						imm = 0;
					} else if (parts.length == 4) {
						imm = parseInt(parts[2]);
						rs1 = parseInt(abiRegisterDecoder(parts[3]));
					}


					opcode = parseInt("0000011", 2);
					word[0] = imm << 20 | rs1 << 15 | funct3 << 12 | rd << 7 | opcode;

					break;
				}
			case "jalr":
				{
					rd = parseInt(abiRegisterDecoder(parts[1]));
					rs1 = parseInt(abiRegisterDecoder(parts[2]));
					imm = parseInt(parts[3]);
					opcode = parseInt("1100111", 2);

					word[0] = imm << 20 | rs1 << 15 | funct3 << 12 | rd << 7 | opcode;
					break;
				}
			case "sw":
			case "sh":
			case "sb":
				{
					let offset = 0;
					// S-Type store instruction
					rs2 = parseInt(abiRegisterDecoder(parts[1]));
					if (parts.length == 3) {
						rs1 = parseInt(parts[2]);
						offset = 0;
					} else if (parts.length == 4) {
						offset = parseInt(parts[2]);
						rs1 = parseInt(abiRegisterDecoder(parts[3]));
					}
					imm = offset;
					opcode = parseInt("0100011", 2);
					word[0] = ((imm >> 5) << 25) | (rs2 << 20) | (rs1 << 15) | (funct3 << 12) | ((imm & 0x1F) << 7) | opcode;
					break;
				}
			case "beq":
			case "blt":
			case "bge":
			case "bne": {
				// B-Type branch instruction 
				rs1 = parseInt(abiRegisterDecoder(parts[1]))
				rs2 = parseInt(abiRegisterDecoder(parts[2]))
				imm = parseInt(parts[3])
				opcode = parseInt("1100011", 2)
				const offset = imm >> 1

				imm = (imm << 19) >> 19;
				const imm12 = (offset >> 11) & 0x1
				const imm10_5 = (offset >> 4) & 0x3F
				const imm4_1 = (offset >> 0) & 0xF
				const imm11 = (offset >> 10) & 0x1


				word[0] = (imm12 << 31) | (imm10_5 << 25) | (rs2 << 20) | (rs1 << 15) | (funct3 << 12) | (imm4_1 << 8) | (imm11 << 7) | opcode

				console.log("branch word:", word[0].toString(2).padStart(32, '0'))
				console.log("branch imm:", imm.toString(2).padStart(32, '0'))

				break;
			}
			case "jal": {
				rd = parseInt(abiRegisterDecoder(parts[1]))
				imm = parseInt(parts[2])
				opcode = parseInt("1101111", 2)
				let offset = imm >> 1  //  immediates in risc are 2 bit aligned 
				let imm10_1 = offset & 0x3FF;
				let imm11 = (offset >> 10) & 0x1;
				let imm19_12 = (offset >> 11) & 0xFF;
				let imm20 = (offset >> 19) & 0x1;


				word[0] = (imm20 << 31) | (imm10_1 << 21) | (imm11 << 20) | (imm19_12 << 12) | (rd << 7) | opcode
				break
			}



		}
	}
	return word
}

const tokenize = (line: string) => {
	return line.match(/-?\w+/g);
};



function preAssembler(instructions: string[]): string[] {
	let LabelMaps = new Map<string, number>()
	let modified: string[] = []
	let offset = 0;
	for (let instruction of instructions) {
		instruction = instruction.trim();
		if (instruction === "" || instruction.startsWith("#")) continue;
		if (!instruction.endsWith(":")) {
			offset += 4
			continue;
		}
		LabelMaps.set(instruction.slice(0, -1), offset);
	}


	let ioffset = 0;
	instructions.forEach((instruction, i) => {
	  instruction = instruction.trim();
		for (let entry of LabelMaps.keys()) {
			if (instruction.endsWith(entry) && !instructions.includes(':')) {
				const regex = new RegExp(`\\b${entry}\\b`, "g");
				if (regex.test(instruction)) {
					const offset = ioffset - LabelMaps.get(entry)!;
					instructions[i] = instruction.replace(regex, offset.toString());
				}
			}
		}
		if (instruction.trim() !== "" && !instruction.endsWith(":")) {
			ioffset += 4
		}
	})

   

	return instructions;

}


export function Assembler(instructions: string) {
	let instructionSet = instructions.split("\n");
	instructionSet = preAssembler(instructionSet)
	let bytecode: Uint32Array = new Uint32Array(instructionSet.length);
	let c = 0;
	for (let instruction of instructionSet) {
		if (instruction.trim() !== "" && !instruction.startsWith("#") && !instruction.includes(':')) {
			const [byteInstruction] = convertInstructionToBytes(instruction.trim());
			bytecode[c++] = byteInstruction;
		}
	}


	return bytecode.subarray(0, c);
}
