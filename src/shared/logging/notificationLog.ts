type LogLevel = "INFO" | "WARN" | "ERROR";

export function notificationLog(scope: string, level: LogLevel, details: Record<string, unknown>): void {
  const line = `[NOTIFICATION][${scope}][${level}]`;
  if (level === "ERROR") {
    console.error(line, details);
    return;
  }
  if (level === "WARN") {
    console.warn(line, details);
    return;
  }
  console.log(line, details);
}

