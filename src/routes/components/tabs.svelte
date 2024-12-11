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
</script>

<style lang="postcss" scoped>
.base {
@apply
flex items-center justify-center px-5 h-12 py-3 mx-2 rounded-t-md font-staatliches }

.gray {
  @apply
  base bg-slate-100 text-slate-700 hover:bg-slate-700 hover:text-slate-100
}
.blue {
  @apply
  base bg-hgac-blue text-slate-200 hover:bg-slate-700 hover:text-slate-100
}
.green {
  @apply
  base bg-hgac-green text-slate-700 hover:bg-slate-700 hover:text-slate-100
}
.yellow {
  @apply
  base bg-yellow-100 text-slate-700 hover:bg-slate-700 hover:text-slate-100
}
.blue {
  @apply
  base bg-hgac-blue text-slate-200 hover:bg-slate-700 hover:text-slate-100
}
.purple {
  @apply
  base bg-neutral-400 text-slate-700 hover:bg-slate-700 hover:text-slate-100
}
.chosen {
  @apply
  base bg-slate-700 text-slate-200
}


</style>

<button onclick={chooseEvent}>
  <a class={color} href={route}>{tabText}</a>
</button>
