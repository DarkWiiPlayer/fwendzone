import element from "https://darkwiiplayer.github.io/js/element.js"
import {html, handle} from "https://darkwiiplayer.github.io/js/skooma.js"

const update = new Set()
setInterval(() => {
	update.forEach(element => element.tick())
}, 1e3)

element(class FwendListItem extends HTMLElement {
	static attributes = {
		name: true,
		zone: true,
	}

	constructor() {
		super()
		this.parts = new Object(null)
		this.attachShadow({mode: "open"}).replaceChildren(
			html.link({rel: "stylesheet", href: "application.css"}),
			this.parts.name = html.span(),
			this.parts.time = html.span(),
			this.parts.remove = html.button('Remove', {click: handle(event => {
				const parent = this.parentElement
				this.remove()
				parent.dispatchEvent(new Event('update'))
			})}),
		)
	}

	$tick() {
		this.parts.time.innerText = this.formatter.format(new Date().getTime())
	}

	nameChanged(old, name) { this.parts.name.innerText = name }

	zoneChanged() {
		this.formatter = 
			new Intl.DateTimeFormat("en-UK", {timeStyle: "medium", timeZone: this.zone})
	}

	connectedCallback() { update.add(this); this.tick() }
	disconnectedCallback() { update.delete(this) }
})

element(class FwendList extends HTMLElement {
	constructor() {
		super()
		this.json = localStorage.getItem("fwend-list") ?? "[]"
		this.addEventListener("update", event => {
			console.log(event.target)
			localStorage.setItem("fwend-list", this.json)
		})
	}

	get json() {
		return JSON.stringify(Array.from(this.querySelectorAll('fwend-list-item')).map(item => ({name: item.name, zone: item.zone})))
	}

	set json(json) {
		const arr = JSON.parse(json)
		if (arr) {
			this.replaceChildren(
				...arr.map(item => html.fwendListItem(item)),
				html.button("Add", {click: event => {
					event.target.before(html.fwendListItem({
						name: prompt("Name"),
						zone: prompt("Time Zone")
					}))
					this.dispatchEvent(new Event("update"))
				}})
			)
		}
	}
})
