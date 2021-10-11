class GallerySlider extends HTMLElement {
    constructor() {
        super();
        this.slider = this.querySelector('.gallery__container');
        this.sliderItems = this.querySelectorAll('.gallery__item');
        this.pageCount = this.querySelector('.slider-counter--current'); // get current slide - always starts at one
        this.pageTotal = this.querySelector('.slider-counter--total'); // get slide amount
        this.prevButton = this.querySelector('button[name="previous"]');
        this.nextButton = this.querySelector('button[name="next"]');

        if(!this.slider || !this.nextButton) return;

        const resizeObserver = new ResizeObserver(entries => this.initPages());
        resizeObserver.observe(this.slider);

        this.slider.addEventListener('scroll', () => this.update.bind(this));
        this.prevButton.addEventListener('click', this.update.bind(this));
        this.nextButton.addEventListener('click', this.update.bind(this));

    }

    initPages() {

    }

    update() {
        if(!this.pageCount || !this.pageTotal) return;
        this.currentPage = Math.round(this.slider.scrollLeft / this.sliderItems[0].clientWidth) + 1;

        if(this.currentPage === 1) {
            this.prevButton.setAttribute('disabled', true);
            this.prevButton.setAttribute('aria-disabled', true);
        } else {
            this.prevButton.removeAttribute('disabled');
            this.prevButton.setAttribute('aria-disabled', false);
        }

        if(this.currentPage === this.pageCount) {
            this.nextButton.setAttribute('disabled', true);
            this.nextButton.setAttribute('aria-disabled', true);
        } else {
            this.nextButton.removeAttribute('disabled');
            this.nextButton.setAttribute('aria-disabled', false)
        }

        this.pageCount.textContent = this.currentPage;
    }

    onButtonClick(e) {
        e.preventDefault();
        const slideScrollPosition = e.currentTarget.name === "next" ? this.slider.scrollLeft + this.sliderItems[0].clientWidth : this.slider.scrollLeft - this.sliderItems[0].clientWidth;
        this.slider.scrollTo({
            left: slideScrollPosition
        });   
    }



}

customElements.define('gallery-slider', GallerySlider);