// risc v memory is byte addressable
// we give 64KB of memory 

export class Memory {
	 memory: Uint8Array;
	 onUpdate?: ((address: number, value: number) => void)
	 constructor(sizeInBytes: number) {
		 this.memory = new Uint8Array(sizeInBytes);
	 }
	 readByte(address:number):number {
		if(address < 0 || address >= this.memory.length) {
		  			throw new Error("Memory read out of bounds");
		}
		return this.memory[address];
	 }
	 writeByte(address:number, value:number):void {
		console.log("Writing value", value, "to address", address);
		if(address < 0 || address >= this.memory.length) {
			throw new Error("Memory write out of bounds");
		}
		this.memory[address] = value & 0xFF; // masking to 8 bits
		if(this.onUpdate) {
			this.onUpdate(address, this.memory[address]);
		}
	 }

	 
	 registerOnUpdate(callback:(address: number, value: number) => void):void {
		 this.onUpdate = callback;
	 }

    



}
