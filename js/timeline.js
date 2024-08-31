class Timeline extends Component {
    #timelineEvents = {};
    #timeline = [];

    constructor(controller, element) {
        super(controller, element);
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

    show() {
        // TODO
    }

    getTitle() {
        return 'Timeline';
    }
}
