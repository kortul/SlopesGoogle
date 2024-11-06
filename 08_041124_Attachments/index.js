"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
function createStore(register) {
    modelBlob.report.cameraIDs.sort(function (x, y) { return strCmpNumeric(modelBlob.cameras[x].caption, modelBlob.cameras[y].caption); });
    modelBlob.report.gcpIDs.sort(function (x, y) { return strCmpNumeric(modelBlob.gcps[x].caption, modelBlob.gcps[y].caption); });
    modelBlob.report.orthoIDs.sort(function (x, y) { return strCmpNumeric(modelBlob.orthos[x].caption, modelBlob.orthos[y].caption); });
    modelBlob.report.annotationIDs.sort(function (x, y) { return strCmpNumeric(modelBlob.annotations[x].caption, modelBlob.annotations[y].caption); });
    return new Store(modelBlob, register);
}
var Dispatcher = /** @class */ (function () {
    function Dispatcher() {
        this.actionQueue = [];
        this.actionProcessors = [];
        this.scheduled = false;
    }
    Dispatcher.prototype.dispatch = function (action) {
        var _this = this;
        this.actionQueue.push(action);
        if (!this.scheduled) {
            this.scheduled = true;
            setTimeout(function () { return _this.processActions(); }, 0);
        }
    };
    Dispatcher.prototype.register = function (callback) {
        this.actionProcessors.push(callback);
    };
    Dispatcher.prototype.processActions = function () {
        var _this = this;
        var dispatch = function (action) { return _this.dispatch(action); };
        var action;
        while (action = this.actionQueue.shift()) {
            for (var _i = 0, _a = this.actionProcessors; _i < _a.length; _i++) {
                var actionProcessor = _a[_i];
                actionProcessor(action, dispatch);
            }
        }
        this.scheduled = false;
    };
    return Dispatcher;
}());
var DOM;
(function (DOM) {
    function append(parent, child) {
        iterateNodes(child, function (node) { return parent.appendChild(node); });
    }
    DOM.append = append;
    function insertAfter(parent, after, child) {
        insertBefore(parent, after.nextSibling, child);
    }
    DOM.insertAfter = insertAfter;
    function insertAt(parent, index, child) {
        insertBefore(parent, parent.childNodes.item(index), child);
    }
    DOM.insertAt = insertAt;
    function insertBefore(parent, before, child) {
        iterateNodes(child, function (node) { return parent.insertBefore(node, before); });
    }
    DOM.insertBefore = insertBefore;
    function remove(node) {
        var parent = node.parentNode;
        if (parent !== null) {
            parent.removeChild(node);
        }
    }
    DOM.remove = remove;
    function replaceChildren(parent, child) {
        while (parent.lastChild) {
            parent.removeChild(parent.lastChild);
        }
        iterateNodes(child, function (node) { return parent.appendChild(node); });
    }
    DOM.replaceChildren = replaceChildren;
    function iterateNodes(obj, callback) {
        if (obj !== null && obj !== undefined) {
            if (obj instanceof Array) {
                for (var _i = 0, obj_1 = obj; _i < obj_1.length; _i++) {
                    var item = obj_1[_i];
                    iterateNodes(item, callback);
                }
            }
            else {
                callback(obj instanceof Node ? obj : document.createTextNode("" + obj));
            }
        }
    }
})(DOM || (DOM = {}));
var JSX = /** @class */ (function () {
    function JSX() {
    }
    JSX.createElement = function (type, props) {
        var children = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            children[_i - 2] = arguments[_i];
        }
        props = props || {};
        if (typeof type === "string") {
            var elem = document.createElement(type);
            for (var key in props) {
                var value = props[key];
                if (value !== undefined) {
                    if (key.substr(0, 2) === "on") {
                        if (value !== null) {
                            elem.addEventListener(key.substr(2), value);
                        }
                    }
                    else if (key === "style") {
                        for (var skey in value) {
                            elem.style[skey] = value[skey];
                        }
                    }
                    else if (key === "ref") {
                        if (value instanceof Ref) {
                            value.set(elem);
                        }
                        else {
                            value(elem);
                        }
                    }
                    else {
                        elem[key] = props[key];
                    }
                }
            }
            DOM.append(elem, children);
            return elem;
        }
        else {
            var inst = new type(props, children);
            if (!inst.render) {
                return inst;
            }
            if (props.ref !== undefined) {
                if (props.ref instanceof Ref) {
                    props.ref.set(inst);
                }
                else {
                    props.ref(inst);
                }
            }
            return inst.render();
        }
    };
    return JSX;
}());
function main() {
    var dispatcher = new Dispatcher();
    var store = createStore(function (callback) { return dispatcher.register(callback); });
    var view = new MainView(document.body, function (action) { return dispatcher.dispatch(action); }, store.data);
    store.subscribe(function (event) { return view.update(event); });
}
var Ref = /** @class */ (function () {
    function Ref() {
    }
    Ref.prototype.get = function () {
        return this.value;
    };
    Ref.prototype.set = function (value) {
        this.value = value;
    };
    return Ref;
}());
var ElemRef = /** @class */ (function (_super) {
    __extends(ElemRef, _super);
    function ElemRef() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ElemRef;
}(Ref));
var Store = /** @class */ (function () {
    function Store(model, register) {
        var _this = this;
        this.model = model;
        this.subscriptions = [];
        this.nextID = 0;
        register(function (action, dispatch) { return _this.processAction(action, dispatch); });
    }
    Store.prototype.subscribe = function (callback) {
        this.subscriptions.push(callback);
    };
    Object.defineProperty(Store.prototype, "data", {
        get: function () {
            return this.model;
        },
        enumerable: true,
        configurable: true
    });
    Store.prototype.processAction = function (action, dispatch) {
        switch (action.kind) {
            case "CreateAnnotationAction": {
                var id = "a" + this.nextID++;
                this.model.annotations[id] = clone(action.annotation);
                this.model.report.annotationIDs.push(id);
                this.model.display.annotationVisibility[id] = true;
                this.model.selection.selectedID = id;
                this.emit({ kind: "AnnotationListAddedEvent", idx: this.model.report.annotationIDs.length - 1 });
                this.emit({ kind: "SelectedChangedEvent" });
                break;
            }
            case "DeleteAction": {
                var id = action.id;
                if (this.model.selection.hotID === id) {
                    this.model.selection.hotID = null;
                    this.emit({ kind: "HotChangedEvent" });
                }
                if (this.model.selection.selectedID === id) {
                    this.model.selection.selectedID = null;
                    this.emit({ kind: "SelectedChangedEvent" });
                }
                if (id in this.model.annotations) {
                    var idx = this.model.report.annotationIDs.indexOf(id);
                    this.model.report.annotationIDs.splice(idx, 1);
                    delete this.model.annotations[id];
                    this.emit({ kind: "AnnotationListRemovedEvent", idx: idx, id: id });
                }
                break;
            }
            case "HotAction": {
                this.model.selection.hotID = action.id;
                this.emit({ kind: "HotChangedEvent" });
                break;
            }
            case "PointAnnotationMoveAction": {
                var point = this.model.annotations[action.id];
                point.pos.lat = action.lat;
                point.pos.lng = action.lng;
                this.emit({ kind: "ObjectChangedEvent", id: action.id });
                break;
            }
            case "PolyAnnotationAddPointAction": {
                var poly = this.model.annotations[action.id];
                poly.points.splice(action.idx, 0, clone({ lat: action.lat, lng: action.lng }));
                this.emit({ kind: "ObjectChangedEvent", id: action.id });
                break;
            }
            case "PolyAnnotationChangePointAction": {
                var poly = this.model.annotations[action.id];
                poly.points[action.idx].lat = action.lat;
                poly.points[action.idx].lng = action.lng;
                this.emit({ kind: "ObjectChangedEvent", id: action.id });
                break;
            }
            case "PolyAnnotationRemovePointAction": {
                var poly = this.model.annotations[action.id];
                poly.points.splice(action.idx, 1);
                this.emit({ kind: "ObjectChangedEvent", id: action.id });
                break;
            }
            case "ReorderAction": {
                var reorder = function (arr, value, pos) {
                    var idx = arr.indexOf(value);
                    if (idx >= 0) {
                        arr.splice(idx, 1);
                        arr.splice(pos, 0, value);
                    }
                    return idx;
                };
                if (action.id in this.model.orthos) {
                    var src = reorder(this.model.report.orthoIDs, action.id, action.pos);
                    this.emit({ kind: "OrthoListMovedEvent", src: src, dest: action.pos });
                }
                if (action.id in this.model.layers) {
                    for (var _i = 0, _a = this.model.report.orthoIDs; _i < _a.length; _i++) {
                        var orthoID = _a[_i];
                        var src = reorder(this.model.orthos[orthoID].layerIDs, action.id, action.pos);
                        if (src >= 0) {
                            this.emit({ kind: "LayerListMovedEvent", orthoID: orthoID, src: src, dest: action.pos });
                            break;
                        }
                    }
                }
                if (action.id in this.model.annotations) {
                    var src = reorder(this.model.report.annotationIDs, action.id, action.pos);
                    this.emit({ kind: "AnnotationListMovedEvent", src: src, dest: action.pos });
                }
                break;
            }
            case "SelectAction": {
                this.model.selection.selectedID = action.id;
                this.emit({ kind: "SelectedChangedEvent" });
                break;
            }
            case "SetAnnotationCaptionAction": {
                this.model.annotations[action.id].caption = action.value;
                this.emit({ kind: "ObjectChangedEvent", id: action.id });
                break;
            }
            case "SetOrthoOpacityAction": {
                this.model.display.layerOpacity[action.id] = action.value;
                this.emit({ kind: "DisplayChangedEvent", id: action.id });
                break;
            }
            case "ToggleAnnotationVisibilityAction": {
                this.model.display.annotationVisibility[action.id] = !this.model.display.annotationVisibility[action.id];
                this.emit({ kind: "DisplayChangedEvent", id: action.id });
                break;
            }
            case "ToggleFilterAnnotationsAction": {
                this.model.filters.annotations = !this.model.filters.annotations;
                this.emit({ kind: "FiltersChangedEvent" });
                break;
            }
            case "ToggleFilterCamerasAction": {
                this.model.filters.cameras = !this.model.filters.cameras;
                this.emit({ kind: "FiltersChangedEvent" });
                break;
            }
            case "ToggleFilterGCPsAction": {
                this.model.filters.gcps = !this.model.filters.gcps;
                this.emit({ kind: "FiltersChangedEvent" });
                break;
            }
            case "ToggleFilterOrthosAction": {
                this.model.filters.orthos = !this.model.filters.orthos;
                this.emit({ kind: "FiltersChangedEvent" });
                break;
            }
            case "ToggleLayerVisibilityAction": {
                this.model.display.layerVisibility[action.id] = !this.model.display.layerVisibility[action.id];
                this.emit({ kind: "DisplayChangedEvent", id: action.id });
                break;
            }
            case "ToggleOrthoVisibilityAction": {
                this.model.display.orthoVisibility[action.id] = !this.model.display.orthoVisibility[action.id];
                this.emit({ kind: "DisplayChangedEvent", id: action.id });
                break;
            }
            default: {
                var _ = action;
                break;
            }
        }
    };
    Store.prototype.emit = function (ev) {
        for (var _i = 0, _a = this.subscriptions; _i < _a.length; _i++) {
            var subscription = _a[_i];
            subscription(ev);
        }
    };
    return Store;
}());
;
function clone(obj) {
    if (typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean" || typeof obj === "function" || obj === null || obj === undefined) {
        return obj;
    }
    else if (obj instanceof Array) {
        var res = [];
        for (var i = 0; i < obj.length; i++) {
            res.push(obj[i]);
        }
        return res;
    }
    else {
        var res = {};
        for (var key in obj) {
            res[key] = clone(obj[key]);
        }
        return res;
    }
}
function fixUrl(url) {
    return url.replace(/\\/g, '/');
}
function makeCssUrl(url) {
    return "url(\"" + fixUrl(url) + "\")";
}
function opt(arg) {
    return arg === undefined ? null : arg;
}
function set(arg) {
    return arg === undefined ? {} : arg;
}
function strCmpNumeric(x, y) {
    x = x.toUpperCase();
    y = y.toUpperCase();
    var i = 0;
    var j = 0;
    var c0 = "0".charCodeAt(0);
    var c9 = "9".charCodeAt(0);
    while (i < x.length && j < y.length) {
        var cx = x.charCodeAt(i);
        var cy = y.charCodeAt(j);
        if (cx > c0 && cx <= c9 && cy > c0 && cy <= c9) {
            var vx = cx - c0;
            for (i += 1; i < x.length && x.charCodeAt(i) >= c0 && x.charCodeAt(i) <= c9; i++) {
                vx = 10 * vx + (x.charCodeAt(i) - c0);
            }
            var vy = cy - c0;
            for (j += 1; j < y.length && y.charCodeAt(j) >= c0 && y.charCodeAt(j) <= c9; j++) {
                vy = 10 * vy + (y.charCodeAt(j) - c0);
            }
            if (vx < vy) {
                return -1;
            }
            else if (vx > vy) {
                return 1;
            }
        }
        else if (cx == cy) {
            i++;
            j++;
        }
        else if (cx < cy) {
            return -1;
        }
        else {
            return 1;
        }
    }
    if (i < x.length) {
        return 1;
    }
    if (j < y.length) {
        return -1;
    }
    return 0;
}
function convertToDMS(dd, isLng) {
    var textID = dd < 0 ? isLng ? "MAPV_LNG_WEST" : "MAPV_LAT_SOUTH" : isLng ? "MAPV_LNG_EAST" : "MAPV_LAT_NORTH";
    var absDd = Math.abs(dd);
    var deg = absDd | 0;
    var frac = absDd - deg;
    var min = (frac * 60) | 0;
    var sec = frac * 3600 - min * 60;
    sec = Math.round(sec * 100) / 100;
    return rcLoadString(textID, deg, min, sec);
}
function dist(p1, p2) {
    var hdist = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(p1.lat, p1.lng), new google.maps.LatLng(p2.lat, p2.lng));
    var vdist = p1.alt - p2.alt;
    return Math.sqrt(hdist * hdist + vdist * vdist);
}
var Frag = /** @class */ (function () {
    function Frag(props, children) {
        this.children = children;
    }
    Frag.prototype.render = function () {
        return this.children;
    };
    return Frag;
}());
var Img = /** @class */ (function () {
    function Img(props, children) {
        var src = props.src, other = __rest(props, ["src"]);
        var style = other.style || {};
        other.style = style;
        style.backgroundImage = makeCssUrl(src.url);
        style.width = style.width || src.width + "px";
        style.height = style.height || src.height + "px";
        style.display = style.display || "inline-block";
        this.elem = JSX.createElement("div", __assign({}, other), children);
    }
    Img.prototype.render = function () {
        return this.elem;
    };
    return Img;
}());
var OutlineTree = /** @class */ (function () {
    function OutlineTree(props, children) {
        this.sprites = props.sprites;
        this.root = JSX.createElement("div", { style: { fontSize: "11px" } });
        this.items = {};
        this.rootIDs = [];
    }
    OutlineTree.prototype.render = function () {
        return this.root;
    };
    OutlineTree.prototype.addItem = function (id, item, parentID, idx) {
        var _this = this;
        var content;
        var subtree;
        var indent = [];
        var ownIndent;
        var expander;
        var parents = [];
        for (var pid = opt(parentID); pid !== null; pid = this.items[pid].parentID) {
            parents.push(this.items[pid]);
        }
        parents.reverse();
        var markup = (JSX.createElement("div", { ref: function (r) { return content = r; } },
            JSX.createElement("div", { className: "hflow root" },
                parents.map(function (parent) { return (JSX.createElement(Sprite, { src: _this.sprites.tree, idx: parent.content.nextSibling === null ? 5 : 4, ref: function (r) { return indent.push(r); } })); }),
                JSX.createElement(Sprite, { src: this.sprites.tree, ref: function (r) { return ownIndent = r; } }),
                JSX.createElement(Sprite, { src: this.sprites.expander, className: "clickable hidden", style: { marginLeft: "-16px" }, onclick: function () { return _this.toggle(id); }, ref: function (r) { return expander = r; } }),
                item),
            JSX.createElement("div", { className: "none", ref: function (r) { return subtree = r; } })));
        var parentNode = parentID === undefined ? this.root : this.items[parentID].subtree;
        if (idx === undefined) {
            DOM.append(parentNode, markup);
        }
        else {
            DOM.insertAt(parentNode, idx, markup);
        }
        this.items[id] = {
            parentID: opt(parentID),
            childIDs: [],
            content: content,
            subtree: subtree,
            indent: indent,
            ownIndent: ownIndent,
            expander: expander,
            expanded: false,
        };
        var childIDs = parentID === undefined ? this.rootIDs : this.items[parentID].childIDs;
        if (idx === undefined) {
            idx = childIDs.length;
            childIDs.push(id);
        }
        else {
            childIDs.splice(idx, 0, id);
        }
        if (idx > 0) {
            this.updateIndent(childIDs[idx - 1]);
        }
        this.updateIndent(id);
        if (idx + 1 < childIDs.length) {
            this.updateIndent(childIDs[idx + 1]);
        }
        if (parentID !== undefined) {
            this.items[parentID].expander.render().classList.remove("hidden");
        }
    };
    OutlineTree.prototype.moveItem = function (id, idx) {
        var _a = this.items[id], parentID = _a.parentID, content = _a.content;
        var siblingIDs = parentID === null ? this.rootIDs : this.items[parentID].childIDs;
        var parent = content.parentNode;
        var src = siblingIDs.indexOf(id);
        if (src === idx) {
            return;
        }
        DOM.remove(content);
        DOM.insertAt(parent, idx, content);
        siblingIDs.splice(src, 1);
        siblingIDs.splice(idx, 0, id);
        if (src === 0 || src === siblingIDs.length - 1) {
            this.updateIndent(id);
            this.updateIndent(siblingIDs[src]);
        }
        if (idx === 0) {
            this.updateIndent(id);
            this.updateIndent(siblingIDs[1]);
        }
        if (idx === siblingIDs.length - 1) {
            this.updateIndent(id);
            this.updateIndent(siblingIDs[siblingIDs.length - 2]);
        }
    };
    OutlineTree.prototype.removeItem = function (id) {
        var item = this.items[id];
        var siblingIDs = item.parentID === null ? this.rootIDs : this.items[item.parentID].childIDs;
        DOM.remove(this.items[id].content);
        delete this.items[id];
        for (var i = 0; i < siblingIDs.length; i++) {
            if (siblingIDs[i] === id) {
                siblingIDs.splice(i, 1);
                if (i > 0) {
                    this.updateIndent(siblingIDs[i - 1]);
                }
                if (i < siblingIDs.length) {
                    this.updateIndent(siblingIDs[i]);
                }
                break;
            }
        }
        if (siblingIDs.length === 0 && item.parentID !== null) {
            this.items[item.parentID].expander.render().classList.add("hidden");
        }
    };
    OutlineTree.prototype.toggle = function (id) {
        if (this.items[id].expanded) {
            this.collapse(id);
        }
        else {
            this.expand(id);
        }
    };
    OutlineTree.prototype.expand = function (id) {
        var item = this.items[id];
        if (!item.expanded) {
            item.expander.setIdx(1);
            item.subtree.classList.remove("none");
            item.expanded = true;
        }
    };
    OutlineTree.prototype.collapse = function (id) {
        var item = this.items[id];
        if (item.expanded) {
            item.expander.setIdx(0);
            item.subtree.classList.add("none");
            item.expanded = false;
        }
    };
    OutlineTree.prototype.scrollIntoView = function (id) {
        for (var pid = this.items[id].parentID; pid !== null; pid = this.items[pid].parentID) {
            this.expand(pid);
        }
        var topEdge = this.items[id].content.offsetTop;
        var bottomEdge = topEdge + this.items[id].content.offsetHeight;
        var parent = this.root.parentNode;
        if (parent.scrollTop > topEdge) {
            parent.scrollTop = topEdge;
        }
        if (parent.scrollTop + parent.clientHeight < bottomEdge) {
            parent.scrollTop = bottomEdge - parent.clientHeight;
        }
    };
    OutlineTree.prototype.updateIndent = function (id) {
        var _a = this.items[id], childIDs = _a.childIDs, content = _a.content, ownIndent = _a.ownIndent;
        var isFirst = content.previousSibling === null;
        var isLast = content.nextSibling === null;
        var isTop = content.parentNode === this.root;
        if (isTop && isFirst && isLast) {
            ownIndent.setIdx(0);
        }
        else if (isTop && isFirst) {
            ownIndent.setIdx(1);
        }
        else if (isLast) {
            ownIndent.setIdx(2);
        }
        else {
            ownIndent.setIdx(3);
        }
        this.setIndentIdx(childIDs, isLast ? 5 : 4, 1);
    };
    OutlineTree.prototype.setIndentIdx = function (ids, idx, offset) {
        for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
            var id = ids_1[_i];
            var _a = this.items[id], childIDs = _a.childIDs, indent = _a.indent;
            indent[indent.length - offset].setIdx(idx);
            this.setIndentIdx(childIDs, idx, offset + 1);
        }
    };
    return OutlineTree;
}());
var PropertiesAnnotation = /** @class */ (function () {
    function PropertiesAnnotation(props, children) {
        var _this = this;
        var annotation = props.annotation, id = props.id, dispatch = props.dispatch, other = __rest(props, ["annotation", "id", "dispatch"]);
        this.annotation = annotation;
        this.elem = (JSX.createElement("div", null,
            JSX.createElement("input", { style: { fontWeight: "700", margin: "12px 0", width: "100%" }, onchange: function () { return dispatch({ kind: "SetAnnotationCaptionAction", id: id, value: _this.input.value }); }, onkeydown: function (e) {
                    if (e.key === "Escape" || e.key === "Esc") {
                        var value = _this.input.value;
                        _this.input.value = _this.annotation.caption;
                        _this.input.blur();
                        e.stopPropagation();
                    }
                }, ref: function (r) { return _this.input = r; } }),
            this.makeContent()));
        this.update();
    }
    PropertiesAnnotation.prototype.render = function () {
        return this.elem;
    };
    PropertiesAnnotation.prototype.update = function () {
        this.input.value = this.annotation.caption;
        this.content.update();
    };
    PropertiesAnnotation.prototype.makeContent = function () {
        var _this = this;
        switch (this.annotation.kind) {
            case "PointAnnotation":
                return JSX.createElement(PropertiesPointAnnotation, { annotation: this.annotation, ref: function (r) { return _this.content = r; } });
            case "PolylineAnnotation":
                return JSX.createElement(PropertiesPolylineAnnotation, { annotation: this.annotation, ref: function (r) { return _this.content = r; } });
            case "PolygonAnnotation":
                return JSX.createElement(PropertiesPolygonAnnotation, { annotation: this.annotation, ref: function (r) { return _this.content = r; } });
            default:
                var _ = this.annotation;
        }
    };
    return PropertiesAnnotation;
}());
var PropertiesCamera = /** @class */ (function () {
    function PropertiesCamera(props, children) {
        var camera = props.camera, other = __rest(props, ["camera"]);
        this.camera = camera;
        this.elem = (JSX.createElement("div", null,
            JSX.createElement("h4", null),
            JSX.createElement("div", null),
            JSX.createElement("div", null),
            JSX.createElement("div", null)));
        this.update();
    }
    PropertiesCamera.prototype.render = function () {
        return this.elem;
    };
    PropertiesCamera.prototype.update = function () {
        this.elem.childNodes[0].textContent = this.camera.caption;
        this.elem.childNodes[1].textContent = rcLoadString("MAPV_PROPERTIES_LATITUDE", convertToDMS(this.camera.pos.lat, false));
        this.elem.childNodes[2].textContent = rcLoadString("MAPV_PROPERTIES_LONGITUDE", convertToDMS(this.camera.pos.lng, true));
        this.elem.childNodes[3].textContent = rcLoadString("MAPV_PROPERTIES_ALTITUDE", rcLoadString("MAPV_LENGTH_METERS", this.camera.pos.alt.toFixed(2)));
    };
    return PropertiesCamera;
}());
var PropertiesGCP = /** @class */ (function () {
    function PropertiesGCP(props, children) {
        var gcp = props.gcp, other = __rest(props, ["gcp"]);
        this.gcp = gcp;
        this.elem = (JSX.createElement("div", null,
            JSX.createElement("h4", null),
            JSX.createElement("div", null),
            JSX.createElement("div", null),
            JSX.createElement("div", null),
            JSX.createElement("div", null)));
        this.update();
    }
    PropertiesGCP.prototype.render = function () {
        return this.elem;
    };
    PropertiesGCP.prototype.update = function () {
        this.elem.childNodes[0].textContent = this.gcp.caption;
        this.elem.childNodes[1].textContent = rcLoadString("MAPV_PROPERTIES_LATITUDE", convertToDMS(this.gcp.outPos.lat, false));
        this.elem.childNodes[2].textContent = rcLoadString("MAPV_PROPERTIES_LONGITUDE", convertToDMS(this.gcp.outPos.lng, true));
        this.elem.childNodes[3].textContent = rcLoadString("MAPV_PROPERTIES_ALTITUDE", rcLoadString("MAPV_LENGTH_METERS", this.gcp.outPos.alt.toFixed(2)));
        this.elem.childNodes[4].textContent = rcLoadString("MAPV_PROPERTIES_ALIGNMENT_ERROR", rcLoadString("MAPV_LENGTH_METERS", dist(this.gcp.inPos, this.gcp.outPos).toFixed(2)));
    };
    return PropertiesGCP;
}());
var PropertiesLayer = /** @class */ (function () {
    function PropertiesLayer(props, children) {
        var model = props.model, id = props.id, dispatch = props.dispatch, other = __rest(props, ["model", "id", "dispatch"]);
        this.layer = model.layers[id];
        var slider;
        var sliderValue;
        var updateSlider = function () {
            sliderValue.innerText = rcLoadString("MAPV_PROPERTIES_OPACITY_PERCENT", slider.value);
            dispatch({ kind: "SetOrthoOpacityAction", id: id, value: Number(slider.value) });
        };
        var caption = rcLoadString("MAPV_OUTLINE_IMAGE_LAYER");
        var altitudeScale = JSX.createElement("div", null);
        if (this.layer.palette) {
            caption = rcLoadString("MAPV_OUTLINE_ALTITUDE_LAYER");
            altitudeScale = (JSX.createElement("div", { style: { marginTop: "12px" } },
                JSX.createElement("div", null, rcLoadString("MAPV_PROPERTIES_ALTITUDE_SCALE")),
                JSX.createElement("div", { className: "hflow", style: { height: "12px" } }, this.layer.palette.map(function (item) {
                    return JSX.createElement("div", { className: "equal", style: {
                            display: "inline-block",
                            backgroundColor: "rgb(" + item.r + "," + item.g + "," + item.b + ")",
                        }, title: item.altitude });
                })),
                JSX.createElement("div", null,
                    this.layer.palette[0].altitude,
                    JSX.createElement("div", { style: { cssFloat: "right" } }, this.layer.palette[this.layer.palette.length - 1].altitude))));
        }
        this.elem = (JSX.createElement("div", null,
            JSX.createElement("h4", null, caption),
            JSX.createElement("div", { className: "hflow", style: { lineHeight: "16px" } },
                JSX.createElement("span", null, rcLoadString("MAPV_PROPERTIES_OPACITY")),
                JSX.createElement("input", { type: "range", min: "0", max: "100", value: "" + model.display.layerOpacity[id], className: "rest", style: { height: "16px", width: "50px", margin: "0 12px", padding: "0" }, oninput: updateSlider, onchange: updateSlider, ref: function (r) { return slider = r; } }),
                JSX.createElement("span", { ref: function (r) { return sliderValue = r; } })),
            altitudeScale));
        updateSlider();
        this.update();
    }
    PropertiesLayer.prototype.render = function () {
        return this.elem;
    };
    PropertiesLayer.prototype.update = function () {
    };
    return PropertiesLayer;
}());
var PropertiesOrtho = /** @class */ (function () {
    function PropertiesOrtho(props, children) {
        var ortho = props.ortho, other = __rest(props, ["ortho"]);
        this.ortho = ortho;
        this.elem = (JSX.createElement("div", null,
            JSX.createElement("h4", null),
            JSX.createElement("div", { style: { marginTop: "30px" } }),
            JSX.createElement("div", { style: { marginTop: "30px" } })));
        this.update();
    }
    PropertiesOrtho.prototype.render = function () {
        return this.elem;
    };
    PropertiesOrtho.prototype.update = function () {
        this.elem.childNodes[0].textContent = this.ortho.caption;
        DOM.replaceChildren(this.elem.childNodes[1], JSX.createElement(Frag, null,
            JSX.createElement("div", { style: { marginTop: "10px" } }, rcLoadString("MAPV_PROPERTIES_CUT_VOLUME", this.ortho.cutVolume)),
            JSX.createElement("div", { style: { marginTop: "10px" } }, rcLoadString("MAPV_PROPERTIES_FILL_VOLUME", this.ortho.fillVolume)),
            JSX.createElement("div", { style: { marginTop: "10px" } }, rcLoadString("MAPV_PROPERTIES_AREA_2D", this.ortho.area2D)),
            JSX.createElement("div", { style: { marginTop: "10px" } }, rcLoadString("MAPV_PROPERTIES_AREA_3D", this.ortho.area3D))));
        DOM.replaceChildren(this.elem.childNodes[2], JSX.createElement(Frag, null,
            JSX.createElement("div", null, rcLoadString("MAPV_PROPERTIES_CORNERS")),
            this.ortho.bounds.map(function (corner) {
                return JSX.createElement("div", { style: { marginTop: "10px" } },
                    rcLoadString("MAPV_PROPERTIES_LATITUDE", convertToDMS(corner.lat, false)),
                    JSX.createElement("br", null),
                    rcLoadString("MAPV_PROPERTIES_LONGITUDE", convertToDMS(corner.lng, true)));
            })));
    };
    return PropertiesOrtho;
}());
var PropertiesPointAnnotation = /** @class */ (function () {
    function PropertiesPointAnnotation(props, children) {
        var annotation = props.annotation, other = __rest(props, ["annotation"]);
        this.annotation = annotation;
        this.elem = (JSX.createElement("div", null,
            JSX.createElement("div", null),
            JSX.createElement("div", null)));
        this.update();
    }
    PropertiesPointAnnotation.prototype.render = function () {
        return this.elem;
    };
    PropertiesPointAnnotation.prototype.update = function () {
        this.elem.childNodes[0].textContent = rcLoadString("MAPV_PROPERTIES_LATITUDE", convertToDMS(this.annotation.pos.lat, false));
        this.elem.childNodes[1].textContent = rcLoadString("MAPV_PROPERTIES_LONGITUDE", convertToDMS(this.annotation.pos.lng, true));
    };
    return PropertiesPointAnnotation;
}());
var PropertiesPolygonAnnotation = /** @class */ (function () {
    function PropertiesPolygonAnnotation(props, children) {
        var annotation = props.annotation, other = __rest(props, ["annotation"]);
        this.annotation = annotation;
        this.elem = (JSX.createElement("div", null,
            JSX.createElement("div", null),
            JSX.createElement("div", { style: { marginTop: "10px" } }),
            JSX.createElement("div", null)));
        this.update();
    }
    PropertiesPolygonAnnotation.prototype.render = function () {
        return this.elem;
    };
    PropertiesPolygonAnnotation.prototype.update = function () {
        DOM.replaceChildren(this.elem.childNodes[0], this.annotation.points.map(function (point) {
            return JSX.createElement(Frag, null,
                JSX.createElement("div", { style: { marginTop: "10px" } }, rcLoadString("MAPV_PROPERTIES_LATITUDE", convertToDMS(point.lat, false))),
                JSX.createElement("div", null, rcLoadString("MAPV_PROPERTIES_LONGITUDE", convertToDMS(point.lng, true))));
        }));
        var path = this.annotation.points.map(function (point) { return new google.maps.LatLng(point.lat, point.lng); });
        var firstPoint = this.annotation.points[0];
        path.push(new google.maps.LatLng(firstPoint.lat, firstPoint.lng));
        var length = google.maps.geometry.spherical.computeLength(path).toFixed(2);
        this.elem.childNodes[1].textContent = rcLoadString("MAPV_PROPERTIES_LENGTH", rcLoadString("MAPV_LENGTH_METERS", length));
        var area = google.maps.geometry.spherical.computeArea(path).toFixed(2);
        this.elem.childNodes[2].textContent = rcLoadString("MAPV_PROPERTIES_AREA", rcLoadString("MAPV_AREA_METERS_SQUARED", area));
    };
    return PropertiesPolygonAnnotation;
}());
var PropertiesPolylineAnnotation = /** @class */ (function () {
    function PropertiesPolylineAnnotation(props, children) {
        var annotation = props.annotation, other = __rest(props, ["annotation"]);
        this.annotation = annotation;
        this.elem = (JSX.createElement("div", null,
            JSX.createElement("div", null),
            JSX.createElement("div", { style: { marginTop: "10px" } })));
        this.update();
    }
    PropertiesPolylineAnnotation.prototype.render = function () {
        return this.elem;
    };
    PropertiesPolylineAnnotation.prototype.update = function () {
        DOM.replaceChildren(this.elem.childNodes[0], this.annotation.points.map(function (point) {
            return JSX.createElement(Frag, null,
                JSX.createElement("div", { style: { marginTop: "10px" } }, rcLoadString("MAPV_PROPERTIES_LATITUDE", convertToDMS(point.lat, false))),
                JSX.createElement("div", null, rcLoadString("MAPV_PROPERTIES_LONGITUDE", convertToDMS(point.lng, true))));
        }));
        var path = this.annotation.points.map(function (point) { return new google.maps.LatLng(point.lat, point.lng); });
        var length = google.maps.geometry.spherical.computeLength(path).toFixed(2);
        this.elem.childNodes[1].textContent = rcLoadString("MAPV_PROPERTIES_LENGTH", rcLoadString("MAPV_LENGTH_METERS", length));
    };
    return PropertiesPolylineAnnotation;
}());
var Sprite = /** @class */ (function () {
    function Sprite(props, children) {
        var src = props.src, idx = props.idx, other = __rest(props, ["src", "idx"]);
        this.idx = idx || 0;
        this.elem = JSX.createElement("div", __assign({}, other), children);
        this.elem.style.backgroundImage = makeCssUrl(src.url);
        this.elem.classList.add("sprite" + src.size);
        this.elem.classList.add("idx" + this.idx);
    }
    Sprite.prototype.render = function () {
        return this.elem;
    };
    Sprite.prototype.setIdx = function (idx) {
        if (idx !== this.idx) {
            this.elem.classList.remove("idx" + this.idx);
            this.idx = idx;
            this.elem.classList.add("idx" + this.idx);
        }
    };
    return Sprite;
}());
var HeaderView = /** @class */ (function () {
    function HeaderView(container, dispatch, model) {
        var _this = this;
        this.model = model;
        DOM.append(container, (JSX.createElement("div", { className: "dark1", style: { marginBottom: "4px", padding: "4px" } },
            JSX.createElement(Img, { src: this.model.images.logoDark, style: { verticalAlign: "bottom" } }),
            JSX.createElement("span", { style: { fontSize: "32px", fontWeight: "700", margin: "4px" }, ref: function (r) { return _this.title = r; } }),
            JSX.createElement("span", { style: { fontSize: "14px", margin: "4px" }, ref: function (r) { return _this.date = r; } }))));
        this.title.innerText = rcLoadString("MAPV_REPORT_TITLE", this.model.report.projectName);
        this.date.innerText = this.model.report.date.toDateString();
    }
    HeaderView.prototype.update = function (event) {
    };
    return HeaderView;
}());
var MainView = /** @class */ (function () {
    function MainView(container, dispatch, model) {
        var topContent;
        var leftContent;
        var middleContent;
        var leftArrow;
        var leftColumn;
        var toggleLeft = function () {
            var col = leftColumn.style;
            var arr = leftArrow.style;
            if (!col.marginLeft) {
                col.marginLeft = "-268px";
                arr.borderLeftColor = "#aaa";
                arr.borderRightColor = "transparent";
                arr.marginLeft = "7px";
                arr.marginRight = "-1px";
            }
            else {
                col.marginLeft = null;
                arr.borderLeftColor = "transparent";
                arr.borderRightColor = "#aaa";
                arr.marginLeft = "-1px";
                arr.marginRight = "7px";
            }
        };
        DOM.append(container, (JSX.createElement("div", { className: "fill scrollable" },
            JSX.createElement("div", { className: "fill vflow", style: { minWidth: "768px", minHeight: "410px" } },
                JSX.createElement("div", { className: "root", ref: function (r) { return topContent = r; } }),
                JSX.createElement("div", { className: "rest hflow" },
                    JSX.createElement("div", { className: "root", style: { width: "268px" }, ref: function (r) { return leftColumn = r; } },
                        JSX.createElement("div", { className: "clickable dark0", style: { position: "absolute", left: "268px", top: "10px", width: "20px", height: "50px", zIndex: "1" }, onclick: toggleLeft },
                            JSX.createElement("div", { style: { margin: "18px 7px 18px -1px", border: "7px solid transparent", borderRightColor: "#aaa" }, ref: function (r) { return leftArrow = r; } })),
                        JSX.createElement("div", { className: "fill", ref: function (r) { return leftContent = r; } })),
                    JSX.createElement("div", { className: "rest root", ref: function (r) { return middleContent = r; } }))))));
        this.header = new HeaderView(topContent, dispatch, model);
        this.sidebar = new SidebarView(leftContent, dispatch, model);
        this.map = new MapView(middleContent, dispatch, model);
    }
    MainView.prototype.update = function (event) {
        this.header.update(event);
        this.sidebar.update(event);
        this.map.update(event);
    };
    return MainView;
}());
var MapView = /** @class */ (function () {
    function MapView(container, dispatch, model) {
        var _this = this;
        this.tileSize = 256;
        this.model = model;
        this.dispatch = dispatch;
        var mapDiv;
        var styleTop = { marginTop: "10px", borderRadius: "4px 4px 0 0" };
        var styleMiddle = {};
        var styleBottom = { borderRadius: "0 0 4px 4px" };
        var styleSingle = { marginTop: "10px", borderRadius: "4px" };
        var tools = [
            {
                spriteIdx: 0,
                style: styleTop,
                drawingMode: null,
                elem: undefined,
            },
            {
                spriteIdx: 1,
                style: styleMiddle,
                drawingMode: google.maps.drawing.OverlayType.MARKER,
                elem: undefined,
            },
            {
                spriteIdx: 2,
                style: styleMiddle,
                drawingMode: google.maps.drawing.OverlayType.POLYLINE,
                elem: undefined,
            },
            {
                spriteIdx: 3,
                style: styleBottom,
                drawingMode: google.maps.drawing.OverlayType.POLYGON,
                elem: undefined,
            },
        ];
        var setDrawingMode = function (drawingMode) {
            drawingManager.setDrawingMode(drawingMode);
            for (var _i = 0, tools_1 = tools; _i < tools_1.length; _i++) {
                var tool = tools_1[_i];
                if (tool.drawingMode === drawingMode) {
                    tool.elem.classList.add("selected");
                }
                else {
                    tool.elem.classList.remove("selected");
                }
            }
        };
        var fullscreenButton;
        var requestFullscreen = container.requestFullscreen || container.webkitRequestFullscreen || container.mozRequestFullScreen || container.msRequestFullscreen;
        var exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        var isFullscreen = function () { return (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) === container; };
        var toggleFullscreen = function () {
            if (isFullscreen()) {
                exitFullscreen.call(document);
            }
            else {
                requestFullscreen.call(container);
            }
        };
        document.addEventListener("fullscreenchange", function () { return fullscreenButton.setIdx(isFullscreen() ? 1 : 0); });
        document.addEventListener("webkitfullscreenchange", function () { return fullscreenButton.setIdx(isFullscreen() ? 1 : 0); });
        document.addEventListener("mozfullscreenchange", function () { return fullscreenButton.setIdx(isFullscreen() ? 1 : 0); });
        document.addEventListener("MSFullscreenChange", function () { return fullscreenButton.setIdx(isFullscreen() ? 1 : 0); });
        var Button = function (props) { return JSX.createElement(Sprite, __assign({ className: "clickable", style: { display: "block" } }, props)); };
        DOM.append(container, (JSX.createElement(Frag, null,
            JSX.createElement("div", { className: "fill", ref: function (r) { return mapDiv = r; } }),
            JSX.createElement("div", { style: { position: "absolute", right: "10px", bottom: "24px", borderRadius: "10px" } },
                tools.map(function (tool) { return (JSX.createElement("div", { className: "light0", style: tool.style, onclick: function () { return setDrawingMode(tool.drawingMode); }, ref: function (r) { return tool.elem = r; } },
                    JSX.createElement(Button, { src: _this.model.sprites.tools, idx: tool.spriteIdx }))); }),
                JSX.createElement("div", { className: "light0", style: styleTop },
                    JSX.createElement(Button, { src: this.model.sprites.zoom, idx: 0, onclick: function () { return _this.map.setZoom(_this.map.getZoom() + 1); } })),
                JSX.createElement("div", { className: "light0", style: styleBottom },
                    JSX.createElement(Button, { src: this.model.sprites.zoom, idx: 1, onclick: function () { return _this.map.setZoom(_this.map.getZoom() - 1); } })),
                !requestFullscreen ? null :
                    JSX.createElement("div", { className: "light0", style: styleSingle },
                        JSX.createElement(Button, { src: this.model.sprites.fullscreen, idx: 0, onclick: toggleFullscreen, ref: function (r) { return fullscreenButton = r; } }))))));
        this.map = new google.maps.Map(mapDiv, {
            tilt: 0,
            mapTypeId: google.maps.MapTypeId.TERRAIN,
            mapTypeControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT,
            },
            fullscreenControl: false,
            scaleControl: true,
            streetViewControl: false,
            zoomControl: false,
            gestureHandling: "greedy",
        });
        var bounds = new google.maps.LatLngBounds();
        for (var _i = 0, _a = model.report.cameraIDs; _i < _a.length; _i++) {
            var cameraID = _a[_i];
            bounds.extend(model.cameras[cameraID].pos);
        }
        for (var _b = 0, _c = model.report.gcpIDs; _b < _c.length; _b++) {
            var gcpID = _c[_b];
            bounds.extend(model.gcps[gcpID].outPos);
        }
        this.map.fitBounds(bounds);
        this.cameras = {};
        var _loop_1 = function (idx) {
            var id = this_1.model.report.cameraIDs[idx];
            var zIndex = MapView.ZBASE_CAMERA - idx;
            this_1.cameras[id] = {
                marker: this_1.makeMarker(this_1.model.cameras[id].pos, this_1.model.icons.camera, zIndex),
                label: this_1.makeLabel(this_1.model.cameras[id].caption, this_1.model.cameras[id].pos, 12, -5, zIndex, "clickable"),
                zIndex: zIndex,
            };
            this_1.addListeners(this_1.cameras[id].marker, id);
            this_1.cameras[id].label.elem.addEventListener("mouseover", function () { return _this.cameras[id].label.setVisible(false); });
        };
        var this_1 = this;
        for (var idx = 0; idx < this.model.report.cameraIDs.length; idx++) {
            _loop_1(idx);
        }
        this.gcps = {};
        for (var idx = 0; idx < this.model.report.gcpIDs.length; idx++) {
            var id = this.model.report.gcpIDs[idx];
            var zIndex = MapView.ZBASE_GCP - idx;
            this.gcps[id] = {
                marker: this.makeMarker(this.model.gcps[id].outPos, this.model.icons.gcp, zIndex),
                label: this.makeLabel(this.model.gcps[id].caption, this.model.gcps[id].outPos, 6, 4, zIndex, "clickable"),
                residual: this.makeLine(this.model.gcps[id].inPos, this.model.gcps[id].outPos, { strokeColor: "#ffa155", strokeWeight: 1, zIndex: zIndex }),
                zIndex: zIndex,
            };
            this.addListeners(this.gcps[id].marker, id);
            this.addListeners(this.gcps[id].label.elem, id);
        }
        this.orthos = {};
        for (var idx = 0; idx < this.model.report.orthoIDs.length; idx++) {
            var id = this.model.report.orthoIDs[idx];
            this.orthos[id] = this.makeOrtho(this.model.orthos[id], MapView.ZBASE_ORTHO + idx);
            this.addListeners(this.orthos[id].border, id);
        }
        this.layers = {};
        for (var _d = 0, _e = this.model.report.orthoIDs; _d < _e.length; _d++) {
            var oid = _e[_d];
            var boundsLatLngLiterals = this.model.orthos[oid].bounds;
            var bounds_1 = {
                latLngs: boundsLatLngLiterals.map(function (point) { return new google.maps.LatLng(point.lat, point.lng); })
            };
            for (var _f = 0, _g = this.model.orthos[oid].layerIDs; _f < _g.length; _f++) {
                var id = _g[_f];
                this.layers[id] = this.makeLayer(this.model.layers[id], oid, id, bounds_1, this.map);
            }
        }
        var canvasProjectionOverlay = new MapView.CanvasProjectionOverlay();
        canvasProjectionOverlay.setMap(this.map);
        var mousePositionDiv = JSX.createElement("div", null);
        DOM.append(container, mousePositionDiv);
        container.addEventListener("mousemove", function (event) {
            var canvasProjection = canvasProjectionOverlay.getProjection();
            if (canvasProjection) {
                var latLonCoordinates = canvasProjection.fromContainerPixelToLatLng(new google.maps.Point(event.pageX - this.offsetLeft, event.pageY - this.offsetTop));
                DOM.remove(mousePositionDiv);
                mousePositionDiv = JSX.createElement("div", { style: { position: "absolute", left: "30px", top: "10px", textShadow: "1px 1px 2px black", color: "white" } },
                    rcLoadString("MAPV_PROPERTIES_LATITUDE", convertToDMS(latLonCoordinates.lat(), false)),
                    JSX.createElement("br", null),
                    rcLoadString("MAPV_PROPERTIES_LONGITUDE", convertToDMS(latLonCoordinates.lng(), true)));
                DOM.append(container, mousePositionDiv);
            }
        });
        this.annotations = {};
        var drawingManager = new google.maps.drawing.DrawingManager({
            map: this.map,
            drawingControl: false,
            polylineOptions: {
                strokeColor: "#7ecefd",
                strokeWeight: 2,
            },
            polygonOptions: {
                strokeColor: "#7ecefd",
                strokeWeight: 2,
                fillColor: "#7ecefd",
                fillOpacity: 0.1,
            },
        });
        setDrawingMode(null);
        var drawingCancelled = false;
        var pointCounter = 1;
        var polylineCounter = 1;
        var polygonCounter = 1;
        drawingManager.addListener("overlaycomplete", function (e) {
            var convert = function (ll) { return ({ lat: ll.lat(), lng: ll.lng() }); };
            setDrawingMode(null);
            switch (e.type) {
                case google.maps.drawing.OverlayType.MARKER: {
                    var overlay = e.overlay;
                    if (!drawingCancelled) {
                        dispatch({
                            kind: "CreateAnnotationAction",
                            annotation: {
                                kind: "PointAnnotation",
                                caption: rcLoadString("MAPV_POINT_NAME", pointCounter++),
                                pos: convert(overlay.getPosition()),
                            },
                        });
                    }
                    overlay.setMap(null);
                    break;
                }
                case google.maps.drawing.OverlayType.POLYLINE: {
                    var overlay = e.overlay;
                    if (!drawingCancelled) {
                        dispatch({
                            kind: "CreateAnnotationAction",
                            annotation: {
                                kind: "PolylineAnnotation",
                                caption: rcLoadString("MAPV_POLYLINE_NAME", polylineCounter++),
                                points: overlay.getPath().getArray().map(convert),
                            },
                        });
                    }
                    overlay.setMap(null);
                    break;
                }
                case google.maps.drawing.OverlayType.POLYGON: {
                    var overlay = e.overlay;
                    if (!drawingCancelled) {
                        dispatch({
                            kind: "CreateAnnotationAction",
                            annotation: {
                                kind: "PolygonAnnotation",
                                caption: rcLoadString("MAPV_POLYGON_NAME", polygonCounter++),
                                points: overlay.getPath().getArray().map(convert),
                            },
                        });
                    }
                    overlay.setMap(null);
                    break;
                }
            }
        });
        var cancelDrawing = function () {
            drawingCancelled = true;
            // This will cause the drawing manager to finish the current shape
            // and possibly trigger the overlaycomplete event, if there was
            // a shape in progress:
            setDrawingMode(null);
            // We can't reset the flag from the overlaycomplete event because
            // the event doesn't always fire. But since the map events seem
            // to fire synchronously resetting it from here should be fine:
            drawingCancelled = false;
        };
        this.map.addListener("rightclick", cancelDrawing);
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" || e.key === "Esc") {
                if (drawingManager.getDrawingMode() !== null) {
                    cancelDrawing();
                }
                else {
                    _this.dispatch({ kind: "SelectAction", id: null });
                }
            }
        });
        this.updateVisibility();
        this.hotID = this.model.selection.hotID;
        this.selectedID = this.model.selection.selectedID;
        this.setHighlight(this.hotID, true, this.selectedID === this.hotID);
        this.setHighlight(this.selectedID, this.hotID === this.selectedID, true);
        this.mouseOverIDs = [];
    }
    MapView.prototype.update = function (event) {
        switch (event.kind) {
            case "AnnotationListAddedEvent":
            case "AnnotationListMovedEvent":
            case "AnnotationListRemovedEvent":
                this.updateAnnotationList();
                break;
            case "DisplayChangedEvent":
            case "FiltersChangedEvent":
                this.updateVisibility();
                break;
            case "HotChangedEvent":
                this.setHighlight(this.hotID, false, this.selectedID === this.hotID);
                this.hotID = this.model.selection.hotID;
                this.setHighlight(this.hotID, true, this.selectedID === this.hotID);
                break;
            case "LayerListMovedEvent":
                this.updateLayersMove(event.orthoID, event.src, event.dest);
                break;
            case "ObjectChangedEvent":
                this.updateAnnotationLabels(event.id);
                break;
            case "OrthoListMovedEvent":
                this.updateOrthosMove(event.src, event.dest);
                break;
            case "SelectedChangedEvent":
                this.setHighlight(this.selectedID, this.hotID === this.selectedID, false);
                this.selectedID = this.model.selection.selectedID;
                this.setHighlight(this.selectedID, this.hotID === this.selectedID, true);
                break;
        }
    };
    MapView.prototype.addListeners = function (obj, id) {
        var _this = this;
        var getZIndex = function (id) {
            if (id in _this.cameras) {
                return _this.cameras[id].zIndex;
            }
            if (id in _this.gcps) {
                return _this.gcps[id].zIndex;
            }
            if (id in _this.orthos) {
                return _this.orthos[id].zIndex;
            }
            if (id in _this.annotations) {
                return _this.annotations[id].zIndex;
            }
            return -1;
        };
        var sendHotAction = function () {
            var hotID = null;
            var hotZIndex = -1;
            for (var _i = 0, _a = _this.mouseOverIDs; _i < _a.length; _i++) {
                var id_1 = _a[_i];
                var zIndex = getZIndex(id_1);
                if (zIndex > hotZIndex) {
                    hotID = id_1;
                    hotZIndex = zIndex;
                }
            }
            _this.dispatch({ kind: "HotAction", id: hotID });
        };
        var clickListener = function () { return _this.dispatch({ kind: "SelectAction", id: id }); };
        var mouseOverListener = function () {
            _this.mouseOverIDs.push(id);
            sendHotAction();
        };
        var mouseOutListener = function () {
            var idx = _this.mouseOverIDs.indexOf(id);
            if (idx >= 0) {
                _this.mouseOverIDs.splice(idx, 1);
                sendHotAction();
            }
        };
        if (obj instanceof HTMLElement) {
            obj.addEventListener("click", clickListener);
            obj.addEventListener("mouseover", mouseOverListener);
            obj.addEventListener("mouseout", mouseOutListener);
        }
        else {
            obj.addListener("click", clickListener);
            obj.addListener("mouseover", mouseOverListener);
            obj.addListener("mouseout", mouseOutListener);
        }
    };
    MapView.prototype.setHighlight = function (id, hot, selected) {
        if (id !== null) {
            if (id in this.cameras) {
                this.cameras[id].marker.setIcon(this.makeIcon(selected ? this.model.icons.cameraSelected : hot ? this.model.icons.cameraHot : this.model.icons.camera));
                this.cameras[id].label.setVisible(this.model.filters.cameras && hot);
            }
            else if (id in this.gcps) {
                this.gcps[id].marker.setIcon(this.makeIcon(selected ? this.model.icons.gcpSelected : hot ? this.model.icons.gcpHot : this.model.icons.gcp));
            }
            else if (id in this.orthos) {
                if (this.model.selection.selectedID !== null && this.model.orthos[id].layerIDs.indexOf(this.model.selection.selectedID) >= 0) {
                    selected = true;
                }
                this.orthos[id].border.setOptions({
                    strokeColor: selected ? "#fb7d00" : hot ? "#7dfb00" : "#7ecefd",
                });
            }
            else if (id in this.annotations) {
                var annotation = this.annotations[id].annotation;
                var labels = this.annotations[id].labels;
                if (annotation instanceof google.maps.Marker) {
                    annotation.setIcon(this.makeIcon(selected ? this.model.icons.markerSelected : hot ? this.model.icons.markerHot : this.model.icons.marker));
                }
                else if (annotation instanceof google.maps.Polyline) {
                    annotation.setOptions({
                        strokeColor: selected ? "#fb7d00" : hot ? "#7dfb00" : "#7ecefd",
                        editable: selected,
                    });
                    for (var _i = 0, labels_1 = labels; _i < labels_1.length; _i++) {
                        var label = labels_1[_i];
                        label.setVisible(annotation.getVisible() && (selected || hot));
                    }
                }
                else {
                    annotation.setOptions({
                        strokeColor: selected ? "#fb7d00" : hot ? "#7dfb00" : "#7ecefd",
                        fillColor: selected ? "#fb7d00" : hot ? "#7dfb00" : "#7ecefd",
                        editable: selected,
                    });
                    for (var _a = 0, labels_2 = labels; _a < labels_2.length; _a++) {
                        var label = labels_2[_a];
                        label.setVisible(annotation.getVisible() && (selected || hot));
                    }
                }
            }
            else {
                for (var orthoId in this.model.orthos) {
                    if (this.model.orthos[orthoId].layerIDs.indexOf(id) >= 0) {
                        if (orthoId === this.model.selection.selectedID || this.model.selection.selectedID !== null && this.model.orthos[orthoId].layerIDs.indexOf(this.model.selection.selectedID) >= 0) {
                            selected = true;
                        }
                        this.orthos[orthoId].border.setOptions({
                            strokeColor: selected ? "#fb7d00" : hot ? "#7dfb00" : "#7ecefd",
                        });
                        break;
                    }
                }
            }
        }
    };
    MapView.prototype.makeMarker = function (position, icon, zIndex) {
        return new google.maps.Marker({
            map: this.map,
            position: position,
            icon: this.makeIcon(icon),
            zIndex: zIndex,
        });
    };
    MapView.prototype.makeLabel = function (caption, pos, xOffset, yOffset, zIndex, className, angle) {
        var label = new MapView.Label(caption, pos.lat, pos.lng, xOffset, yOffset, zIndex, className, angle);
        label.setMap(this.map);
        return label;
    };
    MapView.prototype.makeIcon = function (icon) {
        return {
            url: icon.url.replace(/\\/g, "/"),
            anchor: new google.maps.Point(icon.anchor.x, icon.anchor.y),
        };
    };
    MapView.prototype.makeLine = function (start, end, style) {
        return new google.maps.Polyline(__assign({ map: this.map, path: [start, end] }, style));
    };
    MapView.prototype.makeOrtho = function (ortho, zIndex) {
        return {
            border: new google.maps.Polygon({
                strokeColor: "#7ecefd",
                strokeOpacity: 1,
                strokeWeight: 2,
                fillOpacity: 0,
                map: this.map,
                paths: ortho.bounds,
                zIndex: zIndex,
            }),
            zIndex: zIndex,
        };
    };
    MapView.prototype.makeLayer = function (layer, orthoId, layerId, bounds, map) {
        var counter = 0;
        var tiles = {};
        var opacityStyle = "1";
        return {
            overlay: {
                getTile: function (coord, zoom, ownerDocument) {
                    var url = "";
                    var x = coord.x;
                    var y = coord.y;
                    var z = zoom;
                    var size = layer.tileSize;
                    while (z > 0) {
                        var key = z + "_" + x + "_" + y;
                        if (key in layer.tiles) {
                            url = layer.tilePath
                                .replace("{x}", "" + x)
                                .replace("{y}", "" + y)
                                .replace("{z}", "" + z);
                            break;
                        }
                        else {
                            // continue searching at least some image with lower resolution
                            // defined for 2 times bigger region
                            x = x >> 1;
                            y = y >> 1;
                            z -= 1;
                            size = size << 1;
                        }
                    }
                    if (url) {
                        // (x, y) are greatest integers such that `(x, y) * size <= (coord.x, coord.y) * layer.tileSize`
                        // let (xOffset, yOffset) are differences between sides of this inequality, i.e. reminders modulo `size`:
                        var xOffset = coord.x * layer.tileSize % size;
                        var yOffset = coord.y * layer.tileSize % size;
                        var scale_1 = 1 << zoom;
                        // compute and cache bound-points in first call for orthoprojection
                        if (!('points' in bounds)) {
                            var projection_1 = map.getProjection();
                            bounds.points = bounds.latLngs.map(function (latLng) { return projection_1.fromLatLngToPoint(latLng); });
                        }
                        var existsGreaterX_1 = false, existsGreaterY_1 = false, existsSmallerX_1 = false, existsSmallerY_1 = false;
                        var svgPoints = bounds.points.map(function (point) {
                            var x = Math.round(point.x * scale_1 - coord.x * layer.tileSize);
                            var y = Math.round(point.y * scale_1 - coord.y * layer.tileSize);
                            if (x >= 0) {
                                existsGreaterX_1 = true;
                            }
                            if (y >= 0) {
                                existsGreaterY_1 = true;
                            }
                            if (x < layer.tileSize) {
                                existsSmallerX_1 = true;
                            }
                            if (y < layer.tileSize) {
                                existsSmallerY_1 = true;
                            }
                            return x + ' ' + y;
                        });
                        // Check whether zone bounded by `bounds` can overlap tile.
                        // We test whether tile overlaps minimal rectangle (parallel to coordinate axis) covering bounds.
                        if (existsGreaterX_1 && existsGreaterY_1 && existsSmallerX_1 && existsSmallerY_1) {
                            var counterString = "" + (counter++);
                            // We need a unique guid for every call. Identifier defined as (orthoId, layerId, coord.x, coord.y, zoom) would not be unique,
                            // because API calls the same combination more times and then releases some of them, while tiles generated by other calls should remain.
                            // Therefore we use (orthoId, layerId, counter), where the `counter` is different in every call for the same (orthoId, layerId).
                            var guid = orthoId + '_' + layerId + '_' + counterString;
                            var idClipPath = 'id_clip_path_' + guid;
                            var div = ownerDocument.createElement("div");
                            div.style.imageRendering = "pixelated";
                            div.style.opacity = opacityStyle;
                            div.innerHTML =
                                "<svg style=\"overflow:hidden\" height=\"" + layer.tileSize + "\" width=\"" + layer.tileSize + "\" viewBox=\"0 0 " + layer.tileSize + " " + layer.tileSize + "\">\n                                    <defs><clipPath id=\"" + idClipPath + "\"><path d=\"M" + svgPoints.join(' L') + " Z\" /></clipPath></defs>\n                                    <image xlink:href=\"" + fixUrl(url) + "\" x=\"" + -xOffset + "\" y=\"" + -yOffset + "\" width=\"" + size + "\" height=\"" + size + "\" clip-path=\"url(#" + idClipPath + ")\" />\n                                </svg>";
                            div.__id = counterString;
                            tiles[counterString] = div;
                            return div;
                        }
                    }
                    return null;
                },
                releaseTile: function (tile) {
                    delete tiles[tile.__id];
                },
                setOpacity: function (opacity) {
                    opacityStyle = "" + (opacity / 100);
                    for (var key in tiles) {
                        tiles[key].style.opacity = opacityStyle;
                    }
                },
                tileSize: new google.maps.Size(layer.tileSize, layer.tileSize),
            },
            visible: false,
        };
    };
    MapView.prototype.updateAnnotationList = function () {
        var _this = this;
        var extra = {};
        for (var id in this.annotations) {
            extra[id] = true;
        }
        var _loop_2 = function (idx) {
            var id = this_2.model.report.annotationIDs[idx];
            extra[id] = false;
            if (!(id in this_2.annotations)) {
                var annotation = this_2.model.annotations[id];
                var path = void 0;
                var addPathListeners = function (path) {
                    path.addListener("set_at", function (idx) { return _this.dispatch({ kind: "PolyAnnotationChangePointAction", id: id, idx: idx, lat: path.getAt(idx).lat(), lng: path.getAt(idx).lng() }); });
                    path.addListener("insert_at", function (idx) { return _this.dispatch({ kind: "PolyAnnotationAddPointAction", id: id, idx: idx, lat: path.getAt(idx).lat(), lng: path.getAt(idx).lng() }); });
                    path.addListener("remove_at", function (idx) { return _this.dispatch({ kind: "PolyAnnotationRemovePointAction", id: id, idx: idx }); });
                };
                switch (annotation.kind) {
                    case "PointAnnotation": {
                        var zIndex = MapView.ZBASE_POINT_ANNOTATION + idx;
                        var marker = this_2.makeMarker(annotation.pos, this_2.model.icons.marker, zIndex);
                        marker.setDraggable(true);
                        var labels = [
                            this_2.makeLabel(annotation.caption, annotation.pos, 12, -17, MapView.ZBASE_POINT_ANNOTATION + idx, "clickable"),
                        ];
                        this_2.addListeners(labels[0].elem, id);
                        this_2.annotations[id] = {
                            annotation: marker,
                            labels: labels,
                            zIndex: zIndex,
                        };
                        this_2.addListeners(marker, id);
                        marker.addListener("drag", function (e) { return _this.dispatch({ kind: "PointAnnotationMoveAction", id: id, lat: e.latLng.lat(), lng: e.latLng.lng() }); });
                        break;
                    }
                    case "PolylineAnnotation": {
                        path = annotation.points.map(function (point) { return new google.maps.LatLng(point.lat, point.lng); });
                        var zIndex = MapView.ZBASE_POLY_ANNOTATION + idx;
                        var labels = this_2.makePolyLabels(path, zIndex, false);
                        var polyline = new google.maps.Polyline({
                            map: this_2.map,
                            path: clone(annotation.points),
                            strokeColor: "#7ecefd",
                            strokeWeight: 2,
                            zIndex: zIndex,
                        });
                        this_2.annotations[id] = {
                            annotation: polyline,
                            labels: labels,
                            zIndex: zIndex,
                        };
                        this_2.addListeners(polyline, id);
                        addPathListeners(polyline.getPath());
                        break;
                    }
                    case "PolygonAnnotation": {
                        path = annotation.points.map(function (point) { return new google.maps.LatLng(point.lat, point.lng); });
                        var firstPoint = annotation.points[0];
                        path.push(new google.maps.LatLng(firstPoint.lat, firstPoint.lng));
                        var zIndex = MapView.ZBASE_POLY_ANNOTATION + idx;
                        var labels = this_2.makePolyLabels(path, zIndex, true);
                        var polygon = new google.maps.Polygon({
                            map: this_2.map,
                            paths: clone(annotation.points),
                            strokeColor: "#7ecefd",
                            strokeWeight: 2,
                            fillColor: "#7ecefd",
                            fillOpacity: 0.1,
                            zIndex: zIndex,
                        });
                        this_2.annotations[id] = {
                            annotation: polygon,
                            labels: labels,
                            zIndex: zIndex,
                        };
                        this_2.addListeners(polygon, id);
                        addPathListeners(polygon.getPath());
                        break;
                    }
                }
            }
            else {
                var annotation = this_2.annotations[id].annotation;
                var zIndex = annotation instanceof google.maps.Marker ? MapView.ZBASE_POINT_ANNOTATION + idx : MapView.ZBASE_POLY_ANNOTATION + idx;
                this_2.annotations[id].zIndex = zIndex;
                for (var _i = 0, _a = this_2.annotations[id].labels; _i < _a.length; _i++) {
                    var label = _a[_i];
                    label.setZIndex(zIndex);
                }
                if (annotation instanceof google.maps.Marker) {
                    annotation.setOptions({ zIndex: zIndex });
                }
                else if (annotation instanceof google.maps.Polyline) {
                    annotation.setOptions({ zIndex: zIndex });
                }
                else {
                    annotation.setOptions({ zIndex: zIndex });
                }
            }
        };
        var this_2 = this;
        for (var idx = 0; idx < this.model.report.annotationIDs.length; idx++) {
            _loop_2(idx);
        }
        for (var id in extra) {
            if (extra[id]) {
                var annotation = this.annotations[id].annotation;
                if (annotation instanceof google.maps.Marker) {
                    annotation.setMap(null);
                }
                else {
                    annotation.setMap(null);
                }
                for (var _i = 0, _a = this.annotations[id].labels; _i < _a.length; _i++) {
                    var label = _a[_i];
                    label.setMap(null);
                }
                delete this.annotations[id];
            }
        }
    };
    MapView.prototype.updateAnnotationLabels = function (id) {
        if (id in this.annotations) {
            var annotation = this.model.annotations[id];
            var labels = new Array();
            var path = void 0;
            switch (annotation.kind) {
                case "PointAnnotation":
                    for (var _i = 0, _a = this.annotations[id].labels; _i < _a.length; _i++) {
                        var label = _a[_i];
                        label.setPosition(annotation.pos.lat, annotation.pos.lng);
                        label.setText(annotation.caption);
                    }
                    break;
                case "PolylineAnnotation":
                    for (var _b = 0, _c = this.annotations[id].labels; _b < _c.length; _b++) {
                        var label = _c[_b];
                        label.setMap(null);
                    }
                    path = annotation.points.map(function (point) { return new google.maps.LatLng(point.lat, point.lng); });
                    labels = this.makePolyLabels(path, this.annotations[id].zIndex, false);
                    this.annotations[id].labels = labels;
                    break;
                case "PolygonAnnotation":
                    for (var _d = 0, _e = this.annotations[id].labels; _d < _e.length; _d++) {
                        var label = _e[_d];
                        label.setMap(null);
                    }
                    path = annotation.points.map(function (point) { return new google.maps.LatLng(point.lat, point.lng); });
                    var firstPoint = annotation.points[0];
                    path.push(new google.maps.LatLng(firstPoint.lat, firstPoint.lng));
                    labels = this.makePolyLabels(path, this.annotations[id].zIndex, true);
                    this.annotations[id].labels = labels;
                    break;
            }
        }
    };
    MapView.prototype.makePolyLabels = function (path, zIndex, isPolygon) {
        var labels = new Array();
        var previousVertex = null;
        var previousPixelCoordinate = null;
        var polyBounds = new google.maps.LatLngBounds();
        var angle = 0;
        for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
            var vertex = path_1[_i];
            polyBounds.extend(vertex);
            var scale = 1 << this.map.getZoom();
            var worldCoordinate = this.project(vertex);
            var pixelCoordinate = new google.maps.Point(Math.floor(worldCoordinate.x * scale), Math.floor(worldCoordinate.y * scale));
            if (previousVertex) {
                var caption = rcLoadString("MAPV_LENGTH_METERS", google.maps.geometry.spherical.computeDistanceBetween(previousVertex, vertex).toFixed(2));
                var bounds = new google.maps.LatLngBounds();
                bounds.extend(previousVertex);
                bounds.extend(vertex);
                var center = bounds.getCenter();
                if (previousPixelCoordinate) {
                    var smallerPixelCoordinate = previousPixelCoordinate;
                    var biggerPixelCoordinate = pixelCoordinate;
                    if (Math.abs(vertex.lng() - previousVertex.lng()) > 180) {
                        if (vertex.lng() < previousVertex.lng()) {
                            biggerPixelCoordinate = previousPixelCoordinate;
                            worldCoordinate = this.project(vertex, true);
                        }
                        else {
                            worldCoordinate = this.project(previousVertex, true);
                        }
                        smallerPixelCoordinate = new google.maps.Point(Math.floor(worldCoordinate.x * scale), Math.floor(worldCoordinate.y * scale));
                    }
                    angle = Math.atan2(biggerPixelCoordinate.y - smallerPixelCoordinate.y, biggerPixelCoordinate.x - smallerPixelCoordinate.x) * 180 / Math.PI;
                }
                var label = this.makeLabel(caption, { lat: center.lat(), lng: center.lng() }, 0, 0, zIndex, "", angle);
                labels.push(label);
            }
            previousVertex = vertex;
            previousPixelCoordinate = pixelCoordinate;
        }
        if (isPolygon) {
            var polyCenter = polyBounds.getCenter();
            var caption = rcLoadString("MAPV_AREA_METERS_SQUARED", google.maps.geometry.spherical.computeArea(path).toFixed(2));
            var label = this.makeLabel(caption, { lat: polyCenter.lat(), lng: polyCenter.lng() }, 0, 0, zIndex, "", 0);
            labels.push(label);
        }
        return labels;
    };
    /**
     * The mapping between latitude, longitude and pixels is defined by the web
     * mercator projection.
     */
    MapView.prototype.project = function (latLng, add360ToLng) {
        var siny = Math.sin(latLng.lat() * Math.PI / 180);
        // Truncating to 0.9999 effectively limits latitude to 89.189. This is
        // about a third of a tile past the edge of the world tile.
        siny = Math.min(Math.max(siny, -0.9999), 0.9999);
        var lngShift = add360ToLng ? 360 : 0;
        return new google.maps.Point(this.tileSize * (0.5 + (latLng.lng() + lngShift) / 360), this.tileSize * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)));
    };
    MapView.prototype.updateLayersMove = function (oid, src, dest) {
        var id = this.model.orthos[oid].layerIDs[dest];
        if (this.layers[id].visible) {
            this.map.overlayMapTypes.removeAt(this.map.overlayMapTypes.getArray().indexOf(this.layers[id].overlay));
            this.layers[id].visible = false;
            this.updateVisibility();
        }
    };
    MapView.prototype.updateOrthosMove = function (src, dest) {
        for (var idx = 0; idx < this.model.report.orthoIDs.length; idx++) {
            this.orthos[this.model.report.orthoIDs[idx]].border.setOptions({ zIndex: MapView.ZBASE_ORTHO + idx });
        }
        var oid = this.model.report.orthoIDs[dest];
        for (var _i = 0, _a = this.model.orthos[oid].layerIDs; _i < _a.length; _i++) {
            var id = _a[_i];
            if (this.layers[id].visible) {
                this.map.overlayMapTypes.removeAt(this.map.overlayMapTypes.getArray().indexOf(this.layers[id].overlay));
                this.layers[id].visible = false;
            }
        }
        this.updateVisibility();
    };
    MapView.prototype.updateVisibility = function () {
        for (var id in this.cameras) {
            this.cameras[id].marker.setVisible(this.model.filters.cameras);
            this.cameras[id].label.setVisible(this.model.filters.cameras && this.hotID === id);
        }
        for (var id in this.gcps) {
            this.gcps[id].marker.setVisible(this.model.filters.gcps);
            this.gcps[id].label.setVisible(this.model.filters.gcps);
            this.gcps[id].residual.setVisible(this.model.filters.gcps);
        }
        for (var id in this.orthos) {
            this.orthos[id].border.setVisible(this.model.filters.orthos && this.model.display.orthoVisibility[id]);
        }
        for (var id in this.layers) {
            this.layers[id].overlay.setOpacity(this.model.display.layerOpacity[id]);
        }
        for (var id in this.annotations) {
            this.annotations[id].annotation.setVisible(this.model.filters.annotations && this.model.display.annotationVisibility[id]);
            if ((this.annotations[id].annotation instanceof google.maps.Marker)) {
                for (var _i = 0, _a = this.annotations[id].labels; _i < _a.length; _i++) {
                    var label = _a[_i];
                    label.setVisible(this.model.filters.annotations && this.model.display.annotationVisibility[id]);
                }
            } else {
                for (var _i = 0, _a = this.annotations[id].labels; _i < _a.length; _i++) {
                    var label = _a[_i];
                    label.setVisible(this.model.filters.annotations && this.model.display.annotationVisibility[id] && (id == this.selectedID));
                }
            }
        }
        var oidx = 0;
        for (var _b = 0, _c = this.model.report.orthoIDs; _b < _c.length; _b++) {
            var oid = _c[_b];
            for (var _d = 0, _e = this.model.orthos[oid].layerIDs; _d < _e.length; _d++) {
                var id = _e[_d];
                var display = this.model.filters.orthos && this.model.display.orthoVisibility[oid] && this.model.display.layerVisibility[id];
                if (display !== this.layers[id].visible) {
                    if (this.layers[id].visible) {
                        this.map.overlayMapTypes.removeAt(oidx);
                    }
                    if (display) {
                        this.map.overlayMapTypes.insertAt(oidx, this.layers[id].overlay);
                    }
                    this.layers[id].visible = display;
                }
                if (display) {
                    oidx += 1;
                }
            }
        }
    };
    MapView.ZBASE_ORTHO = 0;
    MapView.ZBASE_POLY_ANNOTATION = 1000000;
    MapView.ZBASE_GCP = 2000000;
    MapView.ZBASE_CAMERA = 3000000;
    MapView.ZBASE_POINT_ANNOTATION = 4000000;
    MapView.Label = /** @class */ (function (_super) {
        __extends(class_1, _super);
        function class_1(text, lat, lng, xOffset, yOffset, zIndex, className, angle) {
            var _this = _super.call(this) || this;
            _this.position = new google.maps.LatLng(lat, lng);
            _this.elem = (JSX.createElement("div", { className: className, style: { fontSize: "12px", textShadow: "1px 1px 1px black", color: "white", position: "absolute", zIndex: "" + zIndex } }, text));
            if (angle !== undefined) {
                angle = angle >= 90 ? angle - 180 : angle;
                angle = angle <= -90 ? angle + 180 : angle;
                var translateX = -50;
                var translateY = Math.abs(50 * (angle / 90));
                _this.elem.style.transform = "translate(" + translateX + "%) rotate(" + angle + "deg) translate(0," + translateY + "%)";
            }
            google.maps.OverlayView.preventMapHitsFrom(_this.elem);
            _this.offset = { x: xOffset, y: yOffset };
            return _this;
        }
        class_1.prototype.draw = function () {
            var position = this.getProjection().fromLatLngToDivPixel(this.position);
            this.elem.style.left = position.x + this.offset.x + "px";
            this.elem.style.top = position.y + this.offset.y + "px";
        };
        class_1.prototype.onAdd = function () {
            this.getPanes().overlayMouseTarget.appendChild(this.elem);
        };
        class_1.prototype.onRemove = function () {
            DOM.remove(this.elem);
        };
        class_1.prototype.setPosition = function (lat, lng) {
            this.position = new google.maps.LatLng(lat, lng);
            this.draw();
        };
        class_1.prototype.setText = function (text) {
            this.elem.innerText = text;
        };
        class_1.prototype.setVisible = function (visible) {
            this.elem.style.visibility = visible ? null : "hidden";
        };
        class_1.prototype.setZIndex = function (zIndex) {
            this.elem.style.zIndex = "" + zIndex;
        };
        return class_1;
    }(google.maps.OverlayView));
    MapView.CanvasProjectionOverlay = /** @class */ (function (_super) {
        __extends(class_2, _super);
        function class_2() {
            return _super.call(this) || this;
        }
        class_2.prototype.draw = function () { };
        class_2.prototype.onAdd = function () { };
        class_2.prototype.onRemove = function () { };
        return class_2;
    }(google.maps.OverlayView));
    return MapView;
}());
var OutlineView = /** @class */ (function () {
    function OutlineView(container, dispatch, model) {
        var _this = this;
        this.model = model;
        this.dispatch = dispatch;
        this.rows = {};
        this.annotations = [];
        this.annotationVisibilityButtons = {};
        this.orthoVisibilityButtons = {};
        this.layerVisibilityButtons = {};
        this.selectedID = null;
        this.draggingID = "";
        this.draggingSection = "";
        DOM.append(container, (JSX.createElement(Frag, null,
            JSX.createElement("div", { className: "fill hflow", style: { zIndex: "-2" } },
                JSX.createElement("div", { className: "dark1 rest" }),
                JSX.createElement("div", { className: "dark2", style: { width: "70px", marginLeft: "2px" } })),
            JSX.createElement("div", { className: "fill scrollable" },
                JSX.createElement(OutlineTree, { sprites: this.model.sprites, ref: function (r) { return _this.outlineTree = r; } })))));
        {
            var id = null;
            var src = this.model.sprites.visible;
            this.outlineTree.addItem("c", this.makeRow(rcLoadString("MAPV_OUTLINE_CAMERAS"), id, this.makeButton(src, function (r) { return _this.filterCameras = r; }, { kind: "ToggleFilterCamerasAction" })));
            this.outlineTree.addItem("p", this.makeRow(rcLoadString("MAPV_OUTLINE_GCPS"), id, this.makeButton(src, function (r) { return _this.filterGCPs = r; }, { kind: "ToggleFilterGCPsAction" })));
            this.outlineTree.addItem("o", this.makeRow(rcLoadString("MAPV_OUTLINE_ORTHOS"), id, this.makeButton(src, function (r) { return _this.filterOrthos = r; }, { kind: "ToggleFilterOrthosAction" })));
            this.outlineTree.addItem("a", this.makeRow(rcLoadString("MAPV_OUTLINE_ANNOTATIONS"), id, this.makeButton(src, function (r) { return _this.filterAnnotations = r; }, { kind: "ToggleFilterAnnotationsAction" })));
        }
        for (var _i = 0, _a = this.model.report.cameraIDs; _i < _a.length; _i++) {
            var id = _a[_i];
            this.outlineTree.addItem(id, this.makeRow(this.model.cameras[id].caption, id), "c");
        }
        for (var _b = 0, _c = this.model.report.gcpIDs; _b < _c.length; _b++) {
            var id = _c[_b];
            var err = rcLoadString("MAPV_OUTLINE_ALIGNMENT_ERROR", rcLoadString("MAPV_LENGTH_METERS", dist(this.model.gcps[id].inPos, this.model.gcps[id].outPos).toFixed(2)));
            this.outlineTree.addItem(id, this.makeRow(this.model.gcps[id].caption, id, this.makeComment(err, "#996033")), "p");
        }
        var _loop_3 = function (id) {
            this_3.outlineTree.addItem(id, this_3.makeRow(this_3.model.orthos[id].caption, id, this_3.makeButton(this_3.model.sprites.visible, function (r) { return _this.orthoVisibilityButtons[id] = r; }, { kind: "ToggleOrthoVisibilityAction", id: id })), "o", 0);
            this_3.makeRowDraggable(id, "o", this_3.model.report.orthoIDs);
            this_3.updateDisplayButtons(id);
            var _loop_4 = function (lid) {
                var layer = this_3.model.layers[lid];
                var caption = layer.palette
                    ? layer.isDtm
                        ? rcLoadString("MAPV_OUTLINE_ALTITUDE_DTM_LAYER")
                        : rcLoadString("MAPV_OUTLINE_ALTITUDE_DSM_LAYER")
                    : rcLoadString("MAPV_OUTLINE_IMAGE_LAYER");
                this_3.outlineTree.addItem(lid, this_3.makeRow(caption, lid, this_3.makeButton(this_3.model.sprites.visible, function (r) { return _this.layerVisibilityButtons[lid] = r; }, { kind: "ToggleLayerVisibilityAction", id: lid })), id, 0);
                this_3.makeRowDraggable(lid, id, this_3.model.orthos[id].layerIDs);
                this_3.updateDisplayButtons(lid);
            };
            for (var _i = 0, _a = this_3.model.orthos[id].layerIDs; _i < _a.length; _i++) {
                var lid = _a[_i];
                _loop_4(lid);
            }
        };
        var this_3 = this;
        for (var _d = 0, _e = this.model.report.orthoIDs; _d < _e.length; _d++) {
            var id = _e[_d];
            _loop_3(id);
        }
        for (var idx = 0; idx < this.model.report.annotationIDs.length; idx++) {
            this.updateAnnotationsAdd(idx);
        }
        this.updateFilterButtons();
        this.updateSelection();
    }
    OutlineView.prototype.update = function (event) {
        switch (event.kind) {
            case "AnnotationListAddedEvent":
                this.updateAnnotationsAdd(event.idx);
                break;
            case "AnnotationListMovedEvent":
                this.outlineTree.moveItem(this.model.report.annotationIDs[event.dest], this.model.report.annotationIDs.length - 1 - event.dest);
                break;
            case "AnnotationListRemovedEvent":
                this.outlineTree.removeItem(event.id);
                break;
            case "DisplayChangedEvent":
                this.updateDisplayButtons(event.id);
                break;
            case "FiltersChangedEvent":
                this.updateFilterButtons();
                break;
            case "LayerListMovedEvent":
                var ortho = this.model.orthos[event.orthoID];
                this.outlineTree.moveItem(ortho.layerIDs[event.dest], ortho.layerIDs.length - 1 - event.dest);
                break;
            case "ObjectChangedEvent":
                this.updateCaption(event.id);
                break;
            case "OrthoListMovedEvent":
                this.outlineTree.moveItem(this.model.report.orthoIDs[event.dest], this.model.report.orthoIDs.length - 1 - event.dest);
                break;
            case "SelectedChangedEvent":
                this.updateSelection();
                break;
        }
    };
    OutlineView.prototype.makeButton = function (src, ref, action) {
        var _this = this;
        return (JSX.createElement(Sprite, { src: src, ref: ref, className: "clickable", style: { margin: "1px 1px 0 1px" }, onclick: function () { return _this.dispatch(action); } }));
    };
    OutlineView.prototype.makeComment = function (text, color) {
        return (JSX.createElement("div", { className: "oneline", style: { display: "inline-block", marginLeft: "auto", color: color } }, text));
    };
    OutlineView.prototype.makeRow = function (text, id) {
        var _this = this;
        var buttons = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            buttons[_i - 2] = arguments[_i];
        }
        var onclick = id === null ? undefined : function () { return _this.dispatch({ kind: "SelectAction", id: id }); };
        var onmouseenter = id === null ? undefined : function () { return _this.dispatch({ kind: "HotAction", id: id }); };
        var onmouseleave = id === null ? undefined : function () { return _this.dispatch({ kind: "HotAction", id: null }); };
        var row = id === null ? undefined : this.rows[id] = {
            back: undefined,
            front: undefined,
            text: undefined,
            highlight: undefined,
        };
        return (JSX.createElement(Frag, null,
            JSX.createElement("div", { className: "oneline rest root clickable", style: { padding: "1px 4px 1px 1px" }, onclick: onclick, onmouseenter: onmouseenter, onmouseleave: onmouseleave, ref: function (r) { return set(row).front = r; } },
                JSX.createElement("div", { className: "noselect", style: { pointerEvents: "none" }, ref: function (r) { return set(row).text = r; } }, text)),
            JSX.createElement("div", { className: "hflow", style: { width: "70px", marginLeft: "2px", padding: "1px 3px" } }, buttons),
            JSX.createElement("div", { className: "fill hflow", style: { zIndex: "-1" } },
                JSX.createElement("div", { className: "dark1 clickable rest", style: { borderRight: "2px solid black" }, ref: function (r) { return set(row).back = r; } }),
                JSX.createElement("div", { className: "dark2", style: { width: "70px" } })),
            JSX.createElement("div", { className: "hidden", style: { position: "absolute", left: "0", top: "2px", bottom: "2px", width: "3px", background: "#ffa155" }, ref: function (r) { return set(row).highlight = r; } })));
    };
    OutlineView.prototype.makeRowDeletable = function (id) {
        var _this = this;
        var front = this.rows[id].front;
        var button;
        DOM.append(front, JSX.createElement(Sprite, { src: this.model.sprites.delete, className: "clickable none", style: { position: "absolute", top: "1px", right: "2px" }, onclick: function (e) { _this.dispatch({ kind: "DeleteAction", id: id }); e.stopPropagation(); }, ref: function (r) { return button = r; } }));
        front.addEventListener("mouseenter", function () { return button.render().classList.remove("none"); });
        front.addEventListener("mouseleave", function () { return button.render().classList.add("none"); });
    };
    OutlineView.prototype.makeRowDraggable = function (id, section, dataSrc) {
        var _this = this;
        var elem = this.rows[id].front;
        elem.draggable = true;
        elem.addEventListener("dragstart", function (e) {
            e.dataTransfer.setData("Text", "");
            e.dataTransfer.effectAllowed = "move";
            _this.draggingID = id;
            _this.draggingSection = section;
        });
        var dragCheck = function () { return _this.draggingSection === section; };
        elem.addEventListener("dragenter", function (e) {
            if (e.target === elem && dragCheck()) {
                var diff = dataSrc.indexOf(id) - dataSrc.indexOf(_this.draggingID);
                if (diff < 0) {
                    elem.style.borderBottom = "1px #00ace6 solid";
                    elem.style.marginBottom = "-1px";
                }
                if (diff > 0) {
                    elem.style.borderTop = "1px #00ace6 solid";
                    elem.style.marginTop = "-1px";
                }
                e.preventDefault();
            }
        });
        elem.addEventListener("dragleave", function (e) {
            if (e.target === elem) {
                elem.style.borderBottom = "";
                elem.style.marginBottom = "";
                elem.style.borderTop = "";
                elem.style.marginTop = "";
            }
        });
        elem.addEventListener("dragover", function (e) {
            if (dragCheck()) {
                e.preventDefault();
            }
        });
        elem.addEventListener("drop", function (e) {
            if (dragCheck()) {
                if (_this.draggingID !== id) {
                    _this.dispatch({ kind: "ReorderAction", id: _this.draggingID, pos: dataSrc.indexOf(id) });
                }
                elem.style.borderBottom = "";
                elem.style.marginBottom = "";
                elem.style.borderTop = "";
                elem.style.marginTop = "";
                e.preventDefault();
            }
        });
    };
    OutlineView.prototype.updateAnnotationsAdd = function (idx) {
        var _this = this;
        var id = this.model.report.annotationIDs[idx];
        this.outlineTree.addItem(id, this.makeRow(this.model.annotations[id].caption, id, this.makeButton(this.model.sprites.visible, function (r) { return _this.annotationVisibilityButtons[id] = r; }, { kind: "ToggleAnnotationVisibilityAction", id: id })), "a", this.model.report.annotationIDs.length - 1 - idx);
        this.makeRowDeletable(id);
        this.makeRowDraggable(id, "a", this.model.report.annotationIDs);
        this.annotations.splice(idx, 0, id);
        this.updateDisplayButtons(id);
    };
    OutlineView.prototype.updateCaption = function (id) {
        if (id in this.model.cameras) {
            this.rows[id].text.innerText = this.model.cameras[id].caption;
        }
        if (id in this.model.gcps) {
            this.rows[id].text.innerText = this.model.gcps[id].caption;
        }
        if (id in this.model.orthos) {
            this.rows[id].text.innerText = this.model.orthos[id].caption;
        }
        if (id in this.model.annotations) {
            this.rows[id].text.innerText = this.model.annotations[id].caption;
        }
    };
    OutlineView.prototype.updateDisplayButtons = function (id) {
        if (id in this.annotationVisibilityButtons) {
            this.annotationVisibilityButtons[id].setIdx(this.model.display.annotationVisibility[id] ? 1 : 0);
        }
        if (id in this.layerVisibilityButtons) {
            this.layerVisibilityButtons[id].setIdx(this.model.display.layerVisibility[id] ? 1 : 0);
        }
        if (id in this.orthoVisibilityButtons) {
            this.orthoVisibilityButtons[id].setIdx(this.model.display.orthoVisibility[id] ? 1 : 0);
        }
    };
    OutlineView.prototype.updateFilterButtons = function () {
        this.filterCameras.setIdx(this.model.filters.cameras ? 1 : 0);
        this.filterGCPs.setIdx(this.model.filters.gcps ? 1 : 0);
        this.filterOrthos.setIdx(this.model.filters.orthos ? 1 : 0);
        this.filterAnnotations.setIdx(this.model.filters.annotations ? 1 : 0);
    };
    OutlineView.prototype.updateSelection = function () {
        if (this.selectedID in this.rows) {
            this.rows[this.selectedID].back.classList.remove("selected");
            this.rows[this.selectedID].front.classList.remove("selected");
            this.rows[this.selectedID].highlight.classList.add("hidden");
        }
        this.selectedID = this.model.selection.selectedID;
        if (this.selectedID in this.rows) {
            this.rows[this.selectedID].back.classList.add("selected");
            this.rows[this.selectedID].front.classList.add("selected");
            this.rows[this.selectedID].highlight.classList.remove("hidden");
            this.outlineTree.scrollIntoView(this.selectedID);
        }
    };
    return OutlineView;
}());
var PropertiesView = /** @class */ (function () {
    function PropertiesView(container, dispatch, model) {
        var _this = this;
        this.model = model;
        this.dispatch = dispatch;
        this.content = null;
        this.selectedID = null;
        DOM.append(container, JSX.createElement("div", { className: "fill dark1 scrollable", style: { padding: "4px" }, ref: function (r) { return _this.root = r; } }));
        this.switchContent();
    }
    PropertiesView.prototype.update = function (event) {
        switch (event.kind) {
            case "DisplayChangedEvent":
                // TODO
                break;
            case "ObjectChangedEvent":
                if (event.id === this.selectedID) {
                    this.updateContent();
                }
                break;
            case "SelectedChangedEvent":
                this.switchContent();
                break;
        }
    };
    PropertiesView.prototype.switchContent = function () {
        var _this = this;
        this.root.innerHTML = "";
        var id = this.model.selection.selectedID;
        this.selectedID = id;
        if (id in this.model.cameras) {
            DOM.append(this.root, JSX.createElement(PropertiesCamera, { camera: this.model.cameras[id], ref: function (r) { return _this.content = r; } }));
        }
        else if (id in this.model.gcps) {
            DOM.append(this.root, JSX.createElement(PropertiesGCP, { gcp: this.model.gcps[id], ref: function (r) { return _this.content = r; } }));
        }
        else if (id in this.model.orthos) {
            DOM.append(this.root, JSX.createElement(PropertiesOrtho, { ortho: this.model.orthos[id], ref: function (r) { return _this.content = r; } }));
        }
        else if (id in this.model.layers) {
            DOM.append(this.root, JSX.createElement(PropertiesLayer, { model: this.model, id: id, dispatch: this.dispatch, ref: function (r) { return _this.content = r; } }));
        }
        else if (id in this.model.annotations) {
            DOM.append(this.root, JSX.createElement(PropertiesAnnotation, { annotation: this.model.annotations[id], id: id, dispatch: this.dispatch, ref: function (r) { return _this.content = r; } }));
        }
        else {
            this.selectedID = null;
            this.content = null;
        }
    };
    PropertiesView.prototype.updateContent = function () {
        if (this.content !== null) {
            this.content.update();
        }
    };
    return PropertiesView;
}());
var SidebarView = /** @class */ (function () {
    function SidebarView(container, dispatch, model) {
        var topDiv;
        var bottomDiv;
        var sizingOverlay;
        var size = 0.6;
        var resizing = false;
        var resizeOffset = 0;
        var updateSize = function () {
            topDiv.style.height = size * 100 + "%";
        };
        DOM.append(container, (JSX.createElement("div", { className: "fill vflow", style: { paddingTop: "4px", paddingRight: "4px" } },
            JSX.createElement("div", { className: "root", style: { marginTop: "-4px" }, ref: function (r) { return topDiv = r; } }),
            JSX.createElement("div", { style: { height: "4px", cursor: "row-resize" }, onmousedown: function (e) {
                    resizing = true;
                    resizeOffset = e.offsetY;
                    sizingOverlay.classList.remove("hidden");
                    e.preventDefault();
                } }),
            JSX.createElement("div", { className: "root rest", ref: function (r) { return bottomDiv = r; } }))));
        updateSize();
        DOM.append(document.body, (JSX.createElement("div", { className: "hidden", style: { position: "fixed", left: "0", right: "0", top: "0", bottom: "0", background: "transparent", cursor: "row-resize", zIndex: "1000000000" }, ref: function (r) { return sizingOverlay = r; } })));
        document.addEventListener("mousemove", function (e) {
            if (resizing) {
                var _a = container.getBoundingClientRect(), top_1 = _a.top, bottom = _a.bottom;
                var pos = e.clientY - resizeOffset;
                bottom -= 4;
                size = Math.max(0.05, Math.min(0.95, (pos - top_1) / (bottom - top_1)));
                updateSize();
            }
        });
        document.addEventListener("mouseup", function () {
            resizing = false;
            sizingOverlay.classList.add("hidden");
        });
        this.outline = new OutlineView(topDiv, dispatch, model);
        this.properties = new PropertiesView(bottomDiv, dispatch, model);
    }
    SidebarView.prototype.update = function (event) {
        this.outline.update(event);
        this.properties.update(event);
    };
    return SidebarView;
}());
