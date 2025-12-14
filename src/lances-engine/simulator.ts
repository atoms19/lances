import { Memory } from "./Memory";
import { RegisterFile } from "./registerFile";
import { decodeInstruction, type InstructionMeta } from "./dissasmbler";
import { currentInstruction } from "../main";



export class Simulator {
	instructionMemory: Uint32Array;
	pc: number;
	dataMemory: Memory;
	registers: RegisterFile;

	constructor() {
		this.pc = 0;
		console.log("Simulator initialized. PC set to 0.");
		this.dataMemory = new Memory(1024 * 4); //4KB data memory
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
			case "sb": {
				return this.dataMemory.writeByte(val1 + imm!, val2 & 0xFF), 0;
			}
			case "sh": {
				// storing half word in little endian
				this.dataMemory.writeByte(val1 + imm!, val2 & 0xFF);
				this.dataMemory.writeByte(val1 + imm! + 1, (val2 >> 8) & 0xFF);
				return 0;
			}
			case "sw": {
				// storing word in little endian
				this.dataMemory.writeByte(val1 + imm!, val2 & 0xFF);
				this.dataMemory.writeByte(val1 + imm! + 1, (val2 >> 8) & 0xFF);
				this.dataMemory.writeByte(val1 + imm! + 2, (val2 >> 16) & 0xFF);
				this.dataMemory.writeByte(val1 + imm! + 3, (val2 >> 24) & 0xFF);
				return 0;
			}
			case "lb": {
				return this.dataMemory.readByte(val1 + imm!) << 24 >> 24; // sign extend 
			}
			case "lh": {
				//half word is 2 bytes 9
				// read from val1+imm+1 and val1+imm then join 
				//first read twp
				let byte1 = this.dataMemory.readByte(val1 + imm!)
				let byte2 = this.dataMemory.readByte(val1 + imm! + 1);
				let halfword = byte2 << 8 | byte1;
				return halfword << 16 >> 16; // sign extend
			}
			case "lw": {
				//word is 4 bytes
				let byte1 = this.dataMemory.readByte(val1 + imm!);
				let byte2 = this.dataMemory.readByte(val1 + imm! + 1);
				let byte3 = this.dataMemory.readByte(val1 + imm! + 2);
				let byte4 = this.dataMemory.readByte(val1 + imm! + 3);
				let word = (byte4 << 24) | (byte3 << 16) | (byte2 << 8) | byte1;
				return word >>> 0; // unsigned
			}
			default:
				throw new Error(`Unsupported operation: ${opName}`);
		}
	}

	decodeBranchedInstruction(decoded: InstructionMeta) {
		let val1 = this.registers.readRegister(decoded.rs1!);
		let val2 = this.registers.readRegister(decoded.rs2!);
		let isBranching = false;
		switch (decoded.name) {
			case "beq":
				isBranching = (val1 === val2);
				break;
			case "bne":
				isBranching = (val1 !== val2);
				break;
			case "blt":
				isBranching = ((val1 | 0) < (val2 | 0));
				break;
			case "bge":
				isBranching = ((val1 | 0) >= (val2 | 0));
				break;
		}
		if (isBranching) {
			this.pc = this.pc + decoded.imm!; // pc relative
		}else{
		  			this.pc +=4;
		}
	}


	executeInstruction(decoded: InstructionMeta) {
		let val1: number, val2: number, resultDest: number;
		if (decoded.rs1 !== undefined) {
			val1 = this.registers.readRegister(decoded.rs1);
		}
		if (decoded.rs2 !== undefined) {
			val2 = this.registers.readRegister(decoded.rs2);
		}
		if (decoded.rd !== undefined) {
			resultDest = decoded.rd;
		}
	 	if (decoded.type == "B-Type") {
			this.decodeBranchedInstruction(decoded);
			return
		}

		let result = this.ALUExecute(decoded.name, val1, val2, decoded.imm!);
		if (resultDest !== undefined) {
			this.registers.writeRegister(resultDest, result);
		}
			this.pc += 4; // move to next instruction

	}

	stepForward() {
		let ins = this.instructionMemory[this.pc >> 2];
		let decoded = decodeInstruction(ins);
		if(ins==undefined){

		console.log("End of program reached."); 
		 currentInstruction.value = {
			 name:"Program Ended",
			 type:"",
			 opcode:0
		 }
		 return 
		}
		console.log("PC:", this.pc, "Instruction:", ins.toString(16).padStart(8, '0'), decoded);
		currentInstruction.value = decoded;
		this.executeInstruction(decoded);
	}

}
