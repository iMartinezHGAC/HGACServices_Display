<script lang="ts">
  import {jurisState} from "../../state/jurisState.svelte"

  type tabProps = {
    tabText: string,
    path: string,
    color: string,
    setChosen: (tabName: string) => void
  }

  const jurisId = jurisState()

  let {tabText, path, color="gray", setChosen}: tabProps = $props()
  let route = $derived( jurisId.uuid + "/" + path)
  //$inspect('full route', route)

  function chooseEvent() {
    setChosen(tabText)
  }
  const base = "flex items-center justify-center px-5 h-12 py-3 mx-2 rounded-t-md font-[Staatliches] hover:bg-slate-700 hover:text-slate-100 "
  const colorClass = $derived.by(()=> {
    if(color === "gray") return base+" bg-slate-100 text-slate-700"
    else if(color ==="blue") return base+" bg-[#8FBC8f] text-slate-700"
    else if(color ==="green") return base+" bg-[#3CB371] text-slate-700"
    else if(color ==="orange") return base+" bg-[#F0E68C] text-slate-700"
    else if(color ==="dblue") return base+" bg-[#4682B4] text-slate-200"
    else if(color ==="red") return base+" bg-[#E9967A] text-slate-700"
    else if(color ==="pink") return base+" bg-[#D2B48C] text-slate-700"
    else if(color ==="teal") return base+" bg-[#B0E0E6] text-slate-700"
    else if(color ==="purple") return base+" bg-[#A0522D] text-slate-200"
    else if(color ==="chosen") return base+" bg-slate-700 text-slate-200"
    else return base

    /*
    if(color === "gray") return base+" bg-slate-100 text-slate-700"
    else if(color ==="blue") return base+" bg-[#66B2FF] text-slate-700"
    else if(color ==="green") return base+" bg-[#66FF66] text-slate-700"
    else if(color ==="orange") return base+" bg-[#FFCC66] text-slate-700"
    else if(color ==="dblue") return base+" bg-[#6666FF] text-slate-700"
    else if(color ==="red") return base+" bg-[#FF6666] text-slate-700"
    else if(color ==="pink") return base+" bg-[#FF66CC] text-slate-700"
    else if(color ==="teal") return base+" bg-[#66FFFF] text-slate-700"
    else if(color ==="purple") return base+" bg-[#CC66FF] text-slate-700"
    else return base
    */

  })
</script>

<button onclick={chooseEvent}>
  <a class={colorClass} href={route}>{tabText}</a>
</button>
