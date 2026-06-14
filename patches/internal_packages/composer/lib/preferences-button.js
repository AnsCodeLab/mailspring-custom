"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const mailspring_exports_1 = require("mailspring-exports");
class PreferencesButton extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this._onOpenPreferences = () => {
            mailspring_exports_1.Actions.openPreferences();
        };
    }
    static { this.displayName = 'PreferencesButton'; }
    render() {
        return (react_1.default.createElement("button", {
            className: "btn btn-toolbar",
            style: { order: -197 },
            title: (0, mailspring_exports_1.localized)('Preferences'),
            "aria-label": (0, mailspring_exports_1.localized)('Preferences'),
            onClick: this._onOpenPreferences,
        },
            react_1.default.createElement("i", { className: "fa fa-cog", "aria-hidden": "true" })));
    }
}
exports.default = PreferencesButton;
