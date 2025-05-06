import { App, Modal, Notice, Plugin, PluginSettingTab, Setting, Vault, Workspace, WorkspaceLeaf, MarkdownPostProcessorContext, parseFrontMatterEntry, View, MarkdownView, MetadataCache } from 'obsidian';
import { LawRefView, VIEW_TYPE_LAWREF } from './law-sidebar';
//import { OldpApi } from './api/opld';
//import LawSuggester from './lawSuggester';
import {  lawRefPluginEditorProcessor, } from './law-editor-processor';

// Remember to rename these classes and interfaces!

interface LawRefPluginSettings {
	useSuggester: boolean;
}

const DEFAULT_SETTINGS: LawRefPluginSettings = {
	useSuggester: false
}

export default class LawRefPlugin extends Plugin {
	settings: LawRefPluginSettings;
	//private readonly OldpApi = new OldpApi();
	async onload() {
		await this.loadSettings();
		this.registerView(VIEW_TYPE_LAWREF, (leaf) => new LawRefView(leaf))
		this.registerEditorExtension(lawRefPluginEditorProcessor);
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new LawRefPluginSettingTab(this.app, this));
		
		this.app.workspace.onLayoutReady(() => {this.activateView()});
		
		/** If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		 Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		}); */

		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			
			//this.activateView();
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		//this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

		// register suggestor on § key
		if (this.settings.useSuggester===true){
			//this.registerEditorSuggest(new LawSuggester(this))
		}
		
		this.app.metadataCache.on("changed", (meta) => {
				//console.log("changed metadata");
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
		  await leaf.setViewState({ type: VIEW_TYPE_LAWREF, active: true });


		}


		// "Reveal" the leaf in case it is in a collapsed sidebar
		workspace.revealLeaf(leaf);
	}
	getFrontMatterMeta(){
		const { workspace } = this.app;
		const actFile = workspace.getActiveFile();
		  	if (!actFile) return
			  const actFilemetadata = app.metadataCache.getFileCache(actFile);
			if (!actFilemetadata) return console.log("no metadata");
			let actFileFrontmatter = actFilemetadata.frontmatter;
			let LawRefList = parseFrontMatterEntry(actFileFrontmatter, '§');
			//console.log(typeof LawRefList);
			if (LawRefList) {
				//console.log(LawRefList);
				return LawRefList;
			} else {
				return [];
		}
	}
	updateLawRef(){
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
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
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
		const {containerEl} = this;

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
	}
}
