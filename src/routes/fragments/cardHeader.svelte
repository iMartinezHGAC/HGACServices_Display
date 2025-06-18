<script lang="ts">

  type headerProps = {
    projectName: string,
    color: string
    links?: object[]
  }

  let {projectName, links, color="dark"}: headerProps = $props()
</script>


