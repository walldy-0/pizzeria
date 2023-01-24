import { classNames, select, settings, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(wrapper) {
    const thisBooking = this;

    thisBooking.selectedTableId = 0;
    thisBooking.selectedStarters = [];

    thisBooking.render(wrapper);
    thisBooking.initWidgets();
    thisBooking.getData();
    this.initActions();
  }

  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      bookings: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = {
      bookings: settings.db.url + '/' + settings.db.bookings + '?' + params.bookings.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (const item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (const item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (const item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
  
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;
    
    thisBooking.resetSelectedTable();

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (typeof thisBooking.booked[thisBooking.date] == 'undefined'
      || typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined') {
      allAvailable = true;
    }

    for (const table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (!allAvailable
        && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(wrapper) {
    const thisBooking = this;
    
    thisBooking.dom = {};

    const generatedHTML = templates.bookingWidget();
    thisBooking.dom.wrapper = wrapper;
    thisBooking.dom.wrapper.appendChild(utils.createDOMFromHTML(generatedHTML));

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.dateWrapper = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.timeWrapper = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.room = thisBooking.dom.wrapper.querySelector(select.booking.room);
    thisBooking.dom.startersOptions = thisBooking.dom.wrapper.querySelector(select.booking.startersOptions);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.submit = thisBooking.dom.wrapper.querySelector(select.booking.formSubmit);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.amountWidgetPeople = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.amountWidgetHours = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.dateWrapper);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.timeWrapper);

    thisBooking.dom.wrapper.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });
  }

  initActions() {
    const thisBooking = this;

    thisBooking.dom.room.addEventListener('click', function(event) {
      const table = event.target;

      // only tables have id attribute
      const tableId = parseInt(table.getAttribute(settings.booking.tableIdAttribute));
      
      if (!isNaN(tableId) && !table.classList.contains(classNames.booking.tableBooked)) {
        const newTableSelected = thisBooking.selectedTableId != tableId;

        thisBooking.resetSelectedTable();

        if (newTableSelected) {
          thisBooking.selectedTableId = tableId;
          table.classList.add(classNames.booking.selected);
        }
      }
    });

    thisBooking.dom.startersOptions.addEventListener('click', function(event) {
      if (event.target.tagName == 'INPUT' && event.target.type == 'checkbox' && event.target.name == settings.booking.starterCheckboxName) {
        if (event.target.checked) {
          thisBooking.selectedStarters.push(event.target.value);
        } else {
          thisBooking.selectedStarters.splice(thisBooking.selectedStarters.indexOf(event.target.value), 1);
        }
      }
    });

    thisBooking.dom.submit.addEventListener('click', function(event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }

  resetSelectedTable() {
    const thisBooking = this;

    if (thisBooking.selectedTableId > 0) {
      const selectedTable = document.querySelector('[' + settings.booking.tableIdAttribute + '="' + thisBooking.selectedTableId + '"]');
      selectedTable.classList.remove(classNames.booking.selected);
      thisBooking.selectedTableId = 0;
    }
  }

  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.bookings;
    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.selectedTableId > 0 ? thisBooking.selectedTableId : null,
      duration: thisBooking.amountWidgetHours.value,
      ppl: thisBooking.amountWidgetPeople.value,
      starters: thisBooking.selectedStarters,
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    
    fetch(url, options)
      .then(function(response) {
        if (!response.ok) {
          throw new Error(response.status + ' (' + response.statusText + ')');
        }
      })
      .then(function() {
        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
        thisBooking.updateDOM();
        
        console.log('Booking OK');
      })
      .catch(function(error) {
        console.error(error);
      });
  }
}

export default Booking;