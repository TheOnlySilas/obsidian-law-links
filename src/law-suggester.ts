import {
    Decoration,
    DecorationSet,
    EditorView,
    PluginSpec,
    PluginValue,
    ViewPlugin,
    ViewUpdate,
    WidgetType,
    MatchDecorator,
  } from '@codemirror/view';

import { LawRefView, VIEW_TYPE_LAWREF } from './law-sidebar';
  
  const lawRefMatcher = new MatchDecorator({
    regexp: /(?:(?<=^|\n)|(?<=\s))(§\s\d+\s\w+)(?=\s|$)/g,
    decoration: Decoration.mark({tagName: "span", class: "lr-underline"}),
  })

  export const lawRefDecorator = ViewPlugin.fromClass(class {
    decorations: DecorationSet
    constructor(view: EditorView) {
      this.decorations = lawRefMatcher.createDeco(view)
    }
    update(update: ViewUpdate) {

        this.decorations = lawRefMatcher.updateDeco(update, this.decorations)

            let elements = document.querySelectorAll(".lr-underline");
            elements.forEach((element:HTMLElement) => {
                element.onclick = () => {
                    let query = element.innerText.replace("§ ", "");
                    let leaves = app.workspace.getLeavesOfType(VIEW_TYPE_LAWREF);
                    let view = leaves[0].view as LawRefView;
                    view.addTempLaw(query);
                }
            })

  }}, {
    decorations: instance => instance.decorations
  });

  

  /**class lawRefSugPlugin implements PluginValue {
    decorations: DecorationSet;
    constructor(view: EditorView) {
        this.decorations = lawRefMatcher.createDeco(view);
    
    }
  
    update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
            this.decorations = lawRefMatcher.updateDeco(update, this.decorations);
          }
    }
  
    destroy() {
      // ...
    }


};*/

//export const lawRefSuggester = ViewPlugin.fromClass(lawRefSugPlugin);





