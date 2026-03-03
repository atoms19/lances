import type { Memory } from "./Memory";

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

export function getAbiRegisterName(registerNumber: number): string {
	let registerMap = {
		0: "zero",
		1: "ra",
		2: "sp",
		3: "gp",
		4: "tp",
		8: "fp/s0",
		9: "s1",
	}
	if (registerNumber in registerMap) return registerMap[registerNumber];
	return ""
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
		case "slt":
		case "slti":
			return 0x2;
		case "sltu":
		case "sltiu":
			return 0x3;
		case "lbu":
		case "lhu":
		case "xori":
		case "xor":
		case "blt":
			return 0x4;
		case "bge":
		case "srl":
		case "srli":
		case "srai":
		case "sra":
			return 0x5;
		case "andi":
		case "and":
		case "bgeu":
			return 0x7;
		case "ori":
		case "or":
		case "bltu":
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
		case "srai":
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
			case "slt":
			case "sltu":
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
			case "srli":
			case "srai":
			case "slti":
			case "sltiu":
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
         case "ecall":
		   case "ebreak":{
				opcode = parseInt("1110011", 2);	
				imm = (parts[0] === "ebreak") ? 1 : 0;
				word[0] = imm << 20 | opcode;
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
			case "bgeu":
			case "bltu":
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
			case "lui":
			case "auipc": {
				// U-Type instruction
				rd = parseInt(abiRegisterDecoder(parts[1]))
				imm = parseInt(parts[2])
				opcode = operation === "lui" ? parseInt("0110111", 2) : parseInt("0010111", 2)
				word[0] = (imm << 12) | (rd << 7) | opcode;
				break

			}



		}
	}
	return word
}

