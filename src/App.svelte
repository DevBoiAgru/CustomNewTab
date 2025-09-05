<script lang="ts">
  import ContextMenu from "./components/ContextMenu.svelte";
  import Note from "./components/Note.svelte";
  import Dialog from "./components/Dialog.svelte";
  import { NoteStore } from "./lib/Stores";
  import { NoteCategory } from "./lib/Types";
  import { onMount } from "svelte";
  import Gear from "./assets/Gear.svelte";

  // Load notes on startup
  let firstStart = $state(true);

  onMount(() => {
    // On run if its the first time app is opened
    if (firstStart) {
      firstStart = false;
      let existingNotes = JSON.parse(localStorage.getItem("notes") ?? "[]");
      NoteStore.set(existingNotes);
    }
  });

  function exportConfig() {
    let saveContent = JSON.stringify($NoteStore);
    let saveFile = new Blob([saveContent], { type: "application/json" });
    const url = URL.createObjectURL(saveFile);

    // Save file by creating a link with blob url clicked automatically, and then cleaned up.
    const a = document.createElement("a");
    a.href = url;
    a.download = "workspace-config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importConfig() {
    if (
      !confirm(
        "This will overwrite ALL of your current configuration. Are you sure?"
      )
    ) {
      return;
    }

    try {
      if (!configImportJson.trim()) {
        alert("Please enter JSON data to import");
        return;
      }

      // Parse json and import config
      try {
        const parsedData = JSON.parse(configImportJson);

        if (Array.isArray(parsedData)) {
          // Validate each item in the array
          const validData = parsedData.every(
            (item) =>
              item &&
              typeof item === "object" &&
              "id" in item &&
              "position" in item &&
              "size" in item &&
              "category" in item
          );

          if (validData) {
            NoteStore.set(parsedData);

            // Close settings dialog
            settingsOpen = false;
          } else {
            throw new Error("Invalid data format");
          }
        } else {
          throw new Error("Data must be an array");
        }
      } catch (error) {
        console.error("Invalid import data:", error);
        alert("Invalid import data. Please check the format and try again.");
      }

      configImportJson = "";
    } catch (error) {
      alert("Invalid JSON data. Please check your input and try again.");
    }
  }

  function clearWorkspace() {
    if (
      !confirm(
        "This will delete ALL elements added to the workspace. Are you sure?"
      )
    ) {
      return;
    }
    NoteStore.set([]);
  }

  // Info about mouse position
  let mouseTop = $state(0);
  let mouseLeft = $state(0);

  // Context Menu
  let cmTop = $state(0);
  let cmLeft = $state(0);
  let contextMenuOpen = $state(false);

  // Add link dialog box
  let addingLink = $state(false);
  let addLinkTitle = $state("");
  let addLinkURL = $state("");

  // Settings page
  let settingsOpen = $state(false);
  let configImportJson = $state("");

  // Spawning notes
  function createNote(
    noteCategory: NoteCategory,
    title: string | null,
    linkTarget: string | null
  ) {
    NoteStore.update((notes) => [
      ...notes,
      {
        id: crypto.randomUUID(),
        category: noteCategory,
        heading: title ?? "",
        content: "",
        linkAddress: linkTarget ?? "",
        position: { x: mouseLeft, y: mouseTop },
        size: (() => {
          // Different default sizes based on what we are adding
          switch (noteCategory) {
            case NoteCategory.StickyNote:
              return { x: 150, y: 150 };
            case NoteCategory.Heading:
              return { x: 170, y: 45 };
            case NoteCategory.Clock:
              return { x: 200, y: 100 };
            case NoteCategory.Link:
              return { x: 110, y: 110 };
          }
        })(),
      },
    ]);
  }

  function onPageClick() {
    contextMenuOpen = false;
  }
</script>

