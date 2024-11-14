<script lang="ts">
  let {tabText, color="gray"}: {tabText: string, color: string} = $props()
  let route = $derived("/" + tabText.toLowerCase())
</script>

<style lang="postcss" scoped>
.base {
@apply
flex items-center justify-center px-5 h-12 py-3 mx-2 rounded-t-md font-staatliches }

.gray {
  @apply
  base bg-slate-600 text-slate-200
}
.red {
  @apply
  base bg-slate-100 hover:bg-hgac-red
}
.green {
  @apply
  base bg-slate-100
}
.blue {
  @apply
  base bg-slate-100
}
.orange {
  @apply
  base bg-slate-100
}

</style>

<a class={color} href={route}>{tabText} </a>
