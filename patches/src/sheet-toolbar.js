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
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const mailspring_exports_1 = require("mailspring-exports");
const flexbox_1 = require("./components/flexbox");
const retina_img_1 = require("./components/retina-img");
const roving_tab_index_toolbar_1 = require("./components/roving-tab-index-toolbar");
const Utils = __importStar(require("./flux/models/utils"));
const is_wayland_1 = require("./browser/is-wayland");
const sheet_context_1 = require("./sheet-context");
let Category = null;
let FocusedPerspectiveStore = null;
class ToolbarSpacer extends react_1.default.Component {
    static { this.displayName = 'ToolbarSpacer'; }
    render() {
        return react_1.default.createElement("div", { className: "item-spacer", style: { flex: 1, order: this.props.order || 0 } });
    }
}
class WindowTitle extends react_1.default.Component {
    static { this.displayName = 'WindowTitle'; }
    constructor(props) {
        super(props);
        this.state = AppEnv.getLoadSettings();
    }
    componentDidMount() {
        this.disposable = AppEnv.onWindowPropsReceived(() => this.setState(AppEnv.getLoadSettings()));
    }
    componentWillUnmount() {
        if (this.disposable) {
            this.disposable.dispose();
        }
    }
    render() {
        return react_1.default.createElement("div", { className: "window-title" }, this.state.title);
    }
}
class ToolbarBack extends react_1.default.Component {
    static { this.displayName = 'ToolbarBack'; }
    constructor(props) {
        super(props);
        this._onClick = () => {
            mailspring_exports_1.Actions.popSheet();
        };
        Category = Category || require('./flux/models/category').Category;
        FocusedPerspectiveStore =
            FocusedPerspectiveStore || require('./flux/stores/focused-perspective-store').default;
        this.state = {
            categoryName: FocusedPerspectiveStore.current().name,
        };
    }
    componentDidMount() {
        this._unsubscriber = FocusedPerspectiveStore.listen(() => this.setState({ categoryName: FocusedPerspectiveStore.current().name }));
    }
    componentWillUnmount() {
        if (this._unsubscriber) {
            this._unsubscriber();
        }
    }
    render() {
        let title = (0, mailspring_exports_1.localized)('Back');
        if (this.state.categoryName === Category.AllMailName) {
            title = (0, mailspring_exports_1.localized)('All Mail');
        }
        else if (this.state.categoryName === 'INBOX') {
            title = (0, mailspring_exports_1.localized)('Inbox');
        }
        else {
            title = this.state.categoryName;
        }
        return (react_1.default.createElement("div", { className: "item-back", onClick: this._onClick, title: (0, mailspring_exports_1.localized)(`Return to %@`, title) },
            react_1.default.createElement(retina_img_1.RetinaImg, { name: "sheet-back.png", mode: retina_img_1.RetinaImg.Mode.ContentIsMask, style: mailspring_exports_1.isRTL ? { transform: `scaleX(-1)` } : {} }),
            react_1.default.createElement("div", { className: "item-back-title" }, title)));
    }
}
class ToolbarWindowControls extends react_1.default.Component {
    static { this.displayName = 'ToolbarWindowControls'; }
    constructor(props) {
        super(props);
        this._onAlt = () => {
            this.setState({ alt: AppEnv.keymaps.getIsAltKeyDown() });
        };
        this._onMaximize = (event) => {
            if (process.platform === 'darwin' && !event.altKey) {
                AppEnv.setFullScreen(!AppEnv.isFullScreen());
            }
            else {
                AppEnv.maximize();
            }
        };
        this.state = { alt: AppEnv.keymaps.getIsAltKeyDown() };
    }
    componentDidMount() {
        if (process.platform === 'darwin') {
            document.addEventListener(AppEnv.keymaps.EVENT_ALT_KEY_STATE_CHANGE, this._onAlt);
        }
    }
    componentWillUnmount() {
        if (process.platform === 'darwin') {
            document.removeEventListener(AppEnv.keymaps.EVENT_ALT_KEY_STATE_CHANGE, this._onAlt);
        }
    }
    render() {
        const enabled = process.platform === 'darwin' ||
            (process.platform === 'linux' &&
                AppEnv.config.get('core.workspace.menubarStyle') === 'hamburger');
        if (!enabled) {
            return react_1.default.createElement("span", null);
        }
        return (react_1.default.createElement("div", { style: { order: 1000 } },
            react_1.default.createElement(roving_tab_index_toolbar_1.RovingTabIndexToolbar, { label: (0, mailspring_exports_1.localized)('Window Controls'), className: `toolbar-window-controls alt-${this.state.alt}` },
                react_1.default.createElement("button", { tabIndex: -1, className: "minimize", "aria-label": (0, mailspring_exports_1.localized)('Minimize window'), onClick: () => AppEnv.minimize() }),
                react_1.default.createElement("button", { tabIndex: -1, className: "maximize", "aria-label": (0, mailspring_exports_1.localized)('Maximize window'), onClick: this._onMaximize }),
                react_1.default.createElement("button", { tabIndex: -1, className: "close", "aria-label": (0, mailspring_exports_1.localized)('Close window'), onClick: () => AppEnv.close() }))));
    }
}
class ToolbarMenuControl extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this._onOpenMenu = () => {
            const { applicationMenu } = require('@electron/remote').getGlobal('application');
            applicationMenu.menu.popup({});
        };
    }
    static { this.displayName = 'ToolbarMenuControl'; }
    render() {
        const enabled = process.platform === 'win32' ||
            (process.platform === 'linux' &&
                (AppEnv.config.get('core.workspace.menubarStyle') === 'hamburger' || (0, is_wayland_1.isWaylandSession)()));
        if (!enabled) {
            return react_1.default.createElement("span", null);
        }
        return (react_1.default.createElement("div", { className: "toolbar-menu-control", style: { order: -200 } },
            react_1.default.createElement("button", { tabIndex: 0, className: "btn btn-toolbar", "aria-label": (0, mailspring_exports_1.localized)('Application menu'), onClick: this._onOpenMenu },
                react_1.default.createElement(retina_img_1.RetinaImg, { name: "windows-menu-icon.png", mode: retina_img_1.RetinaImg.Mode.ContentIsMask, "aria-hidden": "true" }))));
    }
}
mailspring_exports_1.ComponentRegistry.register(ToolbarWindowControls, {
    location: mailspring_exports_1.isRTL
        ? mailspring_exports_1.WorkspaceStore.Sheet.Global.Toolbar.Left
        : mailspring_exports_1.WorkspaceStore.Sheet.Global.Toolbar.Right,
});
mailspring_exports_1.ComponentRegistry.register(ToolbarMenuControl, {
    location: mailspring_exports_1.isRTL
        ? mailspring_exports_1.WorkspaceStore.Sheet.Global.Toolbar.Right
        : mailspring_exports_1.WorkspaceStore.Sheet.Global.Toolbar.Left,
});
const COLUMN_ARIA_LABELS = {
    RootSidebar: (0, mailspring_exports_1.localized)('Sidebar toolbar'),
    ThreadList: (0, mailspring_exports_1.localized)('Thread list toolbar'),
    MessageList: (0, mailspring_exports_1.localized)('Message toolbar'),
    MessageListSidebar: (0, mailspring_exports_1.localized)('Contact panel toolbar'),
};
let lastReportedToolbarHeight = 0;
class Toolbar extends react_1.default.Component {
    static { this.displayName = 'Toolbar'; }
    constructor(props) {
        super(props);
        this.mounted = false;
        this.unlisteners = [];
        this._onWindowResize = () => {
            this.recomputeLayout();
        };
        this.state = this._getStateFromStores();
    }
    componentDidMount() {
        this.mounted = true;
        this.unlisteners = [];
        this.unlisteners.push(mailspring_exports_1.WorkspaceStore.listen(() => this.setState(this._getStateFromStores())));
        this.unlisteners.push(mailspring_exports_1.ComponentRegistry.listen(() => this.setState(this._getStateFromStores())));
        window.addEventListener('resize', this._onWindowResize);
        window.requestAnimationFrame(() => this.recomputeLayout());
    }
    shouldComponentUpdate(nextProps, nextState) {
        return !Utils.isEqualReact(nextProps, this.props) || !Utils.isEqualReact(nextState, this.state);
    }
    componentDidUpdate(prevProps) {
        if (prevProps.data !== this.props.data || prevProps.depth !== this.props.depth) {
            this.setState(this._getStateFromStores());
        }
        window.requestAnimationFrame(() => this.recomputeLayout());
    }
    componentWillUnmount() {
        this.mounted = false;
        window.removeEventListener('resize', this._onWindowResize);
        for (const u of this.unlisteners) {
            u();
        }
    }
    recomputeLayout() {
        if (!this.mounted) {
            return;
        }
        const el = react_dom_1.default.findDOMNode(this);
        const columnToolbarEls = el.querySelectorAll('[data-column]');
        const sheet = document.querySelectorAll("[data-role='Sheet']")[this.props.depth];
        if (!sheet) {
            return;
        }
        for (const columnToolbarEl of Array.from(columnToolbarEls)) {
            const column = columnToolbarEl.dataset.column;
            const columnEl = sheet.querySelector(`[data-column='${column}']`);
            if (!columnEl) {
                continue;
            }
            columnToolbarEl.style.display = 'inherit';
            columnToolbarEl.style.left = `${columnEl.offsetLeft}px`;
            columnToolbarEl.style.width = `${columnEl.offsetWidth}px`;
        }
        if (el.clientHeight !== lastReportedToolbarHeight) {
            lastReportedToolbarHeight = el.clientHeight;
            require('@electron/remote').getCurrentWindow().setSheetOffset(el.clientHeight);
        }
    }
    _getStateFromStores(props = this.props) {
        const state = {
            mode: mailspring_exports_1.WorkspaceStore.layoutMode(),
            columns: [],
            columnNames: [],
        };
        if (props.data && props.data.columns[state.mode]) {
            for (const loc of props.data.columns[state.mode]) {
                if (mailspring_exports_1.WorkspaceStore.isLocationHidden(loc)) {
                    continue;
                }
                const entries = mailspring_exports_1.ComponentRegistry.findComponentsMatching({
                    location: loc.Toolbar,
                    mode: state.mode,
                });
                state.columns.push(entries);
                if (entries) {
                    state.columnNames.push(loc.Toolbar.id.split(':')[0]);
                }
            }
        }
        if (state.columns.length > 0) {
            for (const loc of [mailspring_exports_1.WorkspaceStore.Sheet.Global, props.data]) {
                const entries = mailspring_exports_1.ComponentRegistry.findComponentsMatching({
                    location: loc.Toolbar.Left,
                    mode: state.mode,
                });
                state.columns[0].push(...entries);
            }
            if (props.depth > 0) {
                state.columns[0].push(ToolbarBack);
            }
            for (const loc of [mailspring_exports_1.WorkspaceStore.Sheet.Global, props.data]) {
                const entries = mailspring_exports_1.ComponentRegistry.findComponentsMatching({
                    location: loc.Toolbar.Right,
                    mode: state.mode,
                });
                state.columns[state.columns.length - 1].push(...entries);
            }
            if (state.mode === 'popout') {
                state.columns[0].push(WindowTitle);
            }
        }
        return state;
    }
    _flexboxForComponents(components) {
        const elements = components.map((Component) => (react_1.default.createElement(Component, { key: Component.displayName, ...this.props })));
        return (react_1.default.createElement(flexbox_1.Flexbox, { className: "item-container", direction: "row" },
            elements,
            react_1.default.createElement(ToolbarSpacer, { key: "spacer-50", order: -50 }),
            react_1.default.createElement(ToolbarSpacer, { key: "spacer+50", order: 50 })));
    }
    render() {
        const toolbars = this.state.columns.map((components, idx) => (react_1.default.createElement("div", { role: "toolbar", "aria-label": COLUMN_ARIA_LABELS[this.state.columnNames[idx]] || (0, mailspring_exports_1.localized)('Toolbar'), style: { position: 'absolute', top: 0, display: 'none' }, className: `toolbar-${this.state.columnNames[idx]}`, "data-column": idx, key: idx }, this._flexboxForComponents(components))));
        return (react_1.default.createElement(sheet_context_1.SheetDepthContext.Provider, { value: this.props.depth },
            react_1.default.createElement("div", { style: {
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                }, className: `sheet-toolbar-container mode-${this.state.mode}`, "data-id": this.props.data.id }, toolbars)));
    }
}
exports.default = Toolbar;
//# sourceMappingURL=sheet-toolbar.js.map