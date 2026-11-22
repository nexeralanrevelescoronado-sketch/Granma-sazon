// Vocabulario propio de cada interés, por capítulo: 3 palabras nuevas con su frase (ES/EN).
// Se suman a las 10 palabras base del capítulo: así quien eligió «trabajo» aprende palabras distintas
// de quien eligió «cocina». Cada palabra aparece completa en su frase, en los dos idiomas.
// W(palabra en inglés, palabra en español, frase en inglés, frase en español)
const W = (en, es, fEn, fEs) => ({ en, es, f: { en: fEn, es: fEs } });

export const PALABRAS_INTERES = {
  // 1 · La casita del rancho
  1: {
    trabajo: [W('schedule', 'horario', 'My schedule starts early.', 'Mi horario empieza temprano.'), W('boss', 'jefe', 'My boss arrives in the morning.', 'Mi jefe llega en la mañana.'), W('office', 'oficina', 'The office has a small kitchen.', 'La oficina tiene una cocina pequeña.')],
    amigos: [W('visit', 'visita', 'Your visit makes me happy.', 'Tu visita me alegra.'), W('chat', 'plática', 'A good chat warms the house.', 'Una buena plática calienta la casa.'), W('welcome', 'bienvenido', 'You are welcome in my house.', 'Eres bienvenido en mi casa.')],
    biblia: [W('bread', 'pan', 'Give us our bread today.', 'Danos hoy nuestro pan.'), W('prayer', 'oración', 'A morning prayer gives me peace.', 'Una oración en la mañana me da paz.'), W('blessing', 'bendición', 'This house is a blessing.', 'Esta casa es una bendición.')],
    viajes: [W('ticket', 'boleto', 'I buy a ticket in the morning.', 'Compro un boleto en la mañana.'), W('suitcase', 'maleta', 'My suitcase is in the house.', 'Mi maleta está en la casa.'), W('breakfast', 'desayuno', 'Breakfast is at seven.', 'El desayuno es a las siete.')],
    cocina: [W('stove', 'estufa', 'The pot is on the stove.', 'La olla está en la estufa.'), W('foam', 'espuma', 'The chocolate has foam.', 'El chocolate tiene espuma.'), W('clay', 'barro', 'I drink from a clay cup.', 'Tomo en una taza de barro.')],
  },
  // 2 · Domingo de pozole
  2: {
    trabajo: [W('customer', 'cliente', 'The customer buys at the market.', 'El cliente compra en el mercado.'), W('price', 'precio', 'The price is fair.', 'El precio es justo.'), W('coworker', 'compañero', 'My coworker brings food on Friday.', 'Mi compañero trae comida el viernes.')],
    amigos: [W('invitation', 'invitación', 'Thank you for the invitation.', 'Gracias por la invitación.'), W('share', 'compartir', 'We like to share the food.', 'Nos gusta compartir la comida.'), W('laugh', 'risa', 'Your laugh fills the party.', 'Tu risa llena la fiesta.')],
    biblia: [W('church', 'iglesia', 'On Sunday we go to church.', 'El domingo vamos a la iglesia.'), W('thanks', 'gracias', 'We give thanks for the food.', 'Damos gracias por la comida.'), W('rest', 'descanso', 'Sunday is a day of rest.', 'El domingo es un día de descanso.')],
    viajes: [W('bus', 'autobús', 'The bus goes to the market.', 'El autobús va al mercado.'), W('map', 'mapa', 'I need a map of the town.', 'Necesito un mapa del pueblo.'), W('souvenir', 'recuerdo', 'I buy a souvenir at the market.', 'Compro un recuerdo en el mercado.')],
    cocina: [W('broth', 'caldo', 'The broth smells good.', 'El caldo huele rico.'), W('lettuce', 'lechuga', 'Wash the lettuce well.', 'Lava bien la lechuga.'), W('salt', 'sal', 'Add a little salt.', 'Agrega un poco de sal.')],
  },
  // 3 · Navidad y buñuelos
  3: {
    trabajo: [W('bonus', 'aguinaldo', 'I get a bonus in December.', 'Recibo un aguinaldo en diciembre.'), W('vacation', 'vacaciones', 'My vacation starts at Christmas.', 'Mis vacaciones empiezan en Navidad.'), W('team', 'equipo', 'The team shares a sweet bread.', 'El equipo comparte un pan dulce.')],
    amigos: [W('hug', 'abrazo', 'A hug warms a cold night.', 'Un abrazo calienta una noche fría.'), W('letter', 'carta', 'I write a letter to my friend.', 'Escribo una carta a mi amigo.'), W('toast', 'brindis', 'We make a toast with hot chocolate.', 'Hacemos un brindis con chocolate caliente.')],
    biblia: [W('shepherd', 'pastor', 'A shepherd saw the star.', 'Un pastor vio la estrella.'), W('manger', 'pesebre', 'The baby sleeps in a manger.', 'El niño duerme en un pesebre.'), W('peace', 'paz', 'Christmas brings peace.', 'La Navidad trae paz.')],
    viajes: [W('snow', 'nieve', 'There is snow in the mountains.', 'Hay nieve en las montañas.'), W('coat', 'abrigo', 'I need a coat for the cold.', 'Necesito un abrigo para el frío.'), W('airport', 'aeropuerto', 'The airport is full at Christmas.', 'El aeropuerto está lleno en Navidad.')],
    cocina: [W('dough', 'masa', 'Stretch the dough with your hands.', 'Estira la masa con las manos.'), W('frying pan', 'sartén', 'Heat the oil in a frying pan.', 'Calienta el aceite en una sartén.'), W('crispy', 'crujiente', 'The buñuelo is crispy.', 'El buñuelo está crujiente.')],
  },
  // 4 · El molcajete de mi mamá
  4: {
    trabajo: [W('effort', 'esfuerzo', 'Good work takes effort.', 'El buen trabajo pide esfuerzo.'), W('experience', 'experiencia', 'Experience is the best teacher.', 'La experiencia es la mejor maestra.'), W('goal', 'meta', 'My goal is to learn the recipe.', 'Mi meta es aprender la receta.')],
    amigos: [W('advice', 'consejo', 'My friend gives good advice.', 'Mi amigo da un buen consejo.'), W('trust', 'confianza', 'A secret needs trust.', 'Un secreto necesita confianza.'), W('help', 'ayuda', 'Thank you for your help.', 'Gracias por tu ayuda.')],
    biblia: [W('wisdom', 'sabiduría', 'Patience brings wisdom.', 'La paciencia trae sabiduría.'), W('faith', 'fe', 'Faith is like a small seed.', 'La fe es como una semilla pequeña.'), W('harvest', 'cosecha', 'The harvest comes with patience.', 'La cosecha llega con paciencia.')],
    viajes: [W('waiter', 'mesero', 'The waiter brings the plate.', 'El mesero trae el plato.'), W('bill', 'cuenta', 'The bill, please.', 'La cuenta, por favor.'), W('spicy', 'picante', 'I like spicy food.', 'Me gusta la comida picante.')],
    cocina: [W('grind', 'moler', 'You have to grind the seeds.', 'Hay que moler las semillas.'), W('almond', 'almendra', 'Add one almond.', 'Agrega una almendra.'), W('thick', 'espeso', 'The mole is thick.', 'El mole está espeso.')],
  },
  // 5 · El joven del sombrero
  5: {
    trabajo: [W('respect', 'respeto', 'Respect is always important.', 'El respeto siempre es importante.'), W('meeting', 'reunión', 'The meeting is on Monday.', 'La reunión es el lunes.'), W('partner', 'socio', 'My partner keeps his promise.', 'Mi socio cumple su promesa.')],
    amigos: [W('song', 'canción', 'This song is for the wedding.', 'Esta canción es para la boda.'), W('joke', 'broma', 'A good joke brings a smile.', 'Una buena broma trae una sonrisa.'), W('shy', 'tímido', 'The young man is shy.', 'El joven es tímido.')],
    biblia: [W('love', 'amor', 'Love is patient.', 'El amor es paciente.'), W('ring', 'anillo', 'The ring is a promise.', 'El anillo es una promesa.'), W('joy', 'gozo', 'There is joy at the wedding.', 'Hay gozo en la boda.')],
    viajes: [W('town', 'pueblo', 'The town has a big party.', 'El pueblo tiene una fiesta grande.'), W('road', 'camino', 'The road to the town is long.', 'El camino al pueblo es largo.'), W('square', 'plaza', 'The dance is in the square.', 'El baile es en la plaza.')],
    cocina: [W('banquet', 'banquete', 'The wedding has a banquet.', 'La boda tiene un banquete.'), W('rice', 'arroz', 'Serve the mole with rice.', 'Sirve el mole con arroz.'), W('tablecloth', 'mantel', 'The tablecloth is white.', 'El mantel es blanco.')],
  },
  // 6 · La noche de las posadas
  6: {
    trabajo: [W('celebration', 'celebración', 'The office has a celebration.', 'La oficina tiene una celebración.'), W('December', 'diciembre', 'December is a busy month.', 'Diciembre es un mes ocupado.'), W('kind', 'amable', 'A kind word is a warm gift.', 'Una palabra amable es un regalo cálido.')],
    amigos: [W('door', 'puerta', 'My door is open for you.', 'Mi puerta está abierta para ti.'), W('candy', 'caramelo', 'There is a candy for you.', 'Hay un caramelo para ti.'), W('game', 'juego', 'The piñata is a fun game.', 'La piñata es un juego divertido.')],
    biblia: [W('shelter', 'posada', 'They ask for shelter.', 'Ellos piden posada.'), W('inn', 'mesón', 'There was no room in the inn.', 'No había lugar en el mesón.'), W('hope', 'esperanza', 'The star brings hope.', 'La estrella trae esperanza.')],
    viajes: [W('journey', 'viaje', 'The journey is long and cold.', 'El viaje es largo y frío.'), W('lodging', 'hospedaje', 'We look for lodging tonight.', 'Buscamos hospedaje esta noche.'), W('street', 'calle', 'The street is full of lanterns.', 'La calle está llena de faroles.')],
    cocina: [W('punch', 'ponche', 'The punch is ready.', 'El ponche está listo.'), W('fruit', 'fruta', 'Wash the fruit first.', 'Lava la fruta primero.'), W('ladle', 'cucharón', 'Serve it with a ladle.', 'Sírvelo con un cucharón.')],
  },
};
