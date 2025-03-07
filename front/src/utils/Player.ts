export const rank: Record<number, string> = {
  1: "Admin",
  2: "Super-Admin",
  3: "👑",
};

export const funnyNames = [
  "Surtomien",
  "Cracotto",
  "Marmeluche",
  "Ziboulette",
  "Bidulette",
  "Farfelucho",
  "Patacroute",
  "Zozo",
  "Frimousse",
  "Zigzag",
  "Turlututu",
  "Bouboule",
  "Cacahuete",
  "ChocoBrioche",
  "Roudoudou",
  "Cornichon",
  "Choupette",
  "Bibop",
  "Tornade",
  "Cocorico",
  "Biscotto",
  "Frisottis",
  "Barbapapa",
  "Rigolito",
  "Loufoquet",
  "Gribouille",
  "Papouille",
  "Cocotte",
  "Patachou",
  "Filoufou",
  "Zinzolin",
  "Chocolala",
  "Zigouigoui",
  "TchouTchou",
  "Roudoudouf",
  "Tournicoti",
  "Choubidou",
  "Fantastik",
  "Snickerdoodle",
  "BimBamBoum",
  "Chamallow",
];

export function getPlayerColor(isModerator: number, pseudo: string): string {
  if (isModerator) {
    switch (isModerator) {
      case 1:
        return "rgb(155 185 244)";
      case 2:
        return "rgb(150 40 150)";
      case 3:
        return "rgb(240, 75, 75)";
      default:
        return "rgb(255, 255, 134)";
    }
  } else if (funnyNames.includes(pseudo)) {
    return "white";
  } else {
    return "rgb(255, 255, 134)";
  }
}
