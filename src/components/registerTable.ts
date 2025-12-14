import { table, tr, th, td, tbody,derived,thead } from "dominity";


export function registerTable(registerStates,lastChangedRegister) {
	return table(
	   thead(
				  tr(
					th("Register"),
					th("Decimal"),
					th("Hexadecimal"),
					th("Binary")
			 )),
		tbody(
			
		).forEvery(derived(()=>Array.from(registerStates.value)), (value, i) => (
			tr(
				td(`x${i}`),
				td(() => registerStates.value[i].toString(10)),
				td(() => "0x" + registerStates.value[i].toString(16).padStart(8, '0')),
				td(() => registerStates.value[i].toString(2).padStart(32, '0'))
			).css(()=> ({
						  background:(i === lastChangedRegister.value ? '#77d999' : 'transparent')
			}))
		))
	)
}
