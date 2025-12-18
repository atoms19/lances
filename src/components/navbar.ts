import {nav,div,a,span,state} from "dominity"

export function navbar(){
  let darkmode=state(false);
    return nav({class:"navbar"},
							 div({class:"navbar-left"},
								 a({href:"#"},span("Lances-IDE"))
							 ),
							 div({class:"navbar-right"},
								 a({href:"#"},span(()=>darkmode.value ? "light" : "dark")).on("click",()=>{
  									 darkmode.value = !darkmode.value;
									 if(darkmode.value){
										 document.body.classList.add("dark");
									 }else{
										 document.body.classList.remove("dark");
									 }				
								 }),
								 a({href:"#"},span("GitHub"))
							 )
						 )

}
