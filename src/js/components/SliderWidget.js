class SliderWidget {
  constructor(wrapper) {
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapper;
    thisWidget.initPlugin();
  }

  initPlugin() {
    const thisWidget = this;

    // eslint-disable-next-line no-undef
    new Flickity( thisWidget.dom.wrapper, {
      // options
      autoPlay: 3000,
      prevNextButtons: false,
      wrapAround: true
    });
  }
}

export default SliderWidget;