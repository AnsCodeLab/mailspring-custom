"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeActiveMarks = safeActiveMarks;
exports.expandSelectionToRangeOfMark = expandSelectionToRangeOfMark;
exports.getActiveValueForMark = getActiveValueForMark;
exports.applyValueForMark = applyValueForMark;
exports.BuildToggleButton = BuildToggleButton;
exports.BuildMarkButtonWithValuePicker = BuildMarkButtonWithValuePicker;
exports.BuildColorPicker = BuildColorPicker;
exports.BuildFontPicker = BuildFontPicker;
exports.BuildFontSizeInput = BuildFontSizeInput;
exports.BuildFontFacePicker = BuildFontFacePicker;
const react_1 = __importDefault(require("react"));
const slate_1 = require("slate");
const Compact_1 = __importDefault(require("react-color/lib/Compact"));
function safeActiveMarks(value) {
    try {
        return value.activeMarks.toArray();
    }
    catch (err) {
        return [];
    }
}
function removeMarksOfTypeInRange(editor, range, type) {
    if (range.isCollapsed) {
        const active = safeActiveMarks(editor.value).find((m) => m.type === type);
        if (active) {
            editor.removeMark(active);
        }
        return;
    }
    const document = editor.value.document;
    const texts = document.getTextsAtRange(range);
    const { start, end } = range;
    texts.forEach((node) => {
        const { key } = node;
        let index = 0;
        let length = node.text.length;
        if (key === start.key)
            index = start.offset;
        if (key === end.key)
            length = end.offset;
        if (key === start.key && key === end.key)
            length = end.offset - start.offset;
        node.getMarks().forEach((mark) => {
            if (mark.type === type) {
                editor.removeMarkByKey(key, index, length, mark, { normalize: true });
            }
        });
    });
}
function expandSelectionToRangeOfMark(editor, type) {
    const { selection, document } = editor.value;
    const node = document.getNode(selection.anchor.key);
    let start = selection.anchor.offset;
    let end = selection.anchor.offset;
    while (start > 0 && node.getMarksAtIndex(start).find((m) => m.type === type)) {
        start -= 1;
    }
    while (end < node.text.length - 1 &&
        node.getMarksAtIndex(end + 1).find((m) => m.type === type)) {
        end += 1;
    }
    editor.select({
        anchor: { key: selection.anchor.key, offset: start },
        focus: { key: selection.anchor.key, offset: end },
        isFocused: true,
        isBackward: false,
    });
}
function getActiveValueForMark(value, type) {
    const active = safeActiveMarks(value).find((m) => m.type === type);
    return (active && active.data.get('value')) || '';
}
function applyValueForMark(editor, type, markValue) {
    editor.focus();
    removeMarksOfTypeInRange(editor, editor.value.selection, type);
    if (markValue) {
        editor.addMark({
            type,
            data: {
                value: markValue,
            },
        });
    }
}
function BuildToggleButton({ type, button: { iconClass, isActive, onToggle }, }) {
    return ({ editor, className, value }) => {
        const active = isActive(value);
        const onMouseDown = (e) => {
            onToggle(editor, active);
            e.preventDefault();
        };
        return (react_1.default.createElement("button", { className: `${className} ${active ? 'active' : ''}`, onMouseDown: onMouseDown },
            react_1.default.createElement("i", { title: type, className: iconClass })));
    };
}
function BuildMarkButtonWithValuePicker(config) {
    return class ToolbarMarkDataPicker extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this.state = {
                fieldValue: '',
                expanded: false,
            };
            this.onPrompt = (e) => {
                e.preventDefault();
                const active = safeActiveMarks(this.props.value).find((m) => m.type === config.type);
                const fieldValue = (active && active.data.get(config.field)) || '';
                this.setState({ expanded: true, fieldValue: fieldValue }, () => {
                    setTimeout(() => {
                        this._inputEl.focus();
                        this._inputEl.select();
                    }, 0);
                });
            };
            this.onConfirm = (e) => {
                e.preventDefault();
                const { value, editor } = this.props;
                const { fieldValue } = this.state;
                if (fieldValue.trim() === '') {
                    this.onRemove(e);
                    this.setState({ expanded: false, fieldValue: '' });
                    return;
                }
                const newMark = slate_1.Mark.create({
                    type: config.type,
                    data: {
                        [config.field]: fieldValue,
                    },
                });
                const active = safeActiveMarks(value).find((m) => m.type === config.type);
                if (active) {
                    expandSelectionToRangeOfMark(editor, config.type);
                    removeMarksOfTypeInRange(editor, value.selection, config.type);
                    editor.addMark(newMark);
                    editor.focus();
                }
                else if (value.selection.isCollapsed) {
                    editor.addMark(newMark).insertText(fieldValue).removeMark(newMark).insertText(' ').focus();
                }
                else {
                    removeMarksOfTypeInRange(editor, value.selection, config.type);
                    editor.addMark(newMark);
                    editor.focus();
                }
                this.setState({ expanded: false, fieldValue: '' });
            };
            this.onRemove = (e) => {
                e.preventDefault();
                const { value, editor } = this.props;
                const active = safeActiveMarks(value).find((m) => m.type === config.type);
                if (value.selection.isCollapsed) {
                    const anchorNode = value.document.getNode(value.selection.anchor.key);
                    const expanded = value.selection.moveToRangeOfNode(anchorNode);
                    editor.removeMarkAtRange(expanded, active);
                }
                else {
                    editor.removeMark(active);
                }
            };
            this.onBlur = (e) => {
                if (!this._el.contains(e.relatedTarget)) {
                    this.setState({ expanded: false });
                }
            };
        }
        render() {
            const { value, className } = this.props;
            const { expanded } = this.state;
            const active = safeActiveMarks(value).find((m) => m.type === config.type);
            return (react_1.default.createElement("div", { className: `${className} link-picker`, ref: (el) => (this._el = el), tabIndex: -1, onBlur: this.onBlur },
                active ? (react_1.default.createElement("button", { className: "active", onMouseDown: this.onPrompt },
                    react_1.default.createElement("i", { className: config.iconClassOn }))) : (react_1.default.createElement("button", { onMouseDown: this.onPrompt },
                    react_1.default.createElement("i", { className: config.iconClassOff }))),
                expanded && (react_1.default.createElement("div", { className: "dropdown" },
                    react_1.default.createElement("input", { type: "text", placeholder: config.placeholder, value: this.state.fieldValue, ref: (el) => (this._inputEl = el), onBlur: this.onBlur, onChange: (e) => this.setState({ fieldValue: e.target.value }), onKeyDown: (e) => {
                            if (e.which === 13) {
                                this.onConfirm(e);
                            }
                        } }),
                    react_1.default.createElement("button", { onMouseDown: this.onConfirm }, active ? 'Save' : 'Add')))));
        }
    };
}
function BuildColorPicker(config) {
    return class ToolbarColorPicker extends react_1.default.Component {
        constructor(props) {
            super(props);
            this._onToggleExpanded = () => {
                this.setState({ expanded: !this.state.expanded });
            };
            this._onBlur = (e) => {
                if (!this._el.contains(e.relatedTarget)) {
                    this.setState({ expanded: false });
                }
            };
            this._onChangeComplete = ({ hex }) => {
                this.setState({ expanded: false });
                const { editor } = this.props;
                const markValue = hex !== config.default ? hex : null;
                applyValueForMark(editor, config.type, markValue);
            };
            this.state = {
                expanded: false,
            };
        }
        shouldComponentUpdate(nProps, nState) {
            if (getActiveValueForMark(nProps.value, config.type) !==
                getActiveValueForMark(this.props.value, config.type))
                return true;
            if (nState.expanded !== this.state.expanded)
                return true;
            return false;
        }
        render() {
            const color = getActiveValueForMark(this.props.value, config.type) || config.default;
            const { expanded } = this.state;
            return (react_1.default.createElement("div", { tabIndex: -1, onBlur: this._onBlur, ref: (el) => (this._el = el), className: `color-picker ${this.props.className}` },
                react_1.default.createElement("button", { onClick: this._onToggleExpanded, style: {
                        backgroundColor: color,
                    } }),
                expanded && (react_1.default.createElement("div", { className: "dropdown" },
                    react_1.default.createElement(Compact_1.default, { color: color, onChangeComplete: this._onChangeComplete })))));
        }
    };
}
function BuildFontPicker(config) {
    return class FontPicker extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this._onSetValue = (e) => {
                const { editor } = this.props;
                let markValue = e.target.value !== config.default ? e.target.value : null;
                if (!(typeof config.options[0].value === 'string')) {
                    markValue = Number(markValue);
                }
                applyValueForMark(editor, config.type, markValue);
            };
        }
        shouldComponentUpdate(nextProps) {
            return (getActiveValueForMark(nextProps.value, config.type) !==
                getActiveValueForMark(this.props.value, config.type));
        }
        render() {
            const value = getActiveValueForMark(this.props.value, config.type) || config.default;
            const displayed = config.convert(value);
            return (react_1.default.createElement("button", { style: { padding: 0, paddingRight: 6 }, className: `${this.props.className} with-select` },
                react_1.default.createElement("i", { className: config.iconClass }),
                react_1.default.createElement("select", { value: displayed, onChange: this._onSetValue, tabIndex: -1 }, config.options.map(({ name, value }) => (react_1.default.createElement("option", { key: value, value: value }, name))))));
        }
    };
}
function BuildFontSizeInput(config) {
    const legacyToPt = { 1: 8, 2: 10, 3: 12, 4: 14, 5: 18, 6: 24 };
    function ptFromMarkValue(val) {
        if (!val) return '';
        if (typeof val === 'string' && val.endsWith('pt')) return val.slice(0, -2);
        if (typeof val === 'string' && val.endsWith('px')) return String(Math.round(parseInt(val, 10) * 0.75));
        if (typeof val === 'string' && val.endsWith('em')) return String(Math.round(parseFloat(val) * 12));
        if (typeof val === 'number') return String(legacyToPt[val] || 12);
        return '';
    }
    return class FontSizeInput extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this.state = { editing: false, inputValue: '' };
            this._savedMarks = [];
            this._mouseDownValue = undefined;
            this._onMouseDown = (e) => {
                this._savedMarks = safeActiveMarks(this.props.value);
                this._mouseDownValue = ptFromMarkValue(getActiveValueForMark(this.props.value, config.type));
                e.stopPropagation();
            };
            this._onFocus = () => {
                const current = this._mouseDownValue !== undefined ? this._mouseDownValue : ptFromMarkValue(getActiveValueForMark(this.props.value, config.type));
                this._mouseDownValue = undefined;
                this.setState({ editing: true, inputValue: current || config.default || '' });
            };
            this._onChange = (e) => {
                this.setState({ inputValue: e.target.value });
            };
            this._commit = (domValue) => {
                const raw = domValue !== undefined ? domValue : this.state.inputValue;
                const pt = parseInt(raw, 10);
                const markValue = (pt >= 1 && pt <= 200) ? (String(pt) + 'pt') : null;
                applyValueForMark(this.props.editor, config.type, markValue);
                for (const mark of this._savedMarks) {
                    if (mark.type === config.type) continue;
                    const stillPresent = safeActiveMarks(this.props.editor.value).some((m) => m.type === mark.type);
                    if (!stillPresent) {
                        this.props.editor.addMark({ type: mark.type, data: { value: mark.data.get('value') } });
                    }
                }
            };
            this._onBlur = (e) => {
                this._commit(e.target.value);
                this.setState({ editing: false });
            };
            this._onKeyDown = (e) => {
                if (e.key === 'Enter') { this._commit(e.target.value); e.target.blur(); e.preventDefault(); }
                e.stopPropagation();
            };
        }
        shouldComponentUpdate(nextProps, nextState) {
            if (nextState !== this.state) return true;
            return getActiveValueForMark(nextProps.value, config.type) !== getActiveValueForMark(this.props.value, config.type);
        }
        render() {
            const { editing, inputValue } = this.state;
            const displayVal = editing ? inputValue : (ptFromMarkValue(getActiveValueForMark(this.props.value, config.type)) || config.default || '');
            return react_1.default.createElement("div", {
                className: this.props.className,
                style: { display: 'inline-flex', alignItems: 'center', padding: '0 3px', cursor: 'default' },
            },
                react_1.default.createElement("i", { className: config.iconClass || 'fa fa-text-height', style: { marginRight: 3, pointerEvents: 'none' } }),
                react_1.default.createElement("input", {
                    type: "number",
                    min: 6, max: 96, step: 1,
                    placeholder: "pt",
                    value: displayVal,
                    style: { width: 36, fontSize: 12, padding: '0 2px', border: '1px solid rgba(0,0,0,0.2)', borderRadius: 3, background: 'transparent', color: 'inherit', MozAppearance: 'textfield' },
                    tabIndex: -1,
                    onFocus: this._onFocus,
                    onChange: this._onChange,
                    onBlur: this._onBlur,
                    onKeyDown: this._onKeyDown,
                    onMouseDown: this._onMouseDown,
                })
            );
        }
    };
}
function BuildFontFacePicker(config) {
    const DATALIST_ID = 'mailspring-font-list';
    function faceFromMarkValue(val) {
        if (!val) return '';
        const opt = config.options.find((o) => val.toLowerCase().includes(o.value.toLowerCase()));
        return opt ? opt.value : val;
    }
    return class FontFacePicker extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this.state = { editing: false, inputValue: '' };
            this._savedMarks = [];
            this._mouseDownValue = undefined;
            this._onMouseDown = (e) => {
                this._savedMarks = safeActiveMarks(this.props.value);
                this._mouseDownValue = faceFromMarkValue(getActiveValueForMark(this.props.value, config.type));
                e.stopPropagation();
            };
            this._onFocus = () => {
                const raw = this._mouseDownValue !== undefined ? this._mouseDownValue : faceFromMarkValue(getActiveValueForMark(this.props.value, config.type));
                this._mouseDownValue = undefined;
                this.setState({ editing: true, inputValue: raw || config.default });
            };
            this._onChange = (e) => {
                this.setState({ inputValue: e.target.value });
            };
            this._commit = (domValue) => {
                const v = ((domValue !== undefined ? domValue : this.state.inputValue).trim()) || config.default;
                applyValueForMark(this.props.editor, config.type, v);
                for (const mark of this._savedMarks) {
                    if (mark.type === config.type) continue;
                    const stillPresent = safeActiveMarks(this.props.editor.value).some((m) => m.type === mark.type);
                    if (!stillPresent) {
                        this.props.editor.addMark({ type: mark.type, data: { value: mark.data.get('value') } });
                    }
                }
            };
            this._onBlur = (e) => {
                this._commit(e.target.value);
                this.setState({ editing: false });
            };
            this._onKeyDown = (e) => {
                if (e.key === 'Enter') { this._commit(e.target.value); e.target.blur(); e.preventDefault(); }
                e.stopPropagation();
            };
        }
        shouldComponentUpdate(nextProps, nextState) {
            if (nextState !== this.state) return true;
            return getActiveValueForMark(nextProps.value, config.type) !== getActiveValueForMark(this.props.value, config.type);
        }
        render() {
            const { editing, inputValue } = this.state;
            const displayVal = editing ? inputValue : (faceFromMarkValue(getActiveValueForMark(this.props.value, config.type)) || config.default);
            return react_1.default.createElement("div", {
                className: this.props.className,
                style: { display: 'inline-flex', alignItems: 'center', padding: '0 3px', cursor: 'default' },
            },
                react_1.default.createElement("input", {
                    type: "text",
                    list: DATALIST_ID,
                    placeholder: "Font",
                    value: displayVal,
                    style: { width: 110, fontSize: 12, padding: '1px 4px', border: '1px solid rgba(0,0,0,0.2)', borderRadius: 3, background: 'transparent', color: 'inherit' },
                    tabIndex: -1,
                    onFocus: this._onFocus,
                    onChange: this._onChange,
                    onBlur: this._onBlur,
                    onKeyDown: this._onKeyDown,
                    onMouseDown: this._onMouseDown,
                }),
                react_1.default.createElement("datalist", { id: DATALIST_ID },
                    config.options.map(({ name, value }) =>
                        react_1.default.createElement("option", { key: value, value: value }, name)
                    )
                )
            );
        }
    };
}
//# sourceMappingURL=toolbar-component-factories.js.map