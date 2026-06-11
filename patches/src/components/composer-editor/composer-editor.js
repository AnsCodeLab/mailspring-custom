"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComposerEditor = void 0;
exports.handleFilePasted = handleFilePasted;
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const Immutable = __importStar(require("immutable"));
const slate_1 = require("slate");
const slate_react_1 = require("slate-react");
const electron_1 = require("electron");
const mailspring_exports_1 = require("mailspring-exports");
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const underscore_1 = require("underscore");
const key_commands_region_1 = require("../key-commands-region");
const composer_editor_toolbar_1 = __importDefault(require("./composer-editor-toolbar"));
const conversion_1 = require("./conversion");
const base_block_plugins_1 = require("./base-block-plugins");
const uneditable_plugins_1 = require("./uneditable-plugins");
const inline_attachment_plugins_1 = require("./inline-attachment-plugins");
function getDocumentBrokenReason(value) {
    const { document } = value;
    const firstText = document.getFirstText();
    if (!firstText) {
        return 'document has no text nodes';
    }
    const ancestors = document.getAncestors(firstText.key);
    if (ancestors.some((a) => a.object === 'block' && ((0, base_block_plugins_1.isQuoteNode)(a) || a.type === uneditable_plugins_1.UNEDITABLE_TYPE))) {
        return 'first text node is inside quoted/uneditable content';
    }
    return null;
}
const AEditor = slate_react_1.Editor;
class ComposerEditor extends react_1.default.Component {
    constructor(props) {
        super(props);
        this._pluginKeyHandlers = {};
        this._mounted = false;
        this.editor = null;
        this.state = { isTyping: false };
        this._onDoneTyping = (0, underscore_1.debounce)(() => {
            if (this._mounted) {
                this.setState({ isTyping: false });
            }
        }, 800);
        this.focus = () => {
            this.editor.focus().moveToRangeOfDocument().moveToStart();
        };
        this.focusEndReplyText = () => {
            window.requestAnimationFrame(() => {
                const node = (0, base_block_plugins_1.lastUnquotedNode)(this.editor.value);
                if (!node)
                    return;
                this.editor.moveToEndOfNode(node).focus();
            });
        };
        this.focusEndAbsolute = () => {
            window.requestAnimationFrame(() => {
                this.editor.moveToRangeOfDocument().moveToEnd().focus();
            });
        };
        this.removeQuotedText = () => {
            (0, base_block_plugins_1.removeQuotedText)(this.editor);
        };
        this.insertInlineAttachment = (file) => {
            inline_attachment_plugins_1.changes.insert(this.editor, file);
        };
        this.onFocusIfBlurred = (_event) => {
            if (!this.props.value.selection.isFocused) {
                this.focus();
            }
        };
        this.onKeyDown = (event, editor, next) => {
            const isNavigationKey = [
                'Home',
                'End',
                'ArrowLeft',
                'ArrowRight',
                'ArrowUp',
                'ArrowDown',
                'PageUp',
                'PageDown',
            ].includes(event.key);
            if (!isNavigationKey && !this.state.isTyping) {
                requestAnimationFrame(() => {
                    if (this._mounted && !this.state.isTyping) {
                        this.setState({ isTyping: true });
                    }
                });
            }
            if (!isNavigationKey) {
                this._onDoneTyping();
            }
            return next();
        };
        this.onCopy = (event, editor, next) => {
            const sel = document.getSelection();
            const entirelyWithinUneditable = sel.anchorNode.parentElement.closest('.uneditable') &&
                sel.focusNode.parentElement.closest('.uneditable');
            if (entirelyWithinUneditable)
                return;
            event.preventDefault();
            const range = editor.value.selection;
            const fragment = editor.value.document.getFragmentAtRange(range);
            const value = slate_1.Value.create({ document: fragment });
            const text = (0, conversion_1.convertToPlainText)(value);
            if (text) {
                event.clipboardData.setData('text/html', (0, conversion_1.convertToHTML)(value));
                event.clipboardData.setData('text/plain', text);
            }
            else {
            }
            next();
        };
        this.onCut = (event, editor, next) => {
            this.onCopy(event, editor, next);
            next();
        };
        this.onPaste = (event, editor, next) => {
            const { onFileReceived } = this.props;
            if (event.clipboardData.types.includes('application/x-slate-fragment')) {
                return next();
            }
            if (onFileReceived && event.clipboardData.items.length > 0) {
                event.preventDefault();
                if (handleFilePasted(event, onFileReceived)) {
                    return;
                }
            }
            let html = event.clipboardData.getData('text/html');
            if (html) {
                html = mailspring_exports_1.SanitizeTransformer.runSync(html);
                try {
                    html = mailspring_exports_1.InlineStyleTransformer.runSync(html);
                }
                catch (err) {
                }
                const value = (0, conversion_1.convertFromHTML)(html);
                if (value && value.document) {
                    editor.insertFragment(value.document);
                    event.preventDefault();
                    return;
                }
            }
            return next();
        };
        this.onChange = (change) => {
            if (!this._mounted)
                return;
            const reason = getDocumentBrokenReason(change.value);
            if (reason) {
                console.warn(`ComposerEditor: ${reason}, inserting empty paragraph to recover.`);
                const op = require('slate').Operation.create({
                    type: 'insert_node',
                    path: Immutable.List([0]),
                    node: slate_1.Block.create({ type: 'div', nodes: Immutable.List([slate_1.Text.create('')]) }),
                });
                this.props.onChange({
                    operations: change.operations.push(op),
                    value: op.apply(change.value),
                });
                return;
            }
            this.props.onChange(change);
        };
        this._pluginKeyHandlers = {};
        conversion_1.plugins.forEach((plugin) => {
            if (!plugin.appCommands)
                return;
            Object.entries(plugin.appCommands).forEach(([command, handler]) => {
                this._pluginKeyHandlers[command] = (event) => {
                    if (!this._mounted)
                        return;
                    handler(event, this.editor);
                };
            });
        });
    }
    componentDidMount() {
        this._mounted = true;
        this.props.onUpdatedSlateEditor && this.props.onUpdatedSlateEditor(this.editor);
        this.forceUpdate();
        requestAnimationFrame(() => {
            if (!this._mounted || !this.editor) return;
            const doc = this.props.value.document;
            const texts = doc.getTexts().toArray();
            const isEmpty = texts.length === 0 || texts.every(t => !t.text || t.text.trim() === '');
            const hasBlockquote = !!doc.findDescendant(n => n.type === base_block_plugins_1.BLOCKQUOTE_TYPE);
            if (isEmpty || hasBlockquote) {
                this.editor.focus().moveToStart();
                this.editor.addMark({ type: 'face', data: { value: 'sans-serif' } });
                this.editor.addMark({ type: 'size', data: { value: '11pt' } });
            }
        });
    }
    componentWillUnmount() {
        this._mounted = false;
        this.props.onUpdatedSlateEditor && this.props.onUpdatedSlateEditor(null);
        const editorEl = react_dom_1.default.findDOMNode(this.editor);
        if (editorEl && editorEl.contains(document.getSelection().anchorNode)) {
            this.props.onChange({
                operations: Immutable.List([]),
                value: this.editor.deselect().blur().value,
            });
        }
    }
    render() {
        const { className, onBlur, onDrop, value, propsForPlugins } = this.props;
        const PluginTopComponents = this.editor ? conversion_1.plugins.filter((p) => p.topLevelComponent) : [];
        return (react_1.default.createElement(key_commands_region_1.KeyCommandsRegion, { className: `RichEditor-root ${className || ''}`, localHandlers: this._pluginKeyHandlers },
            this.editor && (react_1.default.createElement(composer_editor_toolbar_1.default, { editor: this.editor, plugins: conversion_1.plugins, value: value })),
            react_1.default.createElement("div", { className: "RichEditor-content", onClick: this.onFocusIfBlurred },
                this.editor &&
                    PluginTopComponents.map((p, idx) => (react_1.default.createElement(p.topLevelComponent, { key: idx, value: value, editor: this.editor }))),
                react_1.default.createElement(AEditor, { ref: (editor) => (this.editor = editor), schema: conversion_1.schema, value: value, onChange: this.onChange, onBlur: (e, editor, next) => {
                        if (onBlur)
                            onBlur(e);
                        if (!e.isPropagationStopped())
                            next();
                    }, onDrop: (e, editor, next) => {
                        if (onDrop)
                            onDrop(e);
                        if (!e.isPropagationStopped())
                            next();
                    }, onKeyDown: this.onKeyDown, onCut: this.onCut, onCopy: this.onCopy, onPaste: this.onPaste, spellCheck: !this.state.isTyping && AppEnv.config.get('core.composing.spellcheck'), plugins: conversion_1.plugins, propsForPlugins: propsForPlugins }))));
    }
}
exports.ComposerEditor = ComposerEditor;
function handleFilePasted(event, onFileReceived) {
    if (event.clipboardData.items.length === 0) {
        return false;
    }
    for (const i in event.clipboardData.items) {
        const item = event.clipboardData.items[i];
        if (item.kind === 'file') {
            const blob = item.getAsFile();
            const ext = {
                'image/png': '.png',
                'image/jpg': '.jpg',
                'image/tiff': '.tiff',
            }[item.type] || '';
            const reader = new FileReader();
            reader.addEventListener('loadend', () => {
                const buffer = Buffer.from(new Uint8Array(reader.result));
                const tmpFolder = path_1.default.join(os_1.default.tmpdir(), `-mailspring-attachment-${crypto.randomUUID()}`);
                const tmpPath = path_1.default.join(tmpFolder, `Pasted File${ext}`);
                fs_1.default.mkdir(tmpFolder, () => {
                    fs_1.default.writeFile(tmpPath, buffer, () => {
                        onFileReceived(tmpPath);
                    });
                });
            });
            reader.readAsArrayBuffer(blob);
            return true;
        }
    }
    const macCopiedFile = decodeURI(electron_1.clipboard.read('public.file-url').replace('file://', ''));
    const winCopiedFile = electron_1.clipboard.read('FileNameW').replace(new RegExp(String.fromCharCode(0), 'g'), '');
    const xdgCopiedFiles = (electron_1.clipboard.read('text/uri-list') || '')
        .split('\r\n')
        .filter((path) => path.startsWith('file://'))
        .map((path) => path.replace('file://', ''))
        .filter((path) => path.length);
    if (macCopiedFile.length || winCopiedFile.length) {
        onFileReceived(macCopiedFile || winCopiedFile);
        return true;
    }
    if (xdgCopiedFiles.length) {
        xdgCopiedFiles.forEach(onFileReceived);
        return true;
    }
    return false;
}
//# sourceMappingURL=composer-editor.js.map