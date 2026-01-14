<script lang="ts">

type PB_Record_Type = {
  collectionId: string;
  collectionName: string;
  id: string;
  [key: string]: string | number | Date;
};

interface props {
  data: PB_Record_Type | PB_Record_Type[]
  columns: string[]
}

const {data, columns}: props = $props()

$inspect('props', data)

</script>

{#each Object.entries(data) as key}
  <div>
    {{key}}
  </div>
{/each}
