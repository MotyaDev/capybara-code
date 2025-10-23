const esc = (s: string) => `\x1b[${s}`;
export const reset = esc("0m");
export const bold = (s: string) => esc("1m") + s + reset;
export const dim = (s: string) => esc("2m") + s + reset;
export const italic = (s: string) => esc("3m") + s + reset;
export const gray = (s: string) => esc("90m") + s + reset;
export const color256 = (code: number, s: string) => `\x1b[38;5;${code}m` + s + reset;
