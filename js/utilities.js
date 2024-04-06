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

    static showPopup(parent, innerClass, callback) {
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
            if (typeof(callback) !== 'undefined' && callback != null) {
                callback(popupDiv);
            }
        });
        return innerDiv;
    }

    static setVisible(element, visible) {
        element.style.display = visible ? '' : 'none';
    }

    static closePopups() {
        let elements = document.getElementsByClassName('popup');
        for (let i = 0; i < elements.length; i++) {
            elements[i].dispatchEvent(new Event("click"));
        }
    }

    static createElement(elementType, className, parent) {
        let div = document.createElement(elementType);
        div.className = className;
        if (typeof(parent) !== 'undefined') {
            parent.appendChild(div);
        }
        return div;
    }
    static createDiv(className, parent) {
        return this.createElement('div', className, parent);
    }

    static createSpan(className, parent) {
        return this.createElement('span', className, parent);
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
}