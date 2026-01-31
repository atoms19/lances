
export class RegisterFile {
   registers: Uint32Array;
   onUpdate?:((index: number, value: number) => void) 
	constructor() {

	  			 this.registers = new Uint32Array(32);
				 for(let i =0; i < 32; i++) {
					 this.registers[i] = 0;
				 }
	 }
  readRegister(index:number):number {
	  if (index < 0 || index > 31) {
		  throw new Error("Register index out of bounds");
	  }
	  console.log(this.registers)
	  return this.registers[index];
  }
  writeRegister(index:number, value:number):void {
	 if(index < 0 || index > 31) {
		 throw new Error("Register index out of bounds");
	 }
	 if(index === 0) 
		 return; // x0 is always 0
	  this.registers[index] = value >>> 0; // ensure unsigned 32-bit
	  if(this.onUpdate) {
		  this.onUpdate(index, this.registers[index]);
	  }
  }
  registerOnUpdate(callback:(index: number, value: number) => void):void {
	  this.onUpdate = callback;
	} 
	
}
