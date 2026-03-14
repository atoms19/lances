import { div,tbody,tr, table, thead, th ,td,h3} from "dominity";


export default function cacheTable(cacheState:any,lastChangedIndex:any) {

	return div({ class: "" },
		h3("Cache Table"),
		table(
			 thead(
				th("valid"),
				th("dirty"),
				th("tag"),
				th("block offset"),
				th("word offset"),
				th("byte offset"),
				th("data")
			 ),
			 tbody().forEvery(cacheState, (cacheLine:any,index) => {
						return tr(
								td(cacheLine.valid ? "1" : "0")
								,td(cacheLine.dirty ? "1" : "0")
								,td(cacheLine.tag+"")
								,td(cacheLine.blockOffset+"")
								,td(cacheLine.wordOffset+"")
								,td(cacheLine.byteOffset+"")
							  ,td(cacheLine.data.join(""))
						).css(()=> ({
						  background:(index === lastChangedIndex.value ? '#77d999' : 'transparent')
						}))
								  
			}))


		)

}

