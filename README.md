# EmojiMenu

API to embed tabs into the emoji picker

## Installation

Copy this folder into the `Plugins` folder of the [DiscordInjections](https://github.com/DiscordInjections/DiscordInjections) project.

## Usage
This Plugin does nothing on its own, it needs other plugins to completly work. 
Either install [LineStickers](https://github.com/DiscordInjections/Plugins/tree/master/LineStickers) or [TelegramStickers](https://github.com/DiscordInjections/Plugins/tree/master/TelegramStickers) by @SnazzyPine25 (inbuilt support)
or any other Plugin that supports Emoji Menu

## Developer Notes
To use emoji menu in your project, add a dependency to it
Required dependency:
```js
class MyPlugin extends Plugin {
static get after() { return ["emojimenu"] }
}
```

Optional dependency:
```js
class MyPlugin extends Plugin {
load() { this.on("plugins-loaded", plugins => {
if (plugins.includes("emojimenu")) { /* do stuff */ }
})
```

And then add a tab to EmojiMenu
```js
function () {
window.DI.PluginManager.plugins.emojimenu.addTab("Tab Name", targetElement => { /* do stuff */})
}
```

  - `addTab(tabName, callback)` needs the Tab Name as the first parameter, the callback receives one parameter, the parent `<div>` 
  - `removeTab(tabName)` removes the Tab specified by the Tab Name