<main>
  {#if contextMenuOpen}
    <ContextMenu top={cmTop} left={cmLeft}>
      <button
        class="context-menu-button"
        aria-label="button"
        onclick={() => {
          createNote(NoteCategory.StickyNote, null, null);
        }}>Add Note</button
      >
      <button
        class="context-menu-button"
        aria-label="button"
        onclick={() => {
          createNote(NoteCategory.Heading, null, null);
        }}>Add Heading</button
      >
      <button
        class="context-menu-button"
        aria-label="button"
        onclick={() => {
          addingLink = true;
        }}>Add Link</button
      >
      <button
        class="context-menu-button"
        aria-label="button"
        onclick={() => {
          createNote(NoteCategory.Clock, null, null);
        }}>Add Clock</button
      >
    </ContextMenu>
  {/if}

  <!-- Link adding dialog box -->
  {#if addingLink}
    <Dialog
      onClose={() => {
        addingLink = false;
      }}
      title="Add link"
    >
      <form
        target="_blank"
        class="dialog-content-container"
        onsubmit={(e) => {
          e.preventDefault();
          if (addLinkTitle !== "" && addLinkURL !== "") {
            createNote(NoteCategory.Link, addLinkTitle, addLinkURL);
            addLinkTitle = "";
            addLinkURL = "";
          }
          addingLink = false;
        }}
      >
        <label for="link-title" class="input-label">Enter link title</label>
        <input
          type="text"
          name="link-title"
          class="user-input-text"
          autocomplete="off"
          placeholder="Best site"
          bind:value={addLinkTitle}
        />
        <label for="link-title" class="input-label">Enter URL</label>
        <input
          type="url"
          name="link-url"
          class="user-input-text"
          autocomplete="off"
          placeholder="https://github.com/DevBoiAgru"
          bind:value={addLinkURL}
        />
        <div class="link-aligned-button-bar">
          <input type="submit" value="Done" class="user-input-button" />
        </div>
      </form>
    </Dialog>
  {/if}

  <!-- Settings dialog -->
  {#if settingsOpen}
    <Dialog
      onClose={() => {
        settingsOpen = false;
      }}
      title="Settings"
    >
      <div class="dialog-content-container">
        <div class="settings-section">
          <h4>Export options</h4>
          <button class="user-input-button" onclick={exportConfig}
            >Export configuration</button
          >
        </div>

        <div class="settings-section">
          <h4>Import options</h4>
          <textarea
            bind:value={configImportJson}
            class="config-input-textbox"
            id="config-json-input"
            name="json-config-textbox"
          ></textarea>
          <button class="user-input-button" onclick={importConfig}
            >Import configuration</button
          >
        </div>

        <div
          class="settings-section"
          style="background-color: #411717; border-color: red;"
        >
          <h4>Danger zone</h4>

          <button
            class="user-input-button"
            onclick={clearWorkspace}
            style="background-color: red;"
            ><strong>Clear workspace</strong></button
          >
        </div>
      </div>
    </Dialog>
  {/if}

  {#each $NoteStore as note (note.id)}
    <Note
      noteID={note.id}
      noteCateg={note.category}
      noteContent={note.content}
      noteHeading={note.heading}
      noteLeft={note.position.x}
      noteTop={note.position.y}
      sizeX={note.size.x}
      sizeY={note.size.y}
      linkURL={note.linkAddress}
    />
  {/each}

  <!-- Settings button -->
  <button
    class="app-button settings-button"
    onclick={() => {
      settingsOpen = true;
    }}
  >
    <Gear />
  </button>
</main>

<svelte:window
  on:contextmenu|preventDefault={(e) => {
    contextMenuOpen = true;
    cmLeft = e.clientX;
    cmTop = e.clientY;
  }}
  on:click={onPageClick}
  on:mousemove={(e) => {
    mouseLeft = e.clientX;
    mouseTop = e.clientY;
  }}
/>

<style>
  .app-button {
    display: flex;
    background-color: var(--fg-color);
    transition: all 0.2s ease-in-out;
    border: var(--app-border);
    border-radius: 50%;
    align-items: center;
    cursor: pointer;
    justify-content: center;
  }

  .app-button:hover {
    box-shadow: #ffffff4f 0px 0px 4px 2px;
  }

  .settings-button {
    position: absolute;
    bottom: 20px;
    right: 20px;
    height: 50px;
    width: 50px;
    z-index: 5;
  }

  .context-menu-button {
    background-color: transparent;
    color: var(--text-color-2);
    transition: color 0.2s ease-in-out;
    border: none;
    text-align: var(--context-menu-item-text-align);
    font-size: 16px;
  }
  .context-menu-button:hover {
    color: var(--text-color);
  }

  .dialog-content-container {
    display: flex;
    position: relative;
    overflow-y: scroll;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
    height: 100%;
    scrollbar-width: thin;
    scrollbar-color: var(--fg-color-active) #1c1c1c;
  }

  .dialog-content-container::-webkit-scrollbar {
    width: 12px;
  }

  .dialog-content-container::-webkit-scrollbar-track {
    background: #1c1c1c;
  }

  .dialog-content-container::-webkit-scrollbar-thumb {
    background-color: var(--fg-color-active);
  }

  .link-aligned-button-bar {
    display: flex;
    align-self: flex-end;
    position: absolute;
    bottom: 20px;
    gap: 20px;
  }

  .settings-section {
    border: var(--app-border);
    border-radius: var(--app-border-radius);
    padding: 20px;
    margin: 0px 0px 20px 0px;
  }

  .settings-section h4 {
    margin: 0px 0px 10px 0px;
  }

  .config-input-textbox {
    color: var(--text-color);
    font-family: "Courier New", Courier, monospace;
    padding: 5px;
    width: 100%;
    height: 120px;
    resize: none;
    background-color: var(--fg-color);
    border: var(--app-border);
    border-radius: var(--app-border-radius);
  }
</style>
