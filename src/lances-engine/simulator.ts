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
			case "and":
					 return (val1 & val2) >>> 0;
			case "or":
				return (val1 | val2) >>> 0;
			case "xor":
						return (val1 ^ val2) >>> 0;
			case "sll":
			     return val1 << (val2 & 0x1F);
			case "srl":
			     return val1 >>> (val2 & 0x1F);
			case "sra":
			     return (val1 >> (val2 & 0x1F)) >>> 0;
			case "slt":
			     return ((val1 | 0) < (val2 | 0)) ? 1 : 0;   // we are doing or 0 to convert to signed
			case "sltu":
			     return (val1 < val2) ? 1 : 0; // unsigned comparison
			case "addi":
				return (val1 + imm) >>> 0;
			case "xori":
				return (val1 ^ imm) >>> 0;
			case "ori":
				return (val1 | imm) >>> 0;
			case "andi":
				return (val1 & imm) >>> 0;
			case "slli":
				return (val1 << (imm! & 0x1F)) >>> 0;
			case "srli":
				return (val1 >>> (imm! & 0x1F)) >>> 0;
			case "srai":
				 return (val1 >> (imm! & 0x1F)) >>> 0;
			case "slti":
			     return ((val1 | 0) < (imm! | 0)) ? 1 : 0;
			case "sltiu":
			     return (val1 < imm!) ? 1 : 0;
			case "sb": {
				return this.dataMemory.writeByte(val1 + imm!, val2 & 0xFF), 0;
			}
			case "sh": {
				this.dataMemory.writeHalf(val1 + imm!, val2 & 0xFFFF);
				return 0;
			}
			case "sw": {
				this.dataMemory.writeWord(val1 + imm!, val2 >>> 0);
				return 0;
			}
			case "lb": {
				return this.dataMemory.readByte(val1 + imm!) << 24 >> 24; // sign extend 
			}
			case "lh": {
				return this.dataMemory.readHalf(val1 + imm!) << 16 >> 16; // sign extend
			}
			case "lw": {
			  return this.dataMemory.readWord(val1 + imm!) >>> 0; 
			}
			case "lbu":{
			  return this.dataMemory.readByte(val1 + imm!) & 0xFF;
			 }
			 case "lhu":{
						  return this.dataMemory.readHalf(val1 + imm!) & 0xFFFF;
		  }
			default:
				throw new Error(`Unsupported operation: ${opName}`);
		}
	}

	decodeBranchedInstruction(decoded: InstructionMeta) {
	  console.log("branching instruction", decoded);
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
		  case "bltu":
			  isBranching = (val1 < val2);
			  break;
		  case "bgeu":
			  isBranching = (val1 >= val2);
			  break;
		}
		if (isBranching) {
		  console.log('Branch taken to', this.pc + decoded.imm!,'isss    ', decoded.imm!);
			this.pc = this.pc + decoded.imm!; // pc relative
			return 
		} else {
		  console.log('Branch not taken');
			this.pc += 4;
			return;
		}
	}

	executeJAL(decoded:InstructionMeta){
	   this.registers.writeRegister( decoded.rd!, this.pc + 4);
	   this.pc += decoded.imm!;
	}
	executeJALR(decoded:InstructionMeta){
	   this.registers.writeRegister( decoded.rd!, this.pc + 4);
		this.pc = ( this.registers.readRegister( decoded.rs1! ) + decoded.imm! ) & ~1;
	 }
   


	executeInstruction(decoded: InstructionMeta) {
	   console.log("the current line ",this.pc);
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
		console.log("Executing instruction:", decoded.type);
		if (decoded.type == "B-Type") {
		  console.log("Executing branch instruction");
			this.decodeBranchedInstruction(decoded);
			return
		}
		if(decoded.type == "J-Type"){
         this.executeJAL(decoded);
			return 
		}
		if(decoded.type == "I-Type" && decoded.name == "jalr"){
		  this.executeJALR(decoded);
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
		console.log("INSTRUCTION MEMORY ", this.instructionMemory);
		let decoded = decodeInstruction(ins);
		if (ins == undefined) {
			console.log("End of program reached.");
			currentInstruction.value = {
				name: "Program Ended",
				type: "",
				opcode: 0
			}
			return
		}
		console.log("PC:", this.pc, "Instruction:", ins.toString(16).padStart(8, '0'), decoded);
		currentInstruction.value = decoded;
		this.executeInstruction(decoded);
	}

}

