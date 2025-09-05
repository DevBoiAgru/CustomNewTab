<script lang="ts">
  let {
    onClose,
    title,
    children,
  }: { onClose: () => void; title: string; children: any } = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="dialog-box-wrapper" onclick={onClose}>
  <div
    class="dialog-box"
    onclick={(e) => {
      e.stopPropagation();
    }}
  >
    <button class="close-button" onclick={onClose}>&#10006;</button>
    <h1 class="page-heading">{title}</h1>

    {@render children()}
  </div>
</div>

<style>
  .dialog-box-wrapper {
    position: absolute;
    background-color: #000000a1;
    width: 100%;
    height: 100%;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dialog-box {
    display: flex;
    position: relative;
    width: 80%;
    height: 80%;
    flex-direction: column;
    background-color: var(--fg-color);
    border: var(--app-border);
    border-radius: var(--app-border-radius);
    padding: var(--notes-padding);
  }
</style>
