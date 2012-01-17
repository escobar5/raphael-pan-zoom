/** 
 * raphael.pan-zoom plugin 0.1.0
 * Copyright (c) 2011 @author Juan S. Escobar
 *
 * licensed under the MIT license 
 */
(function () {

    Raphael.fn.panzoom = {};

    Raphael.fn.panzoom = function (options) {
        var paper = this;
        return new PanZoom(paper, options);
    };

    var panZoomFunctions = {
        enable: function () {
            this.enabled = true;
        },

        disable: function () {
            this.enabled = false;
        },

        zoomIn: function (steps) {
            this.applyZoom(steps);
        },

        zoomOut: function (steps) {
            this.applyZoom(steps > 0 ? steps * -1 : steps);
        },

        pan: function (deltaX, deltaY) {
        },

        isDragging: function () {
            return this.dragTime > this.dragThreshold;
        },

        getCurrentPosition: function () {
            return this.currPos;
        },

        getCurrentZoom: function () {
            return this.currZoom;
        }
    };

    var PanZoom = function (el, options) {
        var paper = el;
        var container = paper.canvas.parentNode;
        var me = this;
        var settings = {};
        var initialPos = { x: 0, y: 0 };
        var deltaX = 0;
        var deltaY = 0;


        this.enabled = false;
        this.dragThreshold = 5;
        this.dragTime = 0;

        options = options || {};

        settings.maxZoom = options.maxZoom || 9;
        settings.minZoom = options.minZoom || 0;
        settings.zoomStep = options.zoomStep || 0.1;
        settings.initialZoom = options.initialZoom || 0;
        settings.initialPosition = options.initialPosition || { x: 0, y: 0 };

        this.currZoom = settings.initialZoom;
        this.currPos = settings.initialPosition;

        repaint();
        container.onmousedown = function (e) {
            var evt = window.event || e;
            if (!me.enabled) return false;
            me.dragTime = 0;
            initialPos = getRelativePosition(evt, container);
            container.className += " grabbing";
            container.onmousemove = dragging;
            document.onmousemove = function () { return false; };
            if (evt.preventDefault) evt.preventDefault();
            else evt.returnValue = false;
            return false;
        };

        container.onmouseup = function (e) {
            //Remove class framework independent
            document.onmousemove = null;
            container.className = container.className.replace(/(?:^|\s)grabbing(?!\S)/g, '');
            container.onmousemove = null;
        };

        var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
        if (container.attachEvent) //if IE (and Opera depending on user setting)
            container.attachEvent("on" + mousewheelevt, handleScroll);
        else if (container.addEventListener) //WC3 browsers
            container.addEventListener(mousewheelevt, handleScroll, false);

        function handleScroll(e) {
            var evt = window.event || e;
            if (!me.enabled) return false;
            var delta = evt.detail ? evt.detail : evt.wheelDelta * -1;
            if (delta < 0) delta = -1;
            else if (delta > 0) delta = 1;
            var zoomCenter = getRelativePosition(evt, container);
            applyZoom(delta, zoomCenter);
            if (evt.preventDefault) evt.preventDefault();
            else evt.returnValue = false;
            return false;
        };

        function applyZoom(val, centerPoint) {
            if (!me.enabled) return false;
            me.currZoom += val;
            if (me.currZoom < settings.minZoom) me.currZoom = settings.minZoom;
            else if (me.currZoom > settings.maxZoom) me.currZoom = settings.maxZoom;
            else {
                centerPoint = centerPoint || { x: 0, y: 0 };

                deltaX = ((paper.width * settings.zoomStep) * (centerPoint.x / paper.width)) * val;
                deltaY = (paper.height * settings.zoomStep) * (centerPoint.y / paper.height) * val;

                repaint();
            }
        };

        this.applyZoom = applyZoom;

        function dragging(e) {
            var evt = window.event || e;
            var newWidth = paper.width * (1 - (me.currZoom * settings.zoomStep));
            var newHeight = paper.height * (1 - (me.currZoom * settings.zoomStep));

            var newPoint = getRelativePosition(evt, container);

            deltaX = (newWidth * (newPoint.x - initialPos.x) / paper.width) * -1;
            deltaY = (newHeight * (newPoint.y - initialPos.y) / paper.height) * -1;
            initialPos = newPoint;

            repaint();
            me.dragTime++;
            if (evt.preventDefault) evt.preventDefault();
            else evt.returnValue = false;
            return false;
        };

        function repaint() {
            me.currPos.x = me.currPos.x + deltaX;
            me.currPos.y = me.currPos.y + deltaY;

            var newWidth = paper.width * (1 - (me.currZoom * settings.zoomStep));
            var newHeight = paper.height * (1 - (me.currZoom * settings.zoomStep));

            if (me.currPos.x < 0) me.currPos.x = 0;
            else if (me.currPos.x > (paper.width * me.currZoom * settings.zoomStep)) {
                me.currPos.x = (paper.width * me.currZoom * settings.zoomStep);
            }

            if (me.currPos.y < 0) me.currPos.y = 0;
            else if (me.currPos.y > (paper.height * me.currZoom * settings.zoomStep)) {
                me.currPos.y = (paper.height * me.currZoom * settings.zoomStep);
            }
            paper.setViewBox(me.currPos.x, me.currPos.y, newWidth, newHeight);
        };
    }

    PanZoom.prototype = panZoomFunctions;

    function getRelativePosition(e, obj) {
        var x;
        var y;
        if (e.pageX || e.pageY) {
            x = e.pageX;
            y = e.pageY;
        }
        else {
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        x -= obj.offsetLeft;
        y -= obj.offsetTop;

        return { x: x, y: y };
    }

})();