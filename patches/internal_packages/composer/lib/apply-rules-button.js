"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const mailspring_exports_1 = require("mailspring-exports");
class ApplyRulesButton extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this._onApplyRules = () => {
            for (const account of mailspring_exports_1.AccountStore.accounts()) {
                mailspring_exports_1.Actions.startReprocessingMailRules(account.id);
            }
        };
    }
    static { this.displayName = 'ApplyRulesButton'; }
    render() {
        return (react_1.default.createElement("button", {
            className: "btn btn-toolbar",
            style: { order: -198 },
            title: (0, mailspring_exports_1.localized)('Apply mail rules'),
            "aria-label": (0, mailspring_exports_1.localized)('Apply mail rules'),
            onClick: this._onApplyRules,
        },
            react_1.default.createElement("i", { className: "fa fa-filter", "aria-hidden": "true" })));
    }
}
exports.default = ApplyRulesButton;
