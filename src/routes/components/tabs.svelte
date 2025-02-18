<script lang="ts">
  type tabProps = {
    tabText: string,
    color: string,
    setChosen: (tabName: string) => void
  }

  let {tabText, color="gray", setChosen}: tabProps = $props()
  let route = $derived("/" + tabText.toLowerCase())

  function chooseEvent() {
    setChosen(tabText)
  }
  const base = "flex items-center justify-center px-5 h-12 py-3 mx-2 rounded-t-md font-[Staatliches] hover:bg-slate-700 hover:text-slate-100 "
  const colorClass = $derived.by(()=> {
    if(color === "gray") return base+" bg-slate-100 text-slate-700"
    else if(color ==="blue") return base+" bg-[#025773] text-slate-200"
    else if(color ==="green") return base+" bg-[#7AB66F] text-slate-700"
    else if(color ==="yellow") return base+" bg-yellow-100 text-slate-700"
    else if(color ==="purple") return base+" bg-neutral-500 text-slate-200"
    else if(color ==="chosen") return base+" bg-slate-700 text-slate-200"
    else return base
  })
</script>

<button onclick={chooseEvent}>
  <a class={colorClass} href={route}>{tabText}</a>
</button>
