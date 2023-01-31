import { templates, select } from '../settings.js';
import utils from '../utils.js';
import SliderWidget from './SliderWidget.js';

class Home {
  constructor(wrapper) {
    const thisHome = this;

    thisHome.render(wrapper);
    thisHome.initWidgets();
    thisHome.initActions();
  }

  render(wrapper) {
    const thisHome = this;

    thisHome.dom = {};

    const generatedHomeHTML = templates.homePage();
    thisHome.dom.wrapper = wrapper;
    thisHome.dom.wrapper.appendChild(utils.createDOMFromHTML(generatedHomeHTML));

    const generatedAwesomeIconsHTML = templates.awesomeIcons();
    thisHome.dom.imageWrappers = thisHome.dom.wrapper.querySelectorAll(select.home.imgContainer);

    for (const wrap of thisHome.dom.imageWrappers) {
      wrap.appendChild(utils.createDOMFromHTML(generatedAwesomeIconsHTML));
    }

    thisHome.dom.linkOrder = thisHome.dom.wrapper.querySelector(select.home.linkOrder);
    thisHome.dom.linkBooking = thisHome.dom.wrapper.querySelector(select.home.linkBooking);
  }

  initWidgets() {
    const thisHome = this;

    thisHome.dom.slider = thisHome.dom.wrapper.querySelector(select.home.slider);
    thisHome.sliderWidget = new SliderWidget(thisHome.dom.slider);
  }

  initActions() {
    const thisHome = this;

    thisHome.dom.linkOrder.addEventListener('click', function(event) {
      thisHome.openTab(thisHome.getPageIdFromClickedLink(event));
    });

    thisHome.dom.linkBooking.addEventListener('click', function(event) {
      thisHome.openTab(thisHome.getPageIdFromClickedLink(event));
    });
  }

  getPageIdFromClickedLink(event) {
    return event.target.classList.value.substring(event.target.classList.value.lastIndexOf('-') + 1, event.target.classList.value.length);
  }

  openTab(target)  {
    const thisHome = this;

    const event = new CustomEvent('open-tab', {
      bubbles: true,
      detail: {
        pageId: target,
      },
    });

    thisHome.dom.wrapper.dispatchEvent(event);
  }
}

export default Home;