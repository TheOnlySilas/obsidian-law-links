import { ItemView, WorkspaceLeaf, sanitizeHTMLToDom, setIcon } from "obsidian";
import { ApiWrapper } from "./api/opld";

export const VIEW_TYPE_LAWREF = "lawref-view";

export class LawRefView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }
  OldPWrapper = new ApiWrapper();
  getViewType() {
    return VIEW_TYPE_LAWREF;
  }

  getDisplayText() {
    return "Example view";
  }

  parseLawRefList(LawRefList: string[]) {
      const suggestionContainer = this.containerEl.children[1].getElementsByClassName("lawRef-suggestion-container")[0];
      suggestionContainer.empty();
      LawRefList.forEach((lawRef) => {
          const lawRefElement = suggestionContainer.createDiv({ cls: "lawRef-suggestion" });
          let lawRefBook = lawRef.split(" ")[1];
          let lawRefParagraph = lawRef.split(" ")[0];
          //console.log(this.OldPWrapper.getIdbyName(lawRefBook[1]));

          const lawRefHeaderContainer = lawRefElement.createDiv({ cls: "lawRef-header-container" });
          lawRefHeaderContainer.createEl("h2", { text: lawRef });
          const klappe = lawRefHeaderContainer.createEl("button", { cls: "lawRef-klappe" });
          setIcon(klappe, "chevron-down");
          
          this.OldPWrapper.search(lawRefBook, lawRefParagraph).then((res) => {
            lawRefElement.createDiv({ text: sanitizeHTMLToDom(res) });
          });
          
      });


    };

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