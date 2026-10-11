(function () {
  var api = window.loadersz;
  var preview = document.getElementById('preview');
  var stateName = document.getElementById('state-name');
  var snippet = document.getElementById('snippet');
  var groups = document.getElementById('groups');
  var filters = document.getElementById('filters');
  var empty = document.getElementById('empty');
  var search = document.getElementById('search');
  var copyButton = document.getElementById('copy');
  var state = 'racing';
  var category = 'all';
  var colorMode = 'native';

  var fields = {
    speed: document.getElementById('speed'),
    density: document.getElementById('density'),
    radius: document.getElementById('radius'),
    hue: document.getElementById('hue'),
    css: document.getElementById('css-color'),
  };

  function number(input) {
    return Number(input.value);
  }

  function fixed(value) {
    return number(value).toFixed(2);
  }

  function syncOutputs() {
    document.getElementById('speed-out').textContent = fixed(fields.speed);
    document.getElementById('density-out').textContent = fixed(fields.density);
    document.getElementById('radius-out').textContent = fixed(fields.radius);
    document.getElementById('hue-out').textContent = String(number(fields.hue));
  }

  function markup() {
    var attrs = [
      'state="' + state + '"',
      'size="160"',
      'speed="' + fixed(fields.speed) + '"',
      'density="' + fixed(fields.density) + '"',
      'particle-radius="' + fixed(fields.radius) + '"',
    ];
    if (colorMode === 'hue') attrs.push('hue="' + number(fields.hue) + '"');
    if (colorMode === 'css') attrs.push('color="' + fields.css.value + '"');
    return '<script src="loadersz.js"><\/script>\n<loadersz-loader ' + attrs.join(' ') + '></loadersz-loader>';
  }

  function applyPreview() {
    preview.setAttribute('state', state);
    preview.setAttribute('speed', fixed(fields.speed));
    preview.setAttribute('density', fixed(fields.density));
    preview.setAttribute('particle-radius', fixed(fields.radius));
    preview.setAttribute('aria-label', state);
    if (colorMode === 'hue') {
      preview.setAttribute('hue', String(number(fields.hue)));
      preview.removeAttribute('color');
    } else if (colorMode === 'css') {
      preview.removeAttribute('hue');
      preview.setAttribute('color', fields.css.value);
    } else {
      preview.removeAttribute('hue');
      preview.removeAttribute('color');
    }
    stateName.textContent = state;
    snippet.textContent = markup();
    document.querySelectorAll('.card').forEach(function (card) {
      card.classList.toggle('is-current', card.dataset.state === state);
    });
  }

  function setColorMode(next) {
    colorMode = next;
    document.getElementById('hue-field').hidden = next !== 'hue';
    document.getElementById('css-field').hidden = next !== 'css';
    applyPreview();
  }

  function wake(card, active) {
    var loader = card.querySelector('loadersz-loader');
    if (active) loader.removeAttribute('paused');
    else loader.setAttribute('paused', '');
  }

  function choose(next) {
    state = next;
    applyPreview();
    document.querySelector('.stage').scrollIntoView({ block: 'nearest' });
  }

  function visible(name) {
    var query = search.value.trim().toLowerCase();
    if (query && name.toLowerCase().indexOf(query) === -1) return false;
    if (category === 'all') return true;
    return api.LOADER_CATEGORIES.some(function (item) {
      return item.id === category && item.states.indexOf(name) !== -1;
    });
  }

  function renderFilters() {
    [{ id: 'all', label: 'Alle ' + api.LOADER_STATES.length }].concat(api.LOADER_CATEGORIES).forEach(function (item) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter';
      button.textContent = item.label;
      button.dataset.category = item.id;
      button.addEventListener('click', function () {
        category = item.id;
        document.querySelectorAll('.filter').forEach(function (filter) {
          filter.classList.toggle('is-active', filter === button);
        });
        applyFilter();
      });
      filters.appendChild(button);
    });
    filters.firstChild.classList.add('is-active');
  }

  function renderCatalog() {
    api.LOADER_CATEGORIES.forEach(function (item) {
      var section = document.createElement('section');
      section.dataset.category = item.id;
      var heading = document.createElement('h2');
      heading.textContent = item.label;
      var grid = document.createElement('div');
      grid.className = 'grid';
      item.states.forEach(function (name) {
        var card = document.createElement('button');
        card.type = 'button';
        card.className = 'card';
        card.dataset.state = name;
        var loader = document.createElement('loadersz-loader');
        loader.setAttribute('state', name);
        loader.setAttribute('size', '72');
        loader.setAttribute('paused', '');
        loader.setAttribute('aria-hidden', 'true');
        var label = document.createElement('span');
        label.textContent = name;
        card.append(loader, label);
        card.addEventListener('mouseenter', function () { wake(card, true); });
        card.addEventListener('mouseleave', function () { wake(card, false); });
        card.addEventListener('focus', function () { wake(card, true); });
        card.addEventListener('blur', function () { wake(card, false); });
        card.addEventListener('click', function () { choose(name); });
        grid.appendChild(card);
      });
      section.append(heading, grid);
      groups.appendChild(section);
    });
  }

  function applyFilter() {
    var shown = 0;
    document.querySelectorAll('.card').forEach(function (card) {
      var show = visible(card.dataset.state);
      card.hidden = !show;
      if (show) shown += 1;
    });
    document.querySelectorAll('#groups > section').forEach(function (section) {
      section.hidden = !section.querySelector('.card:not([hidden])');
    });
    empty.hidden = shown !== 0;
  }

  document.getElementById('controls').addEventListener('input', function (event) {
    if (event.target.name === 'color-mode') setColorMode(event.target.value);
    else {
      syncOutputs();
      applyPreview();
    }
  });

  document.getElementById('surprise').addEventListener('click', function () {
    var states = api.LOADER_STATES;
    choose(states[Math.floor(Math.random() * states.length)]);
  });

  copyButton.addEventListener('click', function () {
    var text = snippet.textContent;
    function done() {
      copyButton.textContent = 'Kopiert';
      setTimeout(function () { copyButton.textContent = 'Kopieren'; }, 1200);
    }
    function fallback() {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      document.body.appendChild(area);
      area.select();
      var copied = false;
      try {
        copied = document.execCommand('copy');
      } catch (err) {
        copied = false;
      }
      area.remove();
      if (copied) done();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
      return;
    }
    fallback();
  });

  search.addEventListener('input', applyFilter);
  renderFilters();
  renderCatalog();
  syncOutputs();
  applyPreview();
})();
