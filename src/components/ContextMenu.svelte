<script lang="ts">
  let { top, left, children }: { top: number; left: number; children: any } =
    $props();
</script>

<div class="context-menu" style="--toppos: {top}px; --leftpos: {left}px">
  {@render children()}
</div>

<style>
  .context-menu {
    position: absolute;
    top: var(--toppos);
    left: var(--leftpos);
    width: var(--context-menu-width);
    gap: 10px;
    display: flex;
    flex-direction: column;
    background-color: var(--fg-color);
    border: var(--app-border);
    border-radius: var(--app-border-radius);
    padding: var(--notes-padding);
  }
</style>
