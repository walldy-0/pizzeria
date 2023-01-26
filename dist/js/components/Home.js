import { templates, select } from '../settings.js';
import utils from '../utils.js';
import SliderWidget from './SliderWidget.js';

class Home {
  constructor(wrapper) {
    const thisHome = this;

    thisHome.render(wrapper);
    thisHome.initWidgets();
  }

  render(wrapper) {
    const thisHome = this;

    thisHome.dom = {};

    const generatedHTML = templates.homePage();
    thisHome.dom.wrapper = wrapper;
    thisHome.dom.wrapper.appendChild(utils.createDOMFromHTML(generatedHTML));
  }

  initWidgets() {
    const thisHome = this;

    thisHome.dom.slider = thisHome.dom.wrapper.querySelector(select.home.slider);
    thisHome.sliderWidget = new SliderWidget(thisHome.dom.slider);
    console.log('init', thisHome.sliderWidget);
  }
}

export default Home;