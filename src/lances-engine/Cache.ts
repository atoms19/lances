
interface CacheLookUp {
	valid: boolean;
	tag: number;
	blockOffset: number;
	wordOffset: number;
	byteOffset: number;
	data: Uint8Array;
}

interface Cache {
	hits: number;
	misses: number;
	data: CacheLookUp[];
	size: number;
	blockSize: number;
	lookup(address: number,requirement:number): CacheLookUp | null;
	set(address: number, data: Uint8Array): void;
	onUpdate?: (data:CacheLookUp[],index :number,extra : {hits:number,misses:number} )=> void;
}

class Cache {
	constructor(blockSize: number, size: number) {
		this.hits = 0;
		this.misses = 0;
		this.data = Array.from({ length: size }, () => ({
			tag: 0,
			blockOffset: 0,
			wordOffset: 0,
			byteOffset: 0,
			valid: false,
			data: new Uint8Array(blockSize)
		}));
		this.size = size;
		this.blockSize = blockSize;
	}

	lookup(address: number,requirement:number): CacheLookUp | null { // requirement is the number of bits requested this allows cache to keep hits and misses accurate
		const blockOffsetBits = Math.log2(this.blockSize); // we say we have 4 words in a block then we need 2 bits and so on
		const indexBits = Math.log2(this.size); // we say we have 8 sets then we need 3 bits and so on 
		const index = (address >>> blockOffsetBits) & (this.size - 1);
		const tag = address >>> (blockOffsetBits + indexBits);
		const cacheLine = this.data[index];
		if (cacheLine.valid && cacheLine.tag === tag) {
			  switch(requirement){
				  case 1: // byte
					 this.hits++;
				    break;
				  case 2: // half word  
					 this.hits+=0.5
				    break;
				  case 4:
					 this.hits+=0.25
				    break;
				  default:
					 this.hits=this.hits 
			  }

			if (this.onUpdate) {
						this.onUpdate(this.data,index,{hits:Math.round(this.hits),misses:Math.round(this.misses)})
			 }
			return cacheLine;
		}

		switch(requirement){
				  case 1: // byte
					 this.misses++;
				    break;
				  case 2: // half word  
					 this.misses+=0.5
				    break;
				  case 4:
					 this.misses+=0.25
				    break;
				  default:
					 this.misses=this.misses // do nothing  
			  }

		return null;
	}

	set(address: number, data: Uint8Array) {
		let blockOffsetBits = Math.log2(this.blockSize);
		let indexBits = Math.log2(this.size);
		let blockOffset = address & (this.blockSize - 1);
		let index = (address >>> blockOffsetBits) & (this.size - 1);
		let tag = address >>> (blockOffsetBits + indexBits);
		this.data[index] = { valid: true, tag, blockOffset, wordOffset: 0, byteOffset: 0, data };
      if(this.onUpdate){
		this.onUpdate(this.data,index,{hits:Math.round(this.hits),misses:Math.round(this.misses)})
	  }

	}


	


}


export default Cache;
