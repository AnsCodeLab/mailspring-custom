"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const mailspring_exports_1 = require("mailspring-exports");
class RefreshButton extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this._onRefresh = () => {
            AppEnv.mailsyncBridge.sendSyncMailNow();
        };
    }
    static { this.displayName = 'RefreshButton'; }
    render() {
        return (react_1.default.createElement("button", {
            className: "btn btn-toolbar",
            style: { order: -199 },
            title: (0, mailspring_exports_1.localized)('Refresh mail'),
            "aria-label": (0, mailspring_exports_1.localized)('Refresh mail'),
            onClick: this._onRefresh,
        },
            react_1.default.createElement("i", { className: "fa fa-refresh", "aria-hidden": "true" })));
    }
}
exports.default = RefreshButton;
