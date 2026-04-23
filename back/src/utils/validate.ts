export function validateUsername(username: string): boolean {
  const usernamePattern = /^[-_a-zA-Z0-9]{1,16}$/;
  return usernamePattern.test(username);
}

export function validateText(text: string): boolean {
  const textPattern = /^.{1,256}$/;
  return textPattern.test(text);
}

export function isJson(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}
