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

import { createLawReference, LawRefView, VIEW_TYPE_LAWREF } from './law-sidebar';
import { MarkdownView } from 'obsidian';

/**
const obsView = app.workspace.getActiveViewOfType(MarkdownView);
// @ts-expect-error, not typed
const editorView = obsView?.editor.cm as EditorView;
 */
const lawRefMatcher = new MatchDecorator({
  regexp: /(§|Art\.)\s\d+\w?\s(((I?(M*D*C*L*X*V*I*))|\d|(Nr\.\s\d+))\s)*(\w+)/g,
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
        let query = createLawReference(element.innerText);
        let leaves = app.workspace.getLeavesOfType(VIEW_TYPE_LAWREF);
        let view = leaves[0].view as LawRefView;
        view.addTempLaw(query);
      }
    })

  }
}, {
  decorations: instance => instance.decorations
});







