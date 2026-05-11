"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessRuleError = void 0;
const DomainError_1 = require("./DomainError");
class BusinessRuleError extends DomainError_1.DomainError {
    constructor(message) {
        super(message);
        this.name = "BusinessRuleError";
    }
}
exports.BusinessRuleError = BusinessRuleError;
