import {div,h2, p, button,state} from "dominity"

export function dialogBox({title, message,isOpen, onClose,component}: {isOpen?:any,component?:any,title: string, message: string, onClose?: () => void}) {
  if(!component){		
	   component=()=>div()
  }
  if(isOpen===undefined){
	  isOpen=state(true)
	}

  return div({ class: "dialog-backdrop" },
		div({ class: "dialog-box" },
			h2(title),
			p(message),
			component(),
			button("Close").on("click",()=>{
						  isOpen.value = false;  
				  if(onClose) onClose();
			})
			)
		).css(()=>({
			 display: isOpen.value ? "flex" : "none",
		}))

}
