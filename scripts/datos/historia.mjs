// Historia 1 de Granma: "Mi vida en México" (de la niñez a las posadas con el Abuelo). 6 capítulos.
// ejemplos[interes] = 3 frases [en, es, palabraEn, palabraEs]; la palabra debe ser una de las del capitulo.
const P = (en, es) => ({ en, es });
const E = (en, es, we, ws) => ({ en, es, we, ws });

export const historia = {
  id: 'historia-1',
  titulo: P('Granma\'s life in Mexico', 'La vida de Granma en México'),
  nivel: 'A1',
  capitulos: [
    {
      id: 1, receta: 'champurrado',
      titulo: P('The little house on the ranch', 'La casita del rancho'),
      relato: {
        es: [
          'Mijo, cuando yo era niña, vivía en una casa pequeña en un rancho de Puebla.',
          'Cada mañana, mi mamá prendía el fuego en la cocina. Yo me sentaba cerca, todavía con sueño.',
          'Ella mezclaba maíz, leche y chocolate en una olla grande y movía todo con una cuchara de palo.',
          '¡Qué rico olía! Mi familia tomaba el champurrado caliente, en tazas de barro, y todos platicábamos antes de salir a trabajar.',
        ],
        en: [
          'Mijo, when I was a girl, I lived in a small house on a ranch in Puebla.',
          'Every morning, my mom lit the fire in the kitchen. I sat close by, still sleepy.',
          'She mixed corn, milk and chocolate in a big pot and stirred everything with a wooden spoon.',
          'It smelled so good! My family drank the hot champurrado from clay cups, and we all chatted before going out to work.',
        ],
      },
      palabras: [P('house','casa'),P('kitchen','cocina'),P('morning','mañana'),P('fire','fuego'),P('corn','maíz'),P('milk','leche'),P('chocolate','chocolate'),P('spoon','cuchara'),P('hot','caliente'),P('family','familia')],
      ejemplos: {
        trabajo: [
          E('My morning starts at six o\'clock.','Mi mañana empieza a las seis.','morning','mañana'),
          E('I need a hot coffee before work.','Necesito un café caliente antes del trabajo.','hot','caliente'),
          E('My family is proud of my job.','Mi familia está orgullosa de mi trabajo.','family','familia'),
        ],
        amigos: [
          E('Come to my house on Saturday.','Ven a mi casa el sábado.','house','casa'),
          E('We talk in the kitchen.','Platicamos en la cocina.','kitchen','cocina'),
          E('How is your family?','¿Cómo está tu familia?','family','familia'),
        ],
        biblia: [
          E('The land has milk and honey.','La tierra tiene leche y miel.','milk','leche'),
          E('In the morning I pray.','En la mañana yo oro.','morning','mañana'),
          E('Bless my house, Lord.','Bendice mi casa, Señor.','house','casa'),
        ],
        viajes: [
          E('The hotel has a small kitchen.','El hotel tiene una cocina pequeña.','kitchen','cocina'),
          E('I want chocolate in the morning.','Quiero chocolate en la mañana.','chocolate','chocolate'),
          E('Is this house far from the beach?','¿Esta casa está lejos de la playa?','house','casa'),
        ],
        cocina: [
          E('Stir the milk with a spoon.','Mueve la leche con una cuchara.','spoon','cuchara'),
          E('Put the pot on the fire.','Pon la olla en el fuego.','fire','fuego'),
          E('Corn is the heart of Mexican cooking.','El maíz es el corazón de la cocina mexicana.','corn','maíz'),
        ],
      },
      consejo: { es: 'Una casa se hace con cariño, no solo con ladrillos.', en: 'A home is built with love, not just with bricks.', clave: [P('love','cariño'), P('bricks','ladrillos')] },
    },
    {
      id: 2, receta: 'pozole',
      titulo: P('Sunday pozole', 'Domingo de pozole'),
      relato: {
        es: [
          'Mija, los domingos íbamos al mercado con mi abuela. Yo llevaba la canasta y ella llevaba la lista.',
          'Comprábamos carne, cebolla, limones y rábanos. El vecino siempre nos regalaba un poco de orégano.',
          'En casa, la olla grande cocinaba toda la tarde. ¡Era el pozole de la fiesta!',
          'Esa noche nos juntábamos todos, grandes y chiquitos, y nadie se levantaba de la mesa sin repetir.',
        ],
        en: [
          'Mija, on Sundays we went to the market with my grandmother. I carried the basket and she carried the list.',
          'We bought meat, onions, limes and radishes. The neighbor always gave us a little oregano.',
          'At home, the big pot cooked all afternoon. It was the pozole for the party!',
          'That night we all gathered, big and small, and nobody left the table without having seconds.',
        ],
      },
      palabras: [P('Sunday','domingo'),P('market','mercado'),P('pot','olla'),P('meat','carne'),P('onion','cebolla'),P('lime','limón'),P('radish','rábano'),P('neighbor','vecino'),P('party','fiesta'),P('basket','canasta')],
      ejemplos: {
        trabajo: [
          E('On Sunday I rest from work.','El domingo descanso del trabajo.','Sunday','domingo'),
          E('The company party is on Friday.','La fiesta de la empresa es el viernes.','party','fiesta'),
          E('My neighbor works near the market.','Mi vecino trabaja cerca del mercado.','neighbor','vecino'),
        ],
        amigos: [
          E('Let\'s go to the party together.','Vamos juntos a la fiesta.','party','fiesta'),
          E('My neighbor is also my friend.','Mi vecino también es mi amigo.','neighbor','vecino'),
          E('We meet on Sunday.','Nos vemos el domingo.','Sunday','domingo'),
        ],
        biblia: [
          E('Sunday is a day of rest and prayer.','El domingo es un día de descanso y oración.','Sunday','domingo'),
          E('Love your neighbor.','Ama a tu vecino.','neighbor','vecino'),
          E('The market was full of people.','El mercado estaba lleno de gente.','market','mercado'),
        ],
        viajes: [
          E('The market has fresh fruit.','El mercado tiene fruta fresca.','market','mercado'),
          E('I want a basket for my trip.','Quiero una canasta para mi viaje.','basket','canasta'),
          E('On Sunday the shops are closed.','El domingo las tiendas están cerradas.','Sunday','domingo'),
        ],
        cocina: [
          E('Chop the onion and add the lime.','Pica la cebolla y agrega el limón.','lime','limón'),
          E('Cook the meat in a big pot.','Cocina la carne en una olla grande.','pot','olla'),
          E('The radish is crunchy and fresh.','El rábano está crujiente y fresco.','radish','rábano'),
        ],
      },
      consejo: { es: 'Quien comparte la mesa, comparte la vida.', en: 'Whoever shares the table shares life.', clave: [P('shares','comparte'), P('table','mesa')] },
    },
    {
      id: 3, receta: 'bunuelos',
      titulo: P('Christmas and buñuelos', 'Navidad y buñuelos'),
      relato: {
        es: [
          'Mijo, en diciembre hacía mucho frío en el rancho. Yo me ponía mi rebozo y ayudaba a mi mamá con los buñuelos.',
          'Mezclábamos harina, azúcar y un poquito de sal. Después estirábamos la masa con las manos, bien delgadita.',
          'Mi mamá los freía en aceite caliente y yo los bañaba con miel de piloncillo. ¡Qué dulce Navidad!',
          'Una vela en la ventana y un regalo para cada niño: así era nuestra noche buena.',
        ],
        en: [
          'Mijo, in December it was very cold on the ranch. I put on my rebozo and helped my mom with the buñuelos.',
          'We mixed flour, sugar and a little salt. Then we stretched the dough with our hands, nice and thin.',
          'My mom fried them in hot oil and I covered them with piloncillo syrup. What a sweet Christmas!',
          'A candle in the window and a gift for every child: that was our Christmas Eve.',
        ],
      },
      palabras: [P('Christmas','Navidad'),P('flour','harina'),P('sugar','azúcar'),P('hands','manos'),P('oil','aceite'),P('gift','regalo'),P('night','noche'),P('cold','frío'),P('sweet','dulce'),P('candle','vela')],
      ejemplos: {
        trabajo: [
          E('I work late at night.','Trabajo tarde por la noche.','night','noche'),
          E('The office gives a gift at Christmas.','La oficina da un regalo en Navidad.','gift','regalo'),
          E('Wash your hands before work.','Lávate las manos antes del trabajo.','hands','manos'),
        ],
        amigos: [
          E('I have a gift for my friend.','Tengo un regalo para mi amigo.','gift','regalo'),
          E('It is cold tonight. Let\'s go inside.','Hace frío esta noche. Entremos.','cold','frío'),
          E('We celebrate Christmas together.','Celebramos la Navidad juntos.','Christmas','Navidad'),
        ],
        biblia: [
          E('At Christmas we remember the birth of Jesus.','En Navidad recordamos el nacimiento de Jesús.','Christmas','Navidad'),
          E('Light a candle and pray.','Enciende una vela y ora.','candle','vela'),
          E('Lift your hands in thanks.','Levanta tus manos con gratitud.','hands','manos'),
        ],
        viajes: [
          E('The night in the city is beautiful.','La noche en la ciudad es hermosa.','night','noche'),
          E('It is cold in the mountains.','Hace frío en las montañas.','cold','frío'),
          E('I buy a gift for my family.','Compro un regalo para mi familia.','gift','regalo'),
        ],
        cocina: [
          E('Mix the flour and the sugar.','Mezcla la harina y el azúcar.','flour','harina'),
          E('Heat the oil in the pan.','Calienta el aceite en la sartén.','oil','aceite'),
          E('This dessert is very sweet.','Este postre es muy dulce.','sweet','dulce'),
        ],
      },
      consejo: { es: 'Las manos que dan nunca quedan vacías.', en: 'Hands that give are never empty.', clave: [P('give','dan'), P('empty','vacías')] },
    },
    {
      id: 4, receta: 'mole',
      titulo: P('My mother\'s molcajete', 'El molcajete de mi mamá'),
      relato: {
        es: [
          'A los diez años, mi mamá me enseñó su receta más importante: el mole.',
          'Primero tostamos los chiles y las semillas. Después los molimos con paciencia en el molcajete. ¡Dos horas de brazo!',
          'Ella me dijo: «Mija, el mole no tiene prisa. El secreto es el cariño y una pizca de chocolate».',
          'Esa tarde probé la salsa por primera vez. Tenía mucho sabor, y yo me sentí muy grande.',
        ],
        en: [
          'When I was ten, my mom taught me her most important recipe: mole.',
          'First we toasted the chilies and the seeds. Then we ground them with patience in the molcajete. Two hours of arm work!',
          'She told me: "Mija, mole is in no hurry. The secret is love and a pinch of chocolate."',
          'That afternoon I tasted the sauce for the first time. It had so much flavor, and I felt very grown up.',
        ],
      },
      palabras: [P('chili','chile'),P('seed','semilla'),P('sauce','salsa'),P('patience','paciencia'),P('secret','secreto'),P('spice','especia'),P('chicken','pollo'),P('flavor','sabor'),P('plate','plato'),P('recipe','receta')],
      ejemplos: {
        trabajo: [
          E('Patience is important at work.','La paciencia es importante en el trabajo.','patience','paciencia'),
          E('The secret of my job is practice.','El secreto de mi trabajo es practicar.','secret','secreto'),
          E('I have a new recipe for success.','Tengo una nueva receta para el éxito.','recipe','receta'),
        ],
        amigos: [
          E('Can you keep a secret?','¿Puedes guardar un secreto?','secret','secreto'),
          E('I made a plate for my friend.','Preparé un plato para mi amigo.','plate','plato'),
          E('Have patience, my friend. It is almost ready.','Ten paciencia, amigo. Ya casi está.','patience','paciencia'),
        ],
        biblia: [
          E('Wait with patience.','Espera con paciencia.','patience','paciencia'),
          E('A seed grows into a tree.','Una semilla se convierte en árbol.','seed','semilla'),
          E('The Lord gives us a plate at His table.','El Señor nos da un plato en su mesa.','plate','plato'),
        ],
        viajes: [
          E('I want the local flavor.','Quiero el sabor local.','flavor','sabor'),
          E('This restaurant has a famous recipe.','Este restaurante tiene una receta famosa.','recipe','receta'),
          E('Is the sauce spicy?','¿La salsa pica?','sauce','salsa'),
        ],
        cocina: [
          E('Toast the chili and the seed.','Tuesta el chile y la semilla.','chili','chile'),
          E('Add one spice at a time.','Agrega una especia a la vez.','spice','especia'),
          E('The chicken is covered with sauce.','El pollo está cubierto de salsa.','chicken','pollo'),
        ],
      },
      consejo: { es: 'La paciencia es la mejor especia.', en: 'Patience is the best spice.', clave: [P('patience','paciencia'), P('spice','especia')] },
    },
    {
      id: 5, receta: 'mole',
      titulo: P('The young man with the hat', 'El joven del sombrero'),
      relato: {
        es: [
          'En la fiesta del pueblo conocí a un joven muy serio, con sombrero de palma. No hablaba mucho, pero me miraba con una sonrisa tranquila.',
          'Me invitó a bailar una pieza. Yo estaba tan nerviosa que casi se me cae la cuchara… ¡todavía la traía en la mano!',
          'Pasó el tiempo y nos casamos. En mi boda cociné mi mole para todos los invitados.',
          'Aquel joven era tu abuelo, mija. Me hizo una promesa y la cumplió: estar juntos siempre, con el corazón.',
        ],
        en: [
          'At the town party I met a very serious young man with a palm hat. He did not talk much, but he looked at me with a calm smile.',
          'He asked me to dance one song. I was so nervous that I almost dropped my spoon… I was still holding it!',
          'Time passed and we got married. At my wedding I cooked my mole for all the guests.',
          'That young man was your grandfather, mija. He made me a promise and he kept it: to be together always, with all his heart.',
        ],
      },
      palabras: [P('hat','sombrero'),P('young','joven'),P('smile','sonrisa'),P('dance','baile'),P('wedding','boda'),P('promise','promesa'),P('together','juntos'),P('always','siempre'),P('heart','corazón'),P('guest','invitado')],
      ejemplos: {
        trabajo: [
          E('Always arrive on time.','Siempre llega a tiempo.','always','siempre'),
          E('We work together as a team.','Trabajamos juntos como equipo.','together','juntos'),
          E('A kind smile helps with customers.','Una sonrisa amable ayuda con los clientes.','smile','sonrisa'),
        ],
        amigos: [
          E('Do you like the dance on Saturday?','¿Te gusta el baile del sábado?','dance','baile'),
          E('My friend has a wedding on Saturday.','Mi amigo tiene una boda el sábado.','wedding','boda'),
          E('A good friend keeps a promise.','Un buen amigo cumple una promesa.','promise','promesa'),
        ],
        biblia: [
          E('God keeps His promise.','Dios cumple su promesa.','promise','promesa'),
          E('Trust in the Lord with all your heart.','Confía en el Señor con todo tu corazón.','heart','corazón'),
          E('Jesus was a guest at a wedding.','Jesús fue invitado a una boda.','wedding','boda'),
        ],
        viajes: [
          E('I want a hat for the sun.','Quiero un sombrero para el sol.','hat','sombrero'),
          E('I am a guest at this hotel.','Soy un invitado en este hotel.','guest','invitado'),
          E('We travel together.','Viajamos juntos.','together','juntos'),
        ],
        cocina: [
          E('Every guest likes the dish.','A cada invitado le gusta el platillo.','guest','invitado'),
          E('We cook with all our heart.','Cocinamos con todo el corazón.','heart','corazón'),
          E('Cook together and have fun.','Cocinen juntos y diviértanse.','together','juntos'),
        ],
      },
      consejo: { es: 'Quien promete con el corazón, cumple con las manos.', en: 'Whoever promises with the heart keeps it with the hands.', clave: [P('promises','promete'), P('keeps','cumple')] },
    },
    // Capítulo 6 (agregado con la skill contenido-granma; objeto literal validado con validar.mjs)
    {
      "id": 6,
      "receta": "ponche",
      "titulo": {
        "es": "La noche de las posadas",
        "en": "The night of the posadas"
      },
      "relato": {
        "es": [
          "Cada diciembre, mijo, mi casita se llenaba de gente para las posadas. Los vecinos llegaban con un farol en la mano y la nariz roja de frío.",
          "Los niños cantaban un villancico afuera de la puerta, pidiendo posada como en la historia de José y María. Yo abría y les decía: «Pásenle, pásenle, aquí hay lugar para todos».",
          "Luego venía la piñata, con su estrella de colores. Tu abuelo, tan serio, le ponía el palo a cada niño con mucho cuidado, y todos reíamos cuando caían los dulces.",
          "Y para el frío, una olla grande de ponche: guayaba, manzana y canela, bien calientito. Ándale, mijo, hoy también te toca prepararlo conmigo, con cobija o sin cobija.",
          "Tu abuelo nunca decía mucho, pero en cada posada levantaba su taza y sonreía. Eso era su manera de decir «gracias por venir»."
        ],
        "en": [
          "Every December, mijo, my little house filled with people for the posadas. The neighbors arrived with a lantern in hand and red noses from the cold.",
          "The children sang a carol outside the door, asking for shelter like in the story of Joseph and Mary. I opened up and said: \"Come in, come in, there is room for everyone here\".",
          "Then came the piñata, with its colorful star. Your grandfather, so serious, handed the stick to each child very carefully, and we all laughed when the candy fell.",
          "And for the cold, a big pot of punch: guava, apple and cinnamon, nice and warm. Come on, mijo, today you get to make it with me, with a blanket or without one.",
          "Your grandfather never said much, but at every posada he raised his cup and smiled. That was his way of saying \"thank you for coming\"."
        ]
      },
      "palabras": [
        {
          "en": "lantern",
          "es": "farol"
        },
        {
          "en": "carol",
          "es": "villancico"
        },
        {
          "en": "piñata",
          "es": "piñata"
        },
        {
          "en": "cinnamon",
          "es": "canela"
        },
        {
          "en": "guava",
          "es": "guayaba"
        },
        {
          "en": "star",
          "es": "estrella"
        },
        {
          "en": "sing",
          "es": "cantar"
        },
        {
          "en": "blanket",
          "es": "cobija"
        },
        {
          "en": "warm",
          "es": "cálido"
        },
        {
          "en": "cup",
          "es": "taza"
        }
      ],
      "ejemplos": {
        "trabajo": [
          {
            "en": "A warm welcome helps every customer.",
            "es": "Un trato cálido ayuda a cada cliente.",
            "we": "warm",
            "ws": "cálido"
          },
          {
            "en": "She is the star of the team.",
            "es": "Ella es la estrella del equipo.",
            "we": "star",
            "ws": "estrella"
          },
          {
            "en": "A lantern at the door tells customers we are open.",
            "es": "Un farol en la puerta avisa a los clientes que estamos abiertos.",
            "we": "lantern",
            "ws": "farol"
          }
        ],
        "amigos": [
          {
            "en": "My friend has a piñata at the party.",
            "es": "Mi amigo tiene una piñata en la fiesta.",
            "we": "piñata",
            "ws": "piñata"
          },
          {
            "en": "My friend brings a blanket to the park.",
            "es": "Mi amigo trae una cobija al parque.",
            "we": "blanket",
            "ws": "cobija"
          },
          {
            "en": "Let us sing together tonight.",
            "es": "Vamos a cantar juntos esta noche.",
            "we": "sing",
            "ws": "cantar"
          }
        ],
        "biblia": [
          {
            "en": "The wise men followed a star.",
            "es": "Los sabios siguieron una estrella.",
            "we": "star",
            "ws": "estrella"
          },
          {
            "en": "Let us sing to the Lord.",
            "es": "Vamos a cantar al Señor.",
            "we": "sing",
            "ws": "cantar"
          },
          {
            "en": "We sing a carol about baby Jesus.",
            "es": "Cantamos un villancico del niño Jesús.",
            "we": "carol",
            "ws": "villancico"
          }
        ],
        "viajes": [
          {
            "en": "I need a blanket for the cold bus.",
            "es": "Necesito una cobija para el autobús frío.",
            "we": "blanket",
            "ws": "cobija"
          },
          {
            "en": "I carry a small lantern on the trip.",
            "es": "Llevo un farol pequeño en el viaje.",
            "we": "lantern",
            "ws": "farol"
          },
          {
            "en": "In the desert you can see every star.",
            "es": "En el desierto se ve cada estrella.",
            "we": "star",
            "ws": "estrella"
          }
        ],
        "cocina": [
          {
            "en": "Add one cinnamon stick to the pot.",
            "es": "Agrega una raja de canela a la olla.",
            "we": "cinnamon",
            "ws": "canela"
          },
          {
            "en": "Cut the guava into pieces.",
            "es": "Corta la guayaba en trozos.",
            "we": "guava",
            "ws": "guayaba"
          },
          {
            "en": "Serve the punch in a cup.",
            "es": "Sirve el ponche en una taza.",
            "we": "cup",
            "ws": "taza"
          }
        ]
      },
      "consejo": {
        "es": "Una puerta abierta calienta más que una fogata.",
        "en": "An open door warms more than a bonfire.",
        "clave": [
          {
            "es": "puerta",
            "en": "door"
          },
          {
            "es": "abierta",
            "en": "open"
          }
        ]
      }
    },
  ],
};
