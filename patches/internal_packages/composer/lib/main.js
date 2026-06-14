"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
exports.serialize = serialize;
const underscore_1 = __importDefault(require("underscore"));
const react_1 = __importDefault(require("react"));
const mailspring_exports_1 = require("mailspring-exports");
const compose_button_1 = __importDefault(require("./compose-button"));
const refresh_button_1 = __importDefault(require("./refresh-button"));
const apply_rules_button_1 = __importDefault(require("./apply-rules-button"));
const composer_view_1 = __importDefault(require("./composer-view"));
const ComposerViewForDraftClientId = (0, mailspring_exports_1.InflatesDraftClientId)(composer_view_1.default);
class ComposerWithWindowProps extends react_1.default.Component {
    static { this.displayName = 'ComposerWithWindowProps'; }
    static { this.containerRequired = false; }
    constructor(props) {
        super(props);
        this._onDraftReady = async () => {
            await this._composerComponent.focus();
            const { newDraft } = AppEnv.getWindowProps();
            const session = await mailspring_exports_1.DraftStore.sessionForClientId(this.state.headerMessageId);
            this._usub = session.listen(() => {
                const d = session.draft();
                if (!d)
                    return;
                const subject = d.subject && d.subject.trim();
                AppEnv.getCurrentWindow().setTitle(subject || (newDraft ? (0, mailspring_exports_1.localized)('New Message') : (0, mailspring_exports_1.localized)('Message')));
            });
            AppEnv.displayWindow();
            if (this.state.errorMessage) {
                this._showInitialErrorDialog(this.state.errorMessage, this.state.errorDetail);
            }
        };
        const windowProps = AppEnv.getWindowProps();
        const { draftJSON, headerMessageId, newDraft } = windowProps;
        if (!draftJSON) {
            throw new Error('Initialize popout composer windows with valid draftJSON');
        }
        const draft = new mailspring_exports_1.Message({}).fromJSON(draftJSON);
        mailspring_exports_1.DraftStore._createSession(headerMessageId, draft);
        this.state = windowProps;
        const subject = draft.subject && draft.subject.trim();
        AppEnv.getCurrentWindow().setTitle(subject || (newDraft ? (0, mailspring_exports_1.localized)('New Message') : (0, mailspring_exports_1.localized)('Message')));
    }
    componentWillUnmount() {
        if (this._usub) {
            this._usub();
        }
    }
    componentDidUpdate() {
        this._composerComponent.focus();
    }
    render() {
        return (react_1.default.createElement(ComposerViewForDraftClientId, { ref: (cm) => {
                this._composerComponent = cm;
            }, onDraftReady: this._onDraftReady, headerMessageId: this.state.headerMessageId, className: "composer-full-window" }));
    }
    _showInitialErrorDialog(msg, detail) {
        underscore_1.default.delay(() => {
            AppEnv.showErrorDialog({ title: (0, mailspring_exports_1.localized)('Error'), message: msg }, { detail: detail });
        }, 100);
    }
}
function activate() {
    if (AppEnv.isMainWindow()) {
        mailspring_exports_1.ComponentRegistry.register(ComposerViewForDraftClientId, {
            role: 'Composer',
        });
        mailspring_exports_1.ComponentRegistry.register(compose_button_1.default, {
            location: mailspring_exports_1.WorkspaceStore.Location.MessageList.Toolbar,
        });
        mailspring_exports_1.ComponentRegistry.register(refresh_button_1.default, {
            location: mailspring_exports_1.WorkspaceStore.Location.MessageList.Toolbar,
        });
        mailspring_exports_1.ComponentRegistry.register(apply_rules_button_1.default, {
            location: mailspring_exports_1.WorkspaceStore.Location.MessageList.Toolbar,
        });
    }
    else if (AppEnv.isThreadWindow()) {
        mailspring_exports_1.ComponentRegistry.register(ComposerViewForDraftClientId, {
            role: 'Composer',
        });
    }
    else {
        AppEnv.getCurrentWindow().setMinimumSize(480, 250);
        mailspring_exports_1.ComponentRegistry.register(ComposerWithWindowProps, {
            location: mailspring_exports_1.WorkspaceStore.Location.Center,
        });
    }
    setTimeout(() => {
        const i = document.createElement('i');
        i.className = 'fa fa-list';
        i.style.position = 'absolute';
        i.style.top = '-20px';
        document.body.appendChild(i);
    }, 1000);
}
function deactivate() {
    if (AppEnv.isMainWindow()) {
        mailspring_exports_1.ComponentRegistry.unregister(ComposerViewForDraftClientId);
        mailspring_exports_1.ComponentRegistry.unregister(compose_button_1.default);
        mailspring_exports_1.ComponentRegistry.unregister(refresh_button_1.default);
        mailspring_exports_1.ComponentRegistry.unregister(apply_rules_button_1.default);
    }
    else {
        mailspring_exports_1.ComponentRegistry.unregister(ComposerWithWindowProps);
    }
}
function serialize() {
    return this.state;
}
//# sourceMappingURL=main.js.map