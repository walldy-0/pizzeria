import { templates } from '../settings.js';
import utils from '../utils.js';

class Home {
  constructor(wrapper) {
    const thisHome = this;

    thisHome.render(wrapper);
  }

  render(wrapper) {
    const thisHome = this;

    thisHome.dom = {};

    const generatedHTML = templates.homePage();
    thisHome.dom.wrapper = wrapper;
    thisHome.dom.wrapper.appendChild(utils.createDOMFromHTML(generatedHTML));
  }
}

export default Home;