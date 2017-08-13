const Plugin = module.parent.require('../Structures/Plugin');
const Package = require("./package.json");
const {remote} = require('electron');

const BaseHtml = '<div class="kura-emojimenu"><ul><li data-tab="emoji" class="active">Emojis</li></ul></div>'

class EmojiMenu extends Plugin {
    load() {
        this.on("plugins-loaded", this.onPluginsLoaded.bind(this));
        this.observer = new MutationObserver(this.onMutation.bind(this))
        this.observer.observe(document.querySelector("#app-mount"), { childList: true, subtree: true })
        this.tabCallbacks = {}
    }

    unload() {
        this.observer.disconnect();
    }

    parseHTML(html) {
        return document.createRange().createContextualFragment(html)
    }

    onPluginsLoaded(plugins) {
        if (plugins.includes("linestickers")) {
            this.log("line stickers detected");
            this.patchLineStickers();
        }

        if (plugins.includes("telegramstickers")) {
            this.log("telegram stickers detected")
            this.patchTelegramStickers();
        }
    }

    onMutation(mutations) {
        mutations.forEach(mutation => {
            if (!mutation.target.classList.contains("theme-dark") && !mutation.target.classList.contains("theme-light")) {
                return;
            }

            if (mutation.addedNodes.length == 0 || !mutation.addedNodes[0].classList.contains("popout")) {
                return;
            }
            
            const picker = mutation.addedNodes[0].querySelector(".emoji-picker")
            picker.insertBefore(this.parseHTML(BaseHtml), picker.querySelector(".header"))

            const tabs = picker.querySelector(".kura-emojimenu")
            this.installTabs(tabs)
            tabs.addEventListener("click", this.onSelectTab.bind(this))
        })
    }

    onSelectTab(ev) {
        const tgt = ev.target
        const tab = tgt.dataset.tab

        const old = document.querySelector(".kura-emojicontent")
        if (old && old.dataset.tab === tab) {
            return
        } else if (old) {
            old.parentElement.removeChild(old)
        }

        const tabs = document.querySelector(".kura-emojimenu")
        tabs.querySelector(".active").classList.remove("active")
        tgt.classList.add("active")
        
        if (tab === "emoji") {
            Array.from(document.querySelectorAll(".emoji-picker>div:not(.kura-emojimenu)")).forEach(el => el.style.display = "inherit")
        } else if (this.tabCallbacks[tab]) {
            Array.from(document.querySelectorAll(".emoji-picker>div:not(.kura-emojimenu)")).forEach(el => el.style.display = "none")
            const picker = document.querySelector(".emoji-picker")
            const content = document.createElement("div")
            content.classList.add("kura-emojicontent")
            content.dataset.tab = tab
            picker.appendChild(content)
            this.tabCallbacks[tab](content)
        } else {
            this.log(`Tab <${tab}> not found!`)
        }
    }

    patchLineStickers() {
        this.line = DI.PluginManager.plugins["linestickers"];
        this.line.observer.mo.disconnect();
        const button = document.querySelector(".line-emotes-btn")
        if (button) {
            button.parentNode.removeChild(button)
        }
        this.addTab("Line", (tgt) => {
            const menu = this.line.menu.build().get(0)
            tgt.appendChild(menu)
        });
    }

    patchTelegramStickers() {
        this.telegram = DI.PluginManager.plugins["telegramstickers"];
        this.telegram.observer.mo.disconnect();
        const button = document.querySelector(".telegram-emotes-btn")
        if (button) {
            button.parentNode.removeChild(button)
        }
        this.addTab("Telegram", (tgt) => {
            const menu = this.telegram.menu.build().get(0)
            tgt.appendChild(menu)
            this.telegram.tspack.checkSets()
        })
    }

    addTab(name, callback) {
        const id = name
        if (this.tabCallbacks[id]) {
            throw new Error("name already exists")
        }
        this.tabCallbacks[id] = callback
        return id
    }

    removeTab(id) {
        delete this.tabCallbacks[id]
        const ul = this.tabs.getElementsByTagName("ul")[0]
        const li = ul.querySelector(`[data-tab="${id}"]`)
        if (li) {
            ul.removeChild(li)
        }
    }

    installTabs(target) {
        Object.keys(this.tabCallbacks).forEach(id => {
            const ul = target.querySelector("ul")
            ul.appendChild(this.parseHTML(`<li data-tab="${id}">${id}</li>`))
        })
    }
    
    get configTemplate() {
        return {
            color: '551177',
            iconURL: 'https://pbs.twimg.com/profile_images/653341480640217088/t1c1aTc9_400x400.png',
        };
    }
}

module.exports = EmojiMenu;
