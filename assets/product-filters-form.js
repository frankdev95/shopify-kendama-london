class ProductFiltersForm extends HTMLElement {
    constructor() {
        super();
        this.filterData = [];
        
        this.debouncedOnSubmit = debounce((event) => {
            this.onSubmitHandler(event);
        }, 500)

        this.querySelector('form').addEventListener('input', this.debouncedOnSubmit.bind(this));
        this.querySelectorAll('.filter__checkbox-input').forEach(input => input.addEventListener('change', this.handleCheckboxEvent));
    }

    onSubmitHandler(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target.closest('form'));
        const formDataArray = [...formData];

        const productFilters = formDataArray.filter(filter => filter.some(element => element.includes('product'))).map(filterArr => filterArr[1]).join();
        const vendorFilters = formDataArray.filter(filter => filter.some(element => element.includes('vendor'))).map(filterArr => filterArr[1]).join();

        const productURL = productFilters.length > 0 ? `filter.p.product_type=${productFilters}` : '';
        const vendorURL = vendorFilters.length > 0 ? `filter.p.vendor=${vendorFilters}` : '';

        let searchParams;

        if(productURL && vendorURL) {
            searchParams = `${productURL}&${vendorURL}`;
        } else if(productURL && !vendorURL) {
            searchParams = productURL;
        } else {
            searchParams = vendorURL;
        }

        this.renderPage(searchParams, event);
    }

    handleCheckboxEvent(event) {
        const checkboxElement = event.target.closest('.filter__checkbox');
        checkboxElement.classList.toggle('active');
    }

    renderPage(searchParams, event, updateURLHash = true) {
        const sections = this.getSections();
        document.getElementById('ProductGrid').querySelector('.collection-products').classList.add('loading');
        
        sections.forEach((section) => {
            const url = `${window.location.pathname}?section_id-${section.section}${searchParams && `&${searchParams}`}`;
            const filterDataUrl = element => element.url === url;

            this.filterData.some(filterDataUrl) ? this.renderSectionFromCache(filterDataUrl, event) : this.renderSectionFromFetch(url, event);
        });
    }

    renderSectionFromFetch(url, event) {
        fetch(url)
            .then(response => response.text())
            .then(responseText => {
                const html = responseText;
                this.filterData = [...this.filterData, { html, url }];
                this.renderFilters(html, event);
                this.renderProductGrid(html);
            })
    }

    renderSectionFromCache(filterDataUrl, event) {
        const html = this.filterData.find(filterDataUrl).html;
        this.renderFilters(html, event);
        this.renderProductGrid(html);
    }

    renderProductGrid(html) {
        const innerHTML = new DOMParser()
            .parseFromString(html, 'text/html')
            .getElementById('ProductGrid').innerHTML;
        
        document.getElementById('ProductGrid').innerHTML = innerHTML;
    }

    renderFilters(html, event) {
        const parsedHTML = new DOMParser().parseFromString(html, 'text/html');

        const filterDetailsElement = parsedHTML.querySelectorAll('#ProductFiltersForm .js-filter');
        const matchesIndex = (element) => element.dataset.index === event?.target.closest('.js-filter')?.dataset.index
        const filtersToRender = Array.from(filterDetailsElement).filter(element => !matchesIndex(element));
        const countsToRender = Array.from(filterDetailsElement).find(matchesIndex);

        filtersToRender.forEach((element) => {
            document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHtml = element.innerHTML;
        })

    }

    getSections() {
        return [
            {
                id: "kendama-main-collection-product-grid",
                section: document.getElementById("kendama-main-collection-product-grid").dataset.id
            }
        ]
    }
}

class FacetRemove extends HTMLElement {
    constructor() {
        super();

    }
}

customElements.define('product-filters-form', ProductFiltersForm)