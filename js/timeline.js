class Timeline extends Component {
    #timelineEvents = {};
    #timeline = [];
    #months = {};

    constructor(controller, element) {
        super(controller, element);
    }

    addMonths(months) {
        for (let id in months) {
            if (months.hasOwnProperty(id)) {
                this.#months[id] = months[id];
            }
        }
    }

    addTimelineEvents(timelineEvents) {
        for (let index in timelineEvents) {
            let timelineEvent = timelineEvents[index];
            this.#timeline.push(timelineEvent.id);
            this.#timelineEvents[timelineEvent.id] = timelineEvent;
        }
    }

    getEvents() {
        return this.#timelineEvents;
    }

    getTimeline() {
        return this.#timeline;
    }

    getMonths() {
        return this.#months;
    }

    show() {
        let container = this.getElement();
        Utilities.empty(container);
        Utilities.createDiv('', container, 'Coming Soon!');
    }

    getTitle() {
        return 'Timeline';
    }
}
