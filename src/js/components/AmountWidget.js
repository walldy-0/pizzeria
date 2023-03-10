import {settings, select} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {
    let initialValue = settings.amountWidget.defaultValue;
    const initialValueFromElm = element.querySelector(select.widgets.amount.input).value;
    if (initialValueFromElm) {
      initialValue = initialValueFromElm;
    }

    super(element, initialValue);

    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.value);
    thisWidget.initActions();
  }

  getElements() {
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(value) {
    return !isNaN(value)
      && value >= settings.amountWidget.defaultMin
      && value <= settings.amountWidget.defaultMax;
  }

  renderValue() {
    const thisWidget = this;
    
    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function() {
      thisWidget.setValue(thisWidget.dom.input.value);
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(parseInt(thisWidget.dom.input.value) - 1);
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(parseInt(thisWidget.dom.input.value) + 1);
    });
  }
}

export default AmountWidget;