type ColoredText = { text: string; color: string };

export const cibleExplanation: ColoredText[] = [
  { text: '\nExplication des ', color: 'lemonchiffon' },
  { text: 'cibles', color: 'darkkhaki' },
  { text: ' :\n', color: 'lemonchiffon' },
  { text: 'Vous pouvez, en plus du ', color: 'lemonchiffon' },
  { text: 'pseudo', color: 'darkkhaki' },
  { text: ', utiliser des ', color: 'lemonchiffon' },
  { text: 'cibles', color: 'darkkhaki' },
  {
    text: '. Elles permettent de sélectionner des joueurs de manière programmatique.\n',
    color: 'lemonchiffon',
  },
  { text: 'Les cibles disponibles sont ', color: 'lemonchiffon' },
  { text: '@a ', color: 'darkkhaki' },
  { text: '(tous), ', color: 'lemonchiffon' },
  { text: '@s ', color: 'darkkhaki' },
  { text: '(soi), ', color: 'lemonchiffon' },
  { text: '@r ', color: 'darkkhaki' },
  { text: '(random), ', color: 'lemonchiffon' },
  { text: '@e ', color: 'darkkhaki' },
  { text: '(tous).\n', color: 'lemonchiffon' },
];

export const markdownExplanation: ColoredText[] = [
  { text: '\nExplication du ', color: 'lemonchiffon' },
  { text: 'Formatage Markdown', color: 'darkkhaki' },
  { text: ' :\n', color: 'lemonchiffon' },
  {
    text: 'Vous pouvez utiliser les éléments suivants pour formater le texte :\n',
    color: 'lemonchiffon',
  },
  { text: '**Gras** : ', color: 'lemonchiffon' },
  { text: '\\*\\*texte\\*\\*', color: 'darkkhaki' },
  { text: '.\n', color: 'lemonchiffon' },
  { text: '*Italique* : ', color: 'lemonchiffon' },
  { text: '\\*texte\\* ou \\_texte\\_', color: 'darkkhaki' },
  { text: '.\n', color: 'lemonchiffon' },
  { text: '***Gras italique*** : ', color: 'lemonchiffon' },
  { text: '\\*\\*\\*texte\\*\\*\\*', color: 'darkkhaki' },
  { text: '.\n', color: 'lemonchiffon' },
  { text: '__Souligné__ : ', color: 'lemonchiffon' },
  { text: '\\_\\_texte\\_\\_', color: 'darkkhaki' },
  { text: '.\n', color: 'lemonchiffon' },
  { text: '~~Barré~~ : ', color: 'lemonchiffon' },
  { text: '\\~\\~texte\\~\\~', color: 'darkkhaki' },
  { text: '.\n', color: 'lemonchiffon' },
  { text: '||Caché 🫣👻|| : ', color: 'lemonchiffon' },
  { text: '\\|\\|texte\\|\\|', color: 'darkkhaki' },
  { text: '.\n', color: 'lemonchiffon' },
  {
    text: "Vous pouvez empêcher la détection d'un modificateur avec \\ (ex: \\\\*).\n",
    color: 'lemonchiffon',
  },
];

export const utilisezEmojis: ColoredText[] = [
  { text: '\nUtilisez donc les emojis ! 😎 😱', color: 'lemonchiffon' },
  { text: '\nFaites simplement ', color: 'lemonchiffon' },
  { text: ':nom_emoji', color: 'darkkhaki' },
  {
    text: ' pour commencer à voir apparaître la liste.\n',
    color: 'lemonchiffon',
  },
];

export const cycleHistory: ColoredText[] = [
  {
    text: "\nParcourez l'historique de vos messages avec ↑ et ↓, filtrez les messages en écrivant d'abord.\n",
    color: 'lemonchiffon',
  },
];

export const helpHeader: ColoredText[] = [
  {
    text: '\nVoici la liste des commandes disponibles :\n',
    color: 'lemonchiffon',
  },
];
