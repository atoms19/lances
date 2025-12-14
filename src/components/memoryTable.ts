import { table, tr, th, td, tbody,derived,thead } from "dominity";


export function memoryTable(memoryState,sp,lastChnagedMemory) {
  let c=0;
	return table(
	   thead(
				  tr(
					th("address"),
					th("Decimal"),
					th("Hexadecimal"),
					th("Binary")
			 )),
		tbody(
			
		).forEvery(derived(()=>Array.from(memoryState.value).slice(sp.value,sp.value+100)), (value, i) => {
		   let addr= i+sp.value;
			if(addr % 4 !==0) return tr();
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
}
