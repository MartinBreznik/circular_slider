function setAttributes(obj, props) {
  var key;
  for (key in props) {
    if (props.hasOwnProperty(key)) {
      obj.setAttribute(key, props[key]);
    }
  }
}

var slide = function (options) { 
  this.svgDoc = 'http://www.w3.org/2000/svg';
  this.mouseDown = false;
  this.lineWidth = 12;
  this.circuit = 2 * Math.PI * (options.radius - (this.lineWidth / 2));

  this.container = options.container.querySelector('.slider');
  if (!this.container) {
    this.container = document.createElement('div');
    setAttributes(this.container, {class:'slider'});
    options.container.appendChild(this.container);
  }
  options.container = this.container;

  this.slider = options.container.querySelector('.slider-container');
  if (!this.slider) {
    this.slider = document.createElement('div');
    setAttributes(this.slider, {
      class: 'slider-container',
      style: 'width:' + ((options.radius * 2) / 5).toString() +
      '%; height:' + ((options.radius * 2) / 5).toString() + '%;'
    });
    options.container.appendChild(this.slider);

  }

  this.sliders = [].slice.call(options.container.querySelectorAll('circle'));

  this.svg = options.container.querySelector('svg');
  if (!this.svg) {
    this.svg = document.createElementNS(this.svgDoc, 'svg');
    setAttributes(this.svg, {
      xmlns: this.svgDoc,
      viewBox: '0 0 ' + (options.radius * 2).toString() + ' ' + (options.radius * 2).toString(),
      width: '100%',
      height: '100%',
      class: 'slider-progress'
    });
    this.slider.appendChild(this.svg);
  }

  this.progressTarget = document.createElementNS(this.svgDoc, 'circle');
  setAttributes(this.progressTarget, {
    cx: options.size / 2,
    cy: options.size / 2,
    r: options.radius,
    fill: 'transparent',
    'stroke-width': this.lineWidth * 4,
    id: 'slider-meter' + (this.sliders.length.toString() / 3)
  });

  this.progressMeter = document.createElementNS(this.svgDoc, 'circle');
  setAttributes(this.progressMeter, {
    cx: options.size / 2,
    cy: options.size / 2,
    r: options.radius - (this.lineWidth / 2),
    fill: 'transparent',
    'stroke-width': this.lineWidth,
    class: 'slider-meter'
  });
  this.progressMeter.style.pointerEvents = 'none';

  this.progressValue = document.createElementNS(this.svgDoc, 'circle');
  setAttributes(this.progressValue, {
    cx: options.size / 2,
    cy: options.size / 2,
    r: options.radius - (this.lineWidth / 2),
    'stroke-width': this.lineWidth,
    fill: 'transparent',
    class: 'slider-value',
    style: 'stroke: ' + options.color + '; pointer-events: none;'
  });

  this.dial = document.createElement('label');
  setAttributes(this.dial, {
    for: 'slider-control' + (this.sliders.length.toString() / 3),
    class: 'slider-dial',
  });
  Object.assign(this.dial.style, {
    width: Math.floor(100 * 2 * options.radius / options.size) + '%',
    height: Math.floor(100 * 2 * options.radius / options.size) + '%'
  });

  this.span = document.createElement('span');
  this.dial.appendChild(this.span);


  this.input = document.createElement('input');
  setAttributes(this.input, {
    type: 'range',
    id: 'slider-control' + (this.sliders.length.toString() / 3),
    name: 'points',
    min: options.range[0],
    max: options.range[1],
    step: options.step,
    value: options.value || '0',
    'aria-label': options.text
  });
  this.input.addEventListener('focus', function (event) {
    event.target.classList.add('focus');
  }.bind(this));
  this.input.addEventListener('blur', function (event) {
    event.target.classList.remove('focus');
  }.bind(this));
  this.input.addEventListener('input', function (event) {
    this.progress(event.target['valueAsNumber']);
  }.bind(this));
  this.input.addEventListener('change', function (event) {
    this.progress(event.target['valueAsNumber']);
  }.bind(this));

  this.pricing = document.createElement('span');
  setAttributes(this.pricing, {class:'slider-pricing'});
  this.pricing[this.pricing.textContent ? 'textContent' : 'innerHTML'] = '$' + options.range[0].toString();

  this.box = document.createElement('span');
  setAttributes(this.box, {class:'slider-box'});
  this.box.style.backgroundColor = options.color;

  this.text = document.createElement('span');
  setAttributes(this.text, {class:'slider-text'});
  this.text[this.text.textContent ? 'textContent' : 'innerHTML'] = options.text;

  // slider
  this.svg.appendChild(this.progressTarget);
  this.svg.appendChild(this.progressMeter);
  this.svg.appendChild(this.progressValue);
  this.slider.appendChild(this.input);
  this.slider.appendChild(this.dial);

  // docs
  this.div = document.createElement('div');
  this.div.appendChild(this.pricing);
  this.div.appendChild(this.box);
  this.div.appendChild(this.text);
  options.docs.appendChild(this.div);
  options.docs.classList.add('slider-price');

  this.handleInput = function() {
    document.addEventListener('mouseup', function() {
      [].slice.call(this.container.querySelectorAll('input')).forEach(function(x){x.classList.remove('focus');});
      this.mouseDown = false;
    }.bind(this), {passive: true});
    document.addEventListener('touchend', function() {
      [].slice.call(this.container.querySelectorAll('input')).forEach(function(x){x.classList.remove('focus');});
      this.mouseDown = false;
    }.bind(this), {passive: true});
    this.slider.addEventListener('mousedown', function(event) {
      if (event.target === this.progressTarget) {
        document.getElementById(event.target.id.replace('slider-meter', 'slider-control')).classList.add('focus');
        this.move(event);
        this.mouseDown = true;
      }
    }.bind(this), {passive: true});
    this.slider.addEventListener('touchstart', function(event) {
      if (event.target === this.progressTarget) {
        document.getElementById(event.target.id.replace('slider-meter', 'slider-control')).classList.add('focus');
        this.move(event);
        this.mouseDown = true;
      }
    }.bind(this), {passive: true});
    this.progressMeter.addEventListener('click', this.update, {passive: true});
    this.progressValue.addEventListener('click', this.update, {passive: true});
    document.addEventListener('mousemove', this.update, {passive: false});
    document.addEventListener('touchmove', this.update, {passive: false});
  }.bind(this);

  this.update = function(event) {
    if (!this.mouseDown || options.range[1] === 0) { return; }
    this.move(event);
  }.bind(this);

  this.move = function(event) {
    var coords = this.slider.getBoundingClientRect(),
        position = { x: event.clientX, y: event.clientY },
        atan, deg, points;

    if (~['touchstart', 'touchmove', 'touchend'].indexOf(event.type)) {
      event.preventDefault();
      position = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }

    atan = Math.atan2(position.x - coords.left - (this.slider.offsetWidth / 2), position.y - coords.top - (this.slider.offsetWidth / 2));
    deg = Math.ceil((-atan / (Math.PI / 180)) + 180);
    points = Math.ceil(deg * options.range[1] / 360);
    this.progress(points);
  }.bind(this);

  this.progress = function(value) {
    var deg = value * 360 / options.range[1];

    this.progressValue.style.strokeDashoffset = this.circuit * (1 - (value / options.range[1]));
    this.input.value = value;
    this.dial.style.transform = 'translate(-50%, -50%) rotate(' + deg.toString() + 'deg)';
    this.pricing.textContent = '$' + value.toString();
  };

  this.progressValue.style.strokeDasharray = this.circuit;
  this.progress(this.input.value);
};

