/*!
 * loadersz
 * Canvas loaders as one plain script, with no build step and no dependencies.
 * Port of loadersz (c) 2026 lumberjacque, MIT License.
 * https://github.com/lumberjacque/loadersz-core
 */
(function (root) {
  'use strict';
  const mod_math = (function () {
  /** Full circle in radians, shared by periodic geometry builders. */
  const TAU = Math.PI * 2;
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
  /**
   * Restricts a number to an inclusive range.
   *
   * @param value Candidate number.
   * @param min Inclusive lower bound.
   * @param max Inclusive upper bound.
   * @returns `value` restricted to the supplied range.
   */
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  /**
   * Interpolates linearly between two values.
   *
   * @param start Value at `amount = 0`.
   * @param end Value at `amount = 1`.
   * @param amount Interpolation amount; values outside `0`–`1` extrapolate.
   * @returns Linear interpolation between the two values.
   */
  const lerp = (start, end, amount) => start + (end - start) * amount;
  /**
   * Applies a cubic smooth-step easing curve to a normalized value.
   *
   * @param value Progress normally in the `0`–`1` range.
   * @returns Cubic ease-in-out progress with zero velocity at both ends.
   */
  const smoothstep = (value) => value * value * (3 - 2 * value);
  /**
   * Produces a deterministic pseudo-random value without retaining state.
   *
   * @param seed Any finite number used to identify a particle or line.
   * @returns A stable number in the half-open range `[0, 1)`.
   */
  function hash(seed) {
      const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
      return value - Math.floor(value);
  }
  /**
   * Places one point on an approximately uniform unit sphere using a Fibonacci distribution.
   *
   * @param index Zero-based point index.
   * @param count Total number of points in the distribution.
   * @returns A unit-length `[x, y, z]` vector.
   */
  function fibonacciPoint(index, count) {
      const y = 1 - (2 * (index + 0.5)) / count;
      const radius = Math.sqrt(1 - y * y);
      const angle = index * GOLDEN_ANGLE;
      return [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
  }
  /**
   * Normalizes a 3D vector safely.
   *
   * @param vector Three-dimensional vector to normalize.
   * @returns A unit vector, or `[0, 0, 0]` when the input has zero length.
   */
  function normalize([x, y, z]) {
      const length = Math.hypot(x, y, z) || 1;
      return [x / length, y / length, z / length];
  }
  return { TAU, clamp, lerp, smoothstep, hash, fibonacciPoint, normalize };
  })();
  
  const mod_stateRegistry = (function () {
  /**
   * Single source of truth for the public state names and their pure geometry builders.
   *
   * The runtime resolver, playground metadata, direct-entry verification and future documentation
   * generation all derive from this registry rather than maintaining independent state lists.
   */
  const STATE_TO_MODE = {
      working: 'orbit',
      searching: 'scan',
      connecting: 'network',
      weaving: 'weave',
      shaping: 'morph',
      listening: 'wave',
      breathing: 'pulse',
      composing: 'ribbon',
      solving: 'cube',
      observing: 'halo',
      dreaming: 'tunnel',
      charging: 'swarm',
      flowing: 'knot',
      awakening: 'nova',
      coding: 'circuit',
      transcending: 'portal',
      singing: 'aurora',
      growing: 'helix',
      blooming: 'flower',
      wandering: 'fireflies',
      decoding: 'matrix',
      calibrating: 'gyroscope',
      attracting: 'magnet',
      shattering: 'shards',
      crystallizing: 'crystal',
      constellating: 'constellation',
      folding: 'origami',
      echoing: 'echo',
      balancing: 'mobile',
      weathering: 'vortex',
      mapping: 'atlas',
      forging: 'forge',
      orbiting: 'satellites',
      racing: 'comet',
      bubbling: 'bubbles',
      spinning: 'pinwheel',
      electrifying: 'plasma',
      flocking: 'flock',
      throbbing: 'beats',
      cascading: 'cascade',
      spiraling: 'galaxy',
      juggling: 'juggle',
      eclipsing: 'eclipse',
      resonating: 'resonance',
      condensing: 'condense',
      dispersing: 'disperse',
      prisming: 'prism',
      levitating: 'levitate',
      synchronizing: 'synchronize',
      unraveling: 'unravel',
      pondering: 'lattice',
      deducing: 'deduce',
      branching: 'branch',
      focusing: 'aperture',
      reflecting: 'mirror',
      weighing: 'scales',
      recalling: 'memory',
      tracing: 'trace',
      converging: 'converge',
      questioning: 'query',
      glimmering: 'glimmer',
      radiating: 'radiance',
      harmonizing: 'harmony',
      twinkling: 'twinkle',
      flickering: 'flicker',
      shimmering: 'shimmer',
      surfacing: 'surface',
      vibrating: 'vibrate',
      illuminating: 'illuminate',
      sparkling: 'sparkle',
      loading: 'spinner',
      buffering: 'buffer',
      typing: 'ellipsis',
      processing: 'process',
      synthesizing: 'reason',
      considering: 'consider',
      uploading: 'upload',
      queuing: 'queue',
      associating: 'associate',
      evaluating: 'evaluate',
      reasoning: 'cognition',
      exploring: 'explore',
      linking: 'link',
      resolving: 'resolve',
      imagining: 'imagine',
      settling: 'settle',
      'loading-bars': 'bars',
      progressing: 'progress',
      placeholder: 'skeleton',
      monitoring: 'waveform',
      checking: 'grid',
      tracking: 'radar',
      waiting: 'hourglass',
      pulsing: 'rings',
      signaling: 'signal',
      stepping: 'steps',
      streaming: 'stream',
      equalizing: 'equalizer',
      wiring: 'circuitboard',
      marqueeing: 'marquee',
      'orbiting-dots': 'orbitdots',
      charting: 'chart',
      plotting: 'plot',
      sampling: 'scatter',
      forecasting: 'forecast',
      metering: 'meter',
      'image-decoding': 'imageDecode',
      unblurring: 'unblur',
      rendering: 'render',
      denoising: 'denoise',
      upscaling: 'upscale',
      segmenting: 'segment',
      masking: 'mask',
      inpainting: 'inpaint',
      interpolating: 'interpolate',
      heatmapping: 'heatmap',
      candlesticking: 'candles',
      graphing: 'graph',
      waterfalling: 'waterfall',
      clustering: 'clusters',
      indexing: 'index',
      benchmarking: 'benchmark',
      profiling: 'profile',
      binning: 'histogram',
      aggregating: 'aggregate',
      scrubbing: 'scrubber',
      telemetry: 'telemetryreadout',
      polling: 'poll',
      correlating: 'correlation',
      routing: 'flowmap',
      'bar-charting': 'barchart',
      comparing: 'comparison',
      accumulating: 'stacked',
      sequencing: 'timeline',
      transmitting: 'throughput',
      summarizing: 'donut',
      gauging: 'gauge',
      funneling: 'funnel',
      treemapping: 'treemap',
      areamapping: 'area',
      downloading: 'download',
      retrying: 'retry',
      scanning: 'scanner',
      compiling: 'compile',
      paginating: 'pagination',
      'bubble-charting': 'bubblechart',
      sankeying: 'sankey',
      radaring: 'radarplot',
      scheduling: 'gantt',
      calendarizing: 'calendar',
      bulletting: 'bullet',
      boxing: 'boxplot',
      dispatching: 'dispatch',
      batching: 'batch',
      checkpointing: 'checkpoint',
      prioritizing: 'priority',
      verifying: 'verify',
      pendulating: 'pendulum',
      drifting: 'drift',
      raining: 'rain',
  };
  /** Ordered semantic state names used by consumers that need to enumerate the full library. */
  const LOADER_STATES = Object.freeze(Object.keys(STATE_TO_MODE));
  const loaderStates = [
      'loading',
      'buffering',
      'typing',
      'processing',
      'loading-bars',
      'progressing',
      'placeholder',
      'waiting',
      'pulsing',
      'downloading',
      'retrying',
      'scanning',
      'compiling',
      'paginating',
  ];
  const reasoningStates = [
      'breathing',
      'listening',
      'connecting',
      'searching',
      'observing',
      'shaping',
      'weaving',
      'pondering',
      'deducing',
      'branching',
      'focusing',
      'reflecting',
      'weighing',
      'recalling',
      'tracing',
      'converging',
      'questioning',
      'considering',
      'associating',
      'evaluating',
      'reasoning',
      'exploring',
      'linking',
      'resolving',
      'imagining',
      'settling',
  ];
  const systemStates = [
      'uploading',
      'queuing',
      'signaling',
      'stepping',
      'wiring',
      'marqueeing',
      'orbiting-dots',
      'dispatching',
      'batching',
      'checkpointing',
      'prioritizing',
      'verifying',
  ];
  const dataStates = [
      'monitoring',
      'checking',
      'tracking',
      'streaming',
      'equalizing',
      'charting',
      'plotting',
      'sampling',
      'forecasting',
      'metering',
      'image-decoding',
      'unblurring',
      'rendering',
      'denoising',
      'upscaling',
      'segmenting',
      'masking',
      'inpainting',
      'interpolating',
      'heatmapping',
      'candlesticking',
      'graphing',
      'waterfalling',
      'clustering',
      'indexing',
      'benchmarking',
      'profiling',
      'binning',
      'aggregating',
      'scrubbing',
      'telemetry',
      'polling',
      'correlating',
      'routing',
      'bar-charting',
      'comparing',
      'accumulating',
      'sequencing',
      'transmitting',
      'summarizing',
      'gauging',
      'funneling',
      'treemapping',
      'bubble-charting',
      'areamapping',
      'sankeying',
      'radaring',
      'scheduling',
      'calendarizing',
      'bulletting',
      'boxing',
  ];
  const atmosphereStates = [
      'glimmering',
      'radiating',
      'harmonizing',
      'twinkling',
      'flickering',
      'shimmering',
      'surfacing',
      'vibrating',
      'illuminating',
      'sparkling',
      'raining',
  ];
  const categorizedStates = new Set([
      ...loaderStates,
      ...systemStates,
      ...dataStates,
      ...reasoningStates,
      ...atmosphereStates,
  ]);
  /** Public category metadata. Every state appears exactly once. */
  const LOADER_CATEGORIES = Object.freeze([
      Object.freeze({ id: 'loaders', label: 'Loaders', states: Object.freeze([...loaderStates]) }),
      Object.freeze({ id: 'systems', label: 'Systems', states: Object.freeze([...systemStates]) }),
      Object.freeze({ id: 'data', label: 'Data visualizations', states: Object.freeze([...dataStates]) }),
      Object.freeze({ id: 'reasoning', label: 'Reasoning', states: Object.freeze([...reasoningStates]) }),
      Object.freeze({ id: 'atmosphere', label: 'Atmosphere', states: Object.freeze([...atmosphereStates]) }),
      Object.freeze({
          id: 'motion',
          label: 'Motion studies',
          states: Object.freeze(LOADER_STATES.filter((state) => !categorizedStates.has(state))),
      }),
  ]);
  return { STATE_TO_MODE, LOADER_STATES, LOADER_CATEGORIES };
  })();
  
  const mod_options = (function () {
  const { STATE_TO_MODE } = mod_stateRegistry;
  /** Fully populated default options used whenever a caller omits a field. */
  const DEFAULT_OPTIONS = {
      state: 'working',
      size: 96,
      speed: 1,
      theme: 'auto',
      paused: false,
      forceMotion: false,
      ariaLabel: 'Loading',
      density: 1,
      particleRadius: 1,
      hue: -1,
      color: '',
  };
  /**
   * Resolves a state name to a geometry builder name.
   *
   * @param state Semantic state or direct geometry mode.
   * @returns The mode that can be used as a key in `FRAME_BUILDERS`.
   */
  function resolveMode(state) {
      return STATE_TO_MODE[state] ?? state;
  }
  /**
   * Adds defaults to a partial option object without mutating the caller's value.
   *
   * @param options Caller-provided option values.
   * @returns A complete option object with every field present.
   */
  function mergeOptions(options) {
      return { ...DEFAULT_OPTIONS, ...options };
  }
  return { DEFAULT_OPTIONS, resolveMode, mergeOptions };
  })();
  
  const mod_renderer = (function () {
  function fillRoundedRect(context, x, y, width, height, radius) {
      const corner = Math.min(radius, width / 2, height / 2);
      if (corner <= 0.1) {
          context.fillRect(x, y, width, height);
          return;
      }
      context.beginPath();
      context.moveTo(x + corner, y);
      context.lineTo(x + width - corner, y);
      context.quadraticCurveTo(x + width, y, x + width, y + corner);
      context.lineTo(x + width, y + height - corner);
      context.quadraticCurveTo(x + width, y + height, x + width - corner, y + height);
      context.lineTo(x + corner, y + height);
      context.quadraticCurveTo(x, y + height, x, y + height - corner);
      context.lineTo(x, y + corner);
      context.quadraticCurveTo(x, y, x + corner, y);
      context.fill();
  }
  /** Resolves one drawable depth to a depth-aware CSS colour string. */
  function shade(theme, z, alpha, tone, hueOverride, colorOverride) {
      if (colorOverride)
          return colorOverride;
      const depth = (z + 1) / 2;
      const brightness = 0.22 + depth * 0.68;
      const resolvedTone = hueOverride >= 0 ? hueOverride : tone;
      if (resolvedTone !== undefined) {
          const lightness = theme === 'dark' ? 42 + brightness * 32 : 30 + brightness * 16;
          return `hsl(${resolvedTone} 86% ${lightness}% / ${alpha})`;
      }
      const channel = Math.round((theme === 'dark' ? brightness : 1 - brightness) * 255);
      return `rgba(${channel}, ${channel}, ${channel}, ${alpha})`;
  }
  /**
   * Paints frame rectangles, arcs, lines and depth-sorted dots onto a Canvas 2D context.
   *
   * @param context Target Canvas 2D context.
   * @param frame Geometry produced by a frame builder.
   * @param theme Concrete theme; resolve `auto` before calling.
   * @param hueOverride Hue in `0`–`360`, or `-1` to keep each mode's native tones.
   * @param particleRadius Multiplier for particle/arc widths and rectangle corner rounding, clamped by the caller to `0.5`–`2.5`.
   * @returns Nothing. The caller is responsible for clearing the canvas first.
   */
  function paintFrame(context, frame, theme, hueOverride = -1, colorOverride, particleRadius = 1) {
      const usesColorOverride = Boolean(colorOverride);
      context.save();
      [...frame.rects]
          .sort((left, right) => left.z - right.z)
          .forEach((rect) => {
          context.globalAlpha = usesColorOverride ? rect.alpha : 1;
          context.fillStyle = shade(theme, rect.z, rect.alpha, rect.tone, hueOverride, colorOverride);
          fillRoundedRect(context, rect.x, rect.y, rect.width, rect.height, particleRadius * 1.65);
      });
      for (const arc of frame.arcs) {
          context.globalAlpha = usesColorOverride ? arc.alpha : 1;
          context.strokeStyle = shade(theme, arc.z, arc.alpha, arc.tone, hueOverride, colorOverride);
          context.lineWidth = arc.width;
          context.lineCap = arc.cap ?? 'round';
          context.beginPath();
          context.arc(arc.x, arc.y, arc.radius, arc.startAngle, arc.endAngle);
          context.stroke();
      }
      for (const line of frame.lines) {
          context.globalAlpha = usesColorOverride ? line.alpha : 1;
          context.strokeStyle = shade(theme, (line.from.z + line.to.z) / 2, line.alpha, line.tone, hueOverride, colorOverride);
          context.lineWidth = line.width;
          context.beginPath();
          context.moveTo(line.from.x, line.from.y);
          context.lineTo(line.to.x, line.to.y);
          context.stroke();
      }
      [...frame.dots]
          .sort((left, right) => left.z - right.z)
          .forEach((dot) => {
          context.globalAlpha = usesColorOverride ? dot.alpha : 1;
          context.fillStyle = shade(theme, dot.z, dot.alpha, dot.tone, hueOverride, colorOverride);
          context.beginPath();
          context.arc(dot.x, dot.y, dot.radius * particleRadius, 0, Math.PI * 2);
          context.fill();
      });
      context.restore();
  }
  return { paintFrame };
  })();
  
  const mod_theme = (function () {
  /**
   * Resolves `auto` to the browser colour-scheme preference.
   *
   * @param theme Requested theme.
   * @returns A concrete `dark` or `light` renderer theme.
   */
  function resolveTheme(theme) {
      if (theme !== 'auto')
          return theme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  /** @returns Whether the browser currently requests reduced motion. */
  function prefersReducedMotion() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return { resolveTheme, prefersReducedMotion };
  })();
  
  const mod_CanvasLoader = (function () {
  const { clamp } = mod_math;
  const { DEFAULT_OPTIONS, mergeOptions } = mod_options;
  const { paintFrame } = mod_renderer;
  const { prefersReducedMotion, resolveTheme } = mod_theme;
  /** Shared Canvas lifecycle for the full loader and tree-shakeable single-mode loaders. */
  class CanvasLoader {
      /** Creates, draws and (unless paused) starts one animation. */
      constructor(canvas, options, frameBuilder) {
          this.frameBuilder = frameBuilder;
          /** Fully resolved current options. Prefer {@link setOptions} to changing this object directly. */
          this.options = DEFAULT_OPTIONS;
          this.reducedMotion = false;
          this.animationFrame = null;
          this.elapsed = 0.6;
          this.clockAnchor = performance.now();
          this.usesLegacyMotionListener = false;
          this.syncAnimation = () => {
              if (this.canAnimate() && this.animationFrame === null)
                  this.animationFrame = requestAnimationFrame(this.render);
              if (!this.canAnimate() && this.animationFrame !== null) {
                  cancelAnimationFrame(this.animationFrame);
                  this.animationFrame = null;
              }
          };
          this.render = () => {
              this.animationFrame = null;
              this.draw();
              this.syncAnimation();
          };
          this.onDocumentVisibility = () => this.syncAnimation();
          this.onMotionPreference = (event) => {
              this.reducedMotion = event.matches;
              this.draw();
              this.syncAnimation();
          };
          const context = canvas.getContext('2d');
          if (!context)
              throw new Error('Loadersz needs a Canvas 2D context.');
          this.canvas = canvas;
          this.context = context;
          this.options = mergeOptions(options);
          this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
          this.configureCanvas();
          this.refreshColorOverride();
          this.bindLifecycle();
          this.draw();
          this.syncAnimation();
      }
      /** Applies a partial update, preserves the current timeline phase and redraws immediately. */
      setOptions(options) {
          const now = performance.now();
          this.elapsed = this.currentTime(now);
          this.clockAnchor = now;
          this.options = mergeOptions({ ...this.options, ...options });
          if (options.size !== undefined)
              this.configureCanvas();
          if (options.color !== undefined)
              this.refreshColorOverride();
          if (options.ariaLabel !== undefined)
              this.canvas.setAttribute('aria-label', this.options.ariaLabel);
          this.draw();
          this.syncAnimation();
      }
      /** Permanently releases browser listeners and cancels a pending animation frame. */
      destroy() {
          if (this.animationFrame !== null)
              cancelAnimationFrame(this.animationFrame);
          this.animationFrame = null;
          document.removeEventListener('visibilitychange', this.onDocumentVisibility);
          if (this.usesLegacyMotionListener)
              this.motionQuery.removeListener(this.onMotionPreference);
          else
              this.motionQuery.removeEventListener('change', this.onMotionPreference);
      }
      configureCanvas() {
          const size = Math.max(16, this.options.size);
          const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
          this.canvas.width = Math.round(size * devicePixelRatio);
          this.canvas.height = Math.round(size * devicePixelRatio);
          this.canvas.style.width = `${size}px`;
          this.canvas.style.height = `${size}px`;
          this.canvas.setAttribute('role', 'img');
          this.canvas.setAttribute('aria-label', this.options.ariaLabel);
          this.context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      }
      bindLifecycle() {
          this.reducedMotion = prefersReducedMotion();
          document.addEventListener('visibilitychange', this.onDocumentVisibility);
          if (typeof this.motionQuery.addEventListener === 'function') {
              this.motionQuery.addEventListener('change', this.onMotionPreference);
              return;
          }
          this.usesLegacyMotionListener = true;
          this.motionQuery.addListener(this.onMotionPreference);
      }
      draw() {
          const size = Math.max(16, this.options.size);
          this.context.clearRect(0, 0, size, size);
          const frame = this.frameBuilder({
              time: this.currentTime(performance.now()),
              radius: size * 0.41,
              density: clamp(this.options.density, 0.35, 2),
              particleRadius: clamp(this.options.particleRadius, 0.5, 2.5),
          }, this.options);
          paintFrame(this.context, frame, resolveTheme(this.options.theme), this.options.hue, this.colorOverride, clamp(this.options.particleRadius, 0.5, 2.5));
      }
      canAnimate() {
          return (!this.options.paused && (!this.reducedMotion || this.options.forceMotion) && document.visibilityState !== 'hidden');
      }
      /** Resolves CSS colours, including inherited custom properties, once per option update. */
      refreshColorOverride() {
          const color = this.options.color.trim();
          if (!color) {
              this.colorOverride = undefined;
              return;
          }
          const previous = this.canvas.style.color;
          this.canvas.style.color = '';
          this.canvas.style.color = color;
          this.colorOverride = this.canvas.style.color ? getComputedStyle(this.canvas).color : undefined;
          this.canvas.style.color = previous;
      }
      currentTime(now) {
          return this.elapsed + ((now - this.clockAnchor) / 1000) * this.options.speed;
      }
  }
  return { CanvasLoader };
  })();
  
  const mod_frame = (function () {
  /**
   * Creates an empty drawable geometry frame.
   *
   * @returns A fresh mutable frame with no dots or lines.
   */
  function createFrame() {
      return { dots: [], lines: [], rects: [], arcs: [] };
  }
  /**
   * Adds a visible particle to a frame, discarding near-transparent particles early.
   *
   * @param frame Destination geometry.
   * @param point Projected particle position and depth.
   * @param radius Particle radius in canvas pixels.
   * @param alpha Opacity; values at or below `0.015` are ignored.
   * @param tone Optional HSL hue for colourful modes.
   */
  function addDot(frame, point, radius, alpha = 1, tone) {
      if (alpha > 0.015)
          frame.dots.push({ x: point.x, y: point.y, z: point.z, radius, alpha, tone });
  }
  /**
   * Adds a visible line segment to a frame, discarding near-transparent lines early.
   *
   * @param frame Destination geometry.
   * @param from Line start.
   * @param to Line end.
   * @param alpha Opacity; values at or below `0.015` are ignored.
   * @param width Stroke width in canvas pixels.
   * @param tone Optional HSL hue.
   */
  function addLine(frame, from, to, alpha, width, tone) {
      if (alpha > 0.015)
          frame.lines.push({ from, to, alpha, width, tone });
  }
  /**
   * Adds a filled rectangular mark to a frame.
   *
   * @param frame Destination geometry.
   * @param rect Rectangle position, dimensions and depth.
   * @param alpha Opacity; values at or below `0.015` are ignored.
   * @param tone Optional HSL hue.
   */
  function addRect(frame, rect, alpha = 1, tone) {
      if (alpha > 0.015 && rect.width > 0 && rect.height > 0) {
          frame.rects.push({ ...rect, z: rect.z ?? 0, alpha, tone });
      }
  }
  /**
   * Adds a stroked circular arc to a frame.
   *
   * @param frame Destination geometry.
   * @param arc Arc centre, radius, angles, width and depth.
   * @param alpha Opacity; values at or below `0.015` are ignored.
   * @param tone Optional HSL hue.
   */
  function addArc(frame, arc, alpha = 1, tone) {
      if (alpha > 0.015 && arc.radius > 0 && arc.width > 0) {
          frame.arcs.push({ ...arc, z: arc.z ?? 0, alpha, tone });
      }
  }
  /**
   * Converts projected depth from `-1`–`1` to a normalized `0`–`1` value.
   *
   * @param point Projected point whose depth to normalize.
   * @returns Depth normalized from `z` in `[-1, 1]` to `[0, 1]`.
   */
  function depth(point) {
      return (point.z + 1) / 2;
  }
  return { createFrame, addDot, addLine, addRect, addArc, depth };
  })();
  
  const mod_projector = (function () {
  /**
   * Rotates a normalized 3D point around yaw and pitch axes, then maps it to canvas coordinates.
   *
   * @param x Unit-space horizontal coordinate.
   * @param y Unit-space vertical coordinate.
   * @param z Unit-space depth coordinate.
   * @param yaw Horizontal rotation in radians.
   * @param pitch Vertical rotation in radians.
   * @param radius Canvas scale in pixels.
   * @param center Canvas center coordinate in pixels.
   * @returns Projected point with its post-rotation depth retained in `z`.
   */
  function projectPoint(x, y, z, yaw, pitch, radius, center) {
      const cosYaw = Math.cos(yaw);
      const sinYaw = Math.sin(yaw);
      const x1 = x * cosYaw - z * sinYaw;
      const z1 = x * sinYaw + z * cosYaw;
      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);
      return {
          x: center + x1 * radius,
          y: center - (y * cosPitch - z1 * sinPitch) * radius,
          z: y * sinPitch + z1 * cosPitch,
      };
  }
  return { projectPoint };
  })();
  
  const mod_shared = (function () {
  const { addArc, addDot, addLine, addRect, createFrame, depth } = mod_frame;
  const { fibonacciPoint, hash, lerp, normalize, smoothstep, TAU } = mod_math;
  const { projectPoint } = mod_projector;
  /** Creates a context-bound 3D-to-canvas projection function. */
  function createProjector(context, yaw, pitch, scale = 1) {
      const center = context.radius / 0.82;
      return (x, y, z) => projectPoint(x, y, z, yaw, pitch, context.radius * scale, center);
  }
  /** Populates a frame with an evenly distributed, projected particle sphere. */
  function sphereDots(context, project, radius = 1, callback) {
      const frame = createFrame();
      const count = Math.round(170 * context.density);
      for (let index = 0; index < count; index += 1) {
          const [x, y, z] = fibonacciPoint(index, count);
          const point = project(x * radius, y * radius, z * radius);
          addDot(frame, point, 0.45 + depth(point) * 1.4, 0.15 + depth(point) * 0.58);
          callback?.(point, index);
      }
      return frame;
  }
  return { createProjector, sphereDots, addArc, addDot, addLine, addRect, createFrame, depth, fibonacciPoint, hash, lerp, normalize, smoothstep, TAU };
  })();
  
  const mod_foundational = (function () {
  const { addDot, addLine, createFrame, createProjector, depth, fibonacciPoint, hash, lerp, normalize, smoothstep, sphereDots, TAU } = mod_shared;
  /** Builds the `working` state: layered orbital paths and travelling particles. */
  function orbitFrame({ time, radius, density }) {
      const frame = createFrame();
      const project = createProjector({ time, radius, density }, time * 0.18, 0.43);
      const orbitCount = Math.round(7 * density);
      const samples = Math.round(28 * density);
      for (let orbit = 0; orbit < orbitCount; orbit += 1) {
          const tilt = 0.25 + hash(orbit * 2.1) * 1.1;
          const heading = hash(orbit * 1.13) * TAU;
          const ringRadius = 0.44 + hash(orbit * 4.37) * 0.48;
          const normal = [Math.sin(tilt) * Math.cos(heading), Math.cos(tilt), Math.sin(tilt) * Math.sin(heading)];
          const basis = Math.abs(normal[1]) > 0.8 ? [1, 0, 0] : [0, 1, 0];
          const u = normalize([
              normal[1] * basis[2] - normal[2] * basis[1],
              normal[2] * basis[0] - normal[0] * basis[2],
              normal[0] * basis[1] - normal[1] * basis[0],
          ]);
          const v = [
              normal[1] * u[2] - normal[2] * u[1],
              normal[2] * u[0] - normal[0] * u[2],
              normal[0] * u[1] - normal[1] * u[0],
          ];
          const pointAt = (angle) => project((u[0] * Math.cos(angle) + v[0] * Math.sin(angle)) * ringRadius, (u[1] * Math.cos(angle) + v[1] * Math.sin(angle)) * ringRadius, (u[2] * Math.cos(angle) + v[2] * Math.sin(angle)) * ringRadius);
          for (let sample = 0; sample < samples; sample += 1) {
              const point = pointAt((sample / samples) * TAU);
              addDot(frame, point, 0.55, 0.12 + depth(point) * 0.28);
          }
          const travel = time * (0.65 + hash(orbit) * 0.45) * (orbit % 2 ? 1 : -1) + orbit;
          for (let particle = 0; particle < 2; particle += 1) {
              const point = pointAt(travel + particle * Math.PI);
              addDot(frame, point, 1.1 + depth(point) * 1.4, 0.8);
          }
      }
      return frame;
  }
  /** Builds the `searching` state: a rotating spherical scan highlight. */
  function scanFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const count = Math.round(180 * density);
      const project = createProjector(context, time * 0.35, 0.35);
      const scanAngle = time * 1.5;
      for (let index = 0; index < count; index += 1) {
          const [x, y, z] = fibonacciPoint(index, count);
          const point = project(x, y, z);
          const longitude = Math.atan2(z, x);
          const distance = Math.atan2(Math.sin(longitude - scanAngle), Math.cos(longitude - scanAngle));
          const scan = Math.exp(-(distance * distance) / 0.14) * Math.max(0, point.z);
          addDot(frame, point, 0.45 + depth(point) * 1.55 + scan * 1.5, 0.17 + depth(point) * 0.58 + scan * 0.25);
      }
      return frame;
  }
  /** Builds the `connecting` state: drifting nodes and their nearest connections. */
  function networkFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const count = Math.round(22 * density);
      const project = createProjector(context, time * 0.14, 0.38);
      const nodes = [];
      for (let index = 0; index < count; index += 1) {
          const [x, y, z] = fibonacciPoint(index, count);
          nodes.push(normalize([
              x + Math.sin(time * 0.71 + index * 4.1) * 0.09,
              y + Math.sin(time * 0.59 + index * 2.3) * 0.09,
              z + Math.cos(time * 0.67 + index * 3.7) * 0.09,
          ]));
      }
      for (let left = 0; left < count; left += 1) {
          for (let right = left + 1; right < count; right += 1) {
              const distance = Math.hypot(nodes[left][0] - nodes[right][0], nodes[left][1] - nodes[right][1], nodes[left][2] - nodes[right][2]);
              if (distance > 0.79)
                  continue;
              const from = project(...nodes[left]);
              const to = project(...nodes[right]);
              addLine(frame, from, to, (1 - distance / 0.79) * (0.1 + ((depth(from) + depth(to)) / 2) * 0.34), 0.45);
          }
      }
      nodes.forEach((node, index) => {
          const point = project(...node);
          addDot(frame, point, 0.7 + depth(point) * 1.65 + Math.sin(time * 1.6 + index) * 0.12, 0.32 + depth(point) * 0.6);
      });
      return frame;
  }
  /** Builds the `weaving` state: braided strands with alternating depth. */
  function weaveFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const project = createProjector(context, time * 0.2, 0.32);
      const samples = Math.round(58 * density);
      for (let strand = 0; strand < 3; strand += 1) {
          for (let index = 0; index < samples; index += 1) {
              const latitude = lerp(-0.92, 0.92, index / (samples - 1));
              const band = Math.sqrt(1 - latitude * latitude);
              const angle = latitude * Math.PI * 2.8 + strand * (TAU / 3) + time * 0.55;
              const pulse = 1 + Math.sin(latitude * 19 + strand * 2 + time * 1.2) * 0.065;
              const point = project(Math.cos(angle) * band * pulse, latitude * pulse, Math.sin(angle) * band * pulse);
              addDot(frame, point, 0.65 + depth(point) * 1.7, 0.16 + depth(point) * 0.75);
          }
      }
      return frame;
  }
  /** Builds the `shaping` state: a continuously interpolating dotted silhouette. */
  function morphFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const phase = (time * 0.22) % 3;
      const from = Math.floor(phase);
      const to = (from + 1) % 3;
      const amount = smoothstep(phase - from);
      const count = Math.round(52 * density);
      const shape = (kind, angle) => {
          if (kind === 0)
              return [Math.cos(angle), Math.sin(angle)];
          if (kind === 1) {
              const corner = Math.cos(((angle + Math.PI / 2) % (TAU / 3)) - Math.PI / 3);
              const scale = Math.cos(Math.PI / 3) / Math.max(0.22, corner);
              return [Math.cos(angle) * scale, Math.sin(angle) * scale];
          }
          const scale = Math.max(Math.abs(Math.cos(angle)), Math.abs(Math.sin(angle)));
          return [Math.cos(angle) / scale, Math.sin(angle) / scale];
      };
      for (let index = 0; index < count; index += 1) {
          const angle = (index / count) * TAU - Math.PI / 2;
          const a = shape(from, angle);
          const b = shape(to, angle);
          const breathing = 0.86 + Math.sin(time * 1.3) * 0.035;
          addDot(frame, {
              x: center + lerp(a[0], b[0], amount) * radius * breathing,
              y: center + lerp(a[1], b[1], amount) * radius * breathing,
              z: 0,
          }, 1.15, 0.86);
      }
      return frame;
  }
  /** Builds the `listening` state: a spherical waveform displaced by time. */
  function waveFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const count = Math.round(190 * density);
      const project = createProjector(context, time * 0.15, 0.38);
      for (let index = 0; index < count; index += 1) {
          const [x, y, z] = fibonacciPoint(index, count);
          const ripple = 1 + Math.sin(Math.atan2(z, x) * 4 - time * 2.7 + y * 5) * 0.1;
          const point = project(x * ripple, y * ripple, z * ripple);
          const crest = Math.max(0, ripple - 1) * 10;
          addDot(frame, point, 0.45 + depth(point) * 1.55 + crest * 0.45, 0.14 + depth(point) * 0.64 + crest * 0.08);
      }
      return frame;
  }
  /** Builds the `breathing` state: soft radial rings that expand and fade. */
  function pulseFrame(context) {
      const pulse = 0.89 + (Math.sin(context.time * 2.1) + 1) * 0.045;
      const frame = sphereDots(context, createProjector(context, context.time * 0.09, 0.2), pulse);
      const center = context.radius / 0.82;
      for (let ring = 0; ring < 3; ring += 1) {
          const progress = (context.time * 0.34 + ring / 3) % 1;
          const ringRadius = context.radius * (0.15 + progress * 0.8);
          const alpha = (1 - progress) * 0.24;
          for (let index = 0; index < 36; index += 1) {
              const angle = (index / 36) * TAU;
              addDot(frame, { x: center + Math.cos(angle) * ringRadius, y: center + Math.sin(angle) * ringRadius, z: -0.15 }, 0.5, alpha);
          }
      }
      return frame;
  }
  /** Builds the `composing` state: a flowing, depth-aware ribbon. */
  function ribbonFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const project = createProjector(context, time * 0.1, 0.48);
      const lanes = Math.round(5 * density);
      const samples = Math.round(64 * density);
      for (let lane = 0; lane < lanes; lane += 1) {
          const offset = (lane - (lanes - 1) / 2) * 0.11;
          for (let index = 0; index < samples; index += 1) {
              const angle = (index / samples) * TAU;
              const wobble = Math.sin(angle * 3 - time * 1.8 + lane * 0.2) * 0.12 + Math.sin(angle * 5 + time) * 0.05;
              const point = project(Math.cos(angle), Math.sin(angle) * offset + wobble, Math.sin(angle));
              addDot(frame, point, 0.65 + depth(point) * 1.45, 0.22 + depth(point) * 0.68);
          }
      }
      return frame;
  }
  /** Builds the direct `crystal` geometry: rotating faceted vertices. */
  function crystalFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const count = Math.round(150 * density);
      const project = createProjector(context, time * 0.42, 0.5 + Math.sin(time * 0.7) * 0.1);
      for (let index = 0; index < count; index += 1) {
          const [x, y, z] = fibonacciPoint(index, count);
          const facet = 0.72 + hash(index * 6.7) * 0.28;
          const point = project(x * facet, y * facet, z * facet);
          const snap = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
          addDot(frame, point, 0.5 + depth(point) * 1.75, 0.12 + depth(point) * (0.45 + snap * 0.28));
      }
      return frame;
  }
  /** Builds the `observing` state: a quiet core surrounded by a travelling halo. */
  function haloFrame(context) {
      const frame = sphereDots(context, createProjector(context, context.time * 0.07, 0.28), 0.72);
      const center = context.radius / 0.82;
      const orbitRadius = context.radius * 1.12;
      for (let index = 0; index < 92 * context.density; index += 1) {
          const angle = (index / (92 * context.density)) * TAU + context.time * 0.8;
          const vertical = Math.sin(angle * 2 + context.time) * context.radius * 0.14;
          addDot(frame, {
              x: center + Math.cos(angle) * orbitRadius,
              y: center + Math.sin(angle) * context.radius * 0.42 + vertical,
              z: Math.sin(angle),
          }, 0.5 + (Math.sin(angle) + 1) * 0.45, 0.18 + (Math.sin(angle) + 1) * 0.16);
      }
      return frame;
  }
  /** Rotates a 3D point around axis `0` (x), `1` (y), or `2` (z) by radians. */
  function rotateAroundAxis([x, y, z], axis, angle) {
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      if (axis === 0)
          return [x, y * cosine - z * sine, y * sine + z * cosine];
      if (axis === 1)
          return [x * cosine + z * sine, y, -x * sine + z * cosine];
      return [x * cosine - y * sine, x * sine + y * cosine, z];
  }
  /** Builds the `solving` state: a ten-move cube sequence across outer, middle and wide layers. */
  function cubeFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const project = createProjector(context, 0.52 + Math.sin(time * 0.17) * 0.16, 0.42 + Math.cos(time * 0.13) * 0.1);
      const divisions = Math.max(4, Math.round(6 * density));
      const moves = [
          { axis: 0, slice: 'positive', angle: Math.PI / 2 },
          { axis: 1, slice: 'negative', angle: -Math.PI },
          { axis: 2, slice: 'middle', angle: Math.PI / 2 },
          { axis: 1, slice: 'positive-wide', angle: Math.PI / 2 },
          { axis: 0, slice: 'negative', angle: -Math.PI / 2 },
          { axis: 2, slice: 'negative-wide', angle: Math.PI },
          { axis: 1, slice: 'middle', angle: -Math.PI / 2 },
          { axis: 2, slice: 'positive', angle: Math.PI / 2 },
          { axis: 0, slice: 'positive-wide', angle: -Math.PI / 2 },
          { axis: 1, slice: 'negative', angle: Math.PI / 2 },
      ];
      const moveDuration = 1.05;
      const activeMove = moves[Math.floor(time / moveDuration) % moves.length];
      const moveProgress = (time % moveDuration) / moveDuration;
      const turn = smoothstep(Math.min(1, moveProgress / 0.72)) * activeMove.angle;
      const faces = [
          { axis: 0, sign: -1 },
          { axis: 0, sign: 1 },
          { axis: 1, sign: -1 },
          { axis: 1, sign: 1 },
          { axis: 2, sign: -1 },
          { axis: 2, sign: 1 },
      ];
      for (const face of faces) {
          for (let row = 0; row < divisions; row += 1) {
              for (let column = 0; column < divisions; column += 1) {
                  const a = -0.82 + ((row + 0.5) / divisions) * 1.64;
                  const b = -0.82 + ((column + 0.5) / divisions) * 1.64;
                  const point3 = face.axis === 0 ? [face.sign, a, b] : face.axis === 1 ? [a, face.sign, b] : [a, b, face.sign];
                  const sliceValue = point3[activeMove.axis];
                  const belongsToSlice = activeMove.slice === 'positive'
                      ? sliceValue > 0.48
                      : activeMove.slice === 'negative'
                          ? sliceValue < -0.48
                          : activeMove.slice === 'middle'
                              ? Math.abs(sliceValue) < 0.28
                              : activeMove.slice === 'positive-wide'
                                  ? sliceValue > -0.28
                                  : sliceValue < 0.28;
                  const [x, y, z] = belongsToSlice ? rotateAroundAxis(point3, activeMove.axis, turn) : point3;
                  const point = project(x * 0.72, y * 0.72, z * 0.72);
                  const active = belongsToSlice && moveProgress < 0.8;
                  addDot(frame, point, 0.75 + depth(point) * 1.1 + (active ? 0.4 : 0), 0.24 + depth(point) * 0.68, active ? 36 + activeMove.axis * 76 : undefined);
              }
          }
      }
      return frame;
  }
  /** Builds the `dreaming` state: particles moving along a depth tunnel. */
  function tunnelFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const tracks = Math.round(13 * density);
      const particles = Math.round(16 * density);
      for (let track = 0; track < tracks; track += 1) {
          const heading = (track / tracks) * TAU + Math.sin(time * 0.18) * 0.2;
          for (let index = 0; index < particles; index += 1) {
              const progress = (time * 0.3 + index / particles + track * 0.037) % 1;
              const z = progress * 2 - 1;
              const perspective = 0.12 + progress * progress * 1.08;
              const twist = heading + z * 0.72;
              const point = {
                  x: center + Math.cos(twist) * radius * perspective,
                  y: center + Math.sin(twist) * radius * perspective,
                  z,
              };
              addDot(frame, point, 0.35 + progress * progress * 2.4, 0.08 + progress * 0.78);
          }
      }
      return frame;
  }
  /** Builds the `charging` state: a swarm that gathers and releases energy. */
  function swarmFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const count = Math.round(110 * density);
      const project = createProjector(context, 0.1, 0.22);
      for (let index = 0; index < count; index += 1) {
          const direction = fibonacciPoint(index, count);
          const beat = (Math.sin(time * 2.3 + index * 1.7) + 1) / 2;
          const surge = Math.pow(beat, 2.4);
          const spiral = time * 0.55 + index * 0.37;
          const point = project(direction[0] * (0.18 + surge * 0.86) + Math.cos(spiral) * 0.08 * (1 - surge), direction[1] * (0.18 + surge * 0.86) + Math.sin(spiral * 1.3) * 0.08 * (1 - surge), direction[2] * (0.18 + surge * 0.86));
          addDot(frame, point, 0.45 + depth(point) * 1.35 + surge * 0.75, 0.12 + depth(point) * 0.65);
      }
      return frame;
  }
  /** Builds the `flowing` state: a continuous 3D knot with a travelling signal. */
  function knotFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const project = createProjector(context, 0.35 + Math.sin(time * 0.16) * 0.08, 0.38);
      const count = Math.round(210 * density);
      for (let index = 0; index < count; index += 1) {
          const angle = (index / count) * TAU;
          const pulse = 1 + Math.sin(angle * 5 - time * 2.4) * 0.07;
          const x = ((2 + Math.cos(angle * 3)) * Math.cos(angle * 2)) / 3;
          const y = ((2 + Math.cos(angle * 3)) * Math.sin(angle * 2)) / 3;
          const z = Math.sin(angle * 3) / 1.8;
          const point = project(x * pulse, y * pulse, z * pulse);
          const traveller = Math.exp(-Math.pow(Math.atan2(Math.sin(angle - time * 1.2), Math.cos(angle - time * 1.2)), 2) / 0.12);
          addDot(frame, point, 0.48 + depth(point) * 1.45 + traveller * 1.2, 0.14 + depth(point) * 0.68 + traveller * 0.18);
      }
      return frame;
  }
  /** Builds the `singing` state: coloured aurora curtains across a sphere. */
  function auroraFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const project = createProjector(context, 0.18, 0.34);
      const curtains = Math.round(7 * density);
      const samples = Math.round(52 * density);
      for (let curtain = 0; curtain < curtains; curtain += 1) {
          const longitude = (curtain / curtains) * TAU;
          for (let index = 0; index < samples; index += 1) {
              const latitude = lerp(-0.86, 0.86, index / (samples - 1));
              const wave = Math.sin(latitude * 8 - time * 1.4 + curtain * 0.7) * 0.16;
              const radius = Math.sqrt(1 - latitude * latitude) * (0.78 + wave);
              const point = project(Math.cos(longitude + wave) * radius, latitude, Math.sin(longitude + wave) * radius);
              const tone = 160 + curtain * 12 + Math.sin(time + latitude * 5) * 20;
              addDot(frame, point, 0.5 + depth(point) * 1.3, 0.16 + depth(point) * 0.6, tone);
          }
      }
      return frame;
  }
  /** Builds the `awakening` state: a pulsing radial nova. */
  function novaFrame(context) {
      const { time, radius, density } = context;
      const frame = createFrame();
      const center = radius / 0.82;
      const rays = Math.round(22 * density);
      const particles = Math.round(11 * density);
      const cycle = (time * 0.28) % 1;
      const expansion = cycle < 0.72 ? smoothstep(cycle / 0.72) : 1 - smoothstep((cycle - 0.72) / 0.28);
      for (let ray = 0; ray < rays; ray += 1) {
          const heading = (ray / rays) * TAU + hash(ray) * 0.09;
          for (let index = 0; index < particles; index += 1) {
              const local = (index + hash(ray * 5)) / particles;
              const reach = (0.08 + local * 0.92) * expansion;
              const shimmer = Math.sin(time * 5 + ray * 2.4 + index) * 0.06;
              const point = {
                  x: center + Math.cos(heading) * radius * (reach + shimmer),
                  y: center + Math.sin(heading) * radius * (reach + shimmer),
                  z: reach * 2 - 1,
              };
              addDot(frame, point, 0.45 + reach * 1.8, 0.06 + (1 - local) * 0.7 * expansion, 24 + local * 34);
          }
      }
      return frame;
  }
  /** Builds the `coding` state: a circuit lattice with alternating live paths. */
  function circuitFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const project = createProjector(context, 0.6, 0.46);
      const divisions = Math.max(3, Math.round(5 * density));
      const nodes = [];
      for (let row = -divisions; row <= divisions; row += 1) {
          for (let column = -divisions; column <= divisions; column += 1) {
              const x = row / divisions;
              const y = column / divisions;
              const z = Math.sin(row * 1.7 + column * 0.8) * 0.12;
              nodes.push(project(x * 0.72, y * 0.72, z));
          }
      }
      const width = divisions * 2 + 1;
      for (let index = 0; index < nodes.length; index += 1) {
          const column = index % width;
          if (column < width - 1)
              addLine(frame, nodes[index], nodes[index + 1], 0.2 + depth(nodes[index]) * 0.25, 0.45, 192);
          if (index + width < nodes.length)
              addLine(frame, nodes[index], nodes[index + width], 0.2 + depth(nodes[index]) * 0.25, 0.45, 192);
          const pulse = (Math.sin(time * 3.4 + index * 1.9) + 1) / 2;
          addDot(frame, nodes[index], 0.55 + pulse * 1.2, 0.2 + pulse * 0.58, 185 + pulse * 55);
      }
      return frame;
  }
  /** Builds the `transcending` state: layered portal rings in depth. */
  function portalFrame(context) {
      const { time, radius, density } = context;
      const frame = createFrame();
      const center = radius / 0.82;
      const rings = Math.round(7 * density);
      const samples = Math.round(64 * density);
      for (let ring = 0; ring < rings; ring += 1) {
          const phase = (ring / rings + time * 0.16) % 1;
          const baseRadius = radius * (0.12 + phase * 0.96);
          for (let index = 0; index < samples; index += 1) {
              const angle = (index / samples) * TAU + time * (0.4 + ring * 0.03);
              const distortion = 1 + Math.sin(angle * 3 - time * 2 + ring) * 0.12;
              const point = {
                  x: center + Math.cos(angle) * baseRadius * distortion,
                  y: center + Math.sin(angle) * baseRadius * (0.68 + Math.sin(time * 0.7) * 0.08) * distortion,
                  z: phase * 2 - 1,
              };
              addDot(frame, point, 0.4 + phase * 1.45, (1 - phase) * 0.46, 272 + ring * 7);
          }
      }
      return frame;
  }
  /** Builds the `growing` state: two linked helix strands. */
  function helixFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const project = createProjector(context, 0.18, 0.22);
      const steps = Math.round(72 * density);
      for (let index = 0; index < steps; index += 1) {
          const progress = index / (steps - 1);
          const height = lerp(-0.92, 0.92, progress);
          const angle = height * Math.PI * 5.2 + time * 1.15;
          const radius = Math.sqrt(1 - height * height) * 0.62;
          const left = project(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
          const right = project(Math.cos(angle + Math.PI) * radius, height, Math.sin(angle + Math.PI) * radius);
          const tone = 178 + Math.sin(height * 8 + time) * 42;
          addLine(frame, left, right, 0.13 + progress * 0.18, 0.42, tone + 32);
          addDot(frame, left, 0.62 + depth(left) * 1.1, 0.22 + depth(left) * 0.68, tone);
          addDot(frame, right, 0.62 + depth(right) * 1.1, 0.22 + depth(right) * 0.68, tone + 75);
      }
      return frame;
  }
  /** Builds the `blooming` state: a breathing, colour-shifting petal field. */
  function flowerFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const count = Math.round(220 * density);
      const petals = 5 + Math.floor((Math.sin(time * 0.22) + 1) * 1.5);
      for (let index = 0; index < count; index += 1) {
          const angle = (index / count) * TAU;
          const bloom = 0.38 + Math.abs(Math.sin(angle * petals + time * 0.9)) * 0.66;
          const breathing = 0.9 + Math.sin(time * 1.4) * 0.08;
          const point = {
              x: center + Math.cos(angle) * radius * bloom * breathing,
              y: center + Math.sin(angle) * radius * bloom * breathing,
              z: Math.sin(angle * petals + time) * 0.65,
          };
          addDot(frame, point, 0.46 + ((point.z + 1) / 2) * 1.4, 0.18 + bloom * 0.65, 310 + Math.sin(angle * 2 + time) * 36);
      }
      return frame;
  }
  /** Builds the `wandering` state: independently wandering, blinking particles. */
  function firefliesFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const count = Math.round(66 * density);
      const project = createProjector(context, 0, 0.1);
      for (let index = 0; index < count; index += 1) {
          const seed = hash(index * 9.3);
          const path = time * (0.32 + seed * 0.24) + index * 1.7;
          const raw = [
              Math.sin(path * 1.7 + seed * 12) * 0.72 + Math.sin(path * 0.43) * 0.16,
              Math.cos(path * 1.21 + index) * 0.66,
              Math.sin(path * 0.91 + index * 2.4) * 0.65,
          ];
          const point = project(...normalize(raw));
          const blink = Math.pow((Math.sin(time * 3.8 + index * 2.13) + 1) / 2, 4);
          addDot(frame, point, 0.38 + depth(point) * 1.3 + blink * 2.1, 0.08 + depth(point) * 0.28 + blink * 0.68, 48 + blink * 30);
      }
      return frame;
  }
  /** Builds the `decoding` state: spherical columns of falling data-like particles. */
  function matrixFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const columns = Math.round(16 * density);
      const glyphs = Math.round(20 * density);
      for (let column = 0; column < columns; column += 1) {
          const x = lerp(-0.88, 0.88, column / Math.max(1, columns - 1));
          const wave = Math.sqrt(Math.max(0, 1 - x * x));
          const head = (time * (0.28 + hash(column) * 0.38) + hash(column * 3)) % 1;
          for (let glyph = 0; glyph < glyphs; glyph += 1) {
              const progress = (head - glyph / glyphs + 1) % 1;
              const y = lerp(-wave, wave, progress);
              const z = Math.sqrt(Math.max(0, 1 - x * x - y * y)) * (column % 2 ? 1 : -1);
              const point = { x: center + x * radius, y: center - y * radius, z };
              const trail = 1 - glyph / glyphs;
              addDot(frame, point, 0.4 + trail * 1.35, 0.04 + trail * 0.58, 114 + trail * 35);
          }
      }
      return frame;
  }
  /** Builds the `calibrating` state: three independently rotating gyroscopic rings. */
  function gyroscopeFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const rings = 3;
      const samples = Math.round(48 * density);
      for (let ring = 0; ring < rings; ring += 1) {
          const tilt = time * (ring % 2 ? -0.72 : 0.62) + (ring * TAU) / rings;
          const project = createProjector(context, tilt, 0.2 + ring * 0.45);
          for (let sample = 0; sample < samples; sample += 1) {
              const angle = (sample / samples) * TAU;
              const point = project(Math.cos(angle), Math.sin(angle) * Math.cos(tilt), Math.sin(angle) * Math.sin(tilt));
              addDot(frame, point, 0.44 + depth(point) * 1.1, 0.16 + depth(point) * 0.48, 190 + ring * 42);
          }
      }
      const center = context.radius / 0.82;
      addDot(frame, { x: center, y: center, z: 1 }, 3.4, 0.92, 43);
      return frame;
  }
  /** Builds the `attracting` state: field curves drawn between coloured magnetic poles. */
  function magnetFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const curves = Math.round(18 * density);
      const samples = Math.round(22 * density);
      const pulse = 0.82 + Math.sin(time * 2.4) * 0.09;
      for (let curve = 0; curve < curves; curve += 1) {
          const offset = lerp(-0.9, 0.9, curve / Math.max(1, curves - 1));
          let previous;
          for (let sample = 0; sample < samples; sample += 1) {
              const progress = sample / Math.max(1, samples - 1);
              const x = lerp(-0.76, 0.76, progress);
              const bend = Math.sin(progress * Math.PI) * (0.16 + Math.abs(offset) * 0.78) * (offset < 0 ? -1 : 1);
              const y = offset * 0.7 + bend * pulse;
              const z = Math.cos(progress * Math.PI) * (0.14 + Math.abs(offset) * 0.6);
              const point = { x: center + x * radius, y: center + y * radius, z };
              if (previous)
                  addLine(frame, previous, point, 0.08 + (1 - Math.abs(offset)) * 0.26, 0.45, 205);
              if (sample % 2 === 0)
                  addDot(frame, point, 0.38 + depth(point), 0.22 + depth(point) * 0.4, 205);
              previous = point;
          }
      }
      addDot(frame, { x: center - radius * 0.5, y: center, z: 1 }, 3.1, 0.92, 348);
      addDot(frame, { x: center + radius * 0.5, y: center, z: 1 }, 3.1, 0.92, 198);
      return frame;
  }
  /** Builds the `shattering` state: triangular shards that separate and reform. */
  function shardsFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const project = createProjector(context, time * 0.18, 0.42);
      const shardCount = Math.round(13 * density);
      for (let shard = 0; shard < shardCount; shard += 1) {
          const angle = (shard / shardCount) * TAU + time * (0.12 + hash(shard) * 0.08);
          const explode = 0.22 + ((Math.sin(time * 0.82 + shard * 2.7) + 1) / 2) * 0.7;
          const base = [
              Math.cos(angle) * explode,
              Math.sin(angle * 1.7) * explode * 0.72,
              Math.sin(angle) * explode,
          ];
          const points = [
              project(...base),
              project(base[0] + Math.cos(angle + 1.9) * 0.2, base[1] + 0.16, base[2] + Math.sin(angle + 1.9) * 0.2),
              project(base[0] + Math.cos(angle - 1.9) * 0.19, base[1] - 0.16, base[2] + Math.sin(angle - 1.9) * 0.19),
          ];
          addLine(frame, points[0], points[1], 0.35, 0.75, 272);
          addLine(frame, points[1], points[2], 0.3, 0.75, 294);
          addLine(frame, points[2], points[0], 0.35, 0.75, 272);
          for (const point of points)
              addDot(frame, point, 0.7 + depth(point), 0.38 + depth(point) * 0.42, 274 + shard * 5);
      }
      return frame;
  }
  /** Builds the `constellating` state: twinkling stars joined to their nearest neighbours. */
  function constellationFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const project = createProjector(context, time * 0.08, 0.35);
      const count = Math.round(28 * density);
      const points = [];
      for (let index = 0; index < count; index += 1) {
          const [x, y, z] = fibonacciPoint(index, count);
          const drift = time * (0.25 + hash(index) * 0.18) + index;
          const point = project(x + Math.sin(drift) * 0.07, y + Math.cos(drift * 1.3) * 0.07, z);
          points.push(point);
          const twinkle = (Math.sin(time * 3.2 + index * 2.17) + 1) / 2;
          addDot(frame, point, 0.7 + depth(point) * 1.35 + twinkle * 1.5, 0.26 + depth(point) * 0.5 + twinkle * 0.24, 46 + index * 3);
      }
      for (let index = 0; index < points.length; index += 1) {
          let nearest = -1;
          let distance = Number.POSITIVE_INFINITY;
          for (let candidate = index + 1; candidate < points.length; candidate += 1) {
              const dx = points[index].x - points[candidate].x;
              const dy = points[index].y - points[candidate].y;
              const nextDistance = dx * dx + dy * dy;
              if (nextDistance < distance) {
                  distance = nextDistance;
                  nearest = candidate;
              }
          }
          if (nearest >= 0 && distance < context.radius * context.radius * 0.32)
              addLine(frame, points[index], points[nearest], 0.13, 0.55, 206);
      }
      return frame;
  }
  /** Builds the `folding` state: a moving mesh whose depth follows paper-like folds. */
  function origamiFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const project = createProjector(context, time * 0.13, 0.46);
      const columns = Math.round(8 * density);
      const rows = Math.round(8 * density);
      const points = [];
      for (let row = 0; row <= rows; row += 1) {
          const line = [];
          for (let column = 0; column <= columns; column += 1) {
              const x = lerp(-0.9, 0.9, column / columns);
              const y = lerp(-0.9, 0.9, row / rows);
              const fold = Math.sin((x * 2.6 + y * 1.9) * Math.PI + time * 1.35) * 0.38;
              const point = project(x, y * 0.88, fold);
              line.push(point);
              addDot(frame, point, 0.28 + depth(point) * 0.78, 0.1 + depth(point) * 0.35, 318);
              if (column > 0)
                  addLine(frame, line[column - 1], point, 0.22, 0.45, 318);
              if (row > 0)
                  addLine(frame, points[row - 1][column], point, 0.22, 0.45, 280);
          }
          points.push(line);
      }
      return frame;
  }
  /** Builds the `echoing` state: expanding concentric rings emitted from a core. */
  function echoFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const rings = 5;
      const samples = Math.round(42 * density);
      for (let ring = 0; ring < rings; ring += 1) {
          const progress = (time * 0.32 + ring / rings) % 1;
          const ringRadius = (0.12 + progress * 0.94) * radius;
          const alpha = (1 - progress) * 0.62;
          for (let sample = 0; sample < samples; sample += 1) {
              const angle = (sample / samples) * TAU;
              const point = {
                  x: center + Math.cos(angle) * ringRadius,
                  y: center + Math.sin(angle) * ringRadius,
                  z: 1 - progress * 1.4,
              };
              addDot(frame, point, 0.35 + (1 - progress) * 1.1, alpha, 187 + ring * 20);
          }
      }
      return frame;
  }
  /** Builds the `balancing` state: a pendulum-like kinetic mobile. */
  function mobileFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const root = { x: center, y: center - radius * 0.72, z: 0 };
      const arms = Math.round(5 * density);
      for (let arm = 0; arm < arms; arm += 1) {
          const swing = Math.sin(time * (0.75 + arm * 0.12) + arm * 1.8) * 0.52;
          const joint = {
              x: center + Math.sin(swing) * radius * 0.5,
              y: center - radius * 0.32 + arm * radius * 0.12,
              z: Math.cos(swing),
          };
          const bob = {
              x: joint.x + Math.sin(time * 1.2 + arm * 2.2) * radius * 0.22,
              y: joint.y + radius * 0.34,
              z: joint.z + 0.2,
          };
          addLine(frame, root, joint, 0.35, 0.7, 208);
          addLine(frame, joint, bob, 0.56, 0.75, 208 + arm * 20);
          addDot(frame, joint, 1.1, 0.72, 208);
          addDot(frame, bob, 2 + (arm % 2), 0.84, 40 + arm * 45);
      }
      addDot(frame, root, 2.2, 0.9, 210);
      return frame;
  }
  /** Builds the `weathering` state: multi-arm spirals moving through a wind vortex. */
  function vortexFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const project = createProjector(context, time * 0.1, 0.35);
      const arms = 5;
      const samples = Math.round(40 * density);
      for (let arm = 0; arm < arms; arm += 1) {
          let previous;
          for (let sample = 0; sample < samples; sample += 1) {
              const progress = sample / Math.max(1, samples - 1);
              const angle = arm * (TAU / arms) + time * 1.1 + progress * TAU * 1.5;
              const distance = 0.08 + progress * 0.92;
              const point = project(Math.cos(angle) * distance, (progress - 0.5) * 0.48, Math.sin(angle) * distance);
              addDot(frame, point, 0.34 + depth(point) * 1.15, 0.12 + progress * 0.52, 194 + progress * 85);
              if (previous)
                  addLine(frame, previous, point, 0.14 + progress * 0.16, 0.45, 205);
              previous = point;
          }
      }
      return frame;
  }
  /** Builds the `mapping` state: rotating latitude lines and a bright travelling route. */
  function atlasFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const project = createProjector(context, time * 0.18, 0.42);
      const parallels = Math.round(6 * density);
      const samples = Math.round(38 * density);
      for (let line = 0; line < parallels; line += 1) {
          const latitude = lerp(-1.12, 1.12, line / Math.max(1, parallels - 1));
          let previous;
          for (let sample = 0; sample < samples; sample += 1) {
              const longitude = (sample / samples) * TAU;
              const point = project(Math.cos(latitude) * Math.cos(longitude), Math.sin(latitude), Math.cos(latitude) * Math.sin(longitude));
              if (previous)
                  addLine(frame, previous, point, 0.18, 0.42, 205);
              if (sample % 3 === 0)
                  addDot(frame, point, 0.35 + depth(point), 0.12 + depth(point) * 0.35, 205);
              previous = point;
          }
      }
      const route = project(Math.cos(time * 1.1) * 0.72, Math.sin(time * 0.7) * 0.5, Math.sin(time * 1.1) * 0.72);
      addDot(frame, route, 3.2, 0.96, 36);
      return frame;
  }
  /** Builds the `forging` state: heated rings with cooling sparks. */
  function forgeFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const project = createProjector(context, time * 0.16, 0.45);
      const rings = 4;
      const samples = Math.round(34 * density);
      for (let ring = 0; ring < rings; ring += 1) {
          for (let sample = 0; sample < samples; sample += 1) {
              const angle = (sample / samples) * TAU + time * (0.7 + ring * 0.16);
              const wobble = 0.66 + Math.sin(angle * 3 + time * 2.2 + ring) * 0.12;
              const point = project(Math.cos(angle) * wobble, Math.sin(angle) * wobble, Math.sin(angle * 2 + ring) * 0.22);
              const heat = (Math.sin(time * 4 + sample * 1.7 + ring) + 1) / 2;
              addDot(frame, point, 0.45 + depth(point) * 1.2 + heat * 1.1, 0.16 + depth(point) * 0.38 + heat * 0.3, 12 + heat * 42);
          }
      }
      const sparks = Math.round(22 * density);
      for (let spark = 0; spark < sparks; spark += 1) {
          const phase = (time * (0.38 + hash(spark) * 0.38) + hash(spark * 5.2)) % 1;
          const angle = hash(spark * 3.3) * TAU;
          const point = project(Math.cos(angle) * phase * 1.25, -phase * 1.1, Math.sin(angle) * phase * 1.25);
          addDot(frame, point, 0.45 + (1 - phase) * 1.5, (1 - phase) * 0.7, 42);
      }
      return frame;
  }
  return { orbitFrame, scanFrame, networkFrame, weaveFrame, morphFrame, waveFrame, pulseFrame, ribbonFrame, crystalFrame, haloFrame, cubeFrame, tunnelFrame, swarmFrame, knotFrame, auroraFrame, novaFrame, circuitFrame, portalFrame, helixFrame, flowerFrame, firefliesFrame, matrixFrame, gyroscopeFrame, magnetFrame, shardsFrame, constellationFrame, origamiFrame, echoFrame, mobileFrame, vortexFrame, atlasFrame, forgeFrame };
  })();
  
  const mod_kinetic = (function () {
  const { addDot, addLine, createFrame, depth, fibonacciPoint, hash, lerp, normalize, smoothstep, TAU, createProjector, sphereDots } = mod_shared;
  /** Builds the `orbiting` state: fast satellites with visibly fading orbital trails. */
  function satellitesFrame(context) {
      const { time, density } = context;
      const frame = sphereDots(context, createProjector(context, time * 0.09, 0.35), 0.63);
      const project = createProjector(context, time * 0.12, 0.35);
      const satellites = Math.round(7 * density);
      const trailLength = 15;
      for (let satellite = 0; satellite < satellites; satellite += 1) {
          const speed = 1.25 + hash(satellite) * 1.15;
          const tilt = 0.2 + hash(satellite * 4.1) * 1.1;
          for (let trail = trailLength; trail >= 0; trail -= 1) {
              const age = trail / trailLength;
              const angle = time * speed - age * 0.62 + satellite * 1.9;
              const orbitRadius = 0.76 + hash(satellite * 8.2) * 0.35;
              const point = project(Math.cos(angle) * orbitRadius, Math.sin(angle) * Math.cos(tilt) * orbitRadius, Math.sin(angle) * Math.sin(tilt) * orbitRadius);
              addDot(frame, point, 0.42 + (1 - age) * 1.85 + depth(point), (1 - age) * 0.62, 190 + satellite * 18);
          }
      }
      return frame;
  }
  /** Builds the `racing` state: three bright comet heads that circle with long, readable tails. */
  function cometFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const project = createProjector(context, time * 0.16, 0.38);
      const cometCount = 3;
      const tailLength = Math.round(34 * density);
      for (let comet = 0; comet < cometCount; comet += 1) {
          const speed = 1.75 + comet * 0.27;
          for (let tail = tailLength; tail >= 0; tail -= 1) {
              const age = tail / tailLength;
              const phase = time * speed - age * 1.5 + comet * (TAU / cometCount);
              const point = project(Math.cos(phase) * (0.7 + Math.sin(phase * 2.1) * 0.16), Math.sin(phase * 1.8) * 0.58, Math.sin(phase) * (0.7 + Math.sin(phase * 2.1) * 0.16));
              addDot(frame, point, 0.38 + (1 - age) * 2.7 + depth(point), Math.pow(1 - age, 1.8) * 0.78, 24 + comet * 92);
          }
      }
      return frame;
  }
  /** Builds the `bubbling` state: rising spherical bubbles with independently cycling paths. */
  function bubblesFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const bubbles = Math.round(58 * density);
      for (let bubble = 0; bubble < bubbles; bubble += 1) {
          const seed = hash(bubble * 5.73);
          const cycle = (time * (0.23 + seed * 0.32) + seed) % 1;
          const x = Math.sin(seed * 18 + cycle * 4.8) * (0.18 + seed * 0.66);
          const y = 1.15 - cycle * 2.3;
          const z = Math.cos(seed * 22 + cycle * 3.6) * (0.22 + seed * 0.68);
          const shimmer = (Math.sin(time * 2.7 + bubble * 1.9) + 1) / 2;
          const point = { x: center + x * radius, y: center + y * radius, z };
          addDot(frame, point, 0.45 + seed * 1.5 + shimmer * 0.9, 0.14 + (1 - cycle) * 0.6, 184 + seed * 38);
      }
      return frame;
  }
  /** Builds the `spinning` state: dense particle blades rotating around a playful central hub. */
  function pinwheelFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const blades = 6;
      const samples = Math.round(29 * density);
      for (let blade = 0; blade < blades; blade += 1) {
          for (let sample = 0; sample < samples; sample += 1) {
              const progress = sample / samples;
              const angle = time * 2.2 + blade * (TAU / blades) + progress * 0.72;
              const distance = 0.1 + progress * 0.94;
              const wobble = Math.sin(time * 3.4 + blade + progress * 7) * 0.08;
              const point = {
                  x: center + Math.cos(angle) * (distance + wobble) * radius,
                  y: center + Math.sin(angle) * (distance - wobble) * radius,
                  z: 1 - progress * 1.25,
              };
              addDot(frame, point, 0.38 + (1 - progress) * 1.45, 0.16 + progress * 0.58, 278 + blade * 14);
          }
      }
      return frame;
  }
  /** Builds the `electrifying` state: unstable plasma threads with travelling high-energy pulses. */
  function plasmaFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const project = createProjector(context, time * 0.13, 0.37);
      const threads = Math.round(11 * density);
      const samples = Math.round(28 * density);
      for (let thread = 0; thread < threads; thread += 1) {
          let previous;
          const phase = thread * 1.37;
          for (let sample = 0; sample < samples; sample += 1) {
              const progress = sample / Math.max(1, samples - 1);
              const angle = progress * TAU + phase;
              const jitter = Math.sin(time * 3.5 + sample * 3.7 + phase) * 0.11;
              const point = project(Math.cos(angle) * (0.55 + jitter), (progress - 0.5) * 1.55 + Math.sin(time * 1.4 + phase) * 0.12, Math.sin(angle) * (0.55 + jitter));
              const pulse = Math.max(0, 1 - Math.abs(((time * 1.25 + thread * 0.17) % 1) - progress) * 7);
              addDot(frame, point, 0.35 + depth(point) + pulse * 2.2, 0.12 + depth(point) * 0.34 + pulse * 0.58, 184 + pulse * 75);
              if (previous)
                  addLine(frame, previous, point, 0.08 + pulse * 0.38, 0.46 + pulse * 0.5, 212);
              previous = point;
          }
      }
      return frame;
  }
  /** Builds the `flocking` state: coordinated particles that visibly gather, bank, and spread. */
  function flockFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const project = createProjector(context, time * 0.08, 0.32);
      const count = Math.round(92 * density);
      for (let bird = 0; bird < count; bird += 1) {
          const seed = hash(bird * 9.7);
          const path = time * (0.9 + seed * 0.5) + seed * TAU;
          const point = project(Math.sin(path + Math.sin(path * 0.7) * 0.8) * (0.25 + seed * 0.73), Math.cos(path * 1.37 + bird * 0.15) * (0.18 + seed * 0.55), Math.cos(path * 0.83 + bird * 0.42) * (0.22 + seed * 0.72));
          const flash = Math.max(0, Math.sin(path * 2.3 + bird) * 0.5 + 0.5);
          addDot(frame, point, 0.42 + depth(point) * 1.2 + flash * 0.8, 0.16 + depth(point) * 0.52, 196 + seed * 34);
      }
      return frame;
  }
  /** Builds the `throbbing` state: stacked particle waves that repeatedly push out from the centre. */
  function beatsFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const waves = 7;
      const samples = Math.round(44 * density);
      for (let wave = 0; wave < waves; wave += 1) {
          const phase = (time * 0.75 + wave / waves) % 1;
          const ringRadius = (0.08 + phase * 1.03) * radius;
          for (let sample = 0; sample < samples; sample += 1) {
              const angle = (sample / samples) * TAU;
              const ripple = Math.sin(angle * 6 + time * 6) * radius * 0.045;
              const point = {
                  x: center + Math.cos(angle) * (ringRadius + ripple),
                  y: center + Math.sin(angle) * (ringRadius + ripple),
                  z: 1 - phase * 1.5,
              };
              addDot(frame, point, 0.34 + (1 - phase) * 1.85, Math.pow(1 - phase, 1.45) * 0.74, 326 + wave * 5);
          }
      }
      return frame;
  }
  /** Builds the `cascading` state: bright droplets continuously falling around a projected globe. */
  function cascadeFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const project = createProjector(context, time * 0.1, 0.37);
      const streams = Math.round(18 * density);
      const drops = Math.round(15 * density);
      for (let stream = 0; stream < streams; stream += 1) {
          const longitude = (stream / streams) * TAU + time * 0.22;
          for (let drop = 0; drop < drops; drop += 1) {
              const progress = (time * (0.55 + hash(stream) * 0.25) + drop / drops + hash(stream * 6.1)) % 1;
              const y = 1.12 - progress * 2.24;
              const width = Math.sqrt(Math.max(0, 1 - y * y)) * 0.82;
              const point = project(Math.cos(longitude) * width, y, Math.sin(longitude) * width);
              addDot(frame, point, 0.34 + depth(point) * 1.2 + (1 - progress) * 0.9, 0.12 + depth(point) * 0.4 + (1 - progress) * 0.3, 194);
          }
      }
      return frame;
  }
  /** Builds the `spiraling` state: a tight moving galaxy with bright cores and winding arms. */
  function galaxyFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const project = createProjector(context, time * 0.16, 0.38);
      const arms = 5;
      const samples = Math.round(45 * density);
      for (let arm = 0; arm < arms; arm += 1) {
          for (let sample = 0; sample < samples; sample += 1) {
              const progress = sample / samples;
              const angle = arm * (TAU / arms) + progress * TAU * 1.85 - time * (1.2 + progress * 0.7);
              const distance = 0.04 + progress * 1.02;
              const point = project(Math.cos(angle) * distance, Math.sin(angle * 1.4 + time) * 0.16, Math.sin(angle) * distance);
              addDot(frame, point, 0.38 + (1 - progress) * 1.7 + depth(point), 0.16 + (1 - progress) * 0.56, 36 + progress * 210);
          }
      }
      return frame;
  }
  /** Builds the `juggling` state: five large kinetic balls trading places on staggered arcs. */
  function juggleFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const balls = Math.max(4, Math.round(5 * density));
      for (let ball = 0; ball < balls; ball += 1) {
          const phase = time * 1.25 + (ball / balls) * TAU;
          const x = Math.sin(phase) * radius * 0.76;
          const y = -Math.abs(Math.cos(phase)) * radius * 0.72 + Math.sin(phase * 2) * radius * 0.12;
          const z = Math.cos(phase) * 0.8;
          const point = { x: center + x, y: center + y, z };
          const trail = 12;
          for (let index = trail; index > 0; index -= 1) {
              const age = index / trail;
              const prior = phase - age * 0.48;
              const trailPoint = {
                  x: center + Math.sin(prior) * radius * 0.76,
                  y: center - Math.abs(Math.cos(prior)) * radius * 0.72 + Math.sin(prior * 2) * radius * 0.12,
                  z: Math.cos(prior) * 0.8,
              };
              addDot(frame, trailPoint, 0.3 + (1 - age) * 1.2, (1 - age) * 0.34, 38 + ball * 56);
          }
          addDot(frame, point, 2.25 + depth(point) * 1.65, 0.94, 38 + ball * 56);
      }
      return frame;
  }
  /** Builds the `eclipsing` state: two dotted moons pass through a soft orbital alignment. */
  function eclipseFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const count = Math.round(118 * density);
      const separation = Math.sin(time * 0.58) * radius * 0.48;
      for (let moon = 0; moon < 2; moon += 1) {
          for (let index = 0; index < count; index += 1) {
              const [x, y, z] = fibonacciPoint(index, count);
              const phase = time * 0.24 + moon * Math.PI;
              const point = {
                  x: center + separation * (moon ? 1 : -1) + x * radius * 0.64,
                  y: center + y * radius * 0.64 + Math.sin(phase + x * 2.8) * radius * 0.04,
                  z: z + (moon ? -0.12 : 0.12),
              };
              const rim = Math.max(0, z) * 0.22;
              addDot(frame, point, 0.42 + depth(point) * 1.35 + rim, 0.12 + depth(point) * 0.5 + rim, moon ? 38 : 214);
          }
      }
      return frame;
  }
  /** Builds the `resonating` state: phase-shifting interference rings ripple through a core. */
  function resonanceFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const rings = 7;
      const samples = Math.round(44 * density);
      for (let ring = 0; ring < rings; ring += 1) {
          const phase = (time * 0.42 + ring / rings) % 1;
          const ringRadius = radius * (0.12 + phase * 0.98);
          for (let sample = 0; sample < samples; sample += 1) {
              const angle = (sample / samples) * TAU;
              const ripple = Math.sin(angle * 5 - time * 3.2 + ring * 1.8) * radius * 0.06 * (1 - phase);
              const point = {
                  x: center + Math.cos(angle) * (ringRadius + ripple),
                  y: center + Math.sin(angle) * (ringRadius + ripple),
                  z: 1 - phase * 1.6,
              };
              addDot(frame, point, 0.34 + (1 - phase) * 1.65, Math.pow(1 - phase, 1.6) * 0.72, 275 + ring * 8);
          }
      }
      return frame;
  }
  /** Builds the `condensing` state: a wide particle field repeatedly collapses into a bright core. */
  function condenseFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const count = Math.round(190 * density);
      const phase = (Math.sin(time * 0.78) + 1) / 2;
      const compression = 0.18 + Math.pow(1 - phase, 2.2) * 0.88;
      for (let index = 0; index < count; index += 1) {
          const [x, y, z] = fibonacciPoint(index, count);
          const twist = time * (0.45 + hash(index) * 0.4);
          const point = {
              x: center + (x * Math.cos(twist) - z * Math.sin(twist)) * radius * compression,
              y: center + y * radius * compression,
              z,
          };
          const glow = 1 - compression;
          addDot(frame, point, 0.38 + depth(point) * 1.35 + glow * 1.1, 0.13 + depth(point) * 0.55 + glow * 0.2, 28 + glow * 28);
      }
      return frame;
  }
  /** Builds the `dispersing` state: a compact core breaks into spiralling particles before re-forming. */
  function disperseFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const count = Math.round(166 * density);
      const phase = (Math.sin(time * 0.7 - 0.8) + 1) / 2;
      for (let index = 0; index < count; index += 1) {
          const seed = hash(index * 7.21);
          const angle = seed * TAU + time * (0.5 + seed * 0.9);
          const distance = radius * (0.1 + phase * (0.22 + seed * 0.86));
          const point = {
              x: center + Math.cos(angle) * distance,
              y: center + Math.sin(angle * 1.37) * distance * 0.7,
              z: 1 - seed * 1.8,
          };
          const trail = Math.max(0, 1 - Math.abs(seed - phase) * 3.2);
          addDot(frame, point, 0.36 + depth(point) * 1.25 + trail, 0.12 + depth(point) * 0.5 + trail * 0.3, 202 + seed * 60);
      }
      return frame;
  }
  /** Builds the `prisming` state: a rotating wire prism refracts particles across its faces. */
  function prismFrame(context) {
      const { time, density } = context;
      const frame = createFrame();
      const project = createProjector(context, time * 0.42, 0.52);
      const vertices = [
          [0, -1, 0],
          [-0.86, 0.55, -0.5],
          [0.86, 0.55, -0.5],
          [0, 0.55, 1],
      ];
      const projected = vertices.map((vertex) => project(...vertex));
      for (const [from, to] of [
          [0, 1],
          [0, 2],
          [0, 3],
          [1, 2],
          [2, 3],
          [3, 1],
      ]) {
          addLine(frame, projected[from], projected[to], 0.32, 0.72, 191 + from * 30);
      }
      const count = Math.round(128 * density);
      for (let index = 0; index < count; index += 1) {
          const seed = hash(index * 3.19);
          const face = index % 3;
          const a = hash(index * 8.1);
          const b = hash(index * 4.7) * (1 - a);
          const base = vertices[0];
          const first = vertices[face + 1];
          const second = vertices[((face + 1) % 3) + 1];
          const point = project(base[0] * (1 - a - b) + first[0] * a + second[0] * b, base[1] * (1 - a - b) + first[1] * a + second[1] * b, base[2] * (1 - a - b) + first[2] * a + second[2] * b);
          addDot(frame, point, 0.42 + depth(point) * 1.35, 0.16 + depth(point) * 0.58, 184 + seed * 100);
      }
      return frame;
  }
  /** Builds the `levitating` state: particle platforms drift upward before dissolving into the field. */
  function levitateFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const platforms = Math.round(9 * density);
      const particles = Math.round(16 * density);
      for (let platform = 0; platform < platforms; platform += 1) {
          const seed = hash(platform * 5.9);
          const progress = (time * (0.22 + seed * 0.18) + seed) % 1;
          const width = radius * (0.16 + seed * 0.36);
          const y = center + radius * (0.92 - progress * 1.85);
          const x = center + Math.sin(time * 0.7 + seed * TAU) * radius * 0.36;
          for (let particle = 0; particle < particles; particle += 1) {
              const horizontal = (particle / Math.max(1, particles - 1) - 0.5) * width * 2;
              const wave = Math.sin(time * 2 + particle * 0.7 + seed * 8) * radius * 0.035;
              const point = { x: x + horizontal, y: y + wave, z: 1 - progress * 1.65 };
              addDot(frame, point, 0.36 + (1 - progress) * 1.15, (1 - progress) * 0.64, 176 + seed * 54);
          }
      }
      return frame;
  }
  /** Builds the `synchronizing` state: multiple orbital clocks settle into a shared phase. */
  function synchronizeFrame(context) {
      const frame = createFrame();
      const project = createProjector(context, context.time * 0.12, 0.4);
      const rings = 4;
      const samples = Math.round(36 * context.density);
      const alignment = (Math.sin(context.time * 0.65) + 1) / 2;
      for (let ring = 0; ring < rings; ring += 1) {
          const tilt = 0.24 + ring * 0.28;
          const offset = (1 - alignment) * ring * 0.94;
          for (let sample = 0; sample < samples; sample += 1) {
              const angle = (sample / samples) * TAU + context.time * 0.82 + offset;
              const point = project(Math.cos(angle) * (0.42 + ring * 0.12), Math.sin(angle) * Math.sin(tilt) * (0.42 + ring * 0.12), Math.sin(angle) * Math.cos(tilt) * (0.42 + ring * 0.12));
              addDot(frame, point, 0.38 + depth(point) * 1.2, 0.13 + depth(point) * 0.52, 204 + ring * 24);
          }
      }
      return frame;
  }
  /** Builds the `unraveling` state: a dense helix loosens into long kinetic filaments. */
  function unravelFrame(context) {
      const frame = createFrame();
      const project = createProjector(context, context.time * 0.16, 0.38);
      const strands = 5;
      const samples = Math.round(58 * context.density);
      const loosen = (Math.sin(context.time * 0.48) + 1) / 2;
      for (let strand = 0; strand < strands; strand += 1) {
          let previous;
          for (let sample = 0; sample < samples; sample += 1) {
              const progress = sample / Math.max(1, samples - 1);
              const angle = progress * TAU * (2.2 + loosen * 2.8) + strand * (TAU / strands) + context.time * 0.8;
              const radial = 0.16 + progress * (0.26 + loosen * 0.72);
              const point = project(Math.cos(angle) * radial, (progress - 0.5) * 1.6, Math.sin(angle) * radial);
              addDot(frame, point, 0.34 + depth(point) * 1.3, 0.14 + depth(point) * 0.56, 298 + strand * 11);
              if (previous)
                  addLine(frame, previous, point, 0.08 + depth(point) * 0.12, 0.4, 298 + strand * 11);
              previous = point;
          }
      }
      return frame;
  }
  return { satellitesFrame, cometFrame, bubblesFrame, pinwheelFrame, plasmaFrame, flockFrame, beatsFrame, cascadeFrame, galaxyFrame, juggleFrame, eclipseFrame, resonanceFrame, condenseFrame, disperseFrame, prismFrame, levitateFrame, synchronizeFrame, unravelFrame };
  })();
  
  const mod_reasoning = (function () {
  const { addDot, addLine, createFrame, depth, fibonacciPoint, hash, lerp, normalize, smoothstep, TAU, createProjector, sphereDots } = mod_shared;
  /** Builds the `pondering` state: a rotating mesh where small ideas travel along possible paths. */
  function latticeFrame(context) {
      const frame = createFrame();
      const project = createProjector(context, context.time * 0.16, 0.46);
      const bands = 7;
      const samples = Math.round(28 * context.density);
      for (let band = 0; band < bands; band += 1) {
          const latitude = -0.78 + (band / (bands - 1)) * 1.56;
          const radial = Math.sqrt(1 - latitude * latitude);
          for (let sample = 0; sample < samples; sample += 1) {
              const angle = (sample / samples) * TAU + latitude * 0.8;
              const point = project(Math.cos(angle) * radial, latitude, Math.sin(angle) * radial);
              addDot(frame, point, 0.36 + depth(point) * 1.16, 0.1 + depth(point) * 0.42);
          }
          const thought = context.time * (0.52 + band * 0.045) + band * 1.43;
          const point = project(Math.cos(thought) * radial, latitude, Math.sin(thought) * radial);
          addDot(frame, point, 1.1 + depth(point) * 1.1, 0.9);
      }
      for (let meridian = 0; meridian < 5; meridian += 1) {
          const heading = meridian * (TAU / 5) + context.time * 0.11;
          for (let sample = 0; sample < samples; sample += 1) {
              const latitude = -0.9 + (sample / (samples - 1)) * 1.8;
              const radial = Math.sqrt(1 - latitude * latitude);
              const point = project(Math.cos(heading) * radial, latitude, Math.sin(heading) * radial);
              addDot(frame, point, 0.32 + depth(point) * 0.96, 0.08 + depth(point) * 0.3);
          }
      }
      return frame;
  }
  /** Builds the `deducing` state: layered premises send a signal through a changing inference tree. */
  function deduceFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const layers = 4;
      const nodes = Array.from({ length: layers }, (_, layer) => Math.pow(2, layer));
      const position = (layer, index) => {
          const count = nodes[layer];
          const spread = radius * (0.18 + layer * 0.16);
          const sway = Math.sin(time * 0.72 + layer * 1.9) * radius * 0.06;
          return {
              x: center + (index / Math.max(1, count - 1) - 0.5) * spread * 2 + sway,
              y: center - radius * 0.66 + layer * radius * 0.44,
              z: 0.55 - layer * 0.28,
          };
      };
      for (let layer = 0; layer < layers - 1; layer += 1) {
          for (let index = 0; index < nodes[layer]; index += 1) {
              const from = position(layer, index);
              for (const child of [index * 2, index * 2 + 1]) {
                  const to = position(layer + 1, child);
                  const progress = (time * 0.35 + layer * 0.24 + index * 0.13) % 1;
                  addLine(frame, from, to, 0.11 + progress * 0.13, 0.5);
                  const signal = {
                      x: lerp(from.x, to.x, progress),
                      y: lerp(from.y, to.y, progress),
                      z: lerp(from.z, to.z, progress),
                  };
                  addDot(frame, signal, 0.6 + progress * 1.2, 0.28 + progress * 0.62);
              }
          }
      }
      for (let layer = 0; layer < layers; layer += 1) {
          for (let index = 0; index < nodes[layer]; index += 1) {
              const point = position(layer, index);
              const pulse = Math.max(0, Math.sin(time * 1.3 - layer * 0.9 + index * 0.35));
              addDot(frame, point, 1 + pulse * 0.82, 0.42 + pulse * 0.35);
          }
      }
      const ambient = Math.round(22 * density);
      for (let index = 0; index < ambient; index += 1) {
          const seed = hash(index * 4.2);
          const point = {
              x: center + (seed - 0.5) * radius * 1.8,
              y: center + (hash(index * 7.3) - 0.5) * radius * 1.5,
              z: -0.7,
          };
          addDot(frame, point, 0.3, 0.06 + seed * 0.08);
      }
      return frame;
  }
  /** Builds the `branching` state: a decision tree grows, retracts, then tries another route. */
  function branchFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const growth = (Math.sin(time * 0.52) + 1) / 2;
      // Keep the branching decision tree legible at low density while letting higher detail
      // values add real decision depth rather than only decorative background particles.
      const levels = Math.max(3, Math.min(7, Math.round(3 + density * 2)));
      const drawBranch = (from, angle, length, depthLevel, seed) => {
          if (depthLevel >= levels)
              return;
          const visible = smoothstep(Math.max(0, Math.min(1, growth * levels - depthLevel)));
          if (visible < 0.02)
              return;
          const bend = Math.sin(time * 0.8 + seed * 7 + depthLevel) * 0.22;
          const to = {
              x: from.x + Math.cos(angle + bend) * length * visible,
              y: from.y - Math.sin(angle + bend) * length * visible,
              z: 0.5 - depthLevel * 0.22,
          };
          addLine(frame, from, to, 0.13 + visible * 0.18, 0.52);
          addDot(frame, to, 0.48 + visible * 0.92, 0.2 + visible * 0.52);
          const split = 0.46 + hash(seed * 3.7) * 0.18;
          drawBranch(to, angle - split, length * 0.69, depthLevel + 1, seed * 2.1 + 0.3);
          drawBranch(to, angle + split, length * 0.69, depthLevel + 1, seed * 2.1 + 0.9);
      };
      const root = { x: center, y: center + radius * 0.7, z: 0.8 };
      addDot(frame, root, 1.25, 0.86);
      // Start with a visible choice rather than a trunk: the first two paths split
      // directly from the root and make the mode read as branching immediately.
      drawBranch(root, Math.PI / 2 - 0.48, radius * 0.45, 0, 0.21);
      drawBranch(root, Math.PI / 2 + 0.48, radius * 0.45, 0, 0.79);
      const dust = Math.round(32 * density);
      for (let index = 0; index < dust; index += 1) {
          const seed = hash(index * 9.13);
          addDot(frame, { x: center + (seed - 0.5) * radius * 1.9, y: center + (hash(index * 2.7) - 0.5) * radius * 1.65, z: -0.6 }, 0.28, 0.045 + seed * 0.075);
      }
      return frame;
  }
  /** Builds the `focusing` state: scattered rings progressively settle into one sharp aperture. */
  function apertureFrame(context) {
      const frame = createFrame();
      const project = createProjector(context, context.time * 0.1, 0.38);
      const focus = (Math.sin(context.time * 0.65) + 1) / 2;
      const rings = 6;
      const samples = Math.round(34 * context.density);
      for (let ring = 0; ring < rings; ring += 1) {
          const radius = 0.18 + ring * 0.13;
          const offset = (1 - focus) * (ring - (rings - 1) / 2) * 0.42;
          for (let sample = 0; sample < samples; sample += 1) {
              const angle = (sample / samples) * TAU + context.time * (0.3 + ring * 0.03) + offset;
              const point = project(Math.cos(angle) * radius, Math.sin(angle) * radius * (0.3 + focus * 0.7), offset * 0.8);
              addDot(frame, point, 0.34 + depth(point) * 1.12, 0.1 + depth(point) * 0.45 + focus * 0.08);
          }
      }
      return frame;
  }
  /** Builds the `reflecting` state: a field folds over a drifting mirror plane and resolves its symmetry. */
  function mirrorFrame(context) {
      const frame = createFrame();
      const project = createProjector(context, context.time * 0.17, 0.43);
      const count = Math.round(68 * context.density);
      const plane = Math.sin(context.time * 0.58) * 0.22;
      for (let index = 0; index < count; index += 1) {
          const seed = hash(index * 5.17);
          const x = (seed - 0.5) * 1.6;
          const y = (hash(index * 2.31) - 0.5) * 1.35;
          const z = (hash(index * 8.43) - 0.5) * 1.1;
          const drift = Math.sin(context.time * 0.9 + index * 1.7) * 0.06;
          const top = project(x, plane + Math.abs(y) + drift, z);
          const reflection = project(x, plane - Math.abs(y) - drift, z);
          const link = 0.06 + Math.max(0, 0.24 - Math.abs(y)) * 0.35;
          addLine(frame, top, reflection, link, 0.35);
          addDot(frame, top, 0.35 + depth(top) * 1.14, 0.12 + depth(top) * 0.52);
          addDot(frame, reflection, 0.3 + depth(reflection) * 0.9, 0.08 + depth(reflection) * 0.4);
      }
      for (let index = 0; index < 32; index += 1) {
          const x = -0.9 + (index / 31) * 1.8;
          const point = project(x, plane, 0);
          addDot(frame, point, 0.42, 0.17);
      }
      return frame;
  }
  /** Builds the `weighing` state: two moving point clouds seek equilibrium across a suspended beam. */
  function scalesFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const tilt = Math.sin(time * 0.72) * 0.32;
      const pivot = { x: center, y: center + radius * 0.06, z: 0.7 };
      const left = { x: center - Math.cos(tilt) * radius * 0.67, y: center + Math.sin(tilt) * radius * 0.67, z: 0.25 };
      const right = { x: center + Math.cos(tilt) * radius * 0.67, y: center - Math.sin(tilt) * radius * 0.67, z: 0.25 };
      addLine(frame, left, right, 0.44, 0.8);
      addLine(frame, pivot, { x: center, y: center + radius * 0.52, z: 0.35 }, 0.25, 0.5);
      addDot(frame, pivot, 1.45, 0.82);
      const particles = Math.round(34 * density);
      for (const [weight, direction] of [
          [left, -1],
          [right, 1],
      ]) {
          for (let index = 0; index < particles; index += 1) {
              const seed = hash(index * 4.79 + direction * 6.1);
              const angle = seed * TAU + time * (0.22 + seed * 0.18) * direction;
              const spread = radius * (0.08 + hash(index * 8.7) * 0.18);
              const point = {
                  x: weight.x + Math.cos(angle) * spread,
                  y: weight.y + radius * 0.22 + Math.sin(angle) * spread * 0.58,
                  z: weight.z - seed * 0.6,
              };
              addDot(frame, point, 0.34 + (1 - seed) * 0.9, 0.16 + (1 - seed) * 0.45);
          }
      }
      return frame;
  }
  /** Builds the `recalling` state: faint snapshots return from the distance toward a central thought. */
  function memoryFrame(context) {
      const frame = createFrame();
      const project = createProjector(context, context.time * 0.12, 0.35);
      const echoes = 8;
      const samples = Math.round(28 * context.density);
      for (let echo = 0; echo < echoes; echo += 1) {
          const progress = (context.time * 0.22 + echo / echoes) % 1;
          const radial = 0.16 + (1 - progress) * 0.82;
          const alpha = 0.08 + progress * 0.42;
          for (let sample = 0; sample < samples; sample += 1) {
              const angle = (sample / samples) * TAU + echo * 0.68 - context.time * 0.28;
              const point = project(Math.cos(angle) * radial, Math.sin(angle * 1.7) * radial * 0.56, Math.sin(angle) * radial * 0.35);
              addDot(frame, point, 0.3 + depth(point) * 0.95 + progress * 0.36, alpha * (0.5 + depth(point) * 0.5));
          }
      }
      return frame;
  }
  /** Builds the `tracing` state: one probe draws a persistent, changing route through an invisible volume. */
  function traceFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const samples = Math.round(130 * density);
      const position = (moment) => ({
          x: center + Math.sin(moment * 1.17) * radius * 0.67,
          y: center + Math.sin(moment * 1.91 + 0.7) * radius * 0.46,
          z: Math.cos(moment * 0.83),
      });
      let previous;
      for (let index = 0; index < samples; index += 1) {
          const progress = index / Math.max(1, samples - 1);
          const point = position(time - (1 - progress) * 5.2);
          addDot(frame, point, 0.28 + progress * 0.74, 0.035 + progress * 0.5);
          if (previous)
              addLine(frame, previous, point, 0.025 + progress * 0.22, 0.42);
          previous = point;
      }
      const probe = position(time);
      addDot(frame, probe, 1.7, 0.92);
      return frame;
  }
  /** Builds the `converging` state: scattered evidence repeatedly settles into an orderly central structure. */
  function convergeFrame(context) {
      const frame = createFrame();
      const project = createProjector(context, context.time * 0.12, 0.39);
      const count = Math.round(160 * context.density);
      const settle = smoothstep((Math.sin(context.time * 0.56) + 1) / 2);
      for (let index = 0; index < count; index += 1) {
          const [x, y, z] = fibonacciPoint(index, count);
          const row = index / Math.max(1, count - 1) - 0.5;
          const angle = index * 2.4 + context.time * 0.65;
          const ordered = [Math.cos(angle) * 0.22, row * 1.45, Math.sin(angle) * 0.22];
          const point = project(lerp(x, ordered[0], settle), lerp(y, ordered[1], settle), lerp(z, ordered[2], settle));
          addDot(frame, point, 0.38 + depth(point) * 1.3 + settle * 0.32, 0.13 + depth(point) * 0.56);
      }
      return frame;
  }
  /** Builds the `questioning` state: a probing signal circles an uncertain boundary in a quiet particle field. */
  function queryFrame(context) {
      const frame = createFrame();
      const project = createProjector(context, context.time * 0.18, 0.42);
      const count = Math.round(142 * context.density);
      const probeAngle = context.time * 0.95;
      for (let index = 0; index < count; index += 1) {
          const [x, y, z] = fibonacciPoint(index, count);
          const longitude = Math.atan2(z, x);
          const distance = Math.atan2(Math.sin(longitude - probeAngle), Math.cos(longitude - probeAngle));
          const uncertainty = Math.exp(-(distance * distance) / 0.2) * (0.3 + (y + 1) * 0.2);
          const point = project(x * (1 + uncertainty * 0.13), y * (1 + uncertainty * 0.13), z * (1 + uncertainty * 0.13));
          addDot(frame, point, 0.38 + depth(point) * 1.3 + uncertainty * 1.1, 0.12 + depth(point) * 0.52 + uncertainty * 0.28);
      }
      const probe = project(Math.cos(probeAngle) * 1.02, Math.sin(context.time * 0.57) * 0.42, Math.sin(probeAngle) * 1.02);
      const core = project(0, 0, 0);
      addLine(frame, core, probe, 0.2, 0.46);
      addDot(frame, probe, 1.8, 0.94);
      return frame;
  }
  /** Builds the `synthesizing` state: separate candidate paths light up, test a route, then resolve at one thought. */
  function reasonFrame(context) {
      const frame = createFrame();
      const project = createProjector(context, context.time * 0.12, 0.36);
      const branches = 5;
      for (let branch = 0; branch < branches; branch += 1) {
          const offset = branch - (branches - 1) / 2;
          const source = project(-0.82, offset * 0.29, Math.sin(branch * 2.4) * 0.24);
          const premise = project(-0.18, offset * 0.42 + Math.sin(context.time * 0.7 + branch) * 0.12, 0.24);
          const conclusion = project(0.72, offset * 0.12, -0.05);
          addLine(frame, source, premise, 0.18, 0.32);
          addLine(frame, premise, conclusion, 0.22, 0.38);
          for (let particle = 0; particle < 4; particle += 1) {
              const progress = (context.time * 0.37 + branch * 0.17 + particle / 4) % 1;
              const from = progress < 0.5 ? source : premise;
              const to = progress < 0.5 ? premise : conclusion;
              const local = progress < 0.5 ? progress * 2 : (progress - 0.5) * 2;
              addDot(frame, { x: lerp(from.x, to.x, local), y: lerp(from.y, to.y, local), z: lerp(from.z, to.z, local) + 0.28 }, 0.5 + local * 0.92, 0.25 + local * 0.6);
          }
      }
      const thought = project(0.86, 0, 0.12);
      addDot(frame, thought, 1.7, 0.92);
      return frame;
  }
  /** Builds the `considering` state: quiet particles orbit three possible centres before returning to balance. */
  function considerFrame(context) {
      const frame = createFrame();
      const project = createProjector(context, context.time * 0.1, 0.43, 1.18);
      const shellCount = Math.round(118 * context.density);
      for (let index = 0; index < shellCount; index += 1) {
          const [x, y, z] = fibonacciPoint(index, shellCount);
          const sway = 0.92 + Math.sin(context.time * 0.72 + y * 5) * 0.07;
          const point = project(x * sway, y * sway, z * sway);
          addDot(frame, point, 0.26 + depth(point) * 0.9, 0.07 + depth(point) * 0.28);
      }
      const centres = [
          [-0.48, -0.24, 0.2],
          [0.46, -0.18, -0.16],
          [0.04, 0.48, 0.28],
      ];
      const count = Math.round(42 * context.density);
      centres.forEach((centre, candidate) => {
          for (let index = 0; index < count; index += 1) {
              const seed = hash(index * 5.17 + candidate * 9.3);
              const angle = seed * TAU + context.time * (0.42 + candidate * 0.08);
              const swell = 0.24 + seed * 0.24 + Math.sin(context.time * 0.8 + candidate) * 0.055;
              const point = project(centre[0] + Math.cos(angle) * swell, centre[1] + Math.sin(angle * 1.7) * swell * 0.7, centre[2] + Math.sin(angle) * swell);
              addDot(frame, point, 0.28 + depth(point) * 0.78, 0.1 + depth(point) * 0.42);
          }
      });
      return frame;
  }
  /** Builds the `uploading` state: packets rise through a clean transmission channel and lock into place. */
  function uploadFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const lanes = 5;
      const packets = Math.round(7 * density);
      const target = { x: center, y: center - radius * 0.68, z: 0.75 };
      for (let lane = 0; lane < lanes; lane += 1) {
          const x = center + (lane - (lanes - 1) / 2) * radius * 0.24;
          addLine(frame, { x, y: center + radius * 0.68, z: -0.5 }, { x, y: center - radius * 0.5, z: 0.2 }, 0.1, 0.25);
          for (let packet = 0; packet < packets; packet += 1) {
              const progress = (time * 0.54 + packet / packets + lane * 0.13) % 1;
              const settle = smoothstep(progress);
              const point = {
                  x: lerp(x, target.x, Math.max(0, (progress - 0.74) / 0.26)),
                  y: lerp(center + radius * 0.68, center - radius * 0.52, settle),
                  z: -0.35 + settle * 1.15,
              };
              addDot(frame, point, 0.34 + settle * 1.15, 0.12 + settle * 0.78);
          }
      }
      addDot(frame, target, 1.55, 0.9);
      return frame;
  }
  /** Builds the `queuing` state: compact tasks take turns advancing through a looping work queue. */
  function queueFrame({ time, radius, density }) {
      const frame = createFrame();
      const project = createProjector({ time, radius, density }, time * 0.14, 0.44, 1.08);
      const lanes = 4;
      const samples = Math.round(34 * density);
      for (let lane = 0; lane < lanes; lane += 1) {
          const tilt = (lane / lanes) * TAU + 0.25;
          let previous;
          for (let index = 0; index <= samples; index += 1) {
              const progress = index / samples;
              const angle = progress * TAU;
              const point = project(Math.cos(angle) * Math.cos(tilt) * 0.86, Math.sin(angle) * 0.58, Math.cos(angle) * Math.sin(tilt) * 0.86);
              addDot(frame, point, 0.22 + depth(point) * 0.46, 0.055 + depth(point) * 0.19);
              if (previous)
                  addLine(frame, previous, point, 0.09, 0.22);
              previous = point;
          }
          const tasks = Math.max(3, Math.round(5 * density));
          for (let task = 0; task < tasks; task += 1) {
              const progress = (time * (0.3 + lane * 0.035) + task / tasks + lane * 0.12) % 1;
              const angle = progress * TAU;
              const point = project(Math.cos(angle) * Math.cos(tilt) * 0.86, Math.sin(angle) * 0.58, Math.cos(angle) * Math.sin(tilt) * 0.86);
              addDot(frame, point, 0.54 + depth(point) * 1.08, 0.3 + depth(point) * 0.54);
          }
      }
      return frame;
  }
  /** Builds the `associating` state: distant ideas form bright links, release them, and form new combinations. */
  function associateFrame(context) {
      const frame = createFrame();
      const project = createProjector(context, context.time * 0.15, 0.4, 1.08);
      const nodes = Math.round(44 * context.density);
      const points = [];
      for (let index = 0; index < nodes; index += 1) {
          const seed = hash(index * 3.81);
          const angle = seed * TAU + context.time * (0.2 + hash(index * 9.1) * 0.22);
          const latitude = (hash(index * 7.2) - 0.5) * 1.8;
          const radial = 0.26 + hash(index * 1.7) * 0.66;
          const point = project(Math.cos(angle) * Math.cos(latitude) * radial, Math.sin(latitude) * radial, Math.sin(angle) * Math.cos(latitude) * radial);
          points.push(point);
          addDot(frame, point, 0.32 + depth(point) * 1.05, 0.11 + depth(point) * 0.48);
      }
      for (let index = 0; index < points.length; index += 1) {
          const next = points[(index * 7 + 9) % points.length];
          const pulse = (Math.sin(context.time * 1.05 + index * 1.91) + 1) / 2;
          if (pulse > 0.64)
              addLine(frame, points[index], next, (pulse - 0.64) * 0.9, 0.24 + pulse * 0.3);
      }
      return frame;
  }
  /** Builds the `evaluating` state: three rotating candidate forms are measured against a steady centre. */
  function evaluateFrame(context) {
      const frame = createFrame();
      const project = createProjector(context, context.time * 0.11, 0.41, 1.12);
      const centre = project(0, 0, 0.14);
      const candidates = 3;
      for (let candidate = 0; candidate < candidates; candidate += 1) {
          const heading = (candidate / candidates) * TAU + context.time * 0.34;
          const anchor = project(Math.cos(heading) * 0.67, Math.sin(heading * 1.6) * 0.28, Math.sin(heading) * 0.56);
          addLine(frame, centre, anchor, 0.22, 0.34);
          for (let sample = 0; sample < Math.round(18 * context.density); sample += 1) {
              const local = (sample / 18) * TAU + context.time * (0.9 + candidate * 0.08);
              const point = project(Math.cos(heading) * 0.67 + Math.cos(local) * 0.17, Math.sin(heading * 1.6) * 0.28 + Math.sin(local) * 0.13, Math.sin(heading) * 0.56 + Math.sin(local * 1.8) * 0.13);
              addDot(frame, point, 0.3 + depth(point) * 0.86, 0.1 + depth(point) * 0.42);
          }
          addDot(frame, anchor, 1.02, 0.66);
      }
      addDot(frame, centre, 1.72, 0.92);
      return frame;
  }
  /** Builds the `reasoning` state: a dense thought sphere sends evidence through shifting internal routes. */
  function cognitionFrame(context) {
      const project = createProjector(context, context.time * 0.16, 0.42, 1.06);
      const frame = createFrame();
      const count = Math.round(170 * context.density);
      for (let index = 0; index < count; index += 1) {
          const [x, y, z] = fibonacciPoint(index, count);
          const point = project(x * 0.96, y * 0.96, z * 0.96);
          addDot(frame, point, 0.45 + depth(point) * 1.4, 0.15 + depth(point) * 0.58);
          const signal = Math.max(0, Math.sin(context.time * 1.28 + index * 0.43));
          if (signal > 0.88)
              addDot(frame, point, 1.28 + signal, 0.5 + signal * 0.4);
      }
      const routes = 6;
      for (let route = 0; route < routes; route += 1) {
          let previous;
          for (let sample = 0; sample <= 32; sample += 1) {
              const progress = sample / 32;
              const angle = progress * TAU + route * 0.87 + context.time * 0.26;
              const point = project(Math.cos(angle) * (0.34 + progress * 0.56), Math.sin(angle * 2.1 + route) * 0.22, Math.sin(angle) * (0.34 + progress * 0.56));
              if (previous)
                  addLine(frame, previous, point, 0.1, 0.22);
              previous = point;
          }
          const signal = (context.time * 0.48 + route / routes) % 1;
          const angle = signal * TAU + route * 0.87 + context.time * 0.26;
          const head = project(Math.cos(angle) * (0.34 + signal * 0.56), Math.sin(angle * 2.1 + route) * 0.22, Math.sin(angle) * (0.34 + signal * 0.56));
          addDot(frame, head, 1.55, 0.92);
          addDot(frame, project(0, 0, 0), 0.7 + signal * 0.42, 0.12 + signal * 0.14);
      }
      const insight = project(0, 0, 0.88);
      addDot(frame, insight, 1.72, 0.94);
      return frame;
  }
  /** Builds the `exploring` state: a moving probe illuminates one latitude of an otherwise quiet orb. */
  function exploreFrame(context) {
      const frame = createFrame();
      const project = createProjector(context, context.time * 0.1, 0.4, 1.08);
      const count = Math.round(168 * context.density);
      const probeAngle = context.time * 0.82;
      for (let index = 0; index < count; index += 1) {
          const [x, y, z] = fibonacciPoint(index, count);
          const longitude = Math.atan2(z, x);
          const delta = Math.atan2(Math.sin(longitude - probeAngle), Math.cos(longitude - probeAngle));
          const discovery = Math.exp(-(delta * delta) / 0.1) * (0.3 + (y + 1) * 0.35);
          const point = project(x * (1 + discovery * 0.18), y * (1 + discovery * 0.18), z * (1 + discovery * 0.18));
          addDot(frame, point, 0.34 + depth(point) * 1.12 + discovery * 1.05, 0.1 + depth(point) * 0.46 + discovery * 0.34);
      }
      const probe = project(Math.cos(probeAngle), Math.sin(context.time * 0.47) * 0.36, Math.sin(probeAngle));
      addDot(frame, probe, 1.85, 0.96);
      return frame;
  }
  /** Builds the `linking` state: separate point clusters on a sphere discover brief, bright bridges. */
  function linkFrame(context) {
      const frame = createFrame();
      const project = createProjector(context, context.time * 0.13, 0.38, 1.08);
      const count = Math.round(92 * context.density);
      const points = [];
      for (let index = 0; index < count; index += 1) {
          const [x, y, z] = fibonacciPoint(index, count);
          const warp = Math.sin(context.time * 0.68 + y * 6 + index * 0.17) * 0.09;
          const point = project(x * (0.9 + warp), y * (0.9 + warp), z * (0.9 + warp));
          points.push(point);
          addDot(frame, point, 0.3 + depth(point) * 1.03, 0.1 + depth(point) * 0.46);
      }
      for (let index = 0; index < points.length; index += 1) {
          const other = points[(index * 11 + 17) % points.length];
          const connection = Math.max(0, Math.sin(context.time * 1.15 + index * 0.79));
          if (connection > 0.72)
              addLine(frame, points[index], other, (connection - 0.72) * 1.2, 0.22 + connection * 0.34);
      }
      addDot(frame, project(0, 0, 0.5), 1.48, 0.72);
      return frame;
  }
  /** Builds the `resolving` state: bright threads weave through an unstable orb until its facets briefly lock together. */
  function resolveFrame(context) {
      const frame = createFrame();
      const project = createProjector(context, context.time * 0.17, 0.46, 1.07);
      const count = Math.round(138 * context.density);
      const settle = smoothstep((Math.sin(context.time * 0.58) + 1) / 2);
      for (let index = 0; index < count; index += 1) {
          const [x, y, z] = fibonacciPoint(index, count);
          const max = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
          const faceted = [x / max, y / max, z / max];
          const point = project(lerp(x, faceted[0], settle), lerp(y, faceted[1], settle), lerp(z, faceted[2], settle));
          addDot(frame, point, 0.34 + depth(point) * 1.08 + settle * 0.32, 0.1 + depth(point) * 0.48 + settle * 0.14);
      }
      const threads = 5;
      const samples = Math.round(48 * context.density);
      for (let thread = 0; thread < threads; thread += 1) {
          let previous;
          for (let sample = 0; sample <= samples; sample += 1) {
              const progress = sample / samples;
              const angle = progress * TAU * 1.25 + thread * (TAU / threads) + context.time * 0.68;
              const radial = 0.72 + Math.sin(progress * TAU * 2 + thread) * 0.18 * (1 - settle);
              const point = project(Math.cos(angle) * radial, Math.sin(progress * TAU * 2 + thread * 0.8) * 0.38, Math.sin(angle) * radial);
              if (previous)
                  addLine(frame, previous, point, 0.13 + settle * 0.12, 0.22 + settle * 0.14);
              previous = point;
          }
          const headProgress = (context.time * 0.21 + thread / threads) % 1;
          const headAngle = headProgress * TAU * 1.25 + thread * (TAU / threads) + context.time * 0.68;
          const head = project(Math.cos(headAngle) * 0.72, Math.sin(headProgress * TAU * 2 + thread * 0.8) * 0.38, Math.sin(headAngle) * 0.72);
          addDot(frame, head, 1.48, 0.9);
      }
      return frame;
  }
  /** Builds the `imagining` state: one orb rapidly cycles through a sphere, cube, coil and flower-like imagined form. */
  function imagineFrame(context) {
      const frame = createFrame();
      const project = createProjector(context, context.time * 0.16, 0.4, 1.08);
      const count = Math.round(154 * context.density);
      const cycle = (context.time * 0.44) % 1;
      const shapeIndex = Math.floor(cycle * 4);
      const blend = smoothstep((cycle * 4) % 1);
      for (let index = 0; index < count; index += 1) {
          const [x, y, z] = fibonacciPoint(index, count);
          const longitude = Math.atan2(z, x);
          const cubeScale = 1 / Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
          const shapes = [
              [x, y, z],
              [x * cubeScale, y * cubeScale, z * cubeScale],
              [Math.cos(longitude * 2) * (0.24 + (y + 1) * 0.18), y * 1.24, Math.sin(longitude * 2) * (0.24 + (y + 1) * 0.18)],
              [Math.cos(longitude * 3) * (0.36 + y * y * 0.25), y * 1.06, Math.sin(longitude * 3) * (0.36 + y * y * 0.25)],
          ];
          const current = shapes[shapeIndex];
          const next = shapes[(shapeIndex + 1) % shapes.length];
          const point = project(lerp(current[0], next[0], blend), lerp(current[1], next[1], blend), lerp(current[2], next[2], blend));
          addDot(frame, point, 0.34 + depth(point) * 1.1 + blend * 0.24, 0.11 + depth(point) * 0.46 + blend * 0.08);
      }
      return frame;
  }
  return { latticeFrame, deduceFrame, branchFrame, apertureFrame, mirrorFrame, scalesFrame, memoryFrame, traceFrame, convergeFrame, queryFrame, reasonFrame, considerFrame, uploadFrame, queueFrame, associateFrame, evaluateFrame, cognitionFrame, exploreFrame, linkFrame, resolveFrame, imagineFrame };
  })();
  
  const mod_agentOrbs = (function () {
  const { addDot, createFrame, createProjector, depth, fibonacciPoint } = mod_shared;
  /**
   * Builds `settling`: a soft, monochrome orb gradually releases its remaining motion.
   *
   * The phase is continuous and intentionally never switches state, so a looping loader has no
   * perceptible reset or sudden accent burst.
   */
  function settleFrame(context) {
      const frame = createFrame();
      const calm = (Math.sin(context.time * 0.72) + 1) / 2;
      const project = createProjector(context, 0.16 + (1 - calm) * 0.22, 0.44, 0.82 + calm * 0.08);
      const count = Math.round(56 * context.density);
      for (let index = 0; index < count; index += 1) {
          const [x, y, z] = fibonacciPoint(index, count);
          const residual = Math.sin(index * 2.4 + context.time * 0.76) * (0.04 + (1 - calm) * 0.09);
          const point = project(x * (0.9 + residual), y * (0.9 + residual), z * (0.9 + residual));
          addDot(frame, point, 0.3 + depth(point) * 0.78, 0.12 + depth(point) * 0.42 + calm * 0.08);
      }
      const center = project(0, 0, 0.7);
      addDot(frame, center, 0.92 + calm * 0.5, 0.38 + calm * 0.32);
      return frame;
  }
  return { settleFrame };
  })();
  
  const mod_atmospheric = (function () {
  const { addDot, addLine, createFrame, createProjector, depth, fibonacciPoint, hash, TAU } = mod_shared;
  /** Builds the `glimmering` state: coloured sparks drift through a faceted, living field. */
  function glimmerFrame(context) {
      const frame = createFrame();
      const project = createProjector(context, context.time * 0.16, 0.4);
      const count = Math.round(112 * context.density);
      for (let index = 0; index < count; index += 1) {
          const seed = hash(index * 6.31);
          const angle = seed * TAU + context.time * (0.32 + seed);
          const radial = 0.2 + hash(index * 2.7) * 0.83;
          const point = project(Math.cos(angle) * radial, Math.sin(angle * 1.7 + context.time) * radial * 0.65, Math.sin(angle) * radial);
          const flash = Math.pow(Math.max(0, Math.sin(context.time * (1.4 + seed * 2) + index)), 12);
          addDot(frame, point, 0.34 + depth(point) * 1.15 + flash * 1.65, 0.1 + depth(point) * 0.46 + flash * 0.38, 184 + seed * 130);
      }
      return frame;
  }
  /** Builds the `radiating` state: a colour-wheel of rays breathes out from a bright centre. */
  function radianceFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const rays = Math.round(30 * density);
      for (let ray = 0; ray < rays; ray += 1) {
          const angle = (ray / rays) * TAU + time * 0.18;
          const tone = (ray / rays) * 360;
          const reach = radius * (0.36 + (Math.sin(time * 1.3 + ray * 0.61) + 1) * 0.29);
          for (let step = 0; step < 9; step += 1) {
              const progress = step / 8;
              const point = {
                  x: center + Math.cos(angle) * reach * progress,
                  y: center + Math.sin(angle) * reach * progress,
                  z: progress * 1.4 - 0.5,
              };
              addDot(frame, point, 0.35 + progress * 0.8, 0.12 + progress * 0.58, tone);
          }
      }
      return frame;
  }
  /** Builds the `harmonizing` state: three chromatic oscillators find a shared orbital rhythm. */
  function harmonyFrame(context) {
      const frame = createFrame();
      const project = createProjector(context, context.time * 0.13, 0.39);
      const samples = Math.round(54 * context.density);
      for (let voice = 0; voice < 3; voice += 1) {
          let previous;
          const tone = 36 + voice * 118;
          for (let index = 0; index < samples; index += 1) {
              const progress = index / (samples - 1);
              const angle = progress * TAU * 1.7 + (voice * TAU) / 3 + context.time * 0.72;
              const point = project(Math.cos(angle) * 0.64, Math.sin(angle * 2.1) * 0.27, Math.sin(angle) * 0.54);
              addDot(frame, point, 0.38 + depth(point) * 1.1, 0.16 + depth(point) * 0.5, tone);
              if (previous)
                  addLine(frame, previous, point, 0.12, 0.46, tone);
              previous = point;
          }
      }
      return frame;
  }
  /** Builds the `twinkling` state: a deep field of stars changes colour as individual points flare. */
  function twinkleFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const count = Math.round(138 * density);
      for (let index = 0; index < count; index += 1) {
          const seed = hash(index * 3.41);
          const phase = Math.max(0, Math.sin(time * (0.9 + seed * 2.1) + seed * 17));
          const flash = Math.pow(phase, 18);
          const point = {
              x: center + (hash(index * 8.2) - 0.5) * radius * 1.78,
              y: center + (seed - 0.5) * radius * 1.66,
              z: hash(index * 1.7) * 2 - 1,
          };
          addDot(frame, point, 0.25 + flash * 2.1, 0.07 + flash * 0.85, 202 + seed * 112);
      }
      return frame;
  }
  /** Builds the `flickering` state: warm coloured embers rise, split and extinguish. */
  function flickerFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const count = Math.round(96 * density);
      for (let index = 0; index < count; index += 1) {
          const seed = hash(index * 8.91);
          const progress = (time * (0.22 + seed * 0.34) + seed) % 1;
          const sway = Math.sin(time * 2.8 + seed * 30) * radius * 0.14 * progress;
          const point = {
              x: center + (seed - 0.5) * radius * 1.2 * progress + sway,
              y: center + radius * (0.74 - progress * 1.55),
              z: progress * 1.2 - 0.6,
          };
          addDot(frame, point, 0.28 + (1 - progress) * 1.5, (1 - progress) * 0.72, 18 + progress * 46);
      }
      return frame;
  }
  /** Builds the `shimmering` state: translucent colour curtains fold across a slowly turning sphere. */
  function shimmerFrame(context) {
      const frame = createFrame();
      const project = createProjector(context, context.time * 0.16, 0.35);
      const samples = Math.round(62 * context.density);
      for (let curtain = 0; curtain < 5; curtain += 1)
          for (let index = 0; index < samples; index += 1) {
              const p = index / (samples - 1) - 0.5;
              const angle = (curtain * TAU) / 5 + Math.sin(p * 7 + context.time) * 0.28;
              const width = 0.36 + Math.cos(p * 9 - context.time * 1.3) * 0.09;
              const point = project(Math.cos(angle) * width, p * 1.65, Math.sin(angle) * width);
              addDot(frame, point, 0.34 + depth(point) * 1.1, 0.12 + depth(point) * 0.5, 158 + curtain * 36 + p * 32);
          }
      return frame;
  }
  /** Builds the `surfacing` state: cool coloured bubbles emerge through a deep circular current. */
  function surfaceFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const count = Math.round(76 * density);
      for (let index = 0; index < count; index += 1) {
          const seed = hash(index * 7.23);
          const progress = (time * (0.19 + seed * 0.29) + seed) % 1;
          const angle = seed * TAU + time * 0.48;
          const spread = radius * (0.08 + seed * 0.68);
          const point = {
              x: center + Math.cos(angle) * spread,
              y: center + radius * (0.72 - progress * 1.45),
              z: progress * 1.5 - 0.6,
          };
          const bubble = Math.sin(progress * Math.PI);
          addDot(frame, point, 0.3 + bubble * (0.8 + seed * 0.9), bubble * 0.64, 174 + seed * 58);
      }
      return frame;
  }
  /** Builds the `vibrating` state: chromatic wave bands interfere and continuously retune each other. */
  function vibrateFrame(context) {
      const frame = createFrame();
      const project = createProjector(context, context.time * 0.12, 0.43);
      const bands = 6;
      const samples = Math.round(44 * context.density);
      for (let band = 0; band < bands; band += 1) {
          let previous;
          const tone = (band / bands) * 360 + context.time * 18;
          for (let index = 0; index < samples; index += 1) {
              const p = index / (samples - 1) - 0.5;
              const point = project(p * 1.65, Math.sin(p * 11 + context.time * 2 + band) * 0.22, (band - 2.5) * 0.16 + Math.cos(p * 8 - context.time) * 0.18);
              addDot(frame, point, 0.32 + depth(point) * 1.05, 0.14 + depth(point) * 0.48, tone);
              if (previous)
                  addLine(frame, previous, point, 0.12, 0.43, tone);
              previous = point;
          }
      }
      return frame;
  }
  /** Builds the `illuminating` state: a colourful inner lens sends expanding pulses through a shell. */
  function illuminateFrame(context) {
      const frame = createFrame();
      const project = createProjector(context, context.time * 0.15, 0.38);
      const count = Math.round(150 * context.density);
      for (let index = 0; index < count; index += 1) {
          const [x, y, z] = fibonacciPoint(index, count);
          const wave = (Math.sin(context.time * 1.7 + Math.atan2(z, x) * 4 + y * 6) + 1) / 2;
          const point = project(x * (0.9 + wave * 0.16), y * (0.9 + wave * 0.16), z * (0.9 + wave * 0.16));
          addDot(frame, point, 0.4 + depth(point) * 1.25 + wave * 0.55, 0.13 + depth(point) * 0.5 + wave * 0.15, 278 - wave * 110 + y * 24);
      }
      return frame;
  }
  /** Builds the `sparkling` state: prismatic shards flash around a rotating crystal core. */
  function sparkleFrame(context) {
      const frame = createFrame();
      const project = createProjector(context, context.time * 0.28, 0.48);
      const shards = Math.round(42 * context.density);
      for (let shard = 0; shard < shards; shard += 1) {
          const seed = hash(shard * 4.63);
          const angle = seed * TAU + context.time * (0.35 + seed * 0.45);
          const tilt = hash(shard * 2.17) * Math.PI - Math.PI / 2;
          const radial = 0.22 + hash(shard * 9.2) * 0.76;
          const base = [
              Math.cos(angle) * Math.cos(tilt) * radial,
              Math.sin(tilt) * radial,
              Math.sin(angle) * Math.cos(tilt) * radial,
          ];
          const point = project(...base);
          const flare = Math.pow(Math.max(0, Math.sin(context.time * 2.2 + shard * 2.6)), 10);
          addDot(frame, point, 0.36 + depth(point) * 1.1 + flare * 1.5, 0.16 + depth(point) * 0.48 + flare * 0.32, 34 + seed * 290);
      }
      return frame;
  }
  return { glimmerFrame, radianceFrame, harmonyFrame, twinkleFrame, flickerFrame, shimmerFrame, surfaceFrame, vibrateFrame, illuminateFrame, sparkleFrame };
  })();
  
  const mod_classicLoaders = (function () {
  const { addDot, addLine, createFrame, lerp, TAU } = mod_shared;
  /** Builds the `loading` state: a familiar spinner made from a soft travelling bead trail. */
  function spinnerFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const segments = Math.round(20 * density);
      for (let index = 0; index < segments; index += 1) {
          const progress = index / segments;
          const angle = progress * TAU + time * 3.1;
          const lead = (Math.cos(progress * TAU) + 1) / 2;
          addDot(frame, {
              x: center + Math.cos(angle) * radius * 0.62,
              y: center + Math.sin(angle) * radius * 0.62,
              z: lead * 1.4 - 0.3,
          }, 0.48 + lead * 1.18, 0.1 + lead * 0.8);
      }
      return frame;
  }
  /** Builds the `buffering` state: three staggered rings fill, pause and hand work to one another. */
  function bufferFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const rings = 3;
      const samples = Math.round(24 * density);
      for (let ring = 0; ring < rings; ring += 1) {
          const phase = (time * 0.48 + ring / rings) % 1;
          const reach = radius * (0.27 + ring * 0.2);
          for (let index = 0; index < samples; index += 1) {
              const progress = index / samples;
              const distance = (progress - phase + 1) % 1;
              const glow = Math.max(0, 1 - distance * 3.2);
              if (glow <= 0)
                  continue;
              const angle = progress * TAU - Math.PI / 2;
              addDot(frame, {
                  x: center + Math.cos(angle) * reach,
                  y: center + Math.sin(angle) * reach,
                  z: ring * 0.22 + glow * 0.65,
              }, 0.34 + glow * 1.1, 0.08 + glow * 0.78);
          }
      }
      return frame;
  }
  /** Builds the `typing` state: three patient dots lift in sequence with a small trailing echo. */
  function ellipsisFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const dots = Math.max(3, Math.round(3 * density));
      for (let index = 0; index < dots; index += 1) {
          const phase = (time * 1.55 + index / dots) % 1;
          const lift = Math.pow(Math.sin(phase * Math.PI), 1.9);
          const x = center + (index - (dots - 1) / 2) * radius * 0.48;
          const y = center - lift * radius * 0.34;
          addDot(frame, { x, y, z: lift * 0.9 }, 1.1 + lift * 0.72, 0.28 + lift * 0.68);
          addDot(frame, { x, y: center + radius * 0.4, z: -0.35 }, 0.28 + lift * 0.34, 0.08 + lift * 0.18);
      }
      return frame;
  }
  /** Builds the `processing` state: work packets travel through a compact, continuously cycling pipeline. */
  function processFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = radius / 0.82;
      const lanes = 4;
      const packets = Math.round(9 * density);
      for (let lane = 0; lane < lanes; lane += 1) {
          const y = center + (lane - (lanes - 1) / 2) * radius * 0.31;
          const from = { x: center - radius * 0.72, y, z: -0.3 };
          const to = { x: center + radius * 0.72, y, z: -0.3 };
          addLine(frame, from, to, 0.12, 0.32);
          for (let packet = 0; packet < packets; packet += 1) {
              const progress = (time * (0.46 + lane * 0.045) + packet / packets + lane * 0.19) % 1;
              const wave = Math.sin(progress * Math.PI);
              addDot(frame, { x: lerp(from.x, to.x, progress), y, z: wave * 0.9 - 0.15 }, 0.36 + wave * 1.12, 0.12 + wave * 0.76);
          }
      }
      return frame;
  }
  return { spinnerFrame, bufferFrame, ellipsisFrame, processFrame };
  })();
  
  const mod_utilityLoaders = (function () {
  const { addArc, addDot, addLine, createFrame, lerp, TAU } = mod_shared;
  const centerOf = (radius) => radius / 0.82;
  /** Builds `loading-bars`: seven vertical bars that hand their energy from left to right. */
  function barsFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const bars = 7;
      for (let bar = 0; bar < bars; bar += 1) {
          const phase = (time * 1.55 - bar / bars) * TAU;
          const height = 0.2 + ((Math.sin(phase) + 1) / 2) * 0.74;
          const x = center + (bar - (bars - 1) / 2) * radius * 0.22;
          const dots = Math.max(3, Math.round((4 + height * 6) * density));
          for (let dot = 0; dot < dots; dot += 1) {
              const progress = dot / Math.max(1, dots - 1);
              addDot(frame, { x, y: center + (0.5 - progress) * radius * height * 1.35, z: progress * 0.7 }, 0.48 + progress * 0.62, 0.18 + progress * 0.68, 200 + bar * 11);
          }
      }
      return frame;
  }
  /** Builds `progressing`: a travelling completion ring with a soft tail and moving endpoint. */
  function progressFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const segments = Math.max(24, Math.round(42 * density));
      const head = (time * 0.42) % 1;
      const length = 0.3 + ((Math.sin(time * 0.58) + 1) / 2) * 0.42;
      for (let index = 0; index < segments; index += 1) {
          const progress = index / segments;
          const distance = (head - progress + 1) % 1;
          if (distance > length)
              continue;
          const glow = 1 - distance / length;
          const angle = progress * TAU - Math.PI / 2;
          addDot(frame, { x: center + Math.cos(angle) * radius * 0.66, y: center + Math.sin(angle) * radius * 0.66, z: glow }, 0.34 + glow * 1.16, 0.08 + glow * 0.86, 142 + glow * 64);
      }
      return frame;
  }
  /** Builds `placeholder`: shimmering dotted text lines for skeleton-loading surfaces. */
  function skeletonFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const rows = [1, 0.76, 0.9, 0.5];
      rows.forEach((width, row) => {
          const y = center + (row - 1.5) * radius * 0.29;
          const count = Math.max(10, Math.round(22 * width * density));
          for (let index = 0; index < count; index += 1) {
              const progress = index / Math.max(1, count - 1);
              const shimmer = Math.max(0, Math.cos((progress - time * 0.34 - row * 0.13) * TAU));
              addDot(frame, { x: center + (progress - 0.5) * radius * width * 1.55, y, z: shimmer * 0.45 - 0.2 }, 0.34 + shimmer * 0.56, 0.12 + shimmer * 0.5, 214);
          }
      });
      return frame;
  }
  /** Builds `monitoring`: a live waveform with a bright sampling head running across it. */
  function waveformFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const samples = Math.max(28, Math.round(68 * density));
      const traces = Math.max(1, Math.min(3, Math.round(density * 1.5)));
      for (let trace = 0; trace < traces; trace += 1) {
          let previous;
          for (let index = 0; index < samples; index += 1) {
              const progress = index / (samples - 1);
              const x = center + (progress - 0.5) * radius * 1.6;
              const envelope = 0.26 + Math.sin(progress * Math.PI) * 0.74;
              const y = center +
                  (trace - (traces - 1) / 2) * radius * 0.08 +
                  Math.sin(progress * TAU * 2.4 + time * 2.3 + trace * 0.5) * radius * 0.32 * envelope;
              const point = { x, y, z: envelope * 0.45 };
              if (previous)
                  addLine(frame, previous, point, 0.1 + trace * 0.025, 0.28, 178 + trace * 12);
              previous = point;
          }
      }
      const head = (time * 0.32) % 1;
      const x = center + (head - 0.5) * radius * 1.6;
      const envelope = 0.26 + Math.sin(head * Math.PI) * 0.74;
      for (let trace = 0; trace < traces; trace += 1) {
          const y = center +
              (trace - (traces - 1) / 2) * radius * 0.08 +
              Math.sin(head * TAU * 2.4 + time * 2.3 + trace * 0.5) * radius * 0.32 * envelope;
          addDot(frame, { x, y, z: 0.9 }, 1.52, 0.96, 178 + trace * 12);
      }
      return frame;
  }
  /** Builds `checking`: a matrix of quiet cells with a diagonal verification sweep. */
  function gridFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const columns = Math.max(4, Math.min(9, Math.round(5 + density * 2)));
      const rows = Math.max(4, Math.min(8, Math.round(4 + density * 2)));
      for (let row = 0; row < rows; row += 1) {
          for (let column = 0; column < columns; column += 1) {
              const phase = (time * 0.48 + (column + row) / (columns + rows)) % 1;
              const pulse = Math.pow(Math.max(0, Math.sin(phase * TAU)), 4);
              addDot(frame, {
                  x: center + (column - (columns - 1) / 2) * ((radius * 1.48) / columns),
                  y: center + (row - (rows - 1) / 2) * ((radius * 1.34) / rows),
                  z: pulse * 0.9 - 0.3,
              }, 0.42 + pulse * 1.02, 0.12 + pulse * 0.76, 104 + row * 7);
          }
      }
      return frame;
  }
  /** Builds `tracking`: a target leaves a projected path, a live trail, and a compact lock-on reticle. */
  function radarFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const samples = Math.max(18, Math.round(30 * density));
      const position = (moment) => ({
          x: center + Math.sin(moment * 0.82) * radius * 0.6,
          y: center + Math.sin(moment * 1.47 + 0.8) * radius * 0.39,
          z: Math.cos(moment * 0.64),
      });
      let previous;
      for (let index = 0; index < samples; index += 1) {
          const p = index / Math.max(1, samples - 1);
          const point = position(time * 0.76 + p * 3.2);
          if (previous)
              addLine(frame, previous, point, 0.1 + p * 0.24, 0.62, 214);
          previous = point;
      }
      const trails = Math.max(4, Math.round(7 * density));
      for (let index = 0; index < trails; index += 1) {
          const p = index / trails;
          const point = position(time * 0.76 - p * 1.2);
          addDot(frame, point, 0.34 + (1 - p) * 0.62, 0.08 + (1 - p) * 0.58, 196);
      }
      const target = position(time * 0.76);
      const lock = radius * (0.12 + (Math.sin(time * 3.2) + 1) * 0.012);
      addArc(frame, { x: target.x, y: target.y, radius: lock, startAngle: 0, endAngle: TAU, width: 1.4, z: 0.9 }, 0.82, 38);
      addLine(frame, { x: target.x - lock * 1.45, y: target.y, z: 1 }, { x: target.x + lock * 1.45, y: target.y, z: 1 }, 0.68, 1, 38);
      addLine(frame, { x: target.x, y: target.y - lock * 1.45, z: 1 }, { x: target.x, y: target.y + lock * 1.45, z: 1 }, 0.68, 1, 38);
      addDot(frame, target, 1.05, 0.96, 38);
      return frame;
  }
  /** Builds `waiting`: flowing particles pass through a compact hourglass. */
  function hourglassFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const topLeft = { x: center - radius * 0.48, y: center - radius * 0.62, z: -0.1 };
      const topRight = { x: center + radius * 0.48, y: center - radius * 0.62, z: -0.1 };
      const neck = { x: center, y: center, z: 0.5 };
      const bottomLeft = { x: center - radius * 0.48, y: center + radius * 0.62, z: -0.1 };
      const bottomRight = { x: center + radius * 0.48, y: center + radius * 0.62, z: -0.1 };
      addLine(frame, topLeft, neck, 0.16, 0.5, 36);
      addLine(frame, topRight, neck, 0.16, 0.5, 36);
      addLine(frame, neck, bottomLeft, 0.16, 0.5, 36);
      addLine(frame, neck, bottomRight, 0.16, 0.5, 36);
      const grains = Math.max(10, Math.round(22 * density));
      for (let grain = 0; grain < grains; grain += 1) {
          const progress = (time * 0.46 + grain / grains) % 1;
          const upper = progress < 0.5;
          const local = upper ? progress * 2 : (progress - 0.5) * 2;
          const spread = (upper ? 1 - local : local) * radius * 0.38;
          addDot(frame, {
              x: center + Math.sin(grain * 7.7) * spread,
              y: upper ? lerp(center - radius * 0.5, center, local) : lerp(center, center + radius * 0.5, local),
              z: 0.1 + local * 0.6,
          }, 0.4 + local * 0.62, 0.22 + local * 0.7, 36);
      }
      return frame;
  }
  /** Builds `pulsing`: concentric signal rings expand, fade and immediately renew. */
  function ringsFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const rings = 4;
      const samples = Math.max(18, Math.round(30 * density));
      for (let ring = 0; ring < rings; ring += 1) {
          const progress = (time * 0.42 + ring / rings) % 1;
          const reach = radius * (0.16 + progress * 0.68);
          for (let index = 0; index < samples; index += 1) {
              const angle = (index / samples) * TAU;
              addDot(frame, { x: center + Math.cos(angle) * reach, y: center + Math.sin(angle) * reach, z: 0.7 - progress }, 0.28 + (1 - progress) * 0.52, 0.04 + Math.pow(1 - progress, 1.7) * 0.5, 284);
          }
      }
      addDot(frame, { x: center, y: center, z: 0.9 }, 1.12, 0.82, 284);
      return frame;
  }
  /** Builds `signaling`: broadcast waves fan outward from a live transmitter. */
  function signalFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const waves = 3;
      const samples = Math.max(12, Math.round(23 * density));
      for (let wave = 0; wave < waves; wave += 1) {
          const progress = (time * 0.64 + wave / waves) % 1;
          const reach = radius * (0.18 + progress * 0.62);
          for (let index = 0; index < samples; index += 1) {
              const angle = -Math.PI / 2 + ((index / (samples - 1)) * Math.PI) / 1.35;
              addDot(frame, { x: center + Math.cos(angle) * reach, y: center + Math.sin(angle) * reach, z: 0.6 - progress }, 0.3 + (1 - progress) * 0.58, 0.05 + Math.pow(1 - progress, 1.8) * 0.54, 322);
          }
      }
      return frame;
  }
  /** Builds `stepping`: a bright task hops through a five-stage staircase. */
  function stepsFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const count = 5;
      const active = (time * 1.1) % count;
      for (let step = 0; step < count; step += 1) {
          const x = center + (step - (count - 1) / 2) * radius * 0.3;
          const y = center + ((count - 1) / 2 - step) * radius * 0.22;
          const distance = Math.abs(active - step);
          const glow = Math.max(0.16, 1 - distance * 0.72);
          const dots = Math.max(3, Math.round(4 * density));
          for (let dot = 0; dot < dots; dot += 1) {
              addDot(frame, { x: x + (dot - 1.5) * radius * 0.055, y, z: glow - 0.2 }, 0.4 + glow * 0.8, 0.13 + glow * 0.76, 52 + step * 12);
          }
      }
      return frame;
  }
  /** Builds `streaming`: packets ride three fluid lanes that bend through the canvas. */
  function streamFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const lanes = Math.max(3, Math.min(7, Math.round(3 * density)));
      const packets = Math.max(4, Math.round(7 * density));
      for (let lane = 0; lane < lanes; lane += 1) {
          const offset = (lane - (lanes - 1) / 2) * ((radius * 0.72) / Math.max(1, lanes - 1));
          let previous;
          for (let sample = 0; sample <= 26; sample += 1) {
              const progress = sample / 26;
              const point = {
                  x: center + (progress - 0.5) * radius * 1.62,
                  y: center + offset + Math.sin(progress * TAU + lane * 1.4) * radius * 0.13,
                  z: -0.2,
              };
              if (previous)
                  addLine(frame, previous, point, 0.08, 0.2, 192 + lane * 14);
              previous = point;
          }
          for (let packet = 0; packet < packets; packet += 1) {
              const progress = (time * (0.36 + lane * 0.05) + packet / packets) % 1;
              addDot(frame, {
                  x: center + (progress - 0.5) * radius * 1.62,
                  y: center + offset + Math.sin(progress * TAU + lane * 1.4) * radius * 0.13,
                  z: 0.62,
              }, 0.62, 0.78, 192 + lane * 14);
          }
      }
      return frame;
  }
  /** Builds `equalizing`: compact equalizer bars respond with independent rhythmic heights. */
  function equalizerFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const bars = Math.max(6, Math.min(18, Math.round(9 * density)));
      for (let bar = 0; bar < bars; bar += 1) {
          const energy = 0.2 + Math.pow((Math.sin(time * (1.4 + (bar % 3) * 0.22) + bar * 1.7) + 1) / 2, 1.55) * 0.78;
          const count = Math.max(3, Math.round((3 + energy * 8) * density));
          const x = center + (bar - (bars - 1) / 2) * radius * 0.17;
          for (let dot = 0; dot < count; dot += 1) {
              const progress = dot / Math.max(1, count - 1);
              addDot(frame, { x, y: center + (0.5 - progress) * radius * energy * 1.28, z: progress }, 0.36 + progress * 0.58, 0.18 + progress * 0.72, 330 - bar * 8);
          }
      }
      return frame;
  }
  /** Builds `wiring`: signal packets route around a simple circuit-board trace. */
  function circuitboardFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const routes = [
          [
              { x: -0.68, y: -0.42 },
              { x: -0.12, y: -0.42 },
              { x: -0.12, y: 0.26 },
              { x: 0.64, y: 0.26 },
          ],
          [
              { x: -0.6, y: 0.46 },
              { x: 0.18, y: 0.46 },
              { x: 0.18, y: -0.34 },
              { x: 0.68, y: -0.34 },
          ],
          [
              { x: -0.7, y: 0.02 },
              { x: 0.02, y: 0.02 },
              { x: 0.02, y: 0.62 },
          ],
      ];
      routes.forEach((route, routeIndex) => {
          const points = route.map(({ x, y }) => ({ x: center + x * radius, y: center + y * radius, z: -0.1 }));
          for (let index = 1; index < points.length; index += 1)
              addLine(frame, points[index - 1], points[index], 0.12, 0.3, 156 + routeIndex * 22);
          points.forEach((point) => addDot(frame, point, 0.62, 0.42, 156 + routeIndex * 22));
          const packets = Math.max(1, Math.min(5, Math.round(density * 2)));
          for (let packet = 0; packet < packets; packet += 1) {
              const progress = (time * (0.34 + routeIndex * 0.06) + routeIndex * 0.23 + packet / packets) % 1;
              const segment = Math.min(points.length - 2, Math.floor(progress * (points.length - 1)));
              const local = (progress * (points.length - 1)) % 1;
              addDot(frame, {
                  x: lerp(points[segment].x, points[segment + 1].x, local),
                  y: lerp(points[segment].y, points[segment + 1].y, local),
                  z: 0.9,
              }, 1.12, 0.94, 156 + routeIndex * 22);
          }
      });
      return frame;
  }
  /** Builds `marqueeing`: a dotted rectangular perimeter with a lively chasing highlight. */
  function marqueeFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const segments = Math.max(28, Math.round(52 * density));
      for (let index = 0; index < segments; index += 1) {
          const progress = index / segments;
          const perimeter = progress * 4;
          const side = Math.floor(perimeter);
          const local = perimeter % 1;
          const halfWidth = radius * 0.72;
          const halfHeight = radius * 0.48;
          const point = side === 0
              ? { x: center - halfWidth + local * halfWidth * 2, y: center - halfHeight }
              : side === 1
                  ? { x: center + halfWidth, y: center - halfHeight + local * halfHeight * 2 }
                  : side === 2
                      ? { x: center + halfWidth - local * halfWidth * 2, y: center + halfHeight }
                      : { x: center - halfWidth, y: center + halfHeight - local * halfHeight * 2 };
          const distance = (time * 0.62 - progress + 1) % 1;
          const glow = Math.max(0, 1 - distance * 4.4);
          addDot(frame, { ...point, z: glow - 0.2 }, 0.3 + glow * 1.04, 0.12 + glow * 0.8, 18 + glow * 38);
      }
      return frame;
  }
  /** Builds `orbiting-dots`: three orbital dots trace separate ellipses with faint dotted paths. */
  function orbitdotsFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const orbits = [
          [0.7, 0.3, 0.0, 198],
          [0.52, 0.6, 2.1, 282],
          [0.32, 0.74, 4.2, 42],
      ];
      const samples = Math.max(18, Math.round(34 * density));
      orbits.forEach(([wide, tall, offset, tone]) => {
          for (let index = 0; index < samples; index += 1) {
              const angle = (index / samples) * TAU + offset;
              addDot(frame, { x: center + Math.cos(angle) * radius * wide, y: center + Math.sin(angle) * radius * tall, z: -0.25 }, 0.24, 0.14, tone);
          }
          const movers = Math.max(1, Math.round(density * 1.5));
          for (let mover = 0; mover < movers; mover += 1) {
              const angle = time * 1.16 + offset + (mover / movers) * TAU;
              addDot(frame, { x: center + Math.cos(angle) * radius * wide, y: center + Math.sin(angle) * radius * tall, z: 0.9 }, 1.1, 0.94, tone);
          }
      });
      return frame;
  }
  return { barsFrame, progressFrame, skeletonFrame, waveformFrame, gridFrame, radarFrame, hourglassFrame, ringsFrame, signalFrame, stepsFrame, streamFrame, equalizerFrame, circuitboardFrame, marqueeFrame, orbitdotsFrame };
  })();
  
  const mod_dataLoaders = (function () {
  const { addDot, addLine, createFrame, TAU } = mod_shared;
  const centerOf = (radius) => radius / 0.82;
  /** Builds `charting`: a compact live bar chart that redistributes its energy every beat. */
  function chartFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const columns = Math.max(7, Math.min(20, Math.round(11 * density)));
      for (let column = 0; column < columns; column += 1) {
          const wave = (Math.sin(time * 1.7 + column * 1.28) + 1) / 2;
          const detail = (Math.sin(time * 0.72 - column * 2.17) + 1) / 2;
          const height = 0.18 + (wave * 0.68 + detail * 0.22) * Math.sin(((column + 1) / (columns + 1)) * Math.PI);
          const dots = Math.max(3, Math.round((3 + height * 9) * density));
          const x = center + (column - (columns - 1) / 2) * radius * 0.145;
          for (let dot = 0; dot < dots; dot += 1) {
              const progress = dot / Math.max(1, dots - 1);
              addDot(frame, { x, y: center + (0.5 - progress) * radius * height * 1.5, z: progress * 0.65 }, 0.28 + progress * 0.52, 0.18 + progress * 0.68, 30 + column * 11);
          }
      }
      return frame;
  }
  /** Builds `plotting`: a continuous signal line with a travelling cursor and softly sampled history. */
  function plotFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const samples = Math.max(24, Math.round(58 * density));
      let previous;
      for (let index = 0; index < samples; index += 1) {
          const progress = index / (samples - 1);
          const x = center + (progress - 0.5) * radius * 1.58;
          const y = center +
              (Math.sin(progress * TAU * 1.42 + time * 1.2) * 0.28 + Math.sin(progress * TAU * 4.1 - time * 1.9) * 0.09) *
                  radius;
          const point = { x, y, z: 0.15 + Math.sin(progress * Math.PI) * 0.5 };
          if (previous)
              addLine(frame, previous, point, 0.13, 0.42, 188);
          if (index % 3 === 0)
              addDot(frame, point, 0.3, 0.28, 188);
          previous = point;
      }
      const head = (time * 0.22) % 1;
      const headX = center + (head - 0.5) * radius * 1.58;
      const headY = center +
          (Math.sin(head * TAU * 1.42 + time * 1.2) * 0.28 + Math.sin(head * TAU * 4.1 - time * 1.9) * 0.09) * radius;
      addLine(frame, { x: headX, y: center + radius * 0.62, z: -0.3 }, { x: headX, y: center - radius * 0.62, z: -0.3 }, 0.08, 0.28, 188);
      addDot(frame, { x: headX, y: headY, z: 0.95 }, 1.3, 0.98, 188);
      return frame;
  }
  /** Builds `sampling`: a moving scatter plot that collects bright observations around a trend. */
  function scatterFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const samples = Math.max(20, Math.round(42 * density));
      for (let index = 0; index < samples; index += 1) {
          const progress = index / Math.max(1, samples - 1);
          const drift = time * 0.18 + index * 0.47;
          const x = center + (progress - 0.5) * radius * 1.48 + Math.sin(drift * 2.1) * radius * 0.055;
          const trend = -0.35 + progress * 0.7;
          const spread = Math.sin(index * 8.37 + time * 1.35) * 0.19 + Math.sin(index * 2.11 - time) * 0.075;
          const pulse = (Math.sin(time * 2.2 + index * 1.4) + 1) / 2;
          addDot(frame, { x, y: center - (trend + spread) * radius, z: pulse * 0.72 - 0.1 }, 0.3 + pulse * 0.62, 0.2 + pulse * 0.64, 286 + (index % 3) * 16);
      }
      return frame;
  }
  /** Builds `forecasting`: observed data becomes a dotted projection that grows into the future. */
  function forecastFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const samples = Math.max(28, Math.round(56 * density));
      let previous;
      for (let index = 0; index < samples; index += 1) {
          const progress = index / (samples - 1);
          const observed = progress < 0.55;
          const local = observed ? progress / 0.55 : (progress - 0.55) / 0.45;
          const x = center + (progress - 0.5) * radius * 1.6;
          const y = observed
              ? center + Math.sin(local * TAU * 0.95 + time * 1.05) * radius * 0.27
              : center +
                  (Math.sin(TAU * 0.95 + time * 1.05) * 0.27 + local * local * 0.22 + Math.sin(local * 5 + time) * 0.045) *
                      radius;
          const point = { x, y, z: observed ? 0.46 : 0.12 + local * 0.2 };
          if (previous && observed)
              addLine(frame, previous, point, 0.15, 0.52, 154);
          if (!observed || index % 2 === 0)
              addDot(frame, point, observed ? 0.36 : 0.28 + local * 0.22, observed ? 0.54 : 0.16 + local * 0.36, observed ? 154 : 42);
          previous = point;
      }
      return frame;
  }
  /** Builds `metering`: a segmented dial whose measure and peak indicator continuously update. */
  function meterFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const segments = Math.max(24, Math.round(42 * density));
      const value = 0.34 + ((Math.sin(time * 1.05) + 1) / 2) * 0.56;
      const start = Math.PI * 0.78;
      const sweep = Math.PI * 1.44;
      for (let index = 0; index < segments; index += 1) {
          const progress = index / (segments - 1);
          const angle = start + progress * sweep;
          const active = progress <= value;
          const distance = Math.abs(progress - value);
          const glow = active ? 0.35 + Math.min(0.65, 1 - distance * 8) : 0.1;
          addDot(frame, { x: center + Math.cos(angle) * radius * 0.67, y: center + Math.sin(angle) * radius * 0.67, z: glow - 0.25 }, 0.31 + glow * 0.76, 0.08 + glow * 0.82, active ? 112 + progress * 68 : 210);
      }
      const angle = start + value * sweep;
      const needle = { x: center + Math.cos(angle) * radius * 0.5, y: center + Math.sin(angle) * radius * 0.5, z: 0.9 };
      addLine(frame, { x: center, y: center, z: 0 }, needle, 0.32, 0.78, 166);
      addDot(frame, { x: center, y: center, z: 0.92 }, 1.1, 0.96, 166);
      addDot(frame, needle, 0.72, 0.92, 166);
      return frame;
  }
  return { chartFrame, plotFrame, scatterFrame, forecastFrame, meterFrame };
  })();
  
  const mod_dataStudies = (function () {
  const { addDot, addLine, createFrame, lerp, TAU } = mod_shared;
  const centerOf = (radius) => radius / 0.82;
  /** Builds `heatmapping`: a live intensity matrix swept by a warm analysis cursor. */
  function heatmapFrame({ time, radius, density }) {
      const frame = createFrame();
      const c = centerOf(radius);
      const cols = Math.max(6, Math.round(8 * density));
      const rows = Math.max(5, Math.round(6 * density));
      for (let y = 0; y < rows; y += 1)
          for (let x = 0; x < cols; x += 1) {
              const value = (Math.sin(time * 1.2 + x * 1.9 + y * 0.7) + Math.sin(time * 0.6 - x * 0.4 + y * 2.1) + 2) / 4;
              addDot(frame, {
                  x: c + ((x - (cols - 1) / 2) * radius * 1.45) / cols,
                  y: c + ((y - (rows - 1) / 2) * radius * 1.2) / rows,
                  z: value,
              }, 0.35 + value * 0.95, 0.12 + value * 0.78, 215 - value * 185);
          }
      return frame;
  }
  /** Builds `candlesticking`: a market-style tape of rising and falling candle bodies. */
  function candlesFrame({ time, radius, density }) {
      const frame = createFrame();
      const c = centerOf(radius);
      const count = Math.max(7, Math.round(10 * density));
      for (let i = 0; i < count; i += 1) {
          const seed = Math.sin(i * 8.41);
          const open = Math.sin(time * 0.55 + i * 1.7) * 0.2;
          const close = open + Math.sin(time * 1.3 + i * 2.9) * 0.2;
          const x = c + ((i - (count - 1) / 2) * radius * 1.5) / count;
          addLine(frame, { x, y: c - (Math.max(open, close) + 0.23 + seed * 0.06) * radius, z: -0.1 }, { x, y: c - (Math.min(open, close) - 0.23 - seed * 0.06) * radius, z: -0.1 }, 0.15, 0.45, close >= open ? 144 : 8);
          for (let dot = 0; dot < 4; dot += 1) {
              const p = dot / 3;
              addDot(frame, { x, y: c - lerp(open, close, p) * radius, z: p }, 0.58, 0.7, close >= open ? 144 : 8);
          }
      }
      return frame;
  }
  /** Builds `graphing`: a node graph with travelling relationships between active entities. */
  function nodegraphFrame({ time, radius, density }) {
      const frame = createFrame();
      const c = centerOf(radius);
      const count = Math.max(7, Math.round(11 * density));
      const nodes = Array.from({ length: count }, (_, i) => ({
          x: c + Math.cos(i * 2.4 + time * 0.2) * radius * (0.3 + (i % 4) * 0.12),
          y: c + Math.sin(i * 1.7 - time * 0.25) * radius * (0.25 + (i % 3) * 0.14),
          z: (i % 3) * 0.2,
      }));
      nodes.forEach((node, i) => {
          const next = nodes[(i * 3 + 2) % count];
          addLine(frame, node, next, 0.1, 0.22, 194);
          const p = (time * 0.38 + i / count) % 1;
          addDot(frame, { x: lerp(node.x, next.x, p), y: lerp(node.y, next.y, p), z: 0.8 }, 0.64, 0.8, 194);
          addDot(frame, node, 0.75, 0.7, i % 2 ? 194 : 278);
      });
      return frame;
  }
  /** Builds `waterfalling`: layered event streams that cascade through a time-series display. */
  function waterfallFrame({ time, radius, density }) {
      const frame = createFrame();
      const c = centerOf(radius);
      const rows = Math.max(4, Math.round(6 * density));
      const samples = Math.max(14, Math.round(22 * density));
      for (let row = 0; row < rows; row += 1)
          for (let i = 0; i < samples; i += 1) {
              const p = i / samples;
              const energy = Math.max(0, Math.sin((p - time * 0.16 - row * 0.11) * TAU * 2));
              addDot(frame, {
                  x: c + (p - 0.5) * radius * 1.58,
                  y: c + (row - (rows - 1) / 2) * radius * 0.22 + energy * radius * 0.09,
                  z: energy,
              }, 0.26 + energy * 0.8, 0.1 + energy * 0.72, 200 + row * 18);
          }
      return frame;
  }
  /** Builds `clustering`: observations converge into shifting coloured groups. */
  function clustersFrame({ time, radius, density }) {
      const frame = createFrame();
      const c = centerOf(radius);
      const points = Math.max(20, Math.round(38 * density));
      for (let i = 0; i < points; i += 1) {
          const group = i % 3;
          const a = i * 2.4 + time * (group + 1) * 0.3;
          const cx = c + Math.cos(time * 0.4 + (group * TAU) / 3) * radius * 0.28;
          const cy = c + Math.sin(time * 0.36 + (group * TAU) / 3) * radius * 0.22;
          const spread = radius * (0.08 + (i % 7) * 0.018);
          addDot(frame, { x: cx + Math.cos(a) * spread, y: cy + Math.sin(a * 1.3) * spread, z: 0.2 + group * 0.2 }, 0.3 + (i % 3) * 0.12, 0.35 + (i % 5) * 0.08, [42, 184, 286][group]);
      }
      return frame;
  }
  /** Builds `indexing`: records snap into an illuminated, moving index strip. */
  function indexFrame({ time, radius, density }) {
      const frame = createFrame();
      const c = centerOf(radius);
      const count = Math.max(12, Math.round(22 * density));
      for (let i = 0; i < count; i += 1) {
          const p = (i / count + time * 0.23) % 1;
          const active = Math.pow(Math.max(0, Math.sin((p - 0.5) * Math.PI)), 5);
          addDot(frame, { x: c + (p - 0.5) * radius * 1.55, y: c + Math.sin(p * TAU * 2) * radius * 0.2, z: active }, 0.28 + active * 1, 0.13 + active * 0.8, 70 + active * 90);
      }
      return frame;
  }
  /** Builds `benchmarking`: competing score columns continuously race toward a new baseline. */
  function benchmarkFrame({ time, radius, density }) {
      const frame = createFrame();
      const c = centerOf(radius);
      const count = Math.max(4, Math.round(6 * density));
      for (let i = 0; i < count; i += 1) {
          const score = 0.24 + ((Math.sin(time * (0.8 + i * 0.09) + i * 1.7) + 1) / 2) * 0.62;
          const x = c + ((i - (count - 1) / 2) * radius * 1.38) / count;
          const dots = Math.max(3, Math.round(score * 9));
          for (let d = 0; d < dots; d += 1)
              addDot(frame, { x, y: c + (0.5 - d / Math.max(1, dots - 1)) * radius * score * 1.4, z: d / dots }, 0.58, 0.25 + (d / dots) * 0.65, 252 + i * 15);
      }
      return frame;
  }
  /** Builds `profiling`: a stacked execution profile with a bright scanning sample. */
  function profileFrame({ time, radius, density }) {
      const frame = createFrame();
      const c = centerOf(radius);
      const rows = Math.max(4, Math.round(6 * density));
      const head = (time * 0.28) % 1;
      for (let row = 0; row < rows; row += 1) {
          const width = 0.38 + ((Math.sin(time + row * 2) + 1) / 2) * 0.43;
          const y = c + (row - (rows - 1) / 2) * radius * 0.21;
          for (let i = 0; i < 18; i += 1) {
              const p = i / 17;
              if (p > width)
                  continue;
              const hot = Math.max(0, 1 - Math.abs(p / width - head) * 8);
              addDot(frame, { x: c + (p - 0.5) * radius * 1.62, y, z: hot }, 0.44 + hot * 0.68, 0.18 + hot * 0.7, 18 + row * 22);
          }
      }
      return frame;
  }
  /** Builds `binning`: a histogram re-bins incoming samples into evolving buckets. */
  function histogramFrame({ time, radius, density }) {
      const frame = createFrame();
      const c = centerOf(radius);
      const bins = Math.max(6, Math.round(9 * density));
      for (let i = 0; i < bins; i += 1) {
          const height = 0.15 + Math.pow((Math.sin(time * 1.15 + i * 1.9) + 1) / 2, 1.6) * 0.7;
          const x = c + ((i - (bins - 1) / 2) * radius * 1.48) / bins;
          for (let d = 0; d < Math.max(2, Math.round(height * 8)); d += 1)
              addDot(frame, { x, y: c + (0.5 - d / 6) * radius * height * 1.45, z: d / 8 }, 0.54, 0.22 + d * 0.08, 316 - i * 9);
      }
      return frame;
  }
  /** Builds `aggregating`: distributed values spiral into a central aggregate. */
  function aggregateFrame({ time, radius, density }) {
      const frame = createFrame();
      const c = centerOf(radius);
      const count = Math.max(18, Math.round(34 * density));
      for (let i = 0; i < count; i += 1) {
          const p = (time * 0.16 + i / count) % 1;
          const a = i * 2.4 + time * 0.72;
          const r = radius * (0.72 - p * 0.56);
          addDot(frame, { x: c + Math.cos(a + p * 4) * r, y: c + Math.sin(a + p * 4) * r, z: 1 - p }, 0.28 + (1 - p) * 0.72, 0.14 + (1 - p) * 0.72, 162);
      }
      return frame;
  }
  /** Builds `scrubbing`: a timeline playhead scrubs through independently sampled events. */
  function scrubberFrame({ time, radius, density }) {
      const frame = createFrame();
      const c = centerOf(radius);
      const head = (time * 0.3) % 1;
      const count = Math.max(18, Math.round(34 * density));
      for (let i = 0; i < count; i += 1) {
          const p = i / (count - 1);
          const hot = Math.max(0, 1 - Math.abs(p - head) * 7);
          addDot(frame, { x: c + (p - 0.5) * radius * 1.6, y: c + Math.sin(i * 2.7) * radius * 0.12, z: hot }, 0.42 + hot * 1.16, 0.14 + hot * 0.82, 38);
      }
      const x = c + (head - 0.5) * radius * 1.6;
      addLine(frame, { x, y: c - radius * 0.5, z: 0 }, { x, y: c + radius * 0.5, z: 0 }, 0.16, 0.72, 38);
      return frame;
  }
  /** Builds `telemetry`: concentric instrument rings broadcast changing readings. */
  function telemetryFrame({ time, radius, density }) {
      const frame = createFrame();
      const c = centerOf(radius);
      const rings = Math.max(2, Math.min(5, Math.round(2 + density)));
      const samples = Math.max(14, Math.round(22 * density));
      for (let ring = 0; ring < rings; ring += 1)
          for (let i = 0; i < samples; i += 1) {
              const p = i / samples;
              const pulse = Math.max(0, Math.sin(time * 1.2 - p * TAU * 2 - ring));
              const a = p * TAU;
              const r = radius * (0.18 + ring * 0.16);
              addDot(frame, { x: c + Math.cos(a) * r, y: c + Math.sin(a) * r, z: pulse }, 0.36 + pulse * 0.74, 0.08 + pulse * 0.76, 192 + ring * 24);
          }
      return frame;
  }
  /** Builds `polling`: repeated probes leave a tiny history of successful responses. */
  function pollingFrame({ time, radius, density }) {
      const frame = createFrame();
      const c = centerOf(radius);
      const count = Math.max(8, Math.round(14 * density));
      for (let i = 0; i < count; i += 1) {
          const age = (time * 0.48 + i / count) % 1;
          addDot(frame, { x: c + (age - 0.5) * radius * 1.54, y: c + Math.sin(age * TAU * 3 + i) * radius * 0.18, z: 1 - age }, 0.46 + (1 - age) * 0.78, 0.08 + Math.pow(1 - age, 2) * 0.82, 128);
      }
      return frame;
  }
  /** Builds `correlating`: two observation axes reveal a pulsing positive correlation. */
  function correlationFrame({ time, radius, density }) {
      const frame = createFrame();
      const c = centerOf(radius);
      const count = Math.max(18, Math.round(36 * density));
      for (let i = 0; i < count; i += 1) {
          const p = i / (count - 1);
          const noise = Math.sin(i * 8.2 + time * 1.1) * 0.13;
          addDot(frame, { x: c + (p - 0.5) * radius * 1.48, y: c - ((p - 0.5) * 0.85 + noise) * radius, z: 0.2 }, 0.5, 0.35 + (i % 4) * 0.1, i % 2 ? 206 : 296);
      }
      return frame;
  }
  /** Builds `routing`: packets choose among a small map of competing routes. */
  function flowmapFrame({ time, radius, density }) {
      const frame = createFrame();
      const c = centerOf(radius);
      const routeCount = Math.max(3, Math.min(7, Math.round(3 * density)));
      const routes = Array.from({ length: routeCount }, (_, route) => (route / Math.max(1, routeCount - 1) - 0.5) * 0.76);
      const packets = Math.max(2, Math.round(4 * density));
      routes.forEach((offset, route) => {
          let prev;
          for (let i = 0; i <= 18; i += 1) {
              const p = i / 18;
              const point = {
                  x: c + (p - 0.5) * radius * 1.6,
                  y: c + offset * radius + Math.sin(p * TAU + route) * radius * 0.11,
                  z: -0.2,
              };
              if (prev)
                  addLine(frame, prev, point, 0.08, 0.24, 174 + route * 28);
              prev = point;
          }
          for (let packet = 0; packet < packets; packet += 1) {
              const p = (time * (0.24 + route * 0.05) + packet / packets) % 1;
              addDot(frame, { x: c + (p - 0.5) * radius * 1.6, y: c + offset * radius + Math.sin(p * TAU + route) * radius * 0.11, z: 0.8 }, 0.68, 0.84, 174 + route * 28);
          }
      });
      return frame;
  }
  return { heatmapFrame, candlesFrame, nodegraphFrame, waterfallFrame, clustersFrame, indexFrame, benchmarkFrame, profileFrame, histogramFrame, aggregateFrame, scrubberFrame, telemetryFrame, pollingFrame, correlationFrame, flowmapFrame };
  })();
  
  const mod_shapeMetrics = (function () {
  /** Resolves a bounded count so density adds detail without making a frame unreasonably expensive. */
  function densityCount(context, rule) {
      return Math.max(rule.minimum, Math.min(rule.maximum, Math.round(rule.base * context.density)));
  }
  /** Resolves thickness while reserving a caller-defined gap to prevent adjacent marks from colliding. */
  function safeThickness(context, base, available, gap) {
      const multiplier = context.particleRadius ?? 1;
      return Math.max(0.4, Math.min(base * multiplier, Math.max(0.4, available - gap)));
  }
  /** Creates a stable segment gap from available circumference/width and requested density. */
  function safeGap(available, count, preferred = 2) {
      return Math.min(preferred, Math.max(0.6, (available / Math.max(1, count)) * 0.32));
  }
  return { densityCount, safeThickness, safeGap };
  })();
  
  const mod_dataBars = (function () {
  const { addLine, addRect, createFrame, smoothstep } = mod_shared;
  const { densityCount, safeThickness } = mod_shapeMetrics;
  const centerOf = (radius) => radius / 0.82;
  const wave = (time, index, speed, phase = 1) => (Math.sin(time * speed + index * phase) + 1) / 2;
  /** Builds `bar-charting`: a real column chart that continuously settles into a new data snapshot. */
  function barChartFrame({ time, radius, density, particleRadius }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const count = densityCount({ time, radius, density }, { base: 8, minimum: 6, maximum: 16 });
      const chartWidth = radius * 1.58;
      const baseline = center + radius * 0.52;
      const gap = chartWidth / count;
      addLine(frame, { x: center - chartWidth / 2, y: baseline, z: -0.5 }, { x: center + chartWidth / 2, y: baseline, z: -0.5 }, 0.18, 0.45, 216);
      for (let index = 0; index < count; index += 1) {
          const value = 0.18 + wave(time, index, 1.35, 1.61) * 0.67;
          const height = value * radius * 1.24;
          const width = safeThickness({ time, radius, density, particleRadius }, gap * 0.62, gap, gap * 0.18);
          const x = center - chartWidth / 2 + index * gap + (gap - width) / 2;
          addRect(frame, { x, y: baseline - height, width, height, z: value }, 0.32 + value * 0.62, 198 + index * 8);
          addRect(frame, { x, y: baseline - height - 1.4, width, height: 1.4, z: value + 0.1 }, 0.86, 198 + index * 8);
      }
      return frame;
  }
  /** Builds `comparing`: paired horizontal bars repeatedly trade the lead in a compact comparison table. */
  function comparisonFrame({ time, radius, density, particleRadius }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const rows = densityCount({ time, radius, density }, { base: 4, minimum: 3, maximum: 8 });
      const trackWidth = radius * 1.34;
      const centerGap = Math.max(2, trackWidth * 0.055);
      const halfTrack = (trackWidth - centerGap) / 2;
      const barHeight = safeThickness({ time, radius, density, particleRadius }, radius * 0.105, radius * 0.3, radius * 0.07);
      for (let row = 0; row < rows; row += 1) {
          const y = center + (row - (rows - 1) / 2) * radius * 0.3;
          const left = 0.24 + wave(time, row, 0.92, 1.77) * 0.56;
          const right = 0.24 + wave(time + 1.2, row, 1.1, 2.43) * 0.56;
          addRect(frame, { x: center - trackWidth / 2, y, width: trackWidth, height: barHeight, z: -0.8 }, 0.08, 220);
          addRect(frame, { x: center - trackWidth / 2, y, width: halfTrack * left, height: barHeight, z: left }, 0.78, 198);
          addRect(frame, { x: center + centerGap / 2, y, width: halfTrack * right, height: barHeight, z: right }, 0.78, 286);
      }
      return frame;
  }
  /** Builds `accumulating`: stacked segments re-balance themselves while a total steadily grows. */
  function stackedFrame({ time, radius, density, particleRadius }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const rows = densityCount({ time, radius, density }, { base: 4, minimum: 3, maximum: 8 });
      const totalWidth = radius * 1.52;
      const rowHeight = safeThickness({ time, radius, density, particleRadius }, radius * 0.15, radius * 0.31, radius * 0.07);
      const tones = [18, 42, 196, 278];
      for (let row = 0; row < rows; row += 1) {
          const y = center + (row - (rows - 1) / 2) * radius * 0.31;
          let cursor = center - totalWidth / 2;
          for (let segment = 0; segment < 4; segment += 1) {
              const raw = 0.22 + wave(time + row * 0.37, segment + row, 0.7 + segment * 0.11, 1.18) * 0.78;
              const total = 2.65 + Math.sin(time * 0.45 + row) * 0.3;
              const width = (raw / total) * totalWidth;
              addRect(frame, { x: cursor, y, width: Math.max(1, width - 1.5), height: rowHeight, z: segment * 0.2 }, 0.72, tones[segment]);
              cursor += width;
          }
      }
      return frame;
  }
  /** Builds `sequencing`: a timeline of task blocks moves beneath a precise scanning playhead. */
  function timelineFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const lanes = densityCount({ time, radius, density }, { base: 4, minimum: 3, maximum: 8 });
      const timelineWidth = radius * 1.58;
      const left = center - timelineWidth / 2;
      const head = (time * 0.18) % 1;
      for (let lane = 0; lane < lanes; lane += 1) {
          const y = center + (lane - (lanes - 1) / 2) * radius * 0.27;
          addRect(frame, { x: left, y, width: timelineWidth, height: 1, z: -0.8 }, 0.12, 212);
          for (let block = 0; block < 4; block += 1) {
              const start = (block * 0.29 + lane * 0.13) % 1;
              const width = 0.12 + ((lane + block) % 3) * 0.055;
              const activity = Math.max(0.22, 1 - Math.abs(head - (start + width / 2)) * 3.8);
              addRect(frame, {
                  x: left + start * timelineWidth,
                  y: y - radius * 0.045,
                  width: width * timelineWidth,
                  height: radius * 0.1,
                  z: activity,
              }, 0.22 + activity * 0.62, 176 + lane * 20);
          }
      }
      const x = left + head * timelineWidth;
      addRect(frame, { x: x - 0.65, y: center - radius * 0.58, width: 1.3, height: radius * 1.16, z: 1 }, 0.82, 42);
      return frame;
  }
  /** Builds `throughput`: packets appear as rectangular payloads and accelerate through a live transport lane. */
  function throughputFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const lanes = densityCount({ time, radius, density }, { base: 3, minimum: 2, maximum: 6 });
      const laneWidth = radius * 1.62;
      const left = center - laneWidth / 2;
      const packets = Math.max(3, Math.round(5 * density));
      for (let lane = 0; lane < lanes; lane += 1) {
          const y = center + (lane - (lanes - 1) / 2) * radius * 0.34;
          addRect(frame, { x: left, y, width: laneWidth, height: radius * 0.11, z: -0.7 }, 0.08, 210);
          for (let packet = 0; packet < packets; packet += 1) {
              const progress = (time * (0.26 + lane * 0.055) + packet / packets + lane * 0.19) % 1;
              const eased = smoothstep(progress);
              const width = radius * (0.085 + ((packet + lane) % 3) * 0.035);
              addRect(frame, { x: left + eased * (laneWidth - width), y: y - radius * 0.025, width, height: radius * 0.16, z: eased }, 0.32 + eased * 0.58, 148 + lane * 28);
          }
      }
      return frame;
  }
  return { barChartFrame, comparisonFrame, stackedFrame, timelineFrame, throughputFrame };
  })();
  
  const mod_dataCharts = (function () {
  const { addArc, addDot, addLine, addRect, createFrame, TAU } = mod_shared;
  const { densityCount, safeThickness } = mod_shapeMetrics;
  const centerOf = (radius) => radius / 0.82;
  const oscillate = (time, seed, speed = 1) => (Math.sin(time * speed + seed) + 1) / 2;
  /** Builds `summarizing`: a segmented donut chart gently redistributes a live total. */
  function donutFrame(context) {
      const frame = createFrame();
      const { time, radius } = context;
      const center = centerOf(radius);
      const segments = densityCount(context, { base: 4, minimum: 3, maximum: 10 });
      const step = TAU / segments;
      const gap = Math.min(0.038, step * 0.06);
      const thickness = safeThickness(context, radius * 0.16, radius * 0.3, radius * 0.05);
      const tones = [18, 44, 194];
      const activeSegment = (time * 0.48) % segments;
      const weights = Array.from({ length: segments }, (_, index) => {
          const distance = Math.min(Math.abs(index - activeSegment), segments - Math.abs(index - activeSegment));
          return 0.72 + Math.max(0, 1 - distance * 0.72) * 0.72;
      });
      const totalWeight = weights.reduce((total, weight) => total + weight, 0);
      let angle = -Math.PI / 2;
      for (let index = 0; index < segments; index += 1) {
          const span = (TAU - gap * segments) * (weights[index] / totalWeight);
          const startAngle = angle + gap / 2;
          addArc(frame, {
              x: center,
              y: center,
              radius: radius * 0.52,
              startAngle,
              endAngle: startAngle + span,
              width: thickness,
              z: index / segments,
              cap: 'butt',
          }, 0.82, tones[index % tones.length]);
          angle += span + gap;
      }
      addArc(frame, { x: center, y: center, radius: radius * 0.52, startAngle: 0, endAngle: TAU, width: thickness, z: -0.8 }, 0.08, 215);
      return frame;
  }
  /** Builds `gauging`: a mechanical instrument dial animates segmented readings, a target band, and a peak needle. */
  function gaugeFrame(context) {
      const frame = createFrame();
      const { time, radius } = context;
      const center = centerOf(radius);
      const start = Math.PI * 0.78;
      const sweep = Math.PI * 1.44;
      const value = 0.14 + oscillate(time, 0.2, 0.68) * 0.74;
      const target = 0.62 + oscillate(time, 2.1, 0.24) * 0.16;
      const ticks = densityCount(context, { base: 18, minimum: 12, maximum: 36 });
      const thickness = safeThickness(context, radius * 0.1, radius * 0.25, radius * 0.05);
      const dialY = center + radius * 0.08;
      const segmentStep = sweep / ticks;
      const segmentGap = Math.min(0.025, segmentStep * 0.22);
      for (let tick = 0; tick < ticks; tick += 1) {
          const progress = (tick + 0.5) / ticks;
          const active = Math.max(0, Math.min(1, (value - tick / ticks) * ticks));
          const tone = progress > target ? 18 : progress > target - 0.14 ? 48 : 196;
          addArc(frame, {
              x: center,
              y: dialY,
              radius: radius * 0.57,
              startAngle: start + tick * segmentStep + segmentGap,
              endAngle: start + (tick + 1) * segmentStep - segmentGap,
              width: thickness,
              z: active,
              cap: 'butt',
          }, 0.1 + active * 0.8, tone);
      }
      addArc(frame, {
          x: center,
          y: dialY,
          radius: radius * 0.7,
          startAngle: start + sweep * (target - 0.07),
          endAngle: start + sweep * (target + 0.07),
          width: Math.max(1, thickness * 0.36),
          z: 0.4,
          cap: 'butt',
      }, 0.8, 144);
      for (let tick = 0; tick <= ticks; tick += 1) {
          const angle = start + (tick / ticks) * sweep;
          const outer = radius * 0.72;
          const inner = outer - radius * (tick % 4 === 0 ? 0.09 : 0.052);
          addLine(frame, { x: center + Math.cos(angle) * inner, y: dialY + Math.sin(angle) * inner, z: -0.1 }, { x: center + Math.cos(angle) * outer, y: dialY + Math.sin(angle) * outer, z: -0.1 }, 0.34, tick % 4 === 0 ? 1.3 : 0.75, 214);
      }
      const angle = start + sweep * value;
      const needleX = center + Math.cos(angle) * radius * 0.5;
      const needleY = dialY + Math.sin(angle) * radius * 0.5;
      addLine(frame, { x: center, y: dialY, z: 0.2 }, { x: needleX, y: needleY, z: 0.9 }, 0.88, radius * 0.035, 42);
      const peakAngle = start + sweep * Math.max(value, target);
      addLine(frame, { x: center + Math.cos(peakAngle) * radius * 0.49, y: dialY + Math.sin(peakAngle) * radius * 0.49, z: 0.65 }, { x: center + Math.cos(peakAngle) * radius * 0.74, y: dialY + Math.sin(peakAngle) * radius * 0.74, z: 0.65 }, 0.92, 1.6, 48);
      addArc(frame, {
          x: center,
          y: dialY,
          radius: radius * 0.17,
          startAngle: 0,
          endAngle: TAU,
          width: Math.max(1.2, thickness * 0.32),
          z: 0.8,
      }, 0.62, 214);
      return frame;
  }
  /** Builds `funneling`: incoming stages compress toward one completed result. */
  function funnelFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const steps = Math.max(4, Math.round(5 * density));
      const height = (radius * 1.15) / steps;
      for (let step = 0; step < steps; step += 1) {
          const progress = step / Math.max(1, steps - 1);
          const width = radius * (1.36 - progress * 0.76) * (0.9 + oscillate(time, step * 1.31, 0.72) * 0.1);
          const x = center - width / 2;
          const y = center - radius * 0.57 + step * height;
          addRect(frame, { x, y, width, height: height * 0.72, z: progress }, 0.35 + progress * 0.5, 208 - step * 18);
      }
      return frame;
  }
  /** Builds `treemapping`: a shifting treemap partitions a dashboard into weighted live blocks. */
  function treemapFrame(context) {
      const frame = createFrame();
      const { time, radius } = context;
      const center = centerOf(radius);
      const left = center - radius * 0.72;
      const top = center - radius * 0.57;
      const width = radius * 1.44;
      const height = radius * 1.14;
      const leaves = densityCount(context, { base: 6, minimum: 4, maximum: 14 });
      const gap = Math.min(2, Math.max(0.6, radius * 0.05));
      const tones = [194, 276, 32, 152, 338, 72];
      const partition = (x, y, partitionWidth, partitionHeight, count, index, depth) => {
          if (count === 1) {
              const inset = Math.min(gap * 0.5, partitionWidth * 0.12, partitionHeight * 0.12);
              addRect(frame, {
                  x: x + inset,
                  y: y + inset,
                  width: Math.max(0.4, partitionWidth - inset * 2),
                  height: Math.max(0.4, partitionHeight - inset * 2),
                  z: 0.2 + (index / Math.max(1, leaves)) * 0.68,
              }, 0.56 + oscillate(time, index * 1.43, 0.72) * 0.28, tones[index % tones.length]);
              return;
          }
          // A stable uneven split keeps the treemap from resolving into repeated
          // 2×2 groups while still preserving a deterministic topology per density.
          const splitSeed = oscillate(0, index * 2.37 + depth * 1.91 + 1.1);
          const firstCount = Math.max(1, Math.min(count - 1, Math.round(count * (0.36 + splitSeed * 0.24))));
          const secondCount = count - firstCount;
          const preferred = firstCount / count;
          const ratio = Math.min(0.68, Math.max(0.32, preferred + (oscillate(time, index * 1.19 + depth, 0.42) - 0.5) * 0.16));
          // Keep the partition topology stable while the weighted split breathes.
          // Choosing from the live aspect ratio makes a branch abruptly flip axes
          // when its animated width and height briefly cross over.
          const horizontal = depth % 2 === 0;
          const span = horizontal ? partitionWidth : partitionHeight;
          const splitGap = Math.min(gap, span * 0.16);
          const firstSpan = Math.max(0.4, (span - splitGap) * ratio);
          const secondSpan = Math.max(0.4, span - splitGap - firstSpan);
          if (horizontal) {
              partition(x, y, firstSpan, partitionHeight, firstCount, index, depth + 1);
              partition(x + firstSpan + splitGap, y, secondSpan, partitionHeight, secondCount, index + firstCount, depth + 1);
              return;
          }
          partition(x, y, partitionWidth, firstSpan, firstCount, index, depth + 1);
          partition(x, y + firstSpan + splitGap, partitionWidth, secondSpan, secondCount, index + firstCount, depth + 1);
      };
      partition(left, top, width, height, leaves, 0, 0);
      return frame;
  }
  /** Builds `bubble-charting`: values share one circular packing field and continuously make room for the current leader. */
  function bubbleChartFrame({ time, radius, density, particleRadius }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const count = densityCount({ time, radius, density }, { base: 8, minimum: 4, maximum: 12 });
      const sizeMultiplier = particleRadius ?? 1;
      const boundary = radius * 0.68;
      const leader = (time * 0.3) % count;
      const weights = Array.from({ length: count }, (_, index) => {
          const distance = Math.min(Math.abs(index - leader), count - Math.abs(index - leader));
          return 0.48 + Math.max(0, 1 - distance * 0.78) * 1.15;
      });
      const totalWeight = weights.reduce((total, weight) => total + weight, 0);
      const bubbles = weights.map((weight, index) => {
          const angle = index * 2.399963229728653 + time * 0.035;
          const radial = Math.sqrt((index + 0.5) / count) * boundary * 0.66;
          return {
              x: center + Math.cos(angle) * radial,
              y: center + Math.sin(angle) * radial,
              radius: Math.sqrt((weight / totalWeight) * boundary * boundary * 0.62),
              weight,
              tone: [196, 278, 32, 48][index % 4],
          };
      });
      const gap = Math.max(1.1, radius * 0.025);
      for (let pass = 0; pass < 7; pass += 1) {
          for (let left = 0; left < bubbles.length; left += 1) {
              for (let right = left + 1; right < bubbles.length; right += 1) {
                  const dx = bubbles[right].x - bubbles[left].x;
                  const dy = bubbles[right].y - bubbles[left].y;
                  const distance = Math.hypot(dx, dy) || 0.001;
                  const minimum = bubbles[left].radius + bubbles[right].radius + gap;
                  if (distance >= minimum)
                      continue;
                  const shift = ((minimum - distance) / distance) * 0.5;
                  const moveX = dx * shift;
                  const moveY = dy * shift;
                  bubbles[left].x -= moveX;
                  bubbles[left].y -= moveY;
                  bubbles[right].x += moveX;
                  bubbles[right].y += moveY;
              }
          }
          for (const bubble of bubbles) {
              const dx = bubble.x - center;
              const dy = bubble.y - center;
              const distance = Math.hypot(dx, dy) || 0.001;
              const limit = boundary - bubble.radius - gap;
              if (distance > limit) {
                  bubble.x = center + (dx / distance) * limit;
                  bubble.y = center + (dy / distance) * limit;
              }
          }
      }
      addArc(frame, { x: center, y: center, radius: boundary, startAngle: 0, endAngle: TAU, width: 0.8, z: -0.8 }, 0.12, 214);
      const maximumWeight = Math.max(...weights);
      for (const bubble of bubbles) {
          const emphasis = bubble.weight / maximumWeight;
          addDot(frame, { x: bubble.x, y: bubble.y, z: emphasis }, bubble.radius / sizeMultiplier, 0.26 + emphasis * 0.64, bubble.tone);
      }
      return frame;
  }
  /** Builds `areamapping`: a continuous area chart rises and falls beneath an animated signal trace. */
  function areaFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const samples = Math.max(22, Math.round(42 * density));
      const chartWidth = radius * 1.58;
      const baseline = center + radius * 0.52;
      const step = chartWidth / Math.max(1, samples - 1);
      const barWidth = step + 0.6;
      let previous;
      for (let index = 0; index < samples; index += 1) {
          const progress = index / (samples - 1);
          const value = 0.18 +
              (Math.sin(progress * TAU * 1.55 - time * 1.2) * 0.23 +
                  Math.sin(progress * TAU * 3.3 + time * 0.68) * 0.11 +
                  0.34);
          const x = center - chartWidth / 2 + index * step;
          const y = baseline - value * radius * 1.35;
          addRect(frame, { x: x - barWidth / 2, y, width: barWidth, height: baseline - y, z: value }, 0.12 + value * 0.24, 184);
          const point = { x, y, z: value };
          if (previous)
              addLine(frame, previous, point, 0.8, 0.8, 184);
          previous = point;
      }
      return frame;
  }
  return { donutFrame, gaugeFrame, funnelFrame, treemapFrame, bubbleChartFrame, areaFrame };
  })();
  
  const mod_imageProcessing = (function () {
  const { addDot, addRect, createFrame } = mod_shared;
  const centerOf = (radius) => radius / 0.82;
  /** Builds `image-decoding`: encoded pixel blocks resolve in a diagonal wave into a readable image. */
  function imageDecodeFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const columns = Math.max(7, Math.round(9 * density));
      const rows = Math.max(6, Math.round(7 * density));
      const scan = (time * 0.27) % 1;
      for (let row = 0; row < rows; row += 1) {
          for (let column = 0; column < columns; column += 1) {
              const x = center + (column / Math.max(1, columns - 1) - 0.5) * radius * 1.45;
              const y = center + (row / Math.max(1, rows - 1) - 0.5) * radius * 1.18;
              const progress = (row / rows) * 0.42 + (column / columns) * 0.58;
              const decoded = Math.max(0, 1 - Math.abs(progress - scan) * 4.8);
              const image = (Math.sin(column * 1.82 + row * 0.74) + Math.cos(row * 1.33 - column * 0.48) + 2) / 4;
              addDot(frame, { x, y, z: decoded }, 0.3 + image * 0.58 + decoded * 0.42, 0.12 + image * 0.34 + decoded * 0.5, 194 + image * 86);
          }
      }
      return frame;
  }
  /** Builds `unblurring`: a diffuse image tightens from its edges into a crisp central signal. */
  function unblurFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const columns = Math.max(7, Math.round(9 * density));
      const rows = Math.max(7, Math.round(9 * density));
      const focus = (Math.sin(time * 0.72) + 1) / 2;
      for (let row = 0; row < rows; row += 1) {
          for (let column = 0; column < columns; column += 1) {
              const nx = column / Math.max(1, columns - 1) - 0.5;
              const ny = row / Math.max(1, rows - 1) - 0.5;
              const distance = Math.min(1, Math.hypot(nx, ny) * 2);
              const blur = (1 - focus) * distance;
              const x = center + (nx + Math.sin(row * 2.3 + time * 2) * blur * 0.12) * radius * 1.52;
              const y = center + (ny + Math.cos(column * 1.9 - time * 2) * blur * 0.12) * radius * 1.52;
              const sharpness = 1 - blur;
              addDot(frame, { x, y, z: sharpness }, 0.24 + sharpness * 0.82, 0.09 + sharpness * 0.74, 216 - sharpness * 72);
          }
      }
      addDot(frame, { x: center, y: center, z: 0.96 }, 1.52 + focus * 0.5, 0.9, 144);
      return frame;
  }
  /** Builds `rendering`: small tiles fill a frame in progressive passes, with the active pass glowing. */
  function renderFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const columns = Math.max(7, Math.round(10 * density));
      const rows = Math.max(6, Math.round(8 * density));
      const progress = (time * 0.23) % 1;
      for (let row = 0; row < rows; row += 1) {
          for (let column = 0; column < columns; column += 1) {
              const order = (row * columns + column) / (rows * columns);
              const completed = order < progress;
              const edge = Math.max(0, 1 - Math.abs(order - progress) * rows * 1.4);
              const x = center + (column / Math.max(1, columns - 1) - 0.5) * radius * 1.46;
              const y = center + (row / Math.max(1, rows - 1) - 0.5) * radius * 1.2;
              const tone = completed ? 166 : 222;
              addDot(frame, { x, y, z: completed ? 0.48 : -0.12 }, 0.3 + edge * 0.72, completed ? 0.2 + edge * 0.66 : 0.07, tone);
          }
      }
      return frame;
  }
  /** Builds `denoising`: noisy pixels settle behind a softly drifting clean field. */
  function denoiseFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const columns = Math.max(6, Math.round(8 * density));
      const rows = Math.max(6, Math.round(8 * density));
      const calm = (Math.sin(time * 0.74) + 1) / 2;
      const step = (radius * 1.42) / columns;
      const focusX = Math.sin(time * 0.38) * 0.22;
      const focusY = Math.cos(time * 0.31) * 0.18;
      for (let row = 0; row < rows; row += 1) {
          for (let column = 0; column < columns; column += 1) {
              const nx = column / Math.max(1, columns - 1) - 0.5;
              const ny = row / Math.max(1, rows - 1) - 0.5;
              const cleared = Math.max(0, 1 - Math.hypot(nx - focusX, ny - focusY) * 3.2);
              const residue = (1 - calm) * (1 - cleared * 0.8);
              const noise = residue * Math.sin(column * 5.3 + row * 2.1 + time * 2.4) * step * 0.26;
              const x = center + (column - columns / 2) * step + noise;
              const y = center + (row - rows / 2) * step + Math.cos(column * 2.4 - row * 4.1 + time * 2.2) * residue * step * 0.26;
              addRect(frame, { x, y, width: step * (0.58 + cleared * 0.16), height: step * (0.58 + cleared * 0.16), z: calm + cleared }, 0.1 + calm * 0.46 + cleared * 0.38, cleared > 0.56 ? 168 : 204);
          }
      }
      addDot(frame, { x: center + focusX * radius * 1.42, y: center + focusY * radius * 1.42, z: 1 }, 1.1, 0.86, 154);
      return frame;
  }
  /** Builds `upscaling`: coarse samples bloom into a crisp, continuous sub-pixel field. */
  function upscaleFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const columns = Math.max(6, Math.round(8 * density));
      const rows = Math.max(6, Math.round(8 * density));
      const detail = (Math.sin(time * 0.62) + 1) / 2;
      const step = (radius * 1.44) / columns;
      for (let row = 0; row < rows; row += 1) {
          for (let column = 0; column < columns; column += 1) {
              const x = center + (column - columns / 2) * step;
              const y = center + (row - rows / 2) * step;
              addDot(frame, { x, y, z: 0 }, 0.62 + (1 - detail) * 0.72, 0.18 + (1 - detail) * 0.48, 218);
              const substep = step * 0.22 * detail;
              for (let sub = 0; sub < 4; sub += 1) {
                  const offsetX = (sub % 2 ? 1 : -1) * substep;
                  const offsetY = (sub < 2 ? -1 : 1) * substep;
                  addDot(frame, { x: x + offsetX, y: y + offsetY, z: detail }, 0.24 + detail * 0.34, 0.08 + detail * 0.7, 178);
              }
          }
      }
      return frame;
  }
  /** Builds `segmenting`: image pixels softly organize into three distinct regions. */
  function segmentFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const columns = Math.max(7, Math.round(9 * density));
      const rows = Math.max(6, Math.round(8 * density));
      const step = (radius * 1.46) / columns;
      for (let row = 0; row < rows; row += 1) {
          for (let column = 0; column < columns; column += 1) {
              const x = center + (column - columns / 2) * step;
              const y = center + (row - rows / 2) * step;
              const region = Math.floor((Math.sin(column * 0.74 + time * 0.36) + Math.cos(row * 0.8 - time * 0.28) + 2) * 0.75) % 3;
              const pulse = (Math.sin(time * 0.8 + region * 1.8) + 1) / 2;
              addRect(frame, { x, y, width: step * 0.72, height: step * 0.72, z: pulse }, 0.2 + pulse * 0.46, [188, 244, 310][region]);
          }
      }
      return frame;
  }
  /** Builds `masking`: a soft active mask travels through a compact image field. */
  function maskFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const columns = Math.max(7, Math.round(9 * density));
      const rows = Math.max(6, Math.round(8 * density));
      const step = (radius * 1.46) / columns;
      const maskX = Math.sin(time * 0.52) * 0.28;
      const maskY = Math.cos(time * 0.44) * 0.2;
      for (let row = 0; row < rows; row += 1) {
          for (let column = 0; column < columns; column += 1) {
              const nx = column / Math.max(1, columns - 1) - 0.5;
              const ny = row / Math.max(1, rows - 1) - 0.5;
              const inside = Math.max(0, 1 - Math.hypot(nx - maskX, ny - maskY) * 3.1);
              const x = center + (column - columns / 2) * step;
              const y = center + (row - rows / 2) * step;
              addRect(frame, { x, y, width: step * 0.7, height: step * 0.7, z: inside }, 0.08 + inside * 0.8, inside > 0.45 ? 46 : 212);
          }
      }
      return frame;
  }
  /** Builds `inpainting`: a central missing patch restores in a softly rippling wave. */
  function inpaintFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const columns = Math.max(7, Math.round(9 * density));
      const rows = Math.max(7, Math.round(9 * density));
      const step = (radius * 1.46) / columns;
      const fill = (Math.sin(time * 0.58) + 1) / 2;
      for (let row = 0; row < rows; row += 1) {
          for (let column = 0; column < columns; column += 1) {
              const nx = column / Math.max(1, columns - 1) - 0.5;
              const ny = row / Math.max(1, rows - 1) - 0.5;
              const distance = Math.min(1, Math.hypot(nx, ny) * 2);
              const ripple = (Math.sin(distance * 12 - time * 1.45) + 1) / 2;
              const restored = Math.max(0, Math.min(1, (fill - distance * 0.48) * 2.2 + ripple * 0.16));
              const x = center + (column - columns / 2) * step;
              const y = center + (row - rows / 2) * step;
              addRect(frame, { x, y, width: step * 0.7, height: step * 0.7, z: restored }, 0.1 + restored * 0.72, 186);
          }
      }
      addDot(frame, { x: center, y: center, z: 1 }, 0.72 + fill * 0.74, 0.26 + fill * 0.66, 164);
      return frame;
  }
  /** Builds `interpolating`: observed chart points bridge a missing section as a calm dotted curve. */
  function interpolateFrame({ time, radius, density }) {
      const frame = createFrame();
      const center = centerOf(radius);
      const points = Math.max(22, Math.round(30 * density));
      const bridge = (Math.sin(time * 0.68) + 1) / 2;
      const valueAt = (p) => Math.sin(p * Math.PI * 2.1) * 0.27 + Math.cos(p * Math.PI * 5.1) * 0.09;
      for (let index = 0; index < points; index += 1) {
          const p = index / Math.max(1, points - 1);
          const inGap = p > 0.37 && p < 0.67;
          const x = center + (p - 0.5) * radius * 1.42;
          const y = center - valueAt(p) * radius;
          const confidence = inGap ? 0.12 + bridge * 0.66 : 0.58;
          addDot(frame, { x, y, z: confidence }, inGap ? 0.28 + bridge * 0.42 : 0.5, confidence, inGap ? 166 : 216);
          if (!inGap && index % 4 === 0)
              addDot(frame, { x, y, z: 0.9 }, 0.94, 0.92, 202);
      }
      return frame;
  }
  return { imageDecodeFrame, unblurFrame, renderFrame, denoiseFrame, upscaleFrame, segmentFrame, maskFrame, inpaintFrame, interpolateFrame };
  })();
  
  const mod_expansion = (function () {
  const { addArc, addDot, addLine, addRect, createFrame, TAU } = mod_shared;
  const { densityCount, safeThickness } = mod_shapeMetrics;
  const center = (radius) => radius / 0.82;
  const pulse = (time, seed = 0, speed = 1) => (Math.sin(time * speed + seed) + 1) / 2;
  function addWorkflowCard(frame, x, y, width, height, z, alpha, tone, time, variant, skeletonRows) {
      const patterns = [
          [0.72, 0.46, 0.62],
          [0.38, 0.74, 0.52],
          [0.6, 0.35, 0.7],
          [0.48, 0.67, 0.42],
      ];
      const pattern = patterns[variant % patterns.length];
      const breath = 0.78 + (Math.sin(time * 1.7 + variant * 1.13) + 1) * 0.11;
      addRect(frame, { x, y, width, height, z }, alpha * 0.48 * breath);
      if (variant % 4 === 0) {
          addDot(frame, { x: x + width * 0.2, y: y + height * 0.23, z: z + 0.03 }, height * 0.09, alpha * 0.32);
      }
      else if (variant % 4 === 1) {
          for (let control = 0; control < 3; control += 1) {
              addRect(frame, {
                  x: x + width * (0.18 + control * 0.2),
                  y: y + height * 0.2,
                  width: width * 0.13,
                  height: height * 0.1,
                  z: z + 0.03,
              }, alpha * 0.26);
          }
      }
      else if (variant % 4 === 2) {
          addRect(frame, { x: x + width * 0.18, y: y + height * 0.16, width: width * 0.26, height: height * 0.15, z: z + 0.03 }, alpha * 0.26);
          addRect(frame, { x: x + width * 0.5, y: y + height * 0.16, width: width * 0.32, height: height * 0.15, z: z + 0.03 }, alpha * 0.2);
      }
      else {
          addRect(frame, { x: x + width * 0.18, y: y + height * 0.16, width: width * 0.18, height: height * 0.15, z: z + 0.03 }, alpha * 0.24);
          addRect(frame, { x: x + width * 0.42, y: y + height * 0.16, width: width * 0.4, height: height * 0.15, z: z + 0.03 }, alpha * 0.22);
      }
      const rowHeight = height / (skeletonRows + 2);
      for (let row = 0; row < skeletonRows; row += 1) {
          const length = width * pattern[row % pattern.length];
          const left = x + width * 0.18;
          const top = y + rowHeight * (row + 1.1);
          const skeletonHeight = Math.max(0.8, rowHeight * 0.2);
          addRect(frame, { x: left, y: top, width: length, height: skeletonHeight, z: z + 0.01 }, alpha * (0.26 + row * 0.045));
          const stripeWidth = Math.max(1.4, length * 0.24);
          const stripeX = left + ((time * 0.58 + variant * 0.19 + row * 0.13) % 1) * (length + stripeWidth) - stripeWidth;
          const highlightLeft = Math.max(left, stripeX);
          const highlightRight = Math.min(left + length, stripeX + stripeWidth);
          if (highlightRight > highlightLeft) {
              addRect(frame, { x: highlightLeft, y: top, width: highlightRight - highlightLeft, height: skeletonHeight, z: z + 0.02 }, Math.min(1, alpha * 0.92));
          }
      }
      addRect(frame, { x: x + width * 0.08, y: y + height * 0.12, width: width * 0.06, height: height * 0.76, z: z + 0.02 }, alpha * 0.75, tone);
  }
  function addWorkflowConnector(frame, from, to, progress, tone) {
      const bend = Math.max(8, Math.abs(to.x - from.x) * 0.46);
      const controls = [
          { x: from.x + bend, y: from.y, z: from.z },
          { x: to.x - bend, y: to.y, z: to.z },
      ];
      const pointAt = (t) => {
          const inverse = 1 - t;
          return {
              x: inverse ** 3 * from.x +
                  3 * inverse ** 2 * t * controls[0].x +
                  3 * inverse * t ** 2 * controls[1].x +
                  t ** 3 * to.x,
              y: inverse ** 3 * from.y +
                  3 * inverse ** 2 * t * controls[0].y +
                  3 * inverse * t ** 2 * controls[1].y +
                  t ** 3 * to.y,
              z: inverse ** 3 * from.z +
                  3 * inverse ** 2 * t * controls[0].z +
                  3 * inverse * t ** 2 * controls[1].z +
                  t ** 3 * to.z,
          };
      };
      let previous = pointAt(0);
      const segments = 12;
      for (let segment = 1; segment <= segments; segment += 1) {
          const point = pointAt(segment / segments);
          addLine(frame, previous, point, 0.32, 0.72, 214);
          previous = point;
      }
      const packet = pointAt(progress);
      addRect(frame, { x: packet.x - 1.9, y: packet.y - 1.35, width: 3.8, height: 2.7, z: 1.3 }, 0.92, tone);
  }
  /** Draws an indeterminate download channel that fills in successive blocks. */
  function downloadFrame({ time, radius, density, particleRadius }) {
      const frame = createFrame();
      const c = center(radius);
      const count = densityCount({ time, radius, density }, { base: 8, minimum: 5, maximum: 15 });
      const gap = (radius * 1.45) / count;
      for (let i = 0; i < count; i += 1) {
          const p = (time * 0.38 + i / count) % 1;
          addRect(frame, {
              x: c - radius * 0.72 + i * gap,
              y: c - radius * 0.1,
              width: safeThickness({ time, radius, density, particleRadius }, gap * 0.68, gap, 1),
              height: radius * (0.16 + p * 0.18),
              z: p,
          }, 0.2 + p * 0.7, 200);
      }
      return frame;
  }
  /** Draws a retry loop whose incomplete ring repeatedly regains confidence. */
  function retryFrame({ time, radius, particleRadius }) {
      const frame = createFrame();
      const c = center(radius);
      // Retries gather confidence, then release it. A cosine cycle avoids a hard reset at 100%.
      const progress = (1 - Math.cos(time * 0.46 * TAU)) / 2;
      const width = safeThickness({ time, radius, density: 1, particleRadius }, radius * 0.12, radius * 0.3, radius * 0.05);
      addArc(frame, { x: c, y: c, radius: radius * 0.54, startAngle: 0, endAngle: TAU, width, z: -0.5 }, 0.1, 210);
      addArc(frame, {
          x: c,
          y: c,
          radius: radius * 0.54,
          startAngle: -Math.PI / 2,
          endAngle: -Math.PI / 2 + progress * TAU * 0.82,
          width,
          z: progress,
      }, 0.9, 26);
      return frame;
  }
  /** Draws a scanner sweep through a bounded inspection field. */
  function scannerFrame({ time, radius, density, particleRadius }) {
      const frame = createFrame();
      const c = center(radius);
      const lines = densityCount({ time, radius, density }, { base: 7, minimum: 5, maximum: 13 });
      // Sweep back through the field instead of teleporting from its lower edge to the top.
      const sweep = (1 - Math.cos(time * 0.4 * TAU)) / 2;
      const y = c - radius * 0.55 + sweep * radius * 1.1;
      for (let i = 0; i < lines; i += 1)
          addRect(frame, {
              x: c - radius * 0.72,
              y: c - radius * 0.55 + (i * radius * 1.1) / lines,
              width: radius * 1.44,
              height: 0.7,
              z: -0.6,
          }, 0.09, 205);
      addRect(frame, {
          x: c - radius * 0.72,
          y,
          width: radius * 1.44,
          height: safeThickness({ time, radius, density, particleRadius }, radius * 0.045, radius * 0.12, 0.8),
          z: 1,
      }, 0.85, 178);
      return frame;
  }
  /** Draws source-like blocks that settle into a compiled arrangement. */
  function compileFrame({ time, radius, density, particleRadius }) {
      const frame = createFrame();
      const c = center(radius);
      const rows = densityCount({ time, radius, density }, { base: 5, minimum: 3, maximum: 9 });
      const rowPitch = (radius * 1.04) / rows;
      const h = safeThickness({ time, radius, density, particleRadius }, radius * 0.1, rowPitch, Math.min(radius * 0.05, rowPitch * 0.22));
      for (let row = 0; row < rows; row += 1) {
          const done = pulse(time, row * 1.8, 0.8);
          addRect(frame, {
              x: c - radius * 0.68,
              y: c - radius * 0.52 + (row * radius * 1.04) / rows,
              width: radius * (0.34 + done * 0.95),
              height: h,
              z: done,
          }, 0.3 + done * 0.6, 200 + row * 8);
      }
      return frame;
  }
  /** Draws pagination markers that advance through a moving active page. */
  function paginationFrame({ time, radius, density, particleRadius }) {
      const frame = createFrame();
      const c = center(radius);
      const pages = densityCount({ time, radius, density }, { base: 6, minimum: 4, maximum: 12 });
      const step = (radius * 1.45) / pages;
      const active = (time * 0.65) % pages;
      for (let i = 0; i < pages; i += 1) {
          const hot = Math.max(0, 1 - Math.abs(i - active));
          const size = safeThickness({ time, radius, density, particleRadius }, step * (0.38 + hot * 0.24), step, step * 0.22);
          addRect(frame, { x: c - radius * 0.72 + i * step, y: c - size / 2, width: size, height: size, z: hot }, 0.22 + hot * 0.72, 30);
      }
      return frame;
  }
  /** Draws weighted flows travelling across a compact Sankey-style system. */
  function sankeyFrame({ time, radius, density }) {
      const frame = createFrame();
      const c = center(radius);
      const flows = densityCount({ time, radius, density }, { base: 4, minimum: 3, maximum: 8 });
      for (let i = 0; i < flows; i += 1) {
          const y1 = c + (i - (flows - 1) / 2) * radius * 0.22;
          const y2 = c + Math.sin(i * 2.1) * radius * 0.34;
          const left = { x: c - radius * 0.65, y: y1, z: -0.2 };
          const right = { x: c + radius * 0.65, y: y2, z: 0.2 };
          addLine(frame, left, right, 0.2, radius * (0.025 + (i % 3) * 0.018), 174 + i * 22);
          const p = (time * (0.22 + i * 0.035) + i / flows) % 1;
          addDot(frame, { x: left.x + (right.x - left.x) * p, y: left.y + (right.y - left.y) * p, z: 0.8 }, 0.6, 0.88, 174 + i * 22);
      }
      return frame;
  }
  /** Draws a radar plot that breathes between several measured axes. */
  function radarPlotFrame({ time, radius, density }) {
      const frame = createFrame();
      const c = center(radius);
      const axes = densityCount({ time, radius, density }, { base: 6, minimum: 4, maximum: 10 });
      const points = [];
      for (let i = 0; i < axes; i += 1) {
          const a = -Math.PI / 2 + (i * TAU) / axes;
          const value = 0.3 + pulse(time, i * 1.4, 0.75) * 0.52;
          const point = { x: c + Math.cos(a) * radius * value, y: c + Math.sin(a) * radius * value, z: value };
          points.push(point);
          addLine(frame, { x: c, y: c, z: -0.4 }, { x: c + Math.cos(a) * radius * 0.76, y: c + Math.sin(a) * radius * 0.76, z: -0.4 }, 0.12, 0.45, 210);
      }
      points.forEach((point, i) => {
          addLine(frame, point, points[(i + 1) % axes], 0.62, 1, 184);
          addDot(frame, point, 0.75, 0.88, 184);
      });
      return frame;
  }
  /** Draws a live Gantt chart of parallel scheduled work. */
  function ganttFrame({ time, radius, density, particleRadius }) {
      const frame = createFrame();
      const c = center(radius);
      const lanes = densityCount({ time, radius, density }, { base: 4, minimum: 3, maximum: 8 });
      const h = safeThickness({ time, radius, density, particleRadius }, radius * 0.1, radius * 0.25, radius * 0.06);
      for (let lane = 0; lane < lanes; lane += 1)
          for (let task = 0; task < 3; task += 1) {
              const start = (task * 0.29 + lane * 0.13 + time * 0.04) % 1;
              const width = radius * (0.22 + ((task + lane) % 3) * 0.11);
              addRect(frame, {
                  x: c - radius * 0.72 + start * radius * 1.44,
                  y: c - radius * 0.5 + (lane * radius) / lanes,
                  width,
                  height: h,
                  z: task * 0.2,
              }, 0.5 + task * 0.12, 180 + lane * 13);
          }
      return frame;
  }
  /** Draws an activity calendar with a travelling intensity wave. */
  function calendarFrame({ time, radius, density, particleRadius }) {
      const frame = createFrame();
      const c = center(radius);
      const cols = densityCount({ time, radius, density }, { base: 7, minimum: 5, maximum: 12 });
      const rows = densityCount({ time, radius, density }, { base: 4, minimum: 3, maximum: 7 });
      const cell = (radius * 1.42) / Math.max(cols, rows);
      const side = safeThickness({ time, radius, density, particleRadius }, cell * 0.72, cell, cell * 0.18);
      for (let y = 0; y < rows; y += 1)
          for (let x = 0; x < cols; x += 1) {
              const value = pulse(time, x * 0.91 + y * 1.63, 0.9);
              addRect(frame, {
                  x: c - (cols * cell) / 2 + x * cell,
                  y: c - (rows * cell) / 2 + y * cell,
                  width: side,
                  height: side,
                  z: value,
              }, 0.12 + value * 0.72, 110 + value * 80);
          }
      return frame;
  }
  /** Draws a target-measuring bullet chart with animated actual and threshold marks. */
  function bulletFrame({ time, radius, particleRadius }) {
      const frame = createFrame();
      const c = center(radius);
      const actual = 0.35 + pulse(time, 0.3, 0.8) * 0.48;
      const target = 0.65 + pulse(time, 1.8, 0.55) * 0.18;
      const h = safeThickness({ time, radius, density: 1, particleRadius }, radius * 0.18, radius * 0.38, radius * 0.08);
      addRect(frame, { x: c - radius * 0.72, y: c - h / 2, width: radius * 1.44, height: h, z: -0.5 }, 0.1, 215);
      addRect(frame, { x: c - radius * 0.72, y: c - h / 2, width: radius * 1.44 * actual, height: h, z: actual }, 0.82, 196);
      addRect(frame, { x: c - radius * 0.72 + radius * 1.44 * target, y: c - radius * 0.27, width: 2, height: radius * 0.54, z: 1 }, 0.9, 36);
      return frame;
  }
  /** Draws a compact animated box plot with changing whiskers and quartiles. */
  function boxPlotFrame({ time, radius, particleRadius }) {
      const frame = createFrame();
      const c = center(radius);
      const low = 0.14 + pulse(time, 0, 0.7) * 0.16;
      const q1 = 0.3 + pulse(time, 1, 0.6) * 0.12;
      const q3 = 0.6 + pulse(time, 2, 0.65) * 0.12;
      const high = 0.82 + pulse(time, 3, 0.5) * 0.1;
      const x = (p) => c - radius * 0.72 + p * radius * 1.44;
      const h = safeThickness({ time, radius, density: 1, particleRadius }, radius * 0.22, radius * 0.5, radius * 0.1);
      addLine(frame, { x: x(low), y: c, z: 0 }, { x: x(high), y: c, z: 0 }, 0.45, 1, 210);
      addRect(frame, { x: x(q1), y: c - h / 2, width: x(q3) - x(q1), height: h, z: 0.5 }, 0.68, 276);
      addLine(frame, { x: x((q1 + q3) / 2), y: c - h / 2, z: 0.8 }, { x: x((q1 + q3) / 2), y: c + h / 2, z: 0.8 }, 0.9, 1.5, 32);
      return frame;
  }
  /** Draws packets dispatched into several outbound channels. */
  function dispatchFrame({ time, radius, density }) {
      const frame = createFrame();
      const c = center(radius);
      const lanes = densityCount({ time, radius, density }, { base: 4, minimum: 3, maximum: 8 });
      for (let i = 0; i < lanes; i += 1) {
          const y = c + (i - (lanes - 1) / 2) * radius * 0.23;
          addLine(frame, { x: c - radius * 0.65, y: c, z: -0.2 }, { x: c + radius * 0.65, y, z: -0.2 }, 0.16, 0.5, 196);
          const p = (time * 0.42 + i / lanes) % 1;
          addDot(frame, { x: c - radius * 0.65 + p * radius * 1.3, y: c + (y - c) * p, z: 0.8 }, 0.78, 0.88, 196);
      }
      return frame;
  }
  /** Draws a low-code batch workflow: skeleton cards rearrange, split into parallel work, merge, then dispatch. */
  function batchFrame({ time, radius, density, particleRadius }) {
      const frame = createFrame();
      const c = center(radius);
      const cardWidth = safeThickness({ time, radius, density, particleRadius }, radius * 0.25, radius * 0.36, radius * 0.07);
      const cardHeight = radius * 0.22;
      const layoutTime = time * 0.16;
      const layoutIndex = Math.floor(layoutTime) % 3;
      const transition = layoutTime % 1;
      const ease = transition * transition * (3 - 2 * transition);
      const skeletonRows = densityCount({ time, radius, density }, { base: 3, minimum: 2, maximum: 5 });
      const branches = densityCount({ time, radius, density }, { base: 2, minimum: 1, maximum: 4 });
      const branchStart = 2;
      const merge = branchStart + branches;
      const output = merge + 1;
      const layoutPosition = (layout, index) => {
          const branch = index - branchStart;
          const spread = branches === 1 ? 0 : (branch / (branches - 1) - 0.5) * 0.86;
          if (layout === 0) {
              if (index === 0)
                  return [-0.8, 0];
              if (index === 1)
                  return [-0.46, 0];
              if (index === merge)
                  return [0.42, 0];
              if (index === output)
                  return [0.78, 0];
              return [-0.03, spread];
          }
          if (layout === 1) {
              if (index === 0)
                  return [-0.8, 0.3];
              if (index === 1)
                  return [-0.46, -0.15];
              if (index === merge)
                  return [0.42, 0.18];
              if (index === output)
                  return [0.78, -0.12];
              return [-0.04 + (branch % 2 ? -0.05 : 0.05), -spread * 0.78 - 0.1];
          }
          if (index === 0)
              return [-0.8, -0.28];
          if (index === 1)
              return [-0.46, 0.2];
          if (index === merge)
              return [0.42, -0.2];
          if (index === output)
              return [0.78, 0.24];
          return [-0.02 + (branch % 2 ? 0.08 : -0.08), spread * 0.64 + (branch % 2 ? 0.08 : -0.08)];
      };
      const cards = Array.from({ length: output + 1 }, (_, index) => {
          const current = layoutPosition(layoutIndex, index);
          const next = layoutPosition((layoutIndex + 1) % 3, index);
          const response = Math.sin(time * 1.35 - index * 0.86) * radius * 0.018;
          return {
              x: c + (current[0] + (next[0] - current[0]) * ease) * radius - cardWidth / 2 + response,
              y: c +
                  (current[1] + (next[1] - current[1]) * ease) * radius -
                  cardHeight / 2 +
                  response * (index % 2 ? -0.65 : 0.65),
              z: index * 0.08,
          };
      });
      const links = [
          [0, 1],
          ...Array.from({ length: branches }, (_, branch) => [1, branchStart + branch]),
          ...Array.from({ length: branches }, (_, branch) => [branchStart + branch, merge]),
          [merge, output],
      ];
      links.forEach(([source, target], index) => {
          const from = { x: cards[source].x + cardWidth, y: cards[source].y + cardHeight / 2, z: cards[source].z };
          const to = { x: cards[target].x, y: cards[target].y + cardHeight / 2, z: cards[target].z };
          addWorkflowConnector(frame, from, to, (time * 0.46 + index * 0.19) % 1, index === 5 ? 48 : index % 2 ? 196 : 32);
      });
      cards.forEach((card, index) => {
          const active = Math.max(0, Math.sin(time * 0.78 - index * 0.95));
          const tone = index === output ? 48 : index >= branchStart && index < merge ? 196 : 214;
          addWorkflowCard(frame, card.x, card.y, cardWidth, cardHeight, card.z, 0.3 + active * 0.54, tone, time, index, skeletonRows);
      });
      return frame;
  }
  /** Draws a checkpoint route where a courier confirms each reached stage before continuing. */
  function checkpointFrame({ time, radius, density }) {
      const frame = createFrame();
      const c = center(radius);
      const checks = densityCount({ time, radius, density }, { base: 5, minimum: 3, maximum: 9 });
      const progress = (time * 0.26) % 1;
      const active = progress * (checks - 1);
      const pointAt = (index) => {
          const p = index / Math.max(1, checks - 1);
          return { x: c - radius * 0.7 + p * radius * 1.4, y: c + Math.sin(p * Math.PI * 2.1) * radius * 0.28, z: p };
      };
      for (let i = 0; i < checks; i += 1) {
          const point = pointAt(i);
          if (i)
              addLine(frame, pointAt(i - 1), point, 0.2, 0.68, 214);
          const completed = Math.max(0, Math.min(1, active - i + 1));
          addArc(frame, {
              x: point.x,
              y: point.y,
              radius: radius * 0.07,
              startAngle: -Math.PI / 2,
              endAngle: -Math.PI / 2 + TAU * completed,
              width: 1.4,
              z: completed,
          }, 0.24 + completed * 0.7, completed ? 144 : 214);
          if (completed > 0.96) {
              addLine(frame, { x: point.x - radius * 0.026, y: point.y, z: 1 }, { x: point.x - radius * 0.004, y: point.y + radius * 0.025, z: 1 }, 0.92, 1.2, 144);
              addLine(frame, { x: point.x - radius * 0.004, y: point.y + radius * 0.025, z: 1 }, { x: point.x + radius * 0.038, y: point.y - radius * 0.035, z: 1 }, 0.92, 1.2, 144);
          }
      }
      const lower = Math.floor(active);
      const local = active - lower;
      const from = pointAt(lower);
      const to = pointAt(Math.min(checks - 1, lower + 1));
      addDot(frame, { x: from.x + (to.x - from.x) * local, y: from.y + (to.y - from.y) * local, z: 1 }, 1.1, 0.94, 38);
      return frame;
  }
  /** Draws ranked work cards whose leading priority rises to the front. */
  function priorityFrame({ time, radius, density, particleRadius }) {
      const frame = createFrame();
      const c = center(radius);
      const cards = densityCount({ time, radius, density }, { base: 4, minimum: 3, maximum: 7 });
      const cardPitch = (radius * 1.04) / cards;
      const h = safeThickness({ time, radius, density, particleRadius }, radius * 0.13, cardPitch, Math.min(radius * 0.06, cardPitch * 0.22));
      for (let i = 0; i < cards; i += 1) {
          const score = pulse(time, i * 1.7, 0.7);
          addRect(frame, {
              x: c - radius * 0.64,
              y: c - radius * 0.52 + (i * radius * 1.04) / cards,
              width: radius * (0.3 + score * 0.95),
              height: h,
              z: score,
          }, 0.3 + score * 0.6, 22 + i * 18);
      }
      return frame;
  }
  /** Draws a verification trace that lights each proof point in sequence. */
  function verifyFrame({ time, radius, density }) {
      const frame = createFrame();
      const c = center(radius);
      const checks = densityCount({ time, radius, density }, { base: 5, minimum: 3, maximum: 10 });
      for (let i = 0; i < checks; i += 1) {
          const p = i / Math.max(1, checks - 1);
          const y = c + Math.sin(p * TAU * 1.2) * radius * 0.24;
          const hot = pulse(time, i * 1.2, 0.9);
          addDot(frame, { x: c - radius * 0.68 + p * radius * 1.36, y, z: hot }, 0.5 + hot * 0.55, 0.3 + hot * 0.6, 142);
      }
      return frame;
  }
  /** Draws a weight on a smooth pendulum arc. */
  function pendulumFrame({ time, radius }) {
      const frame = createFrame();
      const c = center(radius);
      const angle = Math.sin(time * 1.25) * 0.72;
      const end = { x: c + Math.sin(angle) * radius * 0.62, y: c + Math.cos(angle) * radius * 0.62, z: 0.7 };
      addLine(frame, { x: c, y: c - radius * 0.56, z: -0.2 }, end, 0.52, 1, 36);
      addDot(frame, end, 1.35, 0.9, 36);
      return frame;
  }
  /** Draws calm particles drifting across a small invisible current. */
  function driftFrame({ time, radius, density }) {
      const frame = createFrame();
      const c = center(radius);
      const count = densityCount({ time, radius, density }, { base: 18, minimum: 10, maximum: 38 });
      for (let i = 0; i < count; i += 1) {
          const p = (time * (0.08 + (i % 4) * 0.025) + i / count) % 1;
          addDot(frame, { x: c - radius * 0.75 + p * radius * 1.5, y: c + Math.sin(i * 2.4 + time * 0.5) * radius * 0.35, z: p }, 0.4 + p * 0.58, 0.1 + p * 0.55, 202);
      }
      return frame;
  }
  /** Draws a soft rainfall field with passing illuminated drops. */
  function rainFrame({ time, radius, density }) {
      const frame = createFrame();
      const c = center(radius);
      const drops = densityCount({ time, radius, density }, { base: 20, minimum: 12, maximum: 42 });
      for (let i = 0; i < drops; i += 1) {
          const p = (time * (0.32 + (i % 3) * 0.06) + i / drops) % 1;
          const x = c - radius * 0.72 + ((i * 1.71) % 1) * radius * 1.44;
          const y = c - radius * 0.72 + p * radius * 1.44;
          addLine(frame, { x, y: y - radius * 0.11, z: p }, { x, y, z: p }, 0.14 + p * 0.5, 0.55, 204);
      }
      return frame;
  }
  return { downloadFrame, retryFrame, scannerFrame, compileFrame, paginationFrame, sankeyFrame, radarPlotFrame, ganttFrame, calendarFrame, bulletFrame, boxPlotFrame, dispatchFrame, batchFrame, checkpointFrame, priorityFrame, verifyFrame, pendulumFrame, driftFrame, rainFrame };
  })();
  
  const mod_registry = (function () {
  const foundational = mod_foundational;
  const kinetic = mod_kinetic;
  const reasoning = mod_reasoning;
  const agentOrbs = mod_agentOrbs;
  const atmospheric = mod_atmospheric;
  const classicLoaders = mod_classicLoaders;
  const utilityLoaders = mod_utilityLoaders;
  const dataLoaders = mod_dataLoaders;
  const dataStudies = mod_dataStudies;
  const dataBars = mod_dataBars;
  const dataCharts = mod_dataCharts;
  const imageProcessing = mod_imageProcessing;
  const expansion = mod_expansion;
  const BUILDERS = {
      ...foundational,
      ...kinetic,
      ...reasoning,
      ...agentOrbs,
      ...atmospheric,
      ...classicLoaders,
      ...utilityLoaders,
      ...dataLoaders,
      ...dataStudies,
      ...dataBars,
      ...dataCharts,
      ...imageProcessing,
      ...expansion,
  };
  /** Lookup table for every bundled pure geometry builder. */
  const FRAME_BUILDERS = {
      orbit: BUILDERS.orbitFrame,
      scan: BUILDERS.scanFrame,
      network: BUILDERS.networkFrame,
      weave: BUILDERS.weaveFrame,
      morph: BUILDERS.morphFrame,
      wave: BUILDERS.waveFrame,
      pulse: BUILDERS.pulseFrame,
      ribbon: BUILDERS.ribbonFrame,
      crystal: BUILDERS.crystalFrame,
      halo: BUILDERS.haloFrame,
      cube: BUILDERS.cubeFrame,
      tunnel: BUILDERS.tunnelFrame,
      swarm: BUILDERS.swarmFrame,
      knot: BUILDERS.knotFrame,
      aurora: BUILDERS.auroraFrame,
      nova: BUILDERS.novaFrame,
      circuit: BUILDERS.circuitFrame,
      portal: BUILDERS.portalFrame,
      helix: BUILDERS.helixFrame,
      flower: BUILDERS.flowerFrame,
      fireflies: BUILDERS.firefliesFrame,
      matrix: BUILDERS.matrixFrame,
      gyroscope: BUILDERS.gyroscopeFrame,
      magnet: BUILDERS.magnetFrame,
      shards: BUILDERS.shardsFrame,
      constellation: BUILDERS.constellationFrame,
      origami: BUILDERS.origamiFrame,
      echo: BUILDERS.echoFrame,
      mobile: BUILDERS.mobileFrame,
      vortex: BUILDERS.vortexFrame,
      atlas: BUILDERS.atlasFrame,
      forge: BUILDERS.forgeFrame,
      satellites: BUILDERS.satellitesFrame,
      comet: BUILDERS.cometFrame,
      bubbles: BUILDERS.bubblesFrame,
      pinwheel: BUILDERS.pinwheelFrame,
      plasma: BUILDERS.plasmaFrame,
      flock: BUILDERS.flockFrame,
      beats: BUILDERS.beatsFrame,
      cascade: BUILDERS.cascadeFrame,
      galaxy: BUILDERS.galaxyFrame,
      juggle: BUILDERS.juggleFrame,
      eclipse: BUILDERS.eclipseFrame,
      resonance: BUILDERS.resonanceFrame,
      condense: BUILDERS.condenseFrame,
      disperse: BUILDERS.disperseFrame,
      prism: BUILDERS.prismFrame,
      levitate: BUILDERS.levitateFrame,
      synchronize: BUILDERS.synchronizeFrame,
      unravel: BUILDERS.unravelFrame,
      lattice: BUILDERS.latticeFrame,
      deduce: BUILDERS.deduceFrame,
      branch: BUILDERS.branchFrame,
      aperture: BUILDERS.apertureFrame,
      mirror: BUILDERS.mirrorFrame,
      scales: BUILDERS.scalesFrame,
      memory: BUILDERS.memoryFrame,
      trace: BUILDERS.traceFrame,
      converge: BUILDERS.convergeFrame,
      query: BUILDERS.queryFrame,
      glimmer: BUILDERS.glimmerFrame,
      radiance: BUILDERS.radianceFrame,
      harmony: BUILDERS.harmonyFrame,
      twinkle: BUILDERS.twinkleFrame,
      flicker: BUILDERS.flickerFrame,
      shimmer: BUILDERS.shimmerFrame,
      surface: BUILDERS.surfaceFrame,
      vibrate: BUILDERS.vibrateFrame,
      illuminate: BUILDERS.illuminateFrame,
      sparkle: BUILDERS.sparkleFrame,
      spinner: BUILDERS.spinnerFrame,
      buffer: BUILDERS.bufferFrame,
      ellipsis: BUILDERS.ellipsisFrame,
      process: BUILDERS.processFrame,
      reason: BUILDERS.reasonFrame,
      consider: BUILDERS.considerFrame,
      upload: BUILDERS.uploadFrame,
      queue: BUILDERS.queueFrame,
      associate: BUILDERS.associateFrame,
      evaluate: BUILDERS.evaluateFrame,
      cognition: BUILDERS.cognitionFrame,
      explore: BUILDERS.exploreFrame,
      link: BUILDERS.linkFrame,
      resolve: BUILDERS.resolveFrame,
      imagine: BUILDERS.imagineFrame,
      settle: BUILDERS.settleFrame,
      bars: BUILDERS.barsFrame,
      progress: BUILDERS.progressFrame,
      skeleton: BUILDERS.skeletonFrame,
      waveform: BUILDERS.waveformFrame,
      grid: BUILDERS.gridFrame,
      radar: BUILDERS.radarFrame,
      hourglass: BUILDERS.hourglassFrame,
      rings: BUILDERS.ringsFrame,
      signal: BUILDERS.signalFrame,
      steps: BUILDERS.stepsFrame,
      stream: BUILDERS.streamFrame,
      equalizer: BUILDERS.equalizerFrame,
      circuitboard: BUILDERS.circuitboardFrame,
      marquee: BUILDERS.marqueeFrame,
      orbitdots: BUILDERS.orbitdotsFrame,
      chart: BUILDERS.chartFrame,
      plot: BUILDERS.plotFrame,
      scatter: BUILDERS.scatterFrame,
      forecast: BUILDERS.forecastFrame,
      meter: BUILDERS.meterFrame,
      imageDecode: BUILDERS.imageDecodeFrame,
      unblur: BUILDERS.unblurFrame,
      render: BUILDERS.renderFrame,
      denoise: BUILDERS.denoiseFrame,
      upscale: BUILDERS.upscaleFrame,
      segment: BUILDERS.segmentFrame,
      mask: BUILDERS.maskFrame,
      inpaint: BUILDERS.inpaintFrame,
      interpolate: BUILDERS.interpolateFrame,
      heatmap: BUILDERS.heatmapFrame,
      candles: BUILDERS.candlesFrame,
      graph: BUILDERS.nodegraphFrame,
      waterfall: BUILDERS.waterfallFrame,
      clusters: BUILDERS.clustersFrame,
      index: BUILDERS.indexFrame,
      benchmark: BUILDERS.benchmarkFrame,
      profile: BUILDERS.profileFrame,
      histogram: BUILDERS.histogramFrame,
      aggregate: BUILDERS.aggregateFrame,
      scrubber: BUILDERS.scrubberFrame,
      telemetryreadout: BUILDERS.telemetryFrame,
      poll: BUILDERS.pollingFrame,
      correlation: BUILDERS.correlationFrame,
      flowmap: BUILDERS.flowmapFrame,
      barchart: BUILDERS.barChartFrame,
      comparison: BUILDERS.comparisonFrame,
      stacked: BUILDERS.stackedFrame,
      timeline: BUILDERS.timelineFrame,
      throughput: BUILDERS.throughputFrame,
      donut: BUILDERS.donutFrame,
      gauge: BUILDERS.gaugeFrame,
      funnel: BUILDERS.funnelFrame,
      treemap: BUILDERS.treemapFrame,
      area: BUILDERS.areaFrame,
      download: BUILDERS.downloadFrame,
      retry: BUILDERS.retryFrame,
      scanner: BUILDERS.scannerFrame,
      compile: BUILDERS.compileFrame,
      pagination: BUILDERS.paginationFrame,
      bubblechart: BUILDERS.bubbleChartFrame,
      sankey: BUILDERS.sankeyFrame,
      radarplot: BUILDERS.radarPlotFrame,
      gantt: BUILDERS.ganttFrame,
      calendar: BUILDERS.calendarFrame,
      bullet: BUILDERS.bulletFrame,
      boxplot: BUILDERS.boxPlotFrame,
      dispatch: BUILDERS.dispatchFrame,
      batch: BUILDERS.batchFrame,
      checkpoint: BUILDERS.checkpointFrame,
      priority: BUILDERS.priorityFrame,
      verify: BUILDERS.verifyFrame,
      pendulum: BUILDERS.pendulumFrame,
      drift: BUILDERS.driftFrame,
      rain: BUILDERS.rainFrame,
  };
  /**
   * Creates deterministic geometry for one visual state at one point in time.
   *
   * This function is DOM-free and has no Canvas dependency, making it useful for tests or custom
   * renderers. `context.time` is in seconds and the same values always produce the same frame.
   *
   * @param mode Low-level geometry name, normally resolved with `resolveMode` first.
   * @param context Animation time, canvas radius and density multiplier.
   * @returns Dots and lines ready for `paintFrame`.
   */
  function buildFrame(mode, context) {
      return FRAME_BUILDERS[mode](context);
  }
  return { FRAME_BUILDERS, buildFrame };
  })();
  
  const mod_modes = mod_registry;
  
  const mod_LoaderszOrb = (function () {
  const { CanvasLoader } = mod_CanvasLoader;
  const { buildFrame } = mod_modes;
  const { resolveMode } = mod_options;
  /**
   * Imperative Canvas controller for a state-switchable loadersz animation.
   *
   * @example
   * ```ts
   * const loader = new LoaderszLoader(canvas, { state: 'searching', size: 144 });
   * loader.setOptions({ state: 'solving', speed: 1.2 });
   * ```
   */
  class LoaderszLoader extends CanvasLoader {
      /**
       * Creates a loader that can switch between every bundled semantic state.
       *
       * @param canvas Canvas element to own.
       * @param options Initial visual and accessibility options.
       * @throws {Error} When the browser cannot create a 2D canvas context.
       */
      constructor(canvas, options = {}) {
          super(canvas, options, (context, currentOptions) => buildFrame(resolveMode(currentOptions.state), context));
      }
  }
  return { LoaderszLoader };
  })();
  
  const mod_LoaderszOrbElement = (function () {
  const { LoaderszLoader } = mod_LoaderszOrb;
  const { DEFAULT_OPTIONS } = mod_options;
  /**
   * Browser-native `<loadersz-loader>` custom element.
   *
   * Numeric attributes are parsed as numbers. Change an observed attribute at runtime to update
   * the underlying {@link LoaderszLoader} without recreating the element.
   *
   * @example
   * ```html
   * <loadersz-loader state="forging" size="144" speed="1.1" theme="dark"></loadersz-loader>
   * ```
   */
  class LoaderszLoaderElement extends HTMLElement {
      constructor() {
          super(...arguments);
          this.canvas = null;
          this.loader = null;
      }
      /**
       * Attributes that trigger an immediate option update when they change.
       *
       * @returns Supported HTML attribute names. `aria-label` is mirrored to the internal canvas.
       */
      static get observedAttributes() {
          return [
              'state',
              'size',
              'speed',
              'theme',
              'paused',
              'force-motion',
              'density',
              'particle-radius',
              'hue',
              'color',
              'aria-label',
          ];
      }
      /**
       * Creates the backing canvas and controller after the element enters a document.
       *
       * @returns Nothing. Reconnecting an existing element does not create a duplicate controller.
       */
      connectedCallback() {
          if (this.loader)
              return;
          if (!this.canvas)
              this.canvas = document.createElement('canvas');
          this.style.display = 'inline-block';
          if (!this.canvas.isConnected)
              this.append(this.canvas);
          this.loader = new LoaderszLoader(this.canvas, this.readOptions());
      }
      /**
       * Stops animation and removes lifecycle listeners when the element leaves the document.
       *
       * @returns Nothing. A later reconnection creates a fresh controller from the current attributes.
       */
      disconnectedCallback() {
          this.loader?.destroy();
          this.loader = null;
      }
      /**
       * Converts changed attributes to typed options and forwards them to the controller.
       *
       * @param name Name of the changed observed attribute.
       * @returns Nothing. Attribute values are read from the element so removals are handled too.
       */
      attributeChangedCallback(name) {
          if (name === 'aria-label' && this.canvas)
              this.canvas.setAttribute('aria-label', this.label);
          this.loader?.setOptions(this.readOptions());
      }
      /** Returns the accessible label attribute or the component's default label. */
      get label() {
          return this.getAttribute('aria-label') || DEFAULT_OPTIONS.ariaLabel;
      }
      /**
       * Reads all supported element attributes as a complete typed option object.
       *
       * @returns Options ready for {@link LoaderszLoader}; malformed numeric values fall back to defaults.
       */
      readOptions() {
          return {
              state: (this.getAttribute('state') || DEFAULT_OPTIONS.state),
              size: Number(this.getAttribute('size')) || DEFAULT_OPTIONS.size,
              speed: Number(this.getAttribute('speed')) || DEFAULT_OPTIONS.speed,
              theme: (this.getAttribute('theme') || DEFAULT_OPTIONS.theme),
              paused: this.hasAttribute('paused') && this.getAttribute('paused') !== 'false',
              forceMotion: this.hasAttribute('force-motion') && this.getAttribute('force-motion') !== 'false',
              density: Number(this.getAttribute('density')) || DEFAULT_OPTIONS.density,
              particleRadius: Number(this.getAttribute('particle-radius')) || DEFAULT_OPTIONS.particleRadius,
              hue: this.hasAttribute('hue') ? Number(this.getAttribute('hue')) : DEFAULT_OPTIONS.hue,
              color: this.getAttribute('color') || DEFAULT_OPTIONS.color,
              ariaLabel: this.label,
          };
      }
  }
  return { LoaderszLoaderElement };
  })();
  
  var api = {
    LoaderszLoader: mod_LoaderszOrb.LoaderszLoader,
    LOADER_STATES: mod_stateRegistry.LOADER_STATES,
    LOADER_CATEGORIES: mod_stateRegistry.LOADER_CATEGORIES,
  };

  if (typeof customElements !== 'undefined' && !customElements.get('loadersz-loader')) {
    customElements.define('loadersz-loader', mod_LoaderszOrbElement.LoaderszLoaderElement);
  }

  root.loadersz = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
