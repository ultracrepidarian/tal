require.def(
  'antie/widgets/captions', [
    'antie/class',
    'antie/widgets/widget',
    'antie/runtimecontext'
  ],
  function (Class, Widget, RuntimeContext) {
    'use strict';

    var _elementToStyleMap = [
      {
        attribute: 'tts:color',
        property: 'color'
      }, {
        attribute: 'tts:backgroundColor',
        property: 'text-shadow'
      }, {
        attribute: 'tts:fontStyle',
        property: 'font-style'
      }, {
        attribute: 'tts:textAlign',
        property: 'text-align'
      }
    /*,
     {
     attribute: "tts:fontSize",
     property: "font-size",
     conversion: function (value) {
     return '18px'
     }
     }*/
    ];

    /**
     * Widget for displaying timed-text captioning.
     * @name bigscreen.appui.widgets.Captions
     * @class
     * @extends antie.widgets.Widget
     * @param {String} [id] The unique ID of the widget. If excluded, a temporary internal ID will be used (but not included in any output).
     * @param {String} uri URL pointing to Timed-Text captions.
     * @param {antie.widgets.Media} media Media widget which will be playing the content that the captions are associated with.
     */
    var Captions = Widget.extend(/** @lends bigscreen.appui.widgets.Captions.prototype */ {
      init: function (id, uri, media) {
        this._super(id);
        this._media = media;
        this._timedItems = [];
        this._liveItems = [];
        this._iterator = 0;
        this._styles = {};
        this._last_time_seen = 0;
        this._loadData(uri);
      },

      _loadData: function (dataFeedUrl) {
        var self = this;
        var device = this.getCurrentApplication().getDevice();

        var xhr = device.loadURL(
          dataFeedUrl, {
            method: 'GET',
            headers: {},
            onLoad: function () {
              if (xhr.responseXML) {
                try {
                  self._transformXML(xhr.responseXML);
                } catch (e) {
                  RuntimeContext.getDevice().getLogger().error('Error transforming captions response: ' + e);
                }
              }
            },
            onError: function (e) {
              RuntimeContext.getDevice().getLogger().error('Error loading captions data: ' + e);
            }
          }
        );
      },

      /**
       * Renders the widget and any child widgets to device-specific output.
       * @param {antie.devices.Device} device The device to render to.
       * @returns A device-specific object that represents the widget as displayed on the device (in a browser, a DOMElement)
       */
      render: function (device) {
        if (!this.outputElement) {
          this.outputElement = device.createContainer(this.id, this.getClasses());
        }
        return this.outputElement;
      },
      /**
       * Starts displaying the captions.
       */
      start: function () {
        var self = this;
        var update = function () {
          self.update();
        };
        this._interval = setInterval(update, 750);

        if (this.outputElement) {
          var device = this.getCurrentApplication().getDevice();
          device.showElement({
            el: this.outputElement,
            skipAnim: true
          });
        }
      },
      /**
       * Stops displaying the captions.
       */
      stop: function () {
        if (this.outputElement) {
          var device = this.getCurrentApplication().getDevice();
          device.hideElement({
            el: this.outputElement,
            skipAnim: true
          });
        }
        this._cleanOldCaptions(this._media.getDuration());
        clearInterval(this._interval);
      },
      /**
       * Updates captions to match the current position in the associated media.
       * Note: Call this when you change the position in the media!
       */
      update: function () {
        if (!this._media) {
          // clean up
          this.stop();
        }
        var time = this._media.getCurrentTime();
        this._updateCaptions(time);
      },
      /**
       * Transforms the Timed-Text XML into DOM elements.
       * Note: This does not yet use the device abstraction layer.
       * @private
       * @param {XMLDocument} xml The Timed-Text XML document.
       */
      _transformXML: function (xml) {
        var styles = this._styles;
        var style_elements = xml.getElementsByTagName('style');

        var max = style_elements.length; // We should get at least one each time though
        // If we don't, then the data is broken
        // or structed in a way this can't cope with
        // This prevents an infinite loop.
        var seen_non_ok = false;
        do {
          for (var i = 0, j = style_elements.length; i < j; i++) {
            var se = style_elements[i];
            if (se.ok) {
              continue;
            }

            var id = se.getAttribute('id');
            var my_styles = this._elementToStyle(se);

            if (my_styles) {
              styles[id] = my_styles;
              se.ok = true;
            } else {
              seen_non_ok = true;
            }
          }
        } while (seen_non_ok && max--);

        var body = xml.getElementsByTagName('body')[0];
        var s = this._elementToStyle(body);
        var d = document.createElement('div');
        d.setAttribute('style', s);
        d.style.cssText = s;

        if (!this.outputElement) {
          this.outputElement = this.getCurrentApplication().getDevice().createContainer(this.id, this.getClasses());
        }
        this.outputElement.appendChild(d);
        this.outputElement = d;

        var ps = xml.getElementsByTagName('p');
        var items = [];

        for (var k = 0, m = ps.length; k < m; k++) {
          items.push(new TimedPiece(ps[k], this));
        }

        this._timedItems = items;
        this._liveItems = [];
        return items;
      },
      /**
       * Get the CSS style for a given captions element.
       * Note: This does not yet use the device abstraction layer.
       * @private
       * @param {DOMElement} el The captions DOM element.
       */
      _elementToStyle: function (el) {
        var string_style = '';
        var styles = this._styles;
        var inherit = el.getAttribute('style');
        if (inherit) {
          if (styles[inherit]) {
            string_style = styles[inherit];
          } else {
            return false;
          }
        }
        for (var i = 0, j = _elementToStyleMap.length; i < j; i++) {
          var map = _elementToStyleMap[i];
          var value = el.getAttribute(map.attribute);
          if (value === null || value === undefined) {
            continue;
          }
          if (map.conversion) {
            value = map.conversion(value);
          }
          if (map.attribute === 'tts:backgroundColor') {
            value += ' 2px 2px 1px';
          }

          string_style += map.property + ': ' + value + '; ';
        }

        return string_style;
      },
      /**
       * Get captions elements for items at the given time.
       * @private
       * @param {Integer} time The time (in seconds) to get the captions elements for.
       */
      _groupUnseenFor: function (time) {
        // Basic approach first.
        // TODO - seek backwards and do fast seeking if long timestamp
        // differences. Also add a cache for last timestamp seen. If next time is older, reset.
        // Do we need to check for this race condition?
        // if (this._locked) { return false; }
        // this._locked = true
        var it;
        if (time < this._last_time_seen) {
          it = 0;
        } else {
          it = this._iterator || 0;
        }
        this._last_time_seen = time;
        var itms = this._timedItems;
        var max = itms.length;

        // The current iterated item was not returned last time.
        // If its time has not come, we return nothing.
        var ready = [];
        var itm = itms[it];
        while (it !== max && itm._start < time) {
          if (itm._end > time) {
            ready.push(itm);
          }
          it++;
          itm = itms[it];
        }
        this._iterator = it;

        // this._locked = false;   // Do we need to check for this race condition?
        return ready;
      },
      /**
       * Update captions in the DOM for elements at a given time.
       * @private
       * @param {Integer} time The time (in seconds) to show the captions for.
       */
      _updateCaptions: function (time) {
        // Clear out old captions
        this._cleanOldCaptions(time);
        // Add new captions
        this._addNewCaptions(time);
      },
      /**
       * Remove captions from the DOM that should not be visible at a given time.
       * @private
       * @param {Integer} time The time (in seconds) to remove captions for.
       */
      _cleanOldCaptions: function (time) {
        var live = this._liveItems;
        for (var i = live.length - 1; i >= 0; i--) {
          if (live[i].removeFromDomIfExpired(time)) {
            live.splice(i, 1);
          }
        }
      },
      /**
       * Add captions to the DOM that should be visible at a given time.
       * @private
       * @param {Integer} time The time (in seconds) to add captions for.
       */
      _addNewCaptions: function (time) {
        var live = this._liveItems;
        var fresh = this._groupUnseenFor(time);
        this._liveItems = live.concat(fresh);
        for (var i = 0, j = fresh.length; i < j; i++) {
          fresh[i].addToDom(this.outputElement);
        }
      }
    });

    /**
     * A timed piece of text.
     * @class
     * @private
     * @extends antie.Class
     */
    var TimedPiece = Class.extend({
      init: function (timedPieceNode, caption_obj) {
        this._node = timedPieceNode;
        this._start = this.timeStampToSeconds(timedPieceNode.getAttribute('begin'));
        this._end = this.timeStampToSeconds(timedPieceNode.getAttribute('end'));
        this._caption_obj = caption_obj;
      },
      timeStampToSeconds: function (timeStamp) {
        var time_pieces = timeStamp.split(':');
        var time_seconds = parseFloat(time_pieces.pop(), 10);
        if (time_pieces.length) {
          time_seconds += 60 * parseInt(time_pieces.pop(), 10);
        }
        if (time_pieces.length) {
          time_seconds += 60 * 60 * parseInt(time_pieces.pop(), 10);
        }
        return time_seconds;
      },
      removeFromDomIfExpired: function (time) {
        if (time > this._end || time < this._start) {
          if (this._htmlElementNode) {
            var e = this._htmlElementNode;
            if (e.parentNode) {
              e.parentNode.removeChild(e);
            }
          }
          return true;
        }
        return false;
      },
      addToDom: function (parentNode) {
        var node = this._htmlElementNode || this.generateHtmlElementNode();
        parentNode.appendChild(node);
      },
      generateHtmlElementNode: function (node) {
        var source = node || this._node;

        var localName = source.localName || source.tagName;
        var html = document.createElement(localName);
        var style = this._caption_obj._elementToStyle(source);
        if (style) {
          html.setAttribute('style', style);
          html.style.cssText = style;
        }

        for (var i = 0, j = source.childNodes.length; i < j; i++) {
          var n = source.childNodes[i];
          if (n.nodeType === 3) {
            html.appendChild(document.createTextNode(n.data));
          } else if (n.nodeType === 1) {
            html.appendChild(this.generateHtmlElementNode(n));
          }
        }
        if (!node) {
          this._htmlElementNode = html;
        }

        return html;
      }
    });

    return Captions;
  }
);
