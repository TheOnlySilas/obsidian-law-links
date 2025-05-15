import { App, ItemView, WorkspaceLeaf, parseFrontMatterEntry, sanitizeHTMLToDom, setIcon } from "obsidian";
import { ApiWrapper } from "./api/opld";
import LawRefPlugin from "./main";

export const VIEW_TYPE_LAWREF = "lawref-view";

const OldPWrapper = new ApiWrapper();

export class LawRefView extends ItemView {
  laws: Law[] = [];
  tempLaws: Law[] = [];
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);

  }



  getViewType() {
    return VIEW_TYPE_LAWREF;
  }

  getPluginInstance() {
    return this.app
  }

  getDisplayText() {
    return "Example view";
  }

  parseLawRefList(LawRefList: string[]) {
    const suggestionContainer = this.containerEl.children[1].getElementsByClassName("lawRef-suggestion-container")[0];
    suggestionContainer.empty();
    this.laws = [];
    LawRefList.forEach((lawRef) => {
      this.addLaw(lawRef, suggestionContainer as HTMLElement);
    });


  };

  addLaw(lawRef: string, suggestionContainer: HTMLElement) {
    console.log("lawRef: ", lawRef);
    const law = new Law(lawRef, this);
    law.create();
    this.laws.push(law);

  }
  addTempLaw(lawRef: string) {
    console.log("tempLaw: ", lawRef);
    const law = new Law(lawRef, this, true);
    law.create();
    this.tempLaws.push(law);
    if (this.tempLaws.length > 1) {
      for (let i = 0; i < this.tempLaws.length; i++) {
        const element = this.tempLaws[i];
        this.tempLaws.shift();
      }
    }
  }
  convertTempLawToLaw() { }

  async onOpen() {
    console.log("Example view opened");
    const container = this.containerEl.children[1];
    container.empty();

    container.createEl("h1", { text: "Gesetzesauszüge" });

    container.createDiv({ cls: "lawRef-suggestion-container" });
  }

  async onClose() {
    // Nothing to clean up.
  }
}

class Law {
  view: LawRefView;
  plugin: App;
  book: string;
  paragraph: string;
  value: DocumentFragment | string;
  container: HTMLElement
  temp: boolean
  lawRefElement: HTMLElement;
  lawRefHeaderContainer: HTMLElement;
  lawRefMenu: HTMLElement;
  button1: HTMLButtonElement;
  button2?: HTMLButtonElement;
  lawRefBody: HTMLElement;

  constructor(name: string | LawReference, ctx: LawRefView, temp?: boolean) {
    if (typeof name === "string") {
      this.book = name.split(" ")[1];
      this.paragraph = name.split(" ")[0];
    } else {
      this.book = name.book;
      this.paragraph = name.paragraph;
    }
    this.temp = temp || false;
    this.container = ctx.containerEl.children[1].getElementsByClassName("lawRef-suggestion-container")[0] as HTMLElement;
    this.view = ctx;
    this.plugin = ctx.getPluginInstance();
  }

  create() {
    this.lawRefElement = this.container.createDiv({ cls: "lawRef-suggestion" });

    this.lawRefHeaderContainer = this.lawRefElement.createDiv({ cls: "lawRef-header-container" });
    this.lawRefHeaderContainer.createEl("h2", { text: `${this.paragraph} ${this.book}` });
    this.lawRefMenu = this.lawRefHeaderContainer.createDiv({ cls: "lawRef-menu" })
    this.button1 = this.lawRefMenu.createEl("button", { cls: ["lawRef-button1", "lawRef-menu-item"] });
    setIcon(this.button1, "chevron-up");
    this.lawRefBody = this.lawRefElement.createDiv({ cls: "lawRef-body" });

    OldPWrapper.search(this.book, this.paragraph).then((res) => {
      this.value = sanitizeHTMLToDom(res);
      this.lawRefBody.setText(this.value);
    });
    this.lawRefElement.addClass("lawRef-open");
    if (this.temp) {
      this.lawRefElement.addClass("lawRef-temp");
      setIcon(this.button1, "pin");
      this.button2 = this.lawRefMenu.createEl("button", { cls: ["lawRef-button2", "lawRef-menu-item"] });
      setIcon(this.button2, "x");

      this.button2.addEventListener("click", () => {
        this.lawRefElement.remove();
        let i = this.view.tempLaws.findIndex((el) => el.book === this.book && el.paragraph === this.paragraph);
        if (i !== -1){
          this.view.tempLaws.splice(i, 1);
        }
      });
      this.button1.addEventListener("click", () => {
        console.log("button1 clicked");
        this.toLawFromTemp()
      });
    } else {
      this.button1.addEventListener("click", () => {
        if (this.lawRefElement.hasClass("lawRef-open")) {
          this.lawRefElement.removeClass("lawRef-open");
          setIcon(this.button1, "chevron-down");
          this.lawRefBody.style.display = "none";
        } else {
          this.lawRefElement.addClass("lawRef-open");
          setIcon(this.button1, "chevron-up");
          this.lawRefBody.style.display = "block";
        }
      });
    }
    if (this.temp) {

    }
  }
  toLawFromTemp() {
    let i = this.view.tempLaws.findIndex((el) => el.book === this.book && el.paragraph === this.paragraph);
    if (i !== -1) {
      this.view.tempLaws.splice(i, 1);
    }
    //this.view.laws.push(this);
    let activeFile = this.plugin.workspace.getActiveFile();
    if (!activeFile) {
      return
    }
    this.plugin.fileManager.processFrontMatter(activeFile, (frontmatter) => {  
      parseFrontMatterEntry(frontmatter, '§').push(`${this.paragraph} ${this.book}`);
    })
    }
  }

interface LawReference {
  paragraph: string;
  absatz?: number;
  satz?: number;
  halbsatz?: number;
  nummer?: number;
  book: string;
}