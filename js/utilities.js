class Utilities {
    static #markdown_converter = new showdown.Converter({
        requireSpaceBeforeHeadingText: true,
        tables: true,
        underline: false,
    });

    static shuffle = function(a) {
        return a.map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    }

    static mapArray = function(obj) {
        let a = [];
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                let o = obj[key];
                o.id = key;
                a.push(o);
            }
        }
        return a;
    }

    static isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }

    static merge(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();

        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.merge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return this.merge(target, ...sources);
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

    static showPopup(parent, innerClass, buttons) {
        let innerClassName = 'popupContent';
        if (typeof(buttons) === 'undefined') {
            // default to showing a close button
            buttons = {close: null};
        } else {
            // This is kind of a hack for now to trigger full-screen popups only when
            // Navigation buttons are used
            innerClassName += ' popupFullscreen';
        }
        if (typeof(innerClass) === 'undefined') {
            innerClass = 'popupInnerContent';
        }
        let popupDiv = document.createElement('div');
        popupDiv.className = 'popup';
        let contentDiv = document.createElement('div');
        contentDiv.className = innerClassName;
        popupDiv.appendChild(contentDiv);
        let innerDiv = document.createElement('div');
        innerDiv.className = innerClass;
        parent.appendChild(popupDiv);

        let hasPreviousButton = buttons.hasOwnProperty('previous') && buttons.previous !== false;
        let hasLeftButtons = hasPreviousButton;
        let hasNextButton = buttons.hasOwnProperty('next') && buttons.previous !== false;
        let hasCloseButton = buttons.hasOwnProperty('close') && buttons.close !== false;
        let hasRightButtons = hasNextButton || hasCloseButton;

        if (hasLeftButtons) {
            let leftContainer = this.createDiv('leftDialogButtons', contentDiv);
            this.createDiv('emptyButtonContainer', leftContainer);
            if (hasPreviousButton) {
                let callback = buttons.previous;
                if (callback === true) callback = null;
                let previousContainer = this.createDiv('previousButtonContainer', leftContainer);
                let previousButton = this.createElement('button', 'previousButton', previousContainer);
                previousButton.title = 'Previous';
                previousButton.addEventListener('click', function() {
                    if (callback != null) {
                        if (callback(popupDiv)) {
                            popupDiv.remove();
                        }
                    }
                });
            }
        }

        contentDiv.appendChild(innerDiv);

        if (hasRightButtons) {
            let rightContainer = this.createDiv('rightDialogButtons', contentDiv);
            if (hasCloseButton) {
                let callback = buttons.close;
                if (callback === true) callback = null;
                let closeContainer = this.createDiv('closeButtonContainer', rightContainer);
                let closeButton = this.createElement('button', 'closeButton', closeContainer);
                closeButton.title = 'Close Popup';
                closeButton.addEventListener('click', function() {
                    popupDiv.remove();
                    if (callback != null) {
                        callback(popupDiv);
                    }
                });
            } else {
                this.createDiv('emptyButtonContainer', rightContainer);
            }
            if (hasNextButton) {
                let callback = buttons.next;
                if (callback === true) callback = null;
                let nextContainer = this.createDiv('nextButtonContainer', rightContainer);
                let nextButton = this.createElement('button', 'nextButton', nextContainer);
                nextButton.title = 'Next';
                nextButton.addEventListener('click', function() {
                    if (callback != null) {
                        if (callback(popupDiv)) {
                            popupDiv.remove();
                        }
                    }
                });
            }
        }

        // Must be able to close the dialog
        // Note that there is no way to get a callback this way.
        if (!hasCloseButton) {
            popupDiv.addEventListener('click', function() {
                this.remove();
            });
        }
        return innerDiv;
    }

    static setVisible(element, visible) {
        element.style.display = visible ? '' : 'none';
    }

    static closePopups() {
        let elements = document.getElementsByClassName('closeButton');
        for (let i = 0; i < elements.length; i++) {
            elements[i].dispatchEvent(new Event("click"));
        }
    }

    static createElement(elementType, className, parent, text) {
        let div = document.createElement(elementType);
        if (typeof(className) !== 'undefined') {
            div.className = className;
        }
        if (typeof(parent) !== 'undefined') {
            parent.appendChild(div);
        }
        if (typeof(text) !== 'undefined' && text != null) {
            div.innerText = text;
        }
        return div;
    }

    static createDiv(className, parent, text) {
        return this.createElement('div', className, parent, text);
    }

    static createSpan(className, parent, text) {
        return this.createElement('span', className, parent, text);
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

    static escapeHtml(unsafe) {
        return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
    }

    static convertFromHTML(text) {
        let tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        return tempDiv.innerText;
    }

    static convertToHTML(text) {
        let tempDiv = document.createElement('div');
        tempDiv.innerText = text;
        return tempDiv.innerHTML;
    }

    static convertMarkdown(text) {
        text = text.trim();

        // add ending code block tags when missing
        let code_block_count = (text.match(/```/g) || []).length;
        if( code_block_count % 2 !== 0 ) {
            text += "\n```";
        }

        // HTML-escape parts of text that are not inside ticks.
        // This prevents <?php from turning into a comment tag
        let escaped_parts = [];
        let code_parts = text.split("`");
        for( let i = 0; i < code_parts.length; i++ ) {
            if( i % 2 === 0 ) {
                escaped_parts.push( Utilities.escapeHtml( code_parts[i] ) );
            } else {
                escaped_parts.push( code_parts[i] );
            }
        }
        let escaped_message = escaped_parts.join("`");

        // Convert Markdown to HTML
        let formatted_message = "";
        let code_blocks = escaped_message.split("```");
        for( let i = 0; i < code_blocks.length; i++ ) {
            if( i % 2 === 0 ) {
                // add two spaces in the end of every line
                // for non-codeblocks so that one-per-line lists
                // without markdown can be generated
                formatted_message += Utilities.#markdown_converter.makeHtml(
                    code_blocks[i].trim().replace( /\n/g, "  \n" )
                );
            } else {
                // convert Markdown code blocks to HTML
                formatted_message += Utilities.#markdown_converter.makeHtml(
                    "```" + code_blocks[i] + "```"
                );
            }
        }

        return formatted_message;
    }

    static setCookie(cname, cvalue, exdays) {
        exdays = typeof(exdays) === 'undefined' ? 90 : exdays;
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    static getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return null;
    }

    static filterOptions(select, value) {
        for (let i = 0; i < select.children.length; i++) {
            let option = select.children[i];
            option.selected = false;
            if (value.length > 0 && option.innerText.toLowerCase().indexOf(value) === -1) {
                option.hidden = true;
                option.disabled = true;
            } else {
                option.hidden = false;
                option.disabled = false;
            }
        }
    }

    static nextOption(select, direction) {
        let previousSelection = select.selectedIndex;
        let selected = previousSelection + direction;
        while (selected < select.children.length && selected >= 0 && select.children[selected].disabled) {
            selected += direction;
        }
        if (selected < select.children.length && selected >= 0) {
            select.selectedIndex = selected;
            return true;
        } else {
            select.selectedIndex = previousSelection;
        }

        return false;
    }
    static translateToFlag(value) {
        value = value.toLowerCase();
        value = value.replaceAll(" ", "_");
        value = value.replaceAll("/", "_");
        value = value.replaceAll(")", "");
        value = value.replaceAll("(", "");
        value = value.replaceAll("the_", "");
        return value;
    }
}