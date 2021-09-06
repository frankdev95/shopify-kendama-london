class MenuDrawer extends HTMLElement {
    constructor() {
        super();

        this.mainDetailsToggle = this.querySelector('details');
        this.summaryElement = this.querySelectorAll('summary');
        this.addAccessibilityAttributes(this.summaryElement);

        this.addEventListener('keyup', this.onKeyUp.bind(this));
        this.addEventListener('focusout', this.onFocusOut.bind(this));
        this.bindEvents();
    }

    bindEvents() {
        this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
        this.querySelectorAll('button').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
    }

    addAccessibilityAttributes(summaryElements) {
        summaryElements.forEach(element => {
            element.setAttribute('role', 'button');
            element.setAttribute('aria-expanded', false);
            element.setAttribute('aria-controls', element.nextElementSibling.id);
        })
    }

    onSummaryClick(e) {
        const summaryElement = e.currentTarget;
        const detailsElement = summaryElement.parentNode;
        const isOpen = detailsElement.hasAttribute('open');

        // if details element is equal to top level details node
        if(detailsElement == this.mainDetailsToggle) {
            if(isOpen) e.preventDefault();;
            isOpen ? this.closeMenuDrawer(summaryElement) : this.openMenuDrawer(summaryElement);
        } else {
            setTimeout(() => {
                detailsElement.classList.add('menu-opening');
            })
        }
    }

    onKeyUp(e) {
        if(e.code.toUpperCase() !== 'ESCAPE') return;

        const openDetailsElement = e.target.closest('details[open');
        if(!openDetailsElement) return;
    }

    onFocusOut(e) {

    }

    openMenuDrawer(summaryElement) {
        setTimeout(() => {
            this.mainDetailsToggle.classList.add('menu-opening')
        });
        // summaryElement.setAttribute('aria-expanded', true);
    }
    
    closeMenuDrawer(event, elementToFocus = false) {
        if(event !== undefined) {
            this.mainDetailsToggle.classList.remove('menu-opening');
            this.mainDetailsToggle.querySelectorAll('details').forEach(details => {
                details.removeAttribute('open');
                details.classList.remove('menu-opening');
            })
        } 
        this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', false);
        this.closeAnimation(this.mainDetailsToggle);

    }

    onCloseButtonClick(e) {
        const detailsElement = e.target.closest('details');
        this.closeSubMenu(detailsElement);
    }

    closeSubMenu(detailsElement) {
        detailsElement.classList.remove('menu-opening');
        this.closeAnimation(detailsElement);
    }

    closeAnimation(detailsElement) {
        let animationStart;

        const handleAnimation = (time) => {
          if (animationStart === undefined) {
            animationStart = time;
          } 

          const elapsedTime = time - animationStart;
    
          if (elapsedTime < 400) {
            window.requestAnimationFrame(handleAnimation);
          } else {
            detailsElement.removeAttribute('open');
            if (detailsElement.closest('details[open]')) {
              trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
            }
          }
        }
    
        window.requestAnimationFrame(handleAnimation);
      }
}

class KendamaHeaderDrawer extends MenuDrawer {
    constructor() {
        super();
    }
}

customElements.define('kendama-header-drawer', KendamaHeaderDrawer);