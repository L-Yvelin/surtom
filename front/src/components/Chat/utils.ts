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

export const rank = {
  1: "Admin",
  2: "Super-Admin",
  3: "👑",
};

export const getPlayerColor = (moderatorLevel: number) => {
  switch (moderatorLevel) {
    case 1:
      return "#ff0000";
    case 2:
      return "#ff00ff";
    case 3:
      return "#ff0000";
    default:
      return "#000000";
  }
}