import { App, ItemView, WorkspaceLeaf, parseFrontMatterEntry, sanitizeHTMLToDom, setIcon } from "obsidian";
import { ApiWrapper } from "./api/opld";
import LawRefPlugin from "./main";
import { convertfromRomanToNumber, testBookCode } from "./utils";

export const VIEW_TYPE_LAWREF = "lawref-view";

const OldPWrapper = new ApiWrapper();

export class LawRefView extends ItemView {
  laws: Law[] = [];
  tempLaws: Law[] = [];
  suggestionContainer: HTMLDivElement;
  searchBar: HTMLInputElement;
  plugin: LawRefPlugin;
  constructor(leaf: WorkspaceLeaf, plugin: LawRefPlugin) {
    super(leaf);
    this.plugin = plugin
  }


  getIcon(){
    return "section"
  }

  getViewType() {
    return VIEW_TYPE_LAWREF;
  }

  getDisplayText() {
    return "Law References";
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
    const law = new Law(lawRef, this);
    law.create();
    this.laws.push(law);

  }
  addTempLaw(lawRef: string | LawReference) {
    const law = new Law(lawRef, this, true);
    law.create();
    this.tempLaws.push(law);
    this.tempLaws.forEach(element => {
      let i = this.tempLaws.length - this.tempLaws.indexOf(element);
      if (i > this.plugin.settings.anzahlTempLaws){
        element.remove();
        this.tempLaws.splice(this.tempLaws.indexOf(element),1);
      }
    });
  }

  async onOpen() {
    const view = this;
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl("h1", { text: "Gesetzesauszüge" });
    this.searchBar = container.createEl("input", {cls: "lawRef-search", type: "text", placeholder: "Suche ein Gesetz..." })
    this.searchBar.addEventListener("keyup", function(event) {
      if (event.key === "Enter"){
        view.addTempLaw(createLawReference(this.value))
        
      }
    })
    this.suggestionContainer = container.createDiv({ cls: "lawRef-suggestion-container" });
  }

  async onClose() {
    // Nothing to clean up.
  }
}

class Law {
  view: LawRefView;
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
      this.paragraph = name.paragraph.toString();
    }
    this.temp = temp || false;
    
    this.container = ctx.containerEl.children[1].getElementsByClassName("lawRef-suggestion-container")[0] as HTMLElement;
    this.view = ctx;
  }

  create() {
    this.lawRefElement= this.container.createDiv({cls: "lawRef-element"});
    this.lawRefHeaderContainer = this.lawRefElement.createDiv({ cls: "lawRef-header-container" });
    this.lawRefHeaderContainer.createEl("h2", { text: `${this.paragraph} ${this.book}` });
    this.lawRefMenu = this.lawRefHeaderContainer.createDiv({ cls: "lawRef-menu" })
    this.button1 = this.lawRefMenu.createEl("button", { cls: ["lawRef-button1", "lawRef-menu-item"] });
    setIcon(this.button1, "chevron-up");
    this.lawRefBody = this.lawRefElement.createDiv({ cls: "lawRef-body" });
    if (testBookCode(this.book)===null){ 
      this.lawRefBody.setText("Das Gesetzbuch " + this.book + " konnte nicht gefunden werden");
    } else{
    OldPWrapper.search(this.book, this.paragraph).then((res) => {
      this.value = sanitizeHTMLToDom(res);
      this.lawRefBody.setText(this.value);
    });
    }
    this.lawRefElement.addClass("lawRef-open");
    if (this.temp) {
      this.lawRefElement.addClass("lawRef-temp");
      setIcon(this.button1, "pin");
      this.button2 = this.lawRefMenu.createEl("button", { cls: ["lawRef-button2", "lawRef-menu-item"] });
      setIcon(this.button2, "x");

      this.button2.addEventListener("click", () => {
        this.lawRefElement.remove();
        let i = this.view.tempLaws.findIndex((el) => el.book === this.book && el.paragraph === this.paragraph);
        if (i !== -1) {
          this.view.tempLaws.splice(i, 1);
        }
      });
      this.button1.addEventListener("click", () => {
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
  }
  toLawFromTemp() {
    let i = this.view.tempLaws.findIndex((el) => el.book === this.book && el.paragraph === this.paragraph);
    if (i !== -1) {
      this.view.tempLaws.splice(i, 1);
    }
    //this.view.laws.push(this);
    let activeFile = this.view.app.workspace.getActiveFile();
    if (!activeFile) {
      return
    }
    this.view.app.fileManager.processFrontMatter(activeFile, (frontmatter) => {
      parseFrontMatterEntry(frontmatter, '§').push(`${this.paragraph} ${this.book}`);
    })
  }
  remove(){
    this.lawRefElement.remove();
  }
}

export interface LawReference {
  paragraph: number,
  absatz?: number,
  satz?: number,
  halbsatz?: number,
  nummer?: number,
  book: string,
}

export interface LawBook {
  id?: number,
  code: string, 
  slug?: string, 
  title?: string, 
  revision_date?: string, 
  latest?: boolean, 
  order?: number
}

export function createLawReference(query: string) {
  let regabsatz = new RegExp(/^I?(M*D*C*L*X*V*I*)$/);
  let regsatz = new RegExp(/\d+/);
  let reghsatz = new RegExp(/Hs\./);
  let regnummer = new RegExp(/Nr\./);
  let q = query.replace("§ ", "").split(" ");
  let paragraph = parseInt(q[0]);
  let book = q[q.length - 1];
  let lr: LawReference = { paragraph, book };

  q = q.slice(1, -1);
  while (q.length > 0) {
    if (regabsatz.test(q[0])) {
      lr.absatz = convertfromRomanToNumber(q[0]);
      q.splice(0, 1);
    } else if (regsatz.test(q[0])) {
      lr.satz = parseInt(q[0]);
      q.splice(0, 1);
    } else if (reghsatz.test(q[0])) {
      if (q.length > 1) {
        lr.halbsatz = parseInt(q[1]);
        q.splice(0, 2);
      }
    }else if (regnummer.test(q[0])) {
      if (q.length > 1) {
        lr.nummer = parseInt(q[1]);
        q.splice(0, 2);
      }
    }

  }

  return lr

}

