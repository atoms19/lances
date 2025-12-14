import { table, tr, th, td, tbody,derived,thead } from "dominity";


export function memoryTable(memoryState) {
	return table(
	   thead(
				  tr(
					th("address"),
					th("Decimal"),
					th("Hexadecimal"),
					th("Binary")
			 )),
		tbody(
			
		).forEvery(derived(()=>Array.from(memoryState.value)), (value, i) => (
			tr(
				td(`x${i}`),
				td(() => memoryState.value[i].toString(10)),
				td(() => "0x" + memoryState.value[i].toString(16).padStart(8, '0')),
				td(() => memoryState.value[i].toString(2).padStart(32, '0'))
			)
		))
	)
}
