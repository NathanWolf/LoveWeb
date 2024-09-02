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
        // Create list of events
        let eventContainer = Utilities.createDiv('eventContainer', container);
        let eventIdList = this.getTimeline();
        let events = this.getEvents();

        for (let i = 0; i < eventIdList.length; i++) {
            let event = events[eventIdList[i]];
            let nextEvent = i < eventIdList.length - 1 ? events[eventIdList[i  + 1]] : null;
            this.#createEvent(eventContainer, event, nextEvent);
        }
    }

    #createEvent(container, event, nextEvent) {
        let eventDiv = Utilities.createDiv('event', container);
        let yearType = event.year < 0 ? 'BT' : 'AT';
        let month = event.month < 10 ? '0' + event.month : event.month;
        let day = event.day < 10 ? '0' + event.day : event.day;
        let eventDate = Math.abs(event.year) + ' ' + yearType + ' - ' + month + ' - ' + day;
        Utilities.createDiv('eventDate', eventDiv, eventDate);
        Utilities.createDiv('eventName', eventDiv, event.name);
        if (event.description.length > 0) {
            eventDiv.style.cursor = 'pointer';
            eventDiv.addEventListener('click', function() {
                alert(event.description);
            });
        }
        if (nextEvent != null) {
            let eventLine = Utilities.createDiv('eventLine', container);
            let lineWidth = 20;
            let years = nextEvent.year - event.year;
            lineWidth += years;
            eventLine.style.width = lineWidth + 'px';
            eventLine.style.minWidth = lineWidth + 'px';
        }
    }

    getTitle() {
        return 'Timeline';
    }
}
