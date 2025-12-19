
interface Keyword{
	 name:string,
	 type:"keyword"
}

interface Register {
   name: string,
	isAbiName:boolean,
	registerNo:number,
	type:"register"
}

interface Immediate{
  value:number,
  type:"immediate"
}

interface Symbol{
	name:string,
	type:"symbol"
}

type Token = Keyword | Register | Immediate | Symbol;

function parseInstruction(instrctns:string){
		let current:string;
		let parsed:Token[];
	   let i =0;

		while(i < instrctns.length){
				if(instrctns[i]){

				}

		}
		

		


}
