export class Menu {
  private menuMap: Map<HTMLElement, HTMLElement> = new Map()

  static create(): Menu {
    return new Menu()
  }

  public bind(menuID: string, sectionID: string): void {
    const menu = document.getElementById(menuID)
    if (menu === null) throw new Error(`Menu element not found: ${menuID}`)

    const section = document.getElementById(sectionID)
    if (section === null) throw new Error(`Section element not found: ${sectionID}`)

    this.menuMap.set(menu, section)
  }

  public start(): void {
    this.menuMap.forEach((section, menu) => {
      menu.addEventListener('click', _event => {
        this.menuMap.forEach((otherSection, otherMenu) => {
          if (otherSection === section) {
            otherSection.classList.remove('hidden')
            otherMenu.classList.add('text-redis-white')
          } else {
            otherSection.classList.add('hidden')
            otherMenu.classList.remove('text-redis-white')
          }
        })
      })
    })
  }
}
