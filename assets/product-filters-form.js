class ProductFiltersForm extends HTMLElement {
    constructor() {
        super();
        this.filterData = [];
        
        this.debouncedOnSubmit = debounce((event) => {
            this.onSubmitHandler(event);
        }, 500)

        this.querySelector('form').addEventListener('input', this.debouncedOnSubmit.bind(this));
        this.querySelectorAll('.filter__checkbox-input').forEach(input => input.addEventListener('click', this.handleCheckboxEvent));
    }

    onSubmitHandler(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target.closest('form'));
        const formDataArray = [...formData];
        const productFilters = formDataArray.filter(filter => filter.some(element => element.includes('product'))).map(filterArr => filterArr[1]).join();
        const vendorFilters = formDataArray.filter(filter => filter.some(element => element.includes('vendor'))).map(filterArr => filterArr[1]).join();
        const optionMaterialFilters = formDataArray.filter(filter => filter.some(element => element.includes('option.material'))).map(filterArr => filterArr[1]).join();
        const priceFilters = formDataArray.filter(filter => filter.some(element => element.includes('v.price'))).filter(filter => filter[1].length > 0).map(filterArr => [filterArr.join("=")]);
        const sortFilterURL = formDataArray.filter(filter => filter.some(element => element.includes('sort_by')))[0].join('=');

        const productURL = productFilters.length > 0 ? `filter.p.product_type=${productFilters}` : '';
        const vendorURL = vendorFilters.length > 0 ? `filter.p.vendor=${vendorFilters}` : '';
        const optionMaterialURL = optionMaterialFilters.length > 0 ? `filter.v.option.material=${optionMaterialFilters}` : '';

        let priceFilterURL = "";

        if(priceFilters.length > 0) {
            priceFilterURL = priceFilters.length > 1 ? priceFilters.join('&') : priceFilters[0].toString();
        }

        const parsedParams = [productURL, vendorURL, optionMaterialURL, priceFilterURL, sortFilterURL].filter(element => element.length > 0);

        let searchParams = parsedParams;

        if(parsedParams.length > 0) searchParams = parsedParams.join("&");
        console.log(searchParams);
        this.renderPage(searchParams, event);
    }

    handleCheckboxEvent(event) {
        const checkboxElement = event.target.closest('.filter__checkbox');
        console.log(checkboxElement);
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

        if (updateURLHash) this.updateURLHash(searchParams);
    }

    renderSectionFromFetch(url, event) {
        fetch(url)
            .then(response => response.text())
            .then(responseText => {
                const html = responseText;
                this.filterData = [...this.filterData, { html, url }];
                this.renderFilters(html, event);
                this.renderProductGrid(html);
            });
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
        console.log(parsedHTML);

        const filterDetailsElement = parsedHTML.querySelectorAll('#ProductFiltersForm .js-filter');
        const matchesIndex = (element) => element.dataset.index === event?.target.closest('.js-filter')?.dataset.index
        
        const filtersToRender = Array.from(filterDetailsElement).filter(element => !matchesIndex(element));
        const countsToRender = Array.from(filterDetailsElement).find(matchesIndex);

        filtersToRender.forEach((element) => {
           const jsFilter =  document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`);
           jsFilter.innerHTML = element.innerHTML;
        });

    }

    updateURLHash(searchParams) {
        history.pushState({searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`)
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

class PriceRange extends HTMLElement {
    constructor() {
        super();
    }
}
class FacetRemove extends HTMLElement {
    constructor() {
        super();
        this.querySelectorAll('input').forEach(element => element.addEventListener('change', this.onRangeChange.bind(this)))

    }
}

customElements.define('product-filters-form', ProductFiltersForm);
customElements.define('price-range', PriceRange);