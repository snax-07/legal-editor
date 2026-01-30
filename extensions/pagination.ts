import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "prosemirror-state"
import { Decoration, DecorationSet } from "prosemirror-view"

const PAGE_HEIGHT = 1123
const MARGIN = 96
const PAGE_GAP = 32
const USABLE_HEIGHT = PAGE_HEIGHT - MARGIN * 2

export const Pagination = Extension.create({
  name: "pagination",

  addOptions() {
    return {
      getGhostRef: () => null as HTMLDivElement | null,
      onPageCountChange: (_count: number) => {},
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("pagination"),

        state: {
          init: () => DecorationSet.empty,
          apply(tr, old) {
            return tr.getMeta("pagination") || old
          },
        },

        view: view => ({
          update: () => {
            const ghost = this.options.getGhostRef()
            if (!ghost) return

            const proseMirror = view.dom.querySelector(".ProseMirror")
            if (!proseMirror) return


            ghost.innerHTML = proseMirror.innerHTML

            // Normalize empty paragraphs
            ghost.querySelectorAll("p").forEach(( p : any ) => {
              if (!p.innerHTML.trim()) p.innerHTML = "&nbsp;"
            })

            const ghostBlocks = Array.from(ghost.children)
            const realBlocks = Array.from(proseMirror.children)

            if (!ghostBlocks.length || !realBlocks.length) return

            const decorations: Decoration[] = []
            let accumulated = 0
            let pageCount = 1

            ghostBlocks.forEach((ghostEl, i) => {
              const el = ghostEl as HTMLElement
              const style = getComputedStyle(el)

              const height =
                el.offsetHeight +
                parseFloat(style.marginTop) +
                parseFloat(style.marginBottom)

              if (accumulated + height > USABLE_HEIGHT) {
                const realDom = realBlocks[i]
                if (!realDom) return

                const pos = view.posAtDOM(realDom, 0)

                decorations.push(
                  Decoration.widget(pos, () => {
                    const gap = document.createElement("div")
                    gap.className = "page-gap"
                    gap.style.height = `${PAGE_GAP}px`
                    return gap
                  })
                )

                pageCount++
                accumulated = height
              } else {
                accumulated += height
              }
            })

            this.options.onPageCountChange(pageCount)

            const decoSet = DecorationSet.create(view.state.doc, decorations)

            view.dispatch(
              view.state.tr.setMeta("pagination", decoSet)
            )
          },
        }),

        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  },
})
