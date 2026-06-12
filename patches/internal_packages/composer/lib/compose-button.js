"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const mailspring_exports_1 = require("mailspring-exports");
const mailspring_component_kit_1 = require("mailspring-component-kit");
class ComposeButton extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this._onNewCompose = () => {
            mailspring_exports_1.Actions.composeNewBlankDraft();
        };
    }
    static { this.displayName = 'ComposeButton'; }
    render() {
        return (react_1.default.createElement("button", { className: "btn btn-toolbar item-compose", style: { order: 100 }, title: (0, mailspring_exports_1.localized)('Compose new message'), "aria-label": (0, mailspring_exports_1.localized)('Compose new message'), onClick: this._onNewCompose },
            react_1.default.createElement(mailspring_component_kit_1.RetinaImg, { name: "toolbar-compose.png", mode: mailspring_component_kit_1.RetinaImg.Mode.ContentIsMask, "aria-hidden": "true" })));
    }
}
exports.default = ComposeButton;
//# sourceMappingURL=compose-button.js.map