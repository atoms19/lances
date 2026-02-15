export interface InstructionMeta {
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
export function decodeInstruction(instruction: number): InstructionMeta {
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
			rd = (instruction >>> 7) & 0x1F;
			funct3 = (instruction >> 12) & 0x7;
			rs1 = (instruction >>> 15) & 0x1F;
			rs2 = (instruction >>> 20) & 0x1F;
			funct7 = (instruction >>> 25) & 0x7F;
			let name = "unknown R type ";
			if (funct3 === 0x0) {
				if (funct7 === 0x00) {
					name = "add";
				} else if (funct7 === 0x20) {
					name = "sub";
				}
			}else if (funct3 === 0x7) {
				name = "and";
		   } else if (funct3 === 0x6) {
				name = "or";
		   }else if (funct3 === 0x4) {	
			  	name = "xor";
		   }else if (funct3 === 0x1) {
				name = "sll";
		  }else if (funct3 === 0x5) {
				if (funct7 === 0x00) {
					name = "srl";
				} else if (funct7 === 0x20) {
					name = "sra";
				}
		  }else if (funct3 === 0x2) {
				name = "slt";
		  }else if (funct3 === 0x3) {
				name = "sltu";
		  }
		 
			return { name: name, type: "R-Type", opcode, funct3, funct7, rs1, rs2, rd };
		}

		case parseInt("1100111", 2):  // I-Type jalr
		case parseInt("0010011", 2): { //I-Type
			rd = (instruction >>> 7) & 0x1F;
			funct3 = (instruction >>> 12) & 0x7;
			rs1 = (instruction >>> 15) & 0x1F;
			funct7 = (instruction >>> 25) & 0x7F;
			imm = (instruction >>> 20) & 0xFFF; //12 bits

				imm = (imm << 20) >> 20; // sign extension
			let name = "unknown I type ";
			if (funct3 === 0x0) {
				name = "addi"
			} else if (funct3 == 0x4) {
				name = "xori"
			} else if (funct3 == 0x6) {
				name = "ori"
			} else if (funct3 == 0x7) {
				name = "andi"
			}else if (funct3 == 0x1) {
						name = "slli"
			}else if (funct3 == 0x5) {
					 if (funct7 === 0x00) {
						 name = "srli"
					 }
					 else if (funct7 === 0x20) {
						 name = "srai"
					 }
			}else if (funct3 == 0x2) {
			   name = "slti"
		   }else if (funct3 == 0x3) {
				name = "sltiu"
		   }
		   if(opcode === parseInt("1100111", 2)){
			  name = "jalr"
		   }

			return { name, type: "I-Type", opcode, funct3, rs1, imm, rd }
		}
		case parseInt("0000011", 2): { // Load instructions (I-Type)

			rd = (instruction >>> 7) & 0x1F;
			funct3 = (instruction >>> 12) & 0x7;
			rs1 = (instruction >>> 15) & 0x1F;
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
			let imm4_0 = (instruction >>> 7) & 0x1F;
			funct3 = (instruction >>> 12) & 0x7
			rs1 = (instruction >>> 15) & 0x1F;
			rs2 = (instruction >>> 20) & 0x1F;
			let imm11_5 = (instruction >>> 25) & 0x7F

			imm = (imm11_5 << 5) | imm4_0;
			let name = "unknown"
			if (funct3 == 0x0) name = "sb"
			else if (funct3 == 0x1) name = "sh"
			else if (funct3 == 0x2) name = "sw"

			return { name, type: "S-Type", opcode, funct3, rs1, rs2, imm }

		}
		case parseInt("1100011", 2): { // B-Type
			let imm11 = (instruction >> 7) & 0x1;
			let imm4_1 = (instruction >> 8) & 0xF;
			funct3 = (instruction >> 12) & 0x7
			rs1 = (instruction >> 15) & 0x1F;
			rs2 = (instruction >> 20) & 0x1F;
			let imm10_5 = (instruction >> 25) & 0x3F; // 6 bits
			let imm12 = (instruction >> 31) & 0x1;
			imm = imm12 << 12 | imm11 << 11 | imm10_5 << 5 | imm4_1 << 1;
		 

			// doing sign extensoon
			imm = (imm << 19) >> 19; 

			let name = "unknown"
			if (funct3 == 0x0) name = "beq"
			else if (funct3 == 0x1) name = "bne"
			else if (funct3 == 0x4) name = "blt"
			else if (funct3 == 0x5) name = "bge"
		   else if (funct3 == 0x6) name = "bltu"
		   else if (funct3 == 0x7) name = "bgeu"

			return { name, type: "B-Type", opcode, funct3, rs1, rs2, imm }
		}

	  case parseInt("1101111", 2): { // J-Type jal

			rd = (instruction >>> 7) & 0x1F;
		  let imm19_12 = (instruction >> 12 ) & 0xFF;
		  let imm11 = (instruction >> 20 ) & 0x1;
		  let imm10_1 = (instruction >> 21 ) & 0x3FF;
		  let imm20 = (instruction >> 31 ) & 0x1;

		  imm = (imm20 << 20) | (imm19_12 << 12) | (imm11 << 11) | (imm10_1 << 1);
		  // sign extension
		  imm = (imm << 11) >> 11; // imm is 32 bits but we have only 21 bits used
		  return { name: "jal", type: "J-Type", opcode, rd, imm };
		}

		case parseInt("0110111", 2): // U-Type LUI
		case parseInt("0010111", 2): { // U-Type AUIPC
				  rd = (instruction >>> 7) & 0x1F;
				  imm = instruction & 0xFFFFF000; // upper 20 bits
				  opcode = instruction & 0x7F;
				 let name = opcode === parseInt("0110111", 2) ? "lui" : "auipc";
				  return { name, type: "U-Type", opcode, rd, imm };
		}

		default:
			return { name: "unknown", type: "unknown", opcode: opcode };

	}

}