// instance
(function() {
  var container = document.querySelector('.sliders');
  var docs = document.querySelector('.docs');

  var slider1 = new slide({
    container: container,
    docs: docs,
    color: 'red',
    range: [0, 1000],
    value: 200,
    step: 1,
    radius: 250,
    size: 500,
    text: 'Transportation'
  });
  slider1.handleInput();

  var slider2 = new slide({
    container: container,
    docs: docs,
    color: 'orange',
    range: [0, 1000],
    value: 800,
    step: 1,
    radius: 200,
    size: 500,
    text: 'Food'
  });
  slider2.handleInput();

  var slider3 = new slide({
    container: container,
    docs: docs,
    color: 'green',
    range: [0, 1000],
    value: 500,
    step: 1,
    radius: 150,
    size: 500,
    text: 'Insurance'
  });
  slider3.handleInput();

  var slider4 = new slide({
    container: container,
    docs: docs,
    color: 'blue',
    range: [0, 1000],
    value: 650,
    step: 1,
    radius: 100,
    size: 500,
    text: 'Entertainment'
  });
  slider4.handleInput();

  var slider5 = new slide({
    container: container,
    docs: docs,
    color: 'purple',
    range: [0, 1000],
    value: 750,
    step: 1,
    radius: 50,
    size: 500,
    text: 'Health care'
  });
  slider5.handleInput();
})();