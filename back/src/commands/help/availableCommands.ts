type CommandDescriptions = { [key: string]: string };

export function getAvailableCommands(isModerator = false): CommandDescriptions {
  const base: CommandDescriptions = {
    '/register pseudo mot_de_passe': "S'enregistrer avec un pseudo personnalisé",
    '/login pseudo mot_de_passe': 'Se connecter à son compte',
    '/msg cible message': 'Envoyer un message privé à une cible',
    '/help': "Afficher l'aide générale sur les commandes",
  };

  if (isModerator) {
    return {
      ...base,
      '/refresh cible?': 'Actualiser le chat des cibles correspondantes',
      '/mod mot_de_passe': 'Se connecter en tant que modérateur',
      '/tellraw cible? {"text":"","color"?:"","clickable"?:""}':
        "Envoyer un message personnalisé (sauvegardé en BDD si aucune cible n'est précisée)",
      '/addtype type': 'Ajouter un type de message à vos listeningTypes',
      '/eval ¿¿¿ ¿¿¿¿': '¿¿¿¿',
    };
  }

  return {
    ...base,
    '/refresh': 'Actualiser le chat',
  };
}
