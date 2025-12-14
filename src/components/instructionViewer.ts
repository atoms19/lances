import { table, tr, th, td, tbody } from "dominity";


export function instructionViewer(assembly) {
  	return table(
		tr(
			th("Instruction"),
			th("Binary"),
			th("Hexadecimal")
		),
		tbody().forEvery(assembly, inst => (
			tr(
				td(""+inst),
				td(""+ inst.toString(2).padStart(32, '0')),
				td( "0x" + inst.toString(16).padStart(8, '0'))
			)
		))
	)
}
