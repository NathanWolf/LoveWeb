class Tiers {
    #element;
    #tiers = {};

    constructor(element) {
        this.#element = element;
        if (this.#element == null) {
            throw new Error("Element not set");
        }
    }

    addTiers(tiers) {
        for (let id in tiers) {
            if (tiers.hasOwnProperty(id)) {
                this.#tiers[id] = tiers[id];
            }
        }
    }

    showList() {
        Utilities.empty(this.#element);
        let controller = this;
        for (let tierId in this.#tiers) {
            if (!this.#tiers.hasOwnProperty(tierId)) continue;
            let tier = this.#tiers[tierId];
            let tierOption = document.createElement('div');
            tierOption.dataset.tier = tierId;
            tierOption.addEventListener('click', function() {
                controller.onSelectTierList(this.dataset.tier);
            });
            tierOption.className = 'tierOption';
            tierOption.innerText = tier.name;
            this.#element.appendChild(tierOption);
        }
    }

    onSelectTierList(id) {
        alert("Working on it, please try again later! (" + id + ")");
    }
}
