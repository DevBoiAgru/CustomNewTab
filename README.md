# DevBoi New Tab

A customizable new tab page with a modern whiteboard interface. Create and organize sticky notes, headings, and links on your new tab page.

## Features

- Modern dark theme with clean UI
- Create different types of sticky notes:
  - Regular notes with heading and content
  - Headings for section titles
  - Digital clock with clean design
  - Quick links with favicons
- Drag and drop to position elements
- Resize elements to your liking
- Delete elements with a single click
- Import/Export your configuration
- Automatic saving of your layout

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to create the extension bundle
4. Open Chrome and go to `chrome://extensions`
5. Enable `Developer mode` using the toggle switch in the top right corner
6. Click "Load unpacked" and select the `build` folder

## Usage

### Adding Elements

- Right-click anywhere on the whiteboard to open the context menu
- Choose from the following options:
  - "Add Note" - Create a regular sticky note
  - "Add Heading" - Create a heading text
  - "Add Link" - Add a quick link
  - "Add Clock" - Add a digital clock

### Managing Elements

- Click and drag to move elements around
- Click the resize handle (bottom-right corner) to resize elements
- Hover over an element to resize and show the delete button
- Click the delete button (×) to remove an element

### Settings

- Click the settings button (⚙️) in the bottom-right corner to:
  - Export your current configuration
  - Import a previously saved configuration
  - Clear all elements

### Tips

- Use headings to organize your whiteboard into sections
- Create quick links for frequently visited websites
- Export your configuration before making major changes
- All your workspace changes are saved automatically

## Development

- Run `npm run dev` for development mode
- Run `npm run build` to create the production build
- Run `npm run preview` to preview the production build

## License

MIT License
