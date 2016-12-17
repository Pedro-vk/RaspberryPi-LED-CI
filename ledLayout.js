module.exports = class LedLayout {
  
  constructor(gpio, layout, callback) {
    this._testTime = 2000;
    this._gpio = gpio;
    this._layout = Object.assign({
      success: null,
      warn: null,
      progress: [],
    }, layout);
    this._callback = typeof callback === 'function' ? callback : () => {};

    this.setup();
  }

  setup() {
    this._ledsNumber = Object.values(this._layout)
      .map(_ => Array.isArray(_) ? _ : [_])
      .reduce((acc, _) => acc.concat(_), [])
      .map(_ => this._gpio.setup(_, this._gpio.DIR_OUT, () => this._ledSet()))
      .length;
  }
  _ledSet() {
    this._ledsNumber--;
    if (!this._ledsNumber) {
      this.test();
    }
  }

  test() {
    this.writeSuccess();
    let successOn = false;
    let successInterval = setInterval(() => this.writeSuccess(successOn = !successOn), 200);

    this.writeWarn();
    let warnOn = false;
    let warnInterval = setInterval(() => this.writeWarn(warnOn = !warnOn), 1000 / 20);

    let progress = 0;
    let progressInterval = setInterval(() => this.writeProgress(++progress), this._testTime * 0.6 / 100);

    setTimeout(() => {
      clearInterval(successInterval);
      clearInterval(warnInterval);
      clearInterval(progressInterval);

      this.writeSuccess(false);
      this.writeWarn(false);
      this.writeProgress(0)

      setTimeout(() => this._callback(), 1000);
    }, this._testTime);
  }

  writeSuccess(value = true) {
    this.write(this._layout.success, value);
  }
  writeWarn(value = true) {
    this.write(this._layout.warn, value);
  }
  writeProgress(progress = 100) {
    this._layout.progress
      .forEach(_ => this.write(_, false));
    this._layout.progress
      .filter((_, i) => ((i + 1) / this._layout.progress.length * 100) <= progress)
      .forEach(_ => this.write(_));
  }

  write(pin = this._layout.warn, value = true) {
    this._gpio.write(pin, value, function(err) {
      if (err) {
        console.error(err);
      }
    });
  }

  unexport() {
    console.log('unexporting...');
    this._gpio.destroy(function(err) {
      if(err) console.error(err);
      else console.log('All pins unexported');
    });
  }
}
