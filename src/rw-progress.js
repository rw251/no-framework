import './rw-progress.scss';

const queue = (() => {
  const pending = [];

  function next() {
    const fn = pending.shift();
    if (fn) {
      fn(next);
    }
  }

  return (fn) => {
    pending.push(fn);
    if (pending.length === 1) next();
  };
})();

exports.Progress = {
  status: null,
  positionUsing: 'translate3d',

  isStarted() {
    return typeof this.status === 'number';
  },

  isRendered() {
    return !!document.getElementById('nprogress');
  },

  done(force) {
    if (!force && !this.status) return this;

    return this.inc(0.3 + 0.5 * Math.random()).set(1);
  },

  remove() {
    document.documentElement.classList.remove('nprogress-busy');
    const progress = document.getElementById('nprogress');
    progress && progress.parentNode && progress.parentNode.removeChild(progress);
  },

  render(fromStart) {
    if (this.isRendered()) return document.getElementById('nprogress');

    document.documentElement.classList.add('nprogress-busy');

    const progress = document.createElement('div');
    progress.id = 'nprogress';
    progress.innerHTML = '<div class="bar" role="bar"><div class="peg"></div></div>';

    const bar = progress.querySelector('[role="bar"]');
    const perc = fromStart ? '-100' : (-1 + (this.status || 0)) * 100;
    const parent = document.querySelector('body');

    bar.style.transition = 'all 0 linear';
    bar.style.transform = `translate3d(${perc}%,0,0)`;

    parent.appendChild(progress);
    return progress;
  },

  set(n) {
    const started = this.isStarted();

    n = Math.min(Math.max(n, 0.08), 1);
    this.status = (n === 1 ? null : n);

    const progress = this.render(!started);
    const bar = progress.querySelector('[role="bar"]');
    const speed = 200;
    const ease = 'linear';

    progress.offsetWidth; /* Repaint */

    queue((next) => {
      // Add transition
      bar.style.transform = `translate3d(${(-1 + n) * 100}%,0,0)`;
      bar.style.transition = `all ${speed}ms ${ease}`;

      if (n === 1) {
        // Fade out
        progress.style.transition = 'none';
        progress.style.opacity = 1;
        progress.offsetWidth; /* Repaint */

        setTimeout(() => {
          progress.style.transition = `all ${speed}ms linear`;
          progress.style.opacity = 0;

          setTimeout(() => {
            this.remove();
            next();
          }, speed);
        }, speed);
      } else {
        setTimeout(next, speed);
      }
    });

    return this;
  },

  inc(amount) {
    let n = this.status;

    if (!n) {
      return this.start();
    } if (n <= 1) {
      if (typeof amount !== 'number') {
        if (n >= 0 && n < 0.2) { amount = 0.1; } else if (n >= 0.2 && n < 0.5) { amount = 0.04; } else if (n >= 0.5 && n < 0.8) { amount = 0.02; } else if (n >= 0.8 && n < 0.99) { amount = 0.005; } else { amount = 0; }
      }

      n = Math.min(Math.max(n + amount, 0), 0.994);
      return this.set(n);
    }
  },

  start() {
    if (!this.status) this.set(0);

    const work = () => {
      setTimeout(() => {
        if (!this.status) return;
        this.inc();
        work();
      }, 200);
    };

    work();

    return this;
  },
};
