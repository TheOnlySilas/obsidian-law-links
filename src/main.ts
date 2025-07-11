import { App, Modal, Notice, Plugin, PluginSettingTab, Setting, Vault, Workspace, WorkspaceLeaf, MarkdownPostProcessorContext, parseFrontMatterEntry, View, MarkdownView, MetadataCache, setIcon } from 'obsidian';
import { LawRefView, VIEW_TYPE_LAWREF } from './law-sidebar';
//import { OldpApi } from './api/opld';
//import LawSuggester from './lawSuggester';
import { lawRefDecorator } from './law-editor';
import { ApiWrapper } from './api/opld';

// Remember to rename these classes and interfaces!

interface LawRefPluginSettings {
	useSuggester: boolean;
	anzahlTempLaws: number;
}

const DEFAULT_SETTINGS: LawRefPluginSettings = {
	useSuggester: false,
	anzahlTempLaws: 1
}



export default class LawRefPlugin extends Plugin {
	settings: LawRefPluginSettings;
	

	 
	//private readonly OldpApi = new OldpApi();
	async onload() {
		await this.loadSettings();
		const api = new ApiWrapper;
		this.registerView(VIEW_TYPE_LAWREF, (leaf) => new LawRefView(leaf, this))
		this.registerEditorExtension([lawRefDecorator]);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new LawRefPluginSettingTab(this.app, this));
		this.app.workspace.onLayoutReady(() => { this.activateView() });

		const ribbonIconEl = this.addRibbonIcon('section', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			api.previousLaw("bgb", "14");
			//this.activateView();
		});

		/**const ribbonIconEl = this.addRibbonIcon('section', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			let view = this.app.workspace.getLeavesOfType(VIEW_TYPE_LAWREF)[0].view as LawRefView
			console.log("Laws: ", view.laws, "Temp Laws: ", view.tempLaws);
			//this.activateView();
		});**/

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		//this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

		// register suggestor on § key
		if (this.settings.useSuggester === true) {
			//this.registerEditorSuggest(new LawSuggester(this))
		}

		this.app.metadataCache.on("changed", (meta) => {
			this.updateLawRef();
		});
		this.app.workspace.on('file-open', (file) => {
			this.updateLawRef();

		});

	}

	onunload() {

	}
	async activateView() {
		const { workspace } = this.app;
		new Notice('Opening view');

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_LAWREF);
		//const paragraphs = this.getFrontMatterMeta();
		
		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
			
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getRightLeaf(false);
			if (leaf===null){return console.error("something went very wrong")}
			await leaf.setViewState({ type: VIEW_TYPE_LAWREF, active: true });
			

		}
		//leaf.view.icon = "lucide-section";
		


		// "Reveal" the leaf in case it is in a collapsed sidebar
		workspace.revealLeaf(leaf);
	}
	getFrontMatterMeta() {
		const { workspace } = this.app;
		const actFile = workspace.getActiveFile();
		if (!actFile) return
		const actFilemetadata = this.app.metadataCache.getFileCache(actFile);
		if (!actFilemetadata) return console.log("no metadata");
		let actFileFrontmatter = actFilemetadata.frontmatter;
		let LawRefList = parseFrontMatterEntry(actFileFrontmatter, '§');
		if (LawRefList) {
			return LawRefList;
		} else {
			return [];
		}
	}
	updateLawRef() {
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_LAWREF);
		if (leaves.length > 0) {
			const view = leaves[0].view as LawRefView;
			const LawRefList = this.getFrontMatterMeta();
			if (LawRefList) {
				view.parseLawRefList(LawRefList);
			}
		}
	}


	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class LawRefPluginSettingTab extends PluginSettingTab {
	plugin: LawRefPlugin;

	constructor(app: App, plugin: LawRefPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Use the Suggester for law Refs')
			.setDesc('Warning: This Feature can lead to overload the oldpapi - Changing this setting requires a restart')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.useSuggester)
				.onChange(async (value) => {
					this.plugin.settings.useSuggester = value;
					await this.plugin.saveSettings();
				}));

		var anzahl = new Setting(containerEl)
			.setName("Wie viele temporäre (gelb umrandete) Referenzen auf einmal anzeigbar sind")
			.setDesc("wähle eine Zahl zwischen 1 und 5000")
			.addText((text) => text
				
				.setPlaceholder('1 bis 5000')
				.setValue(this.plugin.settings.anzahlTempLaws.toString())
				.onChange(async (value) => {
					if (parseInt(value) <= 5000 && parseInt(value) > 0) {
						this.plugin.settings.anzahlTempLaws = parseInt(value);
						anzahl.setDesc("wähle eine Zahl zwischen 1 und 5000")
						await this.plugin.saveSettings();
						anzahl.controlEl.children[0].removeClass("wrong-input");
						anzahl.descEl.removeClass("wrong-input-text");
						
					}else{
						anzahl.setDesc("Keine Zahl zwischen 1 und 5000");
						anzahl.controlEl.children[0].addClass("wrong-input");
						anzahl.descEl.addClass("wrong-input-text");
					}
					
				})
				
			);
			
			
			
		
	}


}


