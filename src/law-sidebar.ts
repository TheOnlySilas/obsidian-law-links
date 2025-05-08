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
        this.addLaw(lawRef, suggestionContainer as HTMLElement);
     });


    };

    addLaw(lawRef: string, suggestionContainer: HTMLElement) {
      console.log("lawRef: ", lawRef);
      const lawRefElement = suggestionContainer.createDiv({ cls: "lawRef-suggestion" });
      let lawRefBook = lawRef.split(" ")[1];
      let lawRefParagraph = lawRef.split(" ")[0];
      //console.log(this.OldPWrapper.getIdbyName(lawRefBook[1]));

      const lawRefHeaderContainer = lawRefElement.createDiv({ cls: "lawRef-header-container" });
      lawRefHeaderContainer.createEl("h2", { text: lawRef });
      const klappe = lawRefHeaderContainer.createEl("button", { cls: ["lawRef-klappe", "lawRef-menu-item"] });
      setIcon(klappe, "chevron-up");
      

      const lawRefBody = lawRefElement.createDiv({cls: "lawRef-body"});
      lawRefElement.addClass("lawRef-open");
      this.OldPWrapper.search(lawRefBook, lawRefParagraph).then((res) => {
        lawRefBody.setText(sanitizeHTMLToDom(res));
      });
      klappe.addEventListener("click", () => {
        if (lawRefElement.hasClass("lawRef-open")) {
          lawRefElement.removeClass("lawRef-open");
          setIcon(klappe, "chevron-down");
          lawRefBody.style.display = "none";
        } else {
          lawRefElement.addClass("lawRef-open");
          setIcon(klappe, "chevron-up");
          lawRefBody.style.display = "block";
        }
      });
    }
    addTempLaw(lawRef:string){


        const suggestionContainer = this.containerEl.children[1].getElementsByClassName("lawRef-suggestion-container")[0];
        console.log("lawRef: ", lawRef);
        const tempLawRefs = suggestionContainer.getElementsByClassName("lawRef-temp");
        if (tempLawRefs.length > 0) {
          for (let i = 0; i < tempLawRefs.length; i++) {
            const element = tempLawRefs[i];
            element.remove();
          }
        }
      const lawRefElement = suggestionContainer.createDiv({ cls: "lawRef-suggestion" });
      lawRefElement.addClass("lawRef-temp");
      let lawRefBook = lawRef.split(" ")[1];
      let lawRefParagraph = lawRef.split(" ")[0];
      //console.log(this.OldPWrapper.getIdbyName(lawRefBook[1]));

      const lawRefHeaderContainer = lawRefElement.createDiv({ cls: "lawRef-header-container" });
      lawRefHeaderContainer.createEl("h2", { text: lawRef });
      const lawRefMenu = lawRefHeaderContainer.createDiv({ cls: "lawRef-menu"})
      const pin = lawRefMenu.createEl("button", { cls: ["lawRef-pin", "lawRef-menu-item"] });
      setIcon(pin, "pin");
      const rem = lawRefMenu.createEl("button", { cls: ["lawRef-rem", "lawRef-menu-item"] });
      setIcon(rem, "x");
      

      const lawRefBody = lawRefElement.createDiv({cls: "lawRef-body"});
      lawRefElement.addClass("lawRef-open");
      this.OldPWrapper.search(lawRefBook, lawRefParagraph).then((res) => {
        lawRefBody.setText(sanitizeHTMLToDom(res));
      });
      rem.addEventListener("click", () => {
        lawRefElement.remove();
      });
      pin.addEventListener("click", () => {

      });


    }

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