import { table, tr, div,input,th, td, tbody,derived,thead,state } from "dominity";


export function memoryTable(memoryState,sp,lastChnagedMemory) {
  let c=0;
  const wordMode = state(true); 
  let addresses = derived(()=>Array.from(memoryState.value).slice(sp.value,sp.value+100))
	return div(
	  // input({type:"checkbox",value:wordMode}).on("change", (e) => {
	  //  wordMode.value = e.target.checked;
	  //    }),
	  table(
	   thead(
				  tr(
					th("address"),
					th("Decimal"),
					th("Hexadecimal"),
					th("Binary")
			 )),
		tbody(
			
		).forEvery(addresses, (value, i) => {
		   let addr= i+sp.value;
			if(wordMode.value && addr % 4 !==0) return tr();
			return tr(
				td(`x${(addr).toString(16).padStart(8, '0')}`),
				td(() => memoryState.value[i].toString(10)),
				td(() => "0x" + memoryState.value[i].toString(16).padStart(8, '0')),
				td(() => memoryState.value[i].toString(2).padStart(32, '0')),
				// td(()=>lastChnagedMemory.value+"")
			).css(()=>({
				  background:(addr=== lastChnagedMemory.value ? '#77d999' : 'transparent')
			}))


		})
	)
	)
}
