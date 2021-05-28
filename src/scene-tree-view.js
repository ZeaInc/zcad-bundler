import './tree-item-view.js'
const { Color, TreeItem } = window.zeaEngine

/**
 * Scene tree view.
 *
 */
class SceneTreeView extends HTMLElement {
  /**
   * Constructor.
   *
   */
  constructor() {
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })

    // Create container tags
    this.treeContainer = document.createElement('div')
    shadowRoot.appendChild(this.treeContainer)

    // Init root tree item
    this.treeItemView = document.createElement('tree-item-view')
    this.treeContainer.appendChild(this.treeItemView)

    //////////////////////
    // Force loading of @font-face so the main page desn't have to.
    // this is to work around a limitation in Chrome, where @font-face
    // Are not loaded in the shadow dom and must be loaded in the page.
    // See here: https://github.com/mdn/interactive-examples/issues/887

    const fontFaceSheet1 = new CSSStyleSheet()
    fontFaceSheet1.replaceSync(`@font-face {
      font-family: "Material Icons";
      font-style: normal;
      font-weight: 400;
      src: url('https://fonts.gstatic.com/s/materialicons/v48/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2') format('woff');
    }`)

    const fontFaceSheet2 = new CSSStyleSheet()
    fontFaceSheet2.replaceSync(`@font-face {
      font-family: "Material Icons Outlined";
      font-style: normal;
      font-weight: 400;
      src: url('https://fonts.gstatic.com/s/materialiconsoutlined/v14/gok-H7zzDkdnRel8-DQ6KAXJ69wP1tGnf4ZGhUce.woff2') format('woff');
    }`)

    document.adoptedStyleSheets = [...document.adoptedStyleSheets, fontFaceSheet1, fontFaceSheet2]

    this.__onKeyDown = this.__onKeyDown.bind(this)
    this.__onMouseEnter = this.__onMouseEnter.bind(this)
    this.__onMouseLeave = this.__onMouseLeave.bind(this)
    document.addEventListener('keydown', this.__onKeyDown)
    this.addEventListener('mouseenter', this.__onMouseEnter)
    this.addEventListener('mouseleave', this.__onMouseLeave)
  }

  /**
   * Set tree item.
   * @param {object} treeItem Tree item.
   * @param {object} appData App data.
   */
  setTreeItem(treeItem, appData) {
    this.rootTreeItem = treeItem
    this.appData = appData
    this.treeItemView.setTreeItem(treeItem, appData)
  }

  __onMouseEnter(event) {
    this.mouseOver = true
  }

  __onMouseLeave(event) {
    this.mouseOver = false
  }

  __onKeyDown(event) {
    if (!this.mouseOver) return
    const { selectionManager } = this.appData
    if (!selectionManager) return
    if (this.mouseOver && event.key == 'f') {
      const selectedItems = selectionManager.getSelection()
      this.expandSelection(selectedItems, true)
      event.preventDefault()
      event.stopPropagation()
      return
    }
    if (event.key == 'ArrowLeft') {
      const selectedItems = selectionManager.getSelection()
      const newSelection = new Set()
      Array.from(selectedItems).forEach((item) => {
        newSelection.add(item.getOwner())
      })
      if (newSelection.size > 0) {
        selectionManager.setSelection(newSelection)
      }
      event.preventDefault()
      event.stopPropagation()
      return
    }

    if (event.key == 'ArrowRight') {
      const selectedItems = selectionManager.getSelection()
      const newSelection = new Set()
      Array.from(selectedItems).forEach((item) => {
        if (item instanceof TreeItem && item.getNumChildren() > 0) newSelection.add(item.getChild(0))
      })
      if (newSelection.size > 0) {
        selectionManager.setSelection(newSelection)
        this.expandSelection(newSelection, true)
      }
      event.preventDefault()
      event.stopPropagation()
      return
    }

    if (event.key == 'ArrowUp') {
      const selectedItems = selectionManager.getSelection()
      const newSelection = new Set()
      Array.from(selectedItems).forEach((item) => {
        const index = item.getOwner().getChildIndex(item)
        if (index == 0) newSelection.add(item.getOwner())
        else {
          newSelection.add(item.getOwner().getChild(index - 1))
        }
      })
      if (newSelection.size > 0) {
        selectionManager.setSelection(newSelection)
        this.expandSelection(newSelection)
      }
      event.preventDefault()
      event.stopPropagation()
      return
    }

    if (event.key == 'ArrowDown') {
      const selectedItems = selectionManager.getSelection()
      const newSelection = new Set()
      Array.from(selectedItems).forEach((item) => {
        const index = item.getOwner().getChildIndex(item)
        if (index < item.getOwner().getNumChildren() - 1) newSelection.add(item.getOwner().getChild(index + 1))
        else {
          const indexinOwner = item.getOwner().getChildIndex(item)
          if (item.getOwner().getNumChildren() > indexinOwner + 1)
            newSelection.add(item.getOwner().getChild(indexinOwner + 1))
        }
      })
      if (newSelection.size > 0) {
        selectionManager.setSelection(newSelection)
        this.expandSelection(newSelection, true)
      }
      event.preventDefault()
      event.stopPropagation()
      return
    }
  }
  /**
   * The expandSelection method.
   * @param {Map} items - The items we wish to expand to show.
   */
  expandSelection(items, scrollToView = true) {
    Array.from(items).forEach((item) => {
      const path = []
      while (true) {
        path.splice(0, 0, item)
        if (item == this.rootTreeItem) break
        item = item.getOwner()
      }
      let treeViewItem = this.treeItemView
      path.forEach((item, index) => {
        if (index < path.length - 1) {
          if (!treeViewItem.expanded) treeViewItem.expand()
          const childIndex = item.getChildIndex(path[index + 1])
          treeViewItem = treeViewItem.getChild(childIndex)
        }
      })
      // causes the element to be always at the top of the view.
      if (scrollToView && treeViewItem)
        treeViewItem.titleElement.scrollIntoView({
          behavior: 'auto',
          block: 'nearest',
          inline: 'nearest',
        })
    })
  }
}

customElements.define('scene-tree-view', SceneTreeView)

export default SceneTreeView
