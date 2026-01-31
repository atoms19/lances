// risc v memory is byte addressable
// we give 64KB of memory


export class Memory {
	 memory: Uint8Array;
	 onUpdate?: ((address: number, value: number) => void)
	 constructor(sizeInBytes: number) {
		 this.memory = new Uint8Array(sizeInBytes);
	 }

	 // byte I/O
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

	 // half 
	 writeHalf(address:number, value:number):void{
		this.writeByte(address, value & 0xFF); // last 8 bits first 
		this.writeByte(address + 1, (value >> 8) & 0xFF); // next 8 bits
	 }

	 readHalf(address:number):number{
		const byte1= this.readByte(address);
		const byte2= this.readByte(address + 1);
		return byte2 << 8 | byte1;
	 }

	 // word
	 writeWord(address:number, value:number):void{
		this.writeByte(address, value & 0xFF); // last 8 bits first
		this.writeByte(address + 1, (value >> 8) & 0xFF); // next 8 bits
		this.writeByte(address + 2, (value >> 16) & 0xFF); // next 8 bits
		this.writeByte(address + 3, (value >> 24) & 0xFF); // first 8 bits
	 }

	 readWord(address:number):number{
		const byte1= this.readByte(address);
		const byte2= this.readByte(address + 1);
		const byte3= this.readByte(address + 2);
		const byte4= this.readByte(address + 3);
		return (byte4 << 24) | (byte3 << 16) |  (byte2 << 8) | byte1;
	 }

	 
	 registerOnUpdate(callback:(address: number, value: number) => void):void {
		 this.onUpdate = callback;
	 }

    



}
