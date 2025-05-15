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

import { EditorState, StateField, StateEffect, Transaction, ChangeSet } from '@codemirror/state';

import { LawRefView, VIEW_TYPE_LAWREF } from './law-sidebar';
import { MarkdownView } from 'obsidian';

/**
const obsView = app.workspace.getActiveViewOfType(MarkdownView);
// @ts-expect-error, not typed
const editorView = obsView?.editor.cm as EditorView;
 */
const lawRefMatcher = new MatchDecorator({
  regexp: /(?:(?<=^|\n)|(?<=\s))(§\s\d+\s\w+)(?=\s|$)/g,
  decoration: Decoration.mark({ tagName: "span", class: "lr-underline" }),
})

export const lawRefDecorator = ViewPlugin.fromClass(class {
  decorations: DecorationSet
  constructor(view: EditorView) {
    this.decorations = lawRefMatcher.createDeco(view)
  }
  update(update: ViewUpdate) {

    this.decorations = lawRefMatcher.updateDeco(update, this.decorations)

    let elements = document.querySelectorAll(".lr-underline");
    elements.forEach((element: HTMLElement) => {
      element.onclick = () => {
        let query = element.innerText.replace("§ ", "");
        let leaves = app.workspace.getLeavesOfType(VIEW_TYPE_LAWREF);
        let view = leaves[0].view as LawRefView;
        view.addTempLaw(query);
      }
    })

  }
}, {
  decorations: instance => instance.decorations
});




/**export const lawRefField = StateField.define<string>({
  create(state: EditorState) {
    return "";
  },
  update(oldState: string, tr: Transaction): string {
    let newState = oldState;

    return newState;
  }
})

export function dispatchTransaction() {
  const mdView = app.workspace.getActiveViewOfType(MarkdownView);
  // @ts-expect-error, not typed
  const editorView = mdView.editor.cm as EditorView;
  let doc = editorView.state.doc.toString(), pos = 0;


  if (!doc.startsWith("---")) { return console.log("no frontmatter") };
  let frontmatter = doc.slice(doc.indexOf("§"), doc.indexOf("---", 3));
  let frontmatterlength = globalThis.getFrontMatterMeta().length;
  console.log("frontmatter: ", frontmatterlength);


  editorView.dispatch({
    changes: { from: 0, insert: "" }
  });
}*/


