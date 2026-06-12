"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MARK_CONFIG = exports.DEFAULT_FONT_FACE_OPTIONS = exports.DEFAULT_FONT_FACE = exports.DEFAULT_FONT_OPTIONS = exports.DEFAULT_FONT_SIZE = void 0;
const react_1 = __importDefault(require("react"));
const mailspring_exports_1 = require("mailspring-exports");
const toolbar_component_factories_1 = require("./toolbar-component-factories");
const base_block_plugins_1 = __importDefault(require("./base-block-plugins"));
exports.DEFAULT_FONT_SIZE = 2;
exports.DEFAULT_FONT_OPTIONS = [
    { name: (0, mailspring_exports_1.localized)('Small'), value: 1 },
    { name: (0, mailspring_exports_1.localized)('Normal'), value: 2 },
    { name: (0, mailspring_exports_1.localized)('Large'), value: 4 },
    { name: (0, mailspring_exports_1.localized)('Huge'), value: 6 },
];
exports.DEFAULT_FONT_FACE = 'sans-serif';
exports.DEFAULT_FONT_FACE_OPTIONS = [
    { name: 'Sans Serif', value: 'sans-serif' },
    { name: 'Serif', value: 'serif' },
    { name: 'Fixed Width', value: 'monospace' },
    { name: 'Arial', value: 'arial' },
    { name: 'Arial Black', value: 'arial black' },
    { name: 'Book Antiqua', value: 'book antiqua' },
    { name: 'Comic Sans MS', value: 'comic sans ms' },
    { name: 'Courier New', value: 'courier new' },
    { name: 'Garamond', value: 'garamond' },
    { name: 'Georgia', value: 'georgia' },
    { name: 'Helvetica', value: 'helvetica' },
    { name: 'Impact', value: 'impact' },
    { name: 'Lucida Console', value: 'lucida console' },
    { name: 'Palatino', value: 'palatino linotype' },
    { name: 'Tahoma', value: 'tahoma' },
    { name: 'Times New Roman', value: 'times new roman' },
    { name: 'Trebuchet MS', value: 'trebuchet ms' },
    { name: 'Verdana', value: 'verdana' },
];
const PT_TO_SIZE = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 3, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 7];
let plugins = null;
function isMeaningfulColor(color, el) {
    if (!color)
        return false;
    const meaningless = ['black', 'rgb(0,0,0)', 'rgba(0,0,0,1)', '#000', '#000000'];
    if (meaningless.includes(color.replace(/ /g, '')))
        return false;
    const isOwnHTML = (el.style.fontFamily || '').includes('Nylas-Pro');
    if (isOwnHTML && color === AppEnv.themes.getEmailTextColor())
        return false;
    return true;
}
function isMeaningfulFontSize(size) {
    return size && size / 1 !== exports.DEFAULT_FONT_SIZE;
}
function isMeaningfulFontStyle(style) {
    return style && style !== '14px';
}
exports.MARK_CONFIG = {
    bold: {
        type: 'bold',
        tagNames: ['b', 'strong'],
        render: (props) => react_1.default.createElement("strong", null, props.children),
        button: {
            isActive: (value) => (0, toolbar_component_factories_1.safeActiveMarks)(value).some((m) => m.type === exports.MARK_CONFIG.bold.type),
            onToggle: (editor) => editor.toggleMark(exports.MARK_CONFIG.bold.type),
            iconClass: 'fa fa-bold',
        },
    },
    italic: {
        type: 'italic',
        tagNames: ['em', 'i'],
        render: (props) => react_1.default.createElement("em", null, props.children),
        button: {
            isActive: (value) => (0, toolbar_component_factories_1.safeActiveMarks)(value).some((m) => m.type === exports.MARK_CONFIG.italic.type),
            onToggle: (editor) => editor.toggleMark(exports.MARK_CONFIG.italic.type),
            iconClass: 'fa fa-italic',
        },
    },
    underline: {
        type: 'underline',
        tagNames: ['u'],
        render: (props) => react_1.default.createElement("u", null, props.children),
        button: {
            isActive: (value) => (0, toolbar_component_factories_1.safeActiveMarks)(value).some((m) => m.type === exports.MARK_CONFIG.underline.type),
            onToggle: (editor) => editor.toggleMark(exports.MARK_CONFIG.underline.type),
            iconClass: 'fa fa-underline',
        },
    },
    strike: {
        type: 'strike',
        tagNames: ['strike', 's', 'del'],
        render: (props) => react_1.default.createElement("strike", null, props.children),
        button: {
            isActive: (value) => (0, toolbar_component_factories_1.safeActiveMarks)(value).some((m) => m.type === exports.MARK_CONFIG.strike.type),
            onToggle: (editor) => editor.toggleMark(exports.MARK_CONFIG.strike.type),
            iconClass: 'fa fa-strikethrough',
        },
    },
    codeInline: {
        type: 'codeInline',
        tagNames: ['code'],
        render: (props) => react_1.default.createElement("code", { spellCheck: false }, props.children),
    },
    color: {
        type: 'color',
        tagNames: [],
        render: ({ children, mark }) => (react_1.default.createElement("span", { style: { color: mark.data.value || mark.data.get('value') } }, children)),
    },
    size: {
        type: 'size',
        tagNames: [],
        render: ({ children, mark, targetIsHTML }) => {
            let v = mark.data.value || mark.data.get('value');
            if (v === exports.DEFAULT_FONT_SIZE) {
                v = undefined;
            }
            return typeof v === 'string' ? (react_1.default.createElement("font", { style: { fontSize: v } }, children)) : (react_1.default.createElement("font", { size: v }, children));
        },
    },
    face: {
        type: 'face',
        tagNames: [],
        render: ({ children, mark }) => (react_1.default.createElement("font", { style: { fontFamily: mark.data.value || mark.data.get('value') } }, children)),
    },
};
function renderMark(props, editor = null, next = () => { }) {
    const config = exports.MARK_CONFIG[props.mark.type];
    return config && config.render ? config.render(props) : next();
}
const rules = [
    {
        deserialize(el, next) {
            const marks = [];
            const tagName = el.tagName.toLowerCase();
            const config = Object.values(exports.MARK_CONFIG).find((m) => m.tagNames.includes(tagName));
            if (config) {
                return {
                    object: 'mark',
                    type: config.type,
                    nodes: next(el.childNodes),
                };
            }
            if (el instanceof HTMLElement && el.style && isMeaningfulColor(el.style.color, el)) {
                marks.push({
                    object: 'mark',
                    type: 'color',
                    data: { value: el.style.color },
                });
            }
            if (el instanceof HTMLElement && el.style && isMeaningfulFontStyle(el.style.fontSize)) {
                marks.push({
                    object: 'mark',
                    type: 'size',
                    data: { value: el.style.fontSize },
                });
            }
            if (el instanceof HTMLElement && el.style && el.style.fontFamily) {
                marks.push({
                    object: 'mark',
                    type: 'face',
                    data: { value: el.style.fontFamily },
                });
            }
            if (['font', 'p', 'div', 'span'].includes(tagName) &&
                isMeaningfulColor(el.getAttribute('color'), el)) {
                marks.push({
                    object: 'mark',
                    type: 'color',
                    data: { value: el.getAttribute('color') },
                });
            }
            if (tagName === 'font' && el.getAttribute('size')) {
                const size = Math.max(1, Math.min(6, Number(el.getAttribute('size'))));
                if (isMeaningfulFontSize(size)) {
                    marks.push({
                        object: 'mark',
                        type: 'size',
                        data: { value: size },
                    });
                }
            }
            if (tagName === 'font' && el.getAttribute('face')) {
                marks.push({
                    object: 'mark',
                    type: 'face',
                    data: { value: el.getAttribute('face') },
                });
            }
            if (marks.length) {
                plugins = plugins || require('./conversion').plugins;
                const subsequentPlugins = plugins.slice(plugins.findIndex((p) => p.rules === rules) + 1);
                for (const p of subsequentPlugins) {
                    for (const { deserialize } of p.rules || []) {
                        const result = deserialize && deserialize(el, () => []);
                        if (result && result.object === 'mark') {
                            if (result.object.nodes && result.object.nodes.length) {
                                console.warn('base-mark-plugin does not look at nested marks from subsequent plugins');
                            }
                            marks.push(result);
                        }
                    }
                }
                let block = null;
                for (const plugin of base_block_plugins_1.default) {
                    if (block)
                        break;
                    if (!plugin.rules)
                        continue;
                    for (const { deserialize } of plugin.rules) {
                        block = deserialize(el, next);
                        if (block) {
                            break;
                        }
                    }
                }
                const root = marks[0];
                let tail = root;
                for (let x = 1; x < marks.length; x++) {
                    tail.nodes = [marks[x]];
                    tail = tail.nodes[0];
                }
                tail.nodes = block ? [block] : next(el.childNodes);
                return root;
            }
        },
        serialize(obj, children) {
            if (obj.object !== 'mark')
                return;
            return renderMark({ mark: obj, children, targetIsHTML: true });
        },
    },
];
const BaseMarkPlugin = {
    toolbarComponents: []
        .concat(Object.values(exports.MARK_CONFIG)
        .filter((m) => m.button)
        .map(toolbar_component_factories_1.BuildToggleButton))
        .concat([
        (0, toolbar_component_factories_1.BuildColorPicker)({ type: 'color', default: '#000000' }),
        (0, toolbar_component_factories_1.BuildFontFacePicker)({
            type: 'face',
            default: exports.DEFAULT_FONT_FACE,
            options: exports.DEFAULT_FONT_FACE_OPTIONS,
        }),
        (0, toolbar_component_factories_1.BuildFontSizeInput)({
            type: 'size',
            default: '11',
            iconClass: 'fa fa-text-height',
        }),
    ]),
    renderMark,
    appCommands: {
        'contenteditable:bold': (event, editor) => editor.toggleMark(exports.MARK_CONFIG.bold.type),
        'contenteditable:underline': (event, editor) => editor.toggleMark(exports.MARK_CONFIG.underline.type),
        'contenteditable:italic': (event, editor) => editor.toggleMark(exports.MARK_CONFIG.italic.type),
    },
    rules,
};
const exportedPlugins = [BaseMarkPlugin];
exports.default = exportedPlugins;
//# sourceMappingURL=base-mark-plugins.js.map