<script lang="ts">
  import * as d3 from "d3"

  type dataType = {
    age: number 
    juris: string
    pop: number
  }

  let {
    data = [
      {age: 20, juris: "Harris", pop: 2000}, 
      {age: 30, juris: "Harris", pop: 2200}, 
      {age: 30, juris: "Fort Bend", pop:800}
    ],
    width = 928,
    height = 500,
    marginTop = 10,
    marginRight = 10,
    marginBottom = 20,
    marginLeft = 40,
  }: graphProp = $props()

  let ageMap = data.map(d => d.age)

  let series = d3.stack()
    .keys(d3.union(data.map((d: dataType) => d.age)))
    .value(([,D], key: any) => D.get(key).pop)
  (d3.index(data, (d: dataType) => d.juris, (d: dataType) => d.age))

  let x = $derived(
    d3.scaleBand()
      .domain(d3
        .groupSort(data, (D: dataType[]) => -d3.sum(D, (d: dataType) => d.pop), (d: dataType) => d.juris))
      .range([marginLeft, width - marginRight])
      .padding(0,1))

  let y = $derived(
    d3.scaleLinear()
      .domain([0, d3.max((D: dataType[]), (d: dataType) => d3.max(d, (d:dataType) => d[1]))])
  )
</script>
