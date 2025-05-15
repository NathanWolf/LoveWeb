class Slideshow extends Component {
    #url = 'https://docs.google.com/presentation/d/e/2PACX-1vQpDcXm5ARqg75dLyU827cbTkTcjo_xwPmf7tLXdZUrQC3OtMVan6wqkGQUdbPYdDeYcPltMDLzlj0A/pubembed?start=false&loop=false&delayms=10000'
    #loaded = false;

    show() {
        if (this.#loaded) return;
        this.#loaded = true;
        
        let element = this.getElement();
        Utilities.empty(element);
        let iframe = document.createElement('iframe');
        iframe.src = this.#url;
        iframe.frameborder = 0;
        iframe.width = '960';
        iframe.height = '569';
        iframe.allowFullscreen = true;
        element.append(iframe);
    }
}
