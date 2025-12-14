import { RegisterFile } from "./registerFile";

interface InstructionMeta {
	name: string;
	type: string;
	opcode: number;
	funct3?: number;
	funct7?: number;
	imm?: number;
	rs1?: number;
	rs2?: number;
	rd?: number;
}

function decodeInstruction(instruction: number): InstructionMeta {
	let opcode = instruction & 0x7F; // bits 0-6
	let funct7: number;
	let rs2: number;
	let rs1: number;
	let funct3: number;
	let imm: number;
	let rd: number;
	console.log(opcode, opcode.toString(2).padStart(7, '0'));
	switch (opcode) {
		case parseInt("0110011", 2): { //R-Type
			rd = (instruction >> 7) & 0x1F;
			funct3 = (instruction >> 12) & 0x7;
			rs1 = (instruction >> 15) & 0x1F;
			rs2 = (instruction >> 20) & 0x1F;
			funct7 = (instruction >> 25) & 0x7F;
			let name = "unknown";
			if (funct3 === 0x0) {
				if (funct7 === 0x00) {
					name = "add";
				} else if (funct7 === 0x20) {
					name = "sub";
				}
			}
			return { name: name, type: "R-Type", opcode, funct3, funct7, rs1, rs2, rd };
		}
		case parseInt("0010011", 2): { //I-Type
			rd = (instruction >> 7) & 0x1F;
			funct3 = (instruction >> 12) & 0x7;
			rs1 = (instruction >> 15) & 0x1F;
			imm = (instruction >>> 20) & 0xFFF; //12 bits
			let name = "unknown";
			if (funct3 === 0x0) {
				name = "addi"
			} else if (funct3 == 0x4) {
				name = "xori"
			} else if (funct3 == 0x6) {
				name = "ori"
			} else if (funct3 == 0x7) {
				name = "andi"
			}
			return { name, type: "I-Type", opcode, funct3, rs1, imm, rd }
		}
		case parseInt("0000011", 2): { // Load instructions (I-Type)

			rd = (instruction >> 7) & 0x1F;
			funct3 = (instruction >> 12) & 0x7;
			rs1 = (instruction >> 15) & 0x1F;
			imm = (instruction >>> 20) & 0xFFF; //12 bits
			let name = "unknown";
			if (funct3 === 0x0) {
				name = "lb"
			} else if (funct3 == 0x1) {
				name = "lh"
			} else if (funct3 == 0x2) {
				name = "lw"
			} else if (funct3 == 0x4) {
				name = "lbu"
			} else if (funct3 == 0x5) {

				name = "lhu"
			}
			return { name, type: "I-Type", opcode, funct3, rs1, imm, rd }

		}
		case parseInt("0100011", 2): { // S-Type
		  let imm4_0= (instruction >> 7 ) & 0x1F;
		  funct3= (instruction >> 12) & 0x7
		  rs1=(instruction >> 15 ) & 0x1F;
		  rs2=(instruction >> 20) & 0x1F;
		  let imm11_5 = (instruction >> 25) & 0x7F

		  imm= (imm11_5 << 5 ) | imm4_0;
		  let name = "unknown"
		  if(funct3 == 0x0) name = "sb"
		  else if( funct3== 0x1 ) name ="sh"
		  else if(funct3 == 0x2 ) name = "sw"

		  return {name,type:"S-Type",opcode,funct3,rs1,rs2,imm}

		}
		case parseInt("1100011", 2): { // B-Type
        let imm11 = (instruction >> 7) & 0x1;
		  let imm4_1 = (instruction >> 8 )& 0xF;
		  funct3 =  (instruction >>  12 ) & 0x7
		  rs1 = (instruction >> 15 ) & 0x1F;
		  rs2 = (instruction >> 20 ) & 0x1F;
		  let imm10_5= (instruction >> 25 ) & 0x3F; // 6 bits
		  let imm12 = (instruction >> 31 ) & 0x1;
		  imm = imm12 << 12 | imm11 << 11 | imm10_5 <<5 | imm4_1 <<1;
		  let name = "unknown"
		  if(funct3 == 0x0) name = "beq"
		  else if(funct3 == 0x1) name = "bne"
		  else if(funct3 == 0x4) name = "blt"
		  else if(funct3 == 0x5) name = "bge"

		  return {name,type:"B-Type",opcode,funct3,rs1,rs2,imm}
		}
		default:
			return { name: "unknown", type: "unknown", opcode: opcode };

	}

}


export class Simulator {
	instructionMemory: Uint32Array;
	pc: number;
	dataMemory: Uint8Array;
	registers: RegisterFile;

	constructor() {
		this.pc = 0;
		console.log("Simulator initialized. PC set to 0.");
		this.dataMemory = new Uint8Array(1024 * 64); //64KB data memory
		this.registers = new RegisterFile();

	}

	loadProgram(program: Uint32Array) {
		this.instructionMemory = program;
	}


	ALUExecute(opName: string, val1: number, val2: number, imm?: number): number {
	 	switch (opName) {
			case "add":
				return (val1 + val2) >>> 0;
			case "sub":
				return (val1 - val2) >>> 0;
			case "addi":
				return (val1 + imm) >>> 0;
			case "xori":
				return (val1 ^ imm) >>> 0;
			case "ori":
				return (val1 | imm) >>> 0;
			case "andi":
				return (val1 & imm) >>> 0;
			default:
				throw new Error(`Unsupported operation: ${opName}`);
		}
	}

	executeInstruction(decoded: InstructionMeta) {
	  let val1:number,val2:number,resultDest:number;
		if (decoded.rs1 !== undefined) {
			 val1 = this.registers.readRegister(decoded.rs1);
		}
		if (decoded.rs2 !== undefined) {
			 val2 = this.registers.readRegister(decoded.rs2);
		}
		if (decoded.rd !== undefined) {
		    resultDest = decoded.rd; 
		}

		let result = this.ALUExecute(decoded.name, val1, val2, decoded.imm!);
		if (resultDest !== undefined) {
			this.registers.writeRegister(resultDest, result);
		}


	}

	stepForward() {
		let ins = this.instructionMemory[this.pc >> 2];
		let decoded = decodeInstruction(ins);
		console.log("PC:", this.pc, "Instruction:", ins.toString(16).padStart(8, '0'), decoded);
		this.executeInstruction(decoded);
		this.pc += 4;
	}

}
