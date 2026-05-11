import { DomainError } from "./DomainError";

export class BusinessRuleError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = "BusinessRuleError";
  }
}

