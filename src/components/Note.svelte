<script lang="ts">
  import { NoteCategory } from "../lib/Types";
  import { NoteStore } from "../lib/Stores";
  import { onMount } from "svelte";

  let {
    noteID,
    noteCateg,
    noteContent = "",
    noteHeading = "",
    linkURL = "",
    noteTop,
    noteLeft,
    sizeX = 30,
    sizeY = 30,
  }: {
    noteID: string;
    noteCateg: NoteCategory;
    noteContent: string;
    noteHeading: string;
    linkURL: string;
    noteTop: number;
    noteLeft: number;
    sizeX: number;
    sizeY: number;
  } = $props();

  // Used for dragging and resizing
  let dragging = $state(false);
  let resizing = $state(false);
  let noteElement: HTMLElement;
  let resizeHandle: HTMLElement | undefined = $state();

  // Clock things
  let time = $state(new Date());
  let hour = $derived(time.getHours().toString().padStart(2, "0"));
  let mins = $derived(time.getMinutes().toString().padStart(2, "0"));

  onMount(() => {
    saveNotes();

    // Update time every minute
    const interval = setInterval(() => {
      time = new Date();
    }, 1000 * 5);

    function onDragDown(e: MouseEvent) {
      dragging = true;

      if (e.target == resizeHandle) {
        resizing = true;
      }
    }

    function onMouseUp(e: MouseEvent) {
      dragging = false;
      resizing = false;
      saveNotes();
    }

    function onMouseMove(e: MouseEvent) {
      if (dragging && !resizing) {
        noteLeft += e.movementX;
        noteTop += e.movementY;
        updateNote(); // for some reason no other note than the first one updates when calling this on mouse up
      }
      if (dragging && resizing) {
        switch (noteCateg) {
          case NoteCategory.Clock:
          case NoteCategory.StickyNote:
          case NoteCategory.Link:
            // Prevent resizing below the minimum size (100 x 100)

            if (sizeX < 100) {
              sizeX = 100;
            } else {
              sizeX += e.movementX;
            }

            if (sizeY < 100) {
              sizeY = 100;
            } else {
              sizeY += e.movementY;
            }
            break;

          case NoteCategory.Heading:
            // Prevent resizing on Y axis, and enforce minimum width
            if (sizeX < 100) {
              sizeX = 100;
            } else {
              sizeX += e.movementX;
            }

            break;

          default:
            break;
        }

        updateNote();
      }
    }

    noteElement.addEventListener("mousedown", onDragDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);

    // On destroy
    return () => {
      clearInterval(interval);
      noteElement.removeEventListener("mousedown", onDragDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
    };
  });

  let content = $state(noteContent);
  let heading = $state(noteHeading);

  // Update this note in the notes collection
  function updateNote() {
    // Update the note's content and heading on the store
    NoteStore.update((notes) => {
      return notes.map((note) => {
        if (note.id === noteID) {
          return {
            ...note,
            content: content,
            heading: heading,
            position: { x: noteLeft, y: noteTop },
            size: { x: sizeX, y: sizeY },
          };
        }
        return note;
      });
    });
  }

  // Delete this node
  function deleteNote() {
    NoteStore.update((notes) => {
      return notes.filter((note) => {
        return note.id !== noteID;
      });
    });
    saveNotes();
  }

  // Save the current notes to local storage.
  // We are saving it manually instead of a subscription on the notes store since
  // store gets updated repeatedly a lot of times when we drag or resize a note,
  // and we need to save only when we have reached a stable state.
  function saveNotes() {
    let notesJSON = JSON.stringify($NoteStore);
    localStorage.setItem("notes", notesJSON);
  }
</script>

<div
  class="note-wrapper"
  style="--posTop: {noteTop}px; --posLeft: {noteLeft}px; --sizeX: {sizeX}px; --sizeY: {sizeY}px"
  bind:this={noteElement}
>
  <button class="note-delete-button note-button" onclick={deleteNote}
    >&#10006;</button
  >
  <button
    class="note-resize-button note-button"
    name="resize-btn"
    bind:this={resizeHandle}>&#9698;</button
  >
  <!-- Sticky note -->
  {#if noteCateg == NoteCategory.StickyNote}
    <div class="note">
      <input
        type="text"
        name="heading"
        autocomplete="off"
        placeholder="Note heading"
        class="note-heading text-input"
        value={heading}
        onchange={(e) => {
          heading = e.currentTarget.value;
          updateNote();
          saveNotes();
        }}
      />
      <textarea
        autocomplete="off"
        name="content"
        class="note-content"
        value={content}
        onchange={(e) => {
          content = e.currentTarget.value;
          updateNote();
          saveNotes();
        }}
      ></textarea>
    </div>
  {/if}

  <!-- Heading -->
  {#if noteCateg == NoteCategory.Heading}
    <input
      type="text"
      name="heading"
      autocomplete="off"
      placeholder="Note heading"
      class="note-heading text-input standalone-heading"
      value={heading}
      onchange={(e) => {
        heading = e.currentTarget.value;
        updateNote();
        saveNotes();
      }}
    />
  {/if}

  <!-- Link -->
  {#if noteCateg == NoteCategory.Link}
    <div class="note link-note">
      <button
        onclick={() => {
          window.open(linkURL, "_self");
        }}
        class="plain-button"
      >
        <img
          class="link-icon"
          src="https://www.google.com/s2/favicons?domain={new URL(linkURL)
            .hostname}&sz=512"
          alt="{heading} icon"
          draggable="false"
        />
        <p>{heading}</p>
      </button>
    </div>
  {/if}

  <!-- Clock -->
  {#if noteCateg == NoteCategory.Clock}
    <h1 class="clock-time">
      {hour}:{mins}
    </h1>
  {/if}
</div>

<style>
  .note-wrapper {
    display: flex;
    position: absolute;
    top: var(--posTop);
    left: var(--posLeft);
    width: var(--sizeX);
    height: var(--sizeY);
  }

  .note {
    gap: 4px;
    display: flex;
    flex-direction: column;
    background-color: var(--fg-color);
    border: var(--app-border);
    border-radius: var(--app-border-radius);
    padding: var(--notes-padding);
    overflow: hidden;
    flex: 1;
  }

  .note-wrapper:hover > .note-button {
    opacity: 1;
  }

  .note-button {
    position: absolute;
    border: none;
    opacity: 0;
    transition: 0.2s all ease-in-out;
    background-color: transparent;
    color: var(--text-color);
    padding: 0px;
  }

  .text-input {
    border: none;
    background-color: transparent;
    color: var(--text-color);
    text-overflow: ellipsis;
  }

  .note-content {
    color: var(--text-color);
    resize: none;
    font-family: inherit;
    border: none;
    flex: 1;
    background-color: transparent;
  }

  .note-heading {
    font-weight: 600;
    font-size: 16px;
    min-width: 0;
    border-bottom: var(--app-border);
  }

  .standalone-heading {
    font-size: 20px;
    flex: 1;
  }

  .note-delete-button {
    text-shadow: 0px 0px 9px var(--text-color);
    cursor: pointer;
    right: 5px;
    width: 20px;
    margin: 0px;
    top: 5px;
  }

  .note-resize-button {
    right: 0px;
    width: 20px;
    margin: 0px;
    bottom: 0px;
    cursor: nw-resize;
  }

  .link-note {
    align-items: center;
    color: var(--text-color);
  }

  .link-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .plain-button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    height: 70%;
    width: 70%;
    color: var(--text-color);
  }

  .clock-time {
    margin: 0px;
    font-size: min(calc(var(--sizeX) / 2.7), calc(var(--sizeY) / 1.5));
  }
</style>
