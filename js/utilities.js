class Utilities {
    static shuffle = function(a) {
        return a.map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    }

    static empty = function(node) {
        while (node.firstChild) {
            node.removeChild(node.lastChild);
        }
    }

    static addHandlerToClass(className, callback) {
        let elements = document.getElementsByClassName(className);
        for (let i = 0; i < elements.length; i++) {
            elements[i].addEventListener('click', callback);
        }
    }

    static showPopup(parent, innerClass) {
        if (typeof(innerClass) === 'undefined') {
            innerClass = 'popupInnerContent';
        }
        let popupDiv = document.createElement('div');
        popupDiv.className = 'popup';
        let contentDiv = document.createElement('div');
        contentDiv.className = 'popupContent';
        popupDiv.appendChild(contentDiv);
        let innerDiv = document.createElement('div');
        innerDiv.className = innerClass;
        contentDiv.appendChild(innerDiv);
        parent.appendChild(popupDiv);

        popupDiv.addEventListener('click', function() {
            this.remove();
        });
        return innerDiv;
    }

    static createDiv(className, parent) {
        let div = document.createElement('div');
        div.className = className;
        if (typeof(parent) !== 'undefined') {
            parent.appendChild(div);
        }
        return div;
    }
}