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
			this.parts.remove = html.button('Remove', {part: "button", click: handle(event => {
				const parent = this.parentElement
				this.remove()
				parent.dispatchEvent(new Event('update'), {bubbles: true})
			})}),
		)
	}

	update(name, zone) {
		this.name = name
		this.zone = zone
		this.dispatchEvent(new Event('update', {bubbles: true}))
	}

	$tick() {
		if (this.formatter)
			this.parts.time.innerText = this.formatter.format(new Date().getTime())
	}

	edit() {
		this.dialog.showModal()
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
		this.addEventListener("update", event => this.save())
	}

	save() {
		localStorage.setItem("fwend-list", this.json)
	}

	get json() {
		return JSON.stringify(Array.from(this.querySelectorAll('fwend-list-item')).map(item => ({name: item.name, zone: item.zone})))
	}

	set json(json) {
		const arr = JSON.parse(json)
		if (arr) {
			this.replaceChildren(
				...arr.map(item => html.fwendListItem(item)),
				this.dialog = html.dialog(html.form(
					html.label(
						html.span('Fwend Name'),
						html.input({name: "name", type: 'text', placeholder: "Bestie <3"}),
					),
					html.label(
						html.span("Time Zone"),
						html.input({name: "zone", type: 'text', placeholder: "Europe/Berlin"}),
					),
					html.button("Close", {cancel: true, click: handle(event => this.dialog.close())}),
					html.button("Update", {confirm: true}),
				), {submit: handle(event => {
					const form = event.submitter.closest('form')
					const item = html.fwendListItem({
						name: form.name.value,
						zone: form.zone.value,
					})
					this.dialog.before(item)
					this.dispatchEvent(new Event("update"), {bubbles: true})
					this.dialog.close()
				}), }),
				html.button("Add", {click: event => this.addItemInteractive() }),
			)
		}
	}

	addItemInteractive() {
		this.dialog.showModal()
		this.dialog.querySelector("form").reset()
	}
})