const tokenize = (line: string) => {
	return line.match(/-?\.?\w+/g);

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

function handleDataInstruction(instruction: string[],adr:number,memory: Memory): number {
	let directive = instruction[1];
	let offsetLength = 0;
	switch (directive) {
		case ".word": {
			for( let i = 2; i < instruction.length; i++) {
			memory.writeWord(adr,parseInt(instruction[i]))
			 adr += 4;
			 offsetLength += 4;
			}
			console.log("MEMORY MEMORY",memory.memory)
			break;
		}
		case ".half": {
		   for(let i = 2 ; i < instruction.length; i++) {
			memory.writeHalf(adr,parseInt(instruction[2]));
			 adr += 2;
			 offsetLength += 2;
		   }
			break;
		}
		case ".byte": {
		  for ( let i = 2; i < instruction.length; i++) {
		   memory.writeByte(adr,parseInt(instruction[2]));
			 adr += 1;
			 offsetLength += 1;
		  }
			break;
		}
		case ".string":
	 	case ".asciiz": {
		  console.log("RECIEVED STRING ", instruction)
		  let recievedString = instruction.slice(2).join(" ");
		  for (let i = 0; i < recievedString.length; i++) {
			memory.writeByte(adr, recievedString.charCodeAt(i));
			adr += 1;
		  }
		  offsetLength = instruction.slice(2).join(" ").length + 1; // +1 for null terminator  
		  memory.writeByte(adr, 0); // null terminator
			 break;
		}
		case ".ascii": {
		  let recievedString = instruction.slice(2).join(" ");
		  for (let i = 0; i < recievedString.length; i++) {
			memory.writeByte(adr, recievedString.charCodeAt(i));
			adr += 1;
		  }
		  offsetLength = instruction.slice(2).join(" ").length; // no null terminator  
		  break;
		}
		case ".space": {
		  let spaceSize = parseInt(instruction[2]);
		  for (let i = 0; i < spaceSize; i++) {
			memory.writeByte(adr, 0);
			adr += 1;
		  }
		  offsetLength = spaceSize;
		  break;
	 }
  }

    

	 return offsetLength; 


	}




	function epreAssembler(instructions: string[], memory : Memory): string[] {
		const labelMap = new Map<string, number[]>();
		let mode = "text";
		let pc = 0;
		let storageStart = 0x0000000; // Starting address for .data section
		for (const line of instructions) {
			const inst = line.trim();
			if (inst === "" || inst.startsWith("#")) continue;

			if ((mode == 'data' && inst.includes(":")) || inst.endsWith(':') || inst === ".data" || inst === ".text") {

				let labelName = inst.slice(0, -1);

				if (inst.startsWith(".text")) {
					mode = "text";
					console.log('mode switched to text');
				}
				else if (inst.startsWith(".data")) {
					mode = "data";
					console.log('mode switched to data');
				} else if (mode === "text") {
					labelMap.set(inst.slice(0, -1), [0,pc]);
				} else if (mode === "data") {
					console.log('encounered data label ', labelName)
					let dataInst = tokenize(inst)
					let locationOffset = handleDataInstruction(dataInst,storageStart,memory);
					console.log("data instructions ", dataInst)
					labelMap.set(labelName.slice(0,labelName.lastIndexOf(':')), [1,storageStart]);
					storageStart += locationOffset;
				}


			} else if (tokenize(inst)[0] === "la") {
				pc += 8; // 'la' expands to 2 instructions
			}
			else {
				pc += 4; // 4 bytes per instruction
			}
		}

		console.log("LABELS : ", labelMap.keys())

		pc = 0;


		return instructions.map((line) => {
			let inst = line.trim();
			if (inst === "" || inst.startsWith("#") || inst.endsWith(":") || inst.startsWith('.')) {
				return line;
			}

			for (const [label, [mode,labelPC]] of labelMap) {
				const regex = new RegExp(`\\b${label}\\b`);
				if (regex.test(inst)) {
				   console.log(`Resolving label ${label} in instruction: ${inst} and ${labelPC} and mode ${mode}`); 
					const offsetBytes = mode ? labelPC : labelPC - pc;
					const imm = offsetBytes; // B-type rule
					inst = inst.replace(regex, imm.toString()+(!mode ? "" : " (0)"));
				}
			}
			if (tokenize(inst)[0] === "la") {
				pc += 8; // 'la' expands to 2 instructions
			} else {
				pc += 4;
			}
			return inst;
		});
	}


	function pseudoInstructionParser(instructionSet: string[]): string[] {
		return instructionSet.flatMap((instruction) => {
			if (instruction.trim() === "" || instruction.startsWith("#") || instruction.endsWith(":")) {
				return instruction;
			}
			let parts: RegExpMatchArray = tokenize(instruction.trim());
			if (parts.length === 0) return instruction;
			switch (parts[0]) {
				case "mv": {
					return `addi ${parts[1]}, ${parts[2]}, 0`
				}
				case "li": {
					return `addi ${parts[1]}, zero, ${parts[2]}`
				}
				case "j": {
					return `jal zero, ${parts[1]}`
				}
				case "jr": {
					return `jalr x0, 0(${parts[1]})`
				}
				case "ret": {
					return `jalr x0, 0(x1)`
				}
				case "nop": {
					return `addi x0, x0, 0`
				}
				case "la": {
					let ladr = parseInt(parts[2]);
					let upper20 = (ladr + 0x800) >> 12;
					let lower12 = ladr & 0xFFF;
					return [`lui ${parts[1]}, ${upper20}`, `addi ${parts[1]}, ${parts[1]}, ${lower12}`]

				}
				default: {
					return instruction;
				}
			}


		})

	}

	export function Assembler(instructions: string, memory : Memory) {
		let instructionSet = instructions.split("\n");
		instructionSet = pseudoInstructionParser(epreAssembler(instructionSet,memory))
		let bytecode: Uint32Array = new Uint32Array(instructionSet.length);
		let c = 0;
		for (let instruction of instructionSet) {
		  instruction=instruction.trimStart().trim();
			if (instruction.trim() !== "" && !instruction.startsWith("#") && !instruction.includes(':') && !instruction.trim().startsWith('.')) {
				const [byteInstruction] = convertInstructionToBytes(instruction.trim());
				bytecode[c++] = byteInstruction;
			}
		}


		return bytecode.subarray(0, c);
	}
