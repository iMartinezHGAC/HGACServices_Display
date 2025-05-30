<script lang="ts">
  type tabProps = {
    tabText: string,
    path: string,
    color: string,
    uuid: string,
    setChosen: (tabName: string) => void
  }


  let {tabText, path, color="gray", setChosen, uuid}: tabProps = $props()
  let route = $derived( uuid + "/" + path)

  function chooseEvent() {
    setChosen(tabText)
  }
  const base = "flex items-center justify-center px-5 h-12 py-3 mx-2 rounded-t-md font-[Staatliches] hover:bg-slate-700 hover:text-slate-100 "
  const colorClass = $derived(base)
</script>

<button onclick={chooseEvent}>
  <a class={colorClass}  style="background-color: {color};" href={route}>{tabText}</a>
</button>
