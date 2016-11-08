"use strict";

var EventEmitter = require('events').EventEmitter;
var fs 		     = require('fs');
var defaultcss   = require('defaultcss');
var domify 	     = require('domify');

var ALT = 18;
var ESC = 27;

var style = fs.readFileSync(__dirname + '/index.css', 'utf-8');
var html  = fs.readFileSync(__dirname + '/index.html', 'utf-8');

class TitleBar extends EventEmitter {
	constructor(options = {}) {
		super();

		this._options = options;

		var element  = domify(html);
		this.element = element;

		if (this._options.draggable !== false) {
			element.classList.add('webkit-draggable');
		}

		var close      = element.getElementsByClassName('titlebar-close')[0];
		var minimize   = element.getElementsByClassName('titlebar-minimize')[0];
		var fullscreen = element.getElementsByClassName('titlebar-fullscreen')[0];

		this._isMaximaized = false;

		element.addEventListener('click', (e) => {
			var target = e.target;
			if (close.contains(target))
				this.emit('close', e);
			else if (minimize.contains(target))
				this.emit('minimize', e);
			else if (fullscreen.contains(target)) {
				if (e.altKey) this.emit('maximize', e);
				else this.emit('fullscreen', e);
			}
		});

		element.addEventListener('dblclick', (e) => {
			var target = e.target;
			if (close.contains(target) || minimize.contains(target) || fullscreen.contains(target)) return;
			this.emit(this._isMaximaized ? 'unmaximize' : 'maximize', e);
			this._isMaximaized = !this._isMaximaized;
		});

		window.addEventListener('blur', (e) => {
            close.classList.add('blur');
            minimize.classList.add('blur');
            fullscreen.classList.add('blur');
        });

        window.addEventListener('focus', (e) => {
            close.classList.remove('blur');
            minimize.classList.remove('blur');
            fullscreen.classList.remove('blur');
        });
	}

	appendTo(target) {
		if (this._options.style !== false) {
			defaultcss('titlebar', style);
		}

		var element = this.element;
		window.addEventListener('keydown', this._onkeydown = (e) => {
			if (e.keyCode === ALT) element.classList.add('alt');
			if (e.keyCode === ESC) this.emit('fullscreen', e);
		});

		window.addEventListener('keyup', this._onkeyup = (e) => {
			if (e.keyCode === ALT) element.classList.remove('alt');
		});

		target.appendChild(element);
		return this;
	}

	destroy() {
		var parent = this.element.parentNode;
		if (parent) parent.removeChild(this.element);
		window.removeEventListener('keydown', this._onkeydown);
		window.removeEventListener('keyup',   this._onkeyup);
		return this;
	}
}

module.exports = TitleBar;
