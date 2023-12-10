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

    static showStatusPopup(parent, innerClass, timeout) {
        if (typeof(innerClass) === 'undefined') {
            innerClass = 'popupInnerContent';
        }
        if (typeof(timeout) === 'undefined') {
            timeout = 1000;
        }
        let popupDiv = document.createElement('div');
        popupDiv.className = 'statusPopup';
        let contentDiv = document.createElement('div');
        contentDiv.className = 'statusPopupContent';
        popupDiv.appendChild(contentDiv);
        let innerDiv = document.createElement('div');
        innerDiv.className = innerClass;
        contentDiv.appendChild(innerDiv);
        parent.appendChild(popupDiv);

        setTimeout(function() {
            popupDiv.remove();
        }, timeout);
        return innerDiv;
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

    static humanizeKey(str) {
        let pieces = str.split('_');
        for (let i = 0 ; i < pieces.length; i++) {
            pieces[i] = pieces[i].charAt(0).toUpperCase() + pieces[i].slice(1);
        }
        return pieces.join(' ');
    }

    static addClass(element, className) {
        let classes = element.className.split(' ');
        if (classes.indexOf(className) === -1) {
            classes.push(className);
            element.className = classes.join(' ');
        }
    }

    static removeClass(element, className) {
        let classes = element.className.split(' ');
        let index = classes.indexOf(className);
        if (index !== -1) {
            classes.splice(index, 1);
            element.className = classes.join(' ');
        }
    }

    static hasClass(element, className) {
        let classes = element.className.split(' ');
        let index = classes.indexOf(className);
        return index !== -1;
    }
}