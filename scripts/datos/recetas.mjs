// Recetas mexicanas. Cantidades en gramos / mililitros / cucharadas / piezas.
// Las recetas de las fiestas (Historia 3) se escriben directo en JSON: scripts/datos/recetas-fiestas.json; se suman al final.
import { readFileSync } from 'node:fs';
// pasos: min = minutos del cronometro del paso (omitido si no hay espera).
const I = (cant, un, es, en) => ({ cant, un, es, en });
const S = (es, en, min) => (min ? { es, en, min } : { es, en });

export const recetas = [
  {
    id: 'mole', icono: 'mole', estrella: true, insignia: 'maestro-mole',
    nombre: { es: 'Mole poblano', en: 'Mole poblano' },
    resumen: { es: 'La receta estrella de Granma: una salsa de chiles, chocolate y especias que abraza al pollo.', en: 'Granma\'s star recipe: a sauce of chilies, chocolate and spices that wraps around the chicken.' },
    porciones: 8, tiempoPrep: 40, tiempoCoccion: 120, nivel: { es: 'Con paciencia', en: 'Needs patience' },
    nota: { es: 'Los chiles se fríen solo unos segundos; si se queman, el mole amarga. Pide ayuda a un adulto con el aceite caliente.', en: 'Chilies fry for only a few seconds; if they burn, the mole turns bitter. Ask an adult to help with hot oil.' },
    ingredientes: [
      I(2, 'kg', 'pollo en piezas', 'chicken, in pieces'), I(0.5, 'pza', 'cebolla (para el caldo)', 'onion (for the broth)'), I(2, 'dientes', 'ajo (para el caldo)', 'garlic cloves (for the broth)'),
      I(5, 'pza', 'chiles mulatos, sin semillas ni venas', 'mulato chilies, seeds and veins removed'), I(4, 'pza', 'chiles anchos, sin semillas ni venas', 'ancho chilies, seeds and veins removed'), I(4, 'pza', 'chiles pasilla, sin semillas ni venas', 'pasilla chilies, seeds and veins removed'),
      I(30, 'g', 'ajonjolí (más un poco para decorar)', 'sesame seeds (plus a little to garnish)'), I(30, 'g', 'almendras', 'almonds'), I(30, 'g', 'cacahuates sin sal', 'unsalted peanuts'), I(40, 'g', 'pasas', 'raisins'),
      I(2, 'pza', 'tortillas de maíz, doradas', 'corn tortillas, toasted'), I(2, 'pza', 'jitomates medianos (300 g)', 'medium tomatoes (300 g)'), I(0.5, 'pza', 'cebolla para el mole', 'onion for the mole'), I(3, 'dientes', 'ajo para el mole', 'garlic cloves for the mole'),
      I(5, 'cm', 'raja de canela', 'cinnamon stick'), I(4, 'pza', 'clavos de olor', 'whole cloves'), I(6, 'pza', 'pimientas negras', 'black peppercorns'), I(0.5, 'cdta', 'semillas de anís', 'aniseed'),
      I(60, 'g', 'chocolate de mesa', 'Mexican table chocolate'), I(3, 'cda', 'manteca o aceite', 'lard or oil'), I(1, 'L', 'caldo de pollo (el de la cocción)', 'chicken broth (from cooking the chicken)'), I(1, 'cda', 'azúcar', 'sugar'), I(2, 'cdta', 'sal, o al gusto', 'salt, or to taste'),
    ],
    pasos: [
      S('Pon el pollo en una olla con 3 litros de agua, media cebolla, 2 dientes de ajo y 1 cucharadita de sal. Cuécelo a fuego medio.', 'Put the chicken in a pot with 3 liters of water, half an onion, 2 garlic cloves and 1 teaspoon of salt. Cook over medium heat.', 40),
      S('Mientras tanto, abre los chiles y quítales semillas y venas. Tuéstalos 20 segundos por lado en un comal y remójalos en agua caliente.', 'Meanwhile, open the chilies and remove seeds and veins. Toast them 20 seconds per side on a griddle and soak them in hot water.', 15),
      S('En una sartén con 1 cucharada de manteca, dora por separado: ajonjolí, almendras, cacahuates y pasas, 2 minutos cada uno. Resérvalos.', 'In a pan with 1 tablespoon of lard, brown separately: sesame, almonds, peanuts and raisins, 2 minutes each. Set aside.', 8),
      S('Asa los jitomates, la media cebolla y los 3 dientes de ajo hasta que estén suaves y con manchitas doradas.', 'Roast the tomatoes, the half onion and the 3 garlic cloves until soft and lightly charred.', 10),
      S('Licúa en tandas: chiles escurridos, frutos secos, tortillas, jitomate, cebolla, ajo, canela, clavos, pimienta, anís y 2 tazas de caldo. Debe quedar muy suave.', 'Blend in batches: drained chilies, nuts, tortillas, tomato, onion, garlic, cinnamon, cloves, pepper, aniseed and 2 cups of broth. It should be very smooth.', 8),
      S('Calienta 2 cucharadas de manteca en una cazuela, vierte la pasta (con cuidado, salpica) y fríela, moviendo sin parar.', 'Heat 2 tablespoons of lard in a casserole, pour in the paste (carefully, it splashes) and fry it, stirring constantly.', 10),
      S('Agrega el chocolate, el azúcar y el resto del caldo (hasta 1 litro). Cuece a fuego bajo, moviendo de vez en cuando, hasta que espese.', 'Add the chocolate, sugar and the rest of the broth (up to 1 liter). Simmer on low heat, stirring now and then, until it thickens.', 45),
      S('Prueba y ajusta la sal. Mete las piezas de pollo al mole y déjalas hervir suavecito para que tomen sabor.', 'Taste and adjust the salt. Add the chicken pieces to the mole and let them simmer gently to soak up the flavor.', 15),
      S('Sirve caliente con ajonjolí por encima, arroz y tortillas. ¡Buen provecho, mijo!', 'Serve hot with sesame seeds on top, rice and tortillas. Enjoy, mijo!', 3),
    ],
  },
  {
    id: 'pozole', icono: 'pozole', insignia: 'dia-festivo',
    nombre: { es: 'Pozole rojo', en: 'Red pozole' },
    resumen: { es: 'El caldo de fiesta de Granma, con maíz, chile guajillo y todo su acompañamiento.', en: 'Granma\'s party stew, with hominy, guajillo chili and all the toppings.' },
    porciones: 8, tiempoPrep: 30, tiempoCoccion: 150, nivel: { es: 'Fácil, pero lleva tiempo', en: 'Easy, but takes time' },
    nota: { es: 'Con maíz cacahuazintle precocido de bote se ahorra mucho tiempo. Cuidado al licuar líquidos calientes.', en: 'Canned pre-cooked hominy saves lots of time. Be careful when blending hot liquids.' },
    ingredientes: [
      I(1, 'kg', 'espaldilla de cerdo en trozos', 'pork shoulder, in chunks'), I(3, 'L', 'agua', 'water'), I(0.5, 'pza', 'cebolla', 'onion'), I(4, 'dientes', 'ajo', 'garlic cloves'), I(2, 'cdta', 'sal, o al gusto', 'salt, or to taste'),
      I(800, 'g', 'maíz cacahuazintle precocido, escurrido', 'pre-cooked hominy, drained'), I(6, 'pza', 'chiles guajillo, sin semillas', 'guajillo chilies, seeds removed'), I(2, 'pza', 'chiles ancho, sin semillas', 'ancho chilies, seeds removed'),
      I(1, 'cda', 'orégano seco', 'dried oregano'), I(2, 'tazas', 'lechuga o col, finamente picada', 'lettuce or cabbage, finely chopped'), I(6, 'pza', 'rábanos en rodajas', 'radishes, sliced'),
      I(0.5, 'pza', 'cebolla picada, para servir', 'chopped onion, to serve'), I(4, 'pza', 'limones, en gajos', 'limes, in wedges'), I(8, 'pza', 'tostadas', 'tostadas'),
    ],
    pasos: [
      S('Pon la carne en una olla grande con el agua, la media cebolla, 2 dientes de ajo y 1 cucharadita de sal. Cuece a fuego medio quitando la espuma.', 'Put the pork in a large pot with the water, the half onion, 2 garlic cloves and 1 teaspoon of salt. Cook over medium heat, skimming off the foam.', 60),
      S('Mientras tanto, tuesta los chiles 15 segundos por lado y remójalos en agua caliente.', 'Meanwhile, toast the chilies 15 seconds per side and soak them in hot water.', 15),
      S('Licúa los chiles escurridos con 2 dientes de ajo, el orégano y 1 taza de caldo. Cuela la salsa.', 'Blend the drained chilies with 2 garlic cloves, the oregano and 1 cup of broth. Strain the sauce.', 5),
      S('Agrega la salsa y el maíz a la olla. Cuece a fuego bajo hasta que la carne esté suave y el maíz haya florecido.', 'Add the sauce and hominy to the pot. Simmer on low heat until the pork is tender and the hominy has bloomed.', 60),
      S('Prueba y ajusta la sal. Deja reposar 10 minutos con la olla tapada.', 'Taste and adjust the salt. Let it rest for 10 minutes with the lid on.', 10),
      S('Sirve en tazones y pon en la mesa lechuga, rábano, cebolla, limón, orégano y tostadas. ¡Cada quien arma su pozole!', 'Serve in bowls and put lettuce, radish, onion, lime, oregano and tostadas on the table. Everyone builds their own pozole!', 5),
    ],
  },
  {
    id: 'champurrado', icono: 'champurrado', insignia: null,
    nombre: { es: 'Champurrado de chocolate', en: 'Chocolate champurrado' },
    resumen: { es: 'La bebida espesa y calientita de las mañanas en el rancho.', en: 'The thick, warm drink of the mornings on the ranch.' },
    porciones: 6, tiempoPrep: 5, tiempoCoccion: 25, nivel: { es: 'Muy fácil', en: 'Very easy' },
    nota: { es: 'Muévelo sin parar para que no se haga grumos. Sírvelo cuando ya no queme.', en: 'Stir constantly so it does not get lumpy. Serve it once it is no longer scalding.' },
    ingredientes: [
      I(1, 'L', 'agua', 'water'), I(1, 'L', 'leche', 'milk'), I(60, 'g', 'masa harina de maíz (½ taza)', 'corn masa flour (½ cup)'), I(90, 'g', 'chocolate de mesa (1 tableta)', 'Mexican table chocolate (1 tablet)'),
      I(100, 'g', 'piloncillo, o al gusto', 'piloncillo, or to taste'), I(1, 'pza', 'raja de canela (5 cm)', 'cinnamon stick (5 cm)'), I(1, 'pizca', 'sal', 'salt'),
    ],
    pasos: [
      S('En una olla, calienta el agua con la canela, el piloncillo y el chocolate, moviendo hasta que todo se disuelva.', 'In a pot, heat the water with the cinnamon, piloncillo and chocolate, stirring until everything dissolves.', 8),
      S('Disuelve la masa harina en la leche fría con ayuda de un batidor, sin grumos.', 'Dissolve the masa flour in the cold milk with a whisk until smooth.', 3),
      S('Vierte la mezcla de leche en la olla colándola, y agrega la pizca de sal.', 'Pour the milk mixture into the pot through a strainer and add the pinch of salt.', 2),
      S('Cuece a fuego bajo moviendo siempre, hasta que espese y cubra la cuchara.', 'Cook on low heat, stirring all the time, until it thickens and coats the spoon.', 12),
      S('Retira la canela y bátelo con un molinillo hasta que haga espuma. Sirve caliente en tazas.', 'Remove the cinnamon and froth it with a molinillo until foamy. Serve hot in cups.', 3),
    ],
  },
  {
    id: 'bunuelos', icono: 'bunuelos', insignia: null,
    nombre: { es: 'Buñuelos con miel de piloncillo', en: 'Buñuelos with piloncillo syrup' },
    resumen: { es: 'Crujientes, delgaditos y dulces: la Navidad de la niñez de Granma.', en: 'Crispy, thin and sweet: the Christmas of Granma\'s childhood.' },
    porciones: 12, tiempoPrep: 60, tiempoCoccion: 40, nivel: { es: 'Con ayuda de un adulto', en: 'With an adult\'s help' },
    nota: { es: 'El aceite caliente salpica: la fritura es trabajo de un adulto. Los niños pueden amasar y bañar con la miel.', en: 'Hot oil splatters: frying is an adult\'s job. Kids can knead and add the syrup.' },
    ingredientes: [
      I(500, 'g', 'harina de trigo', 'all-purpose flour'), I(1, 'cdta', 'polvo para hornear', 'baking powder'), I(0.5, 'cdta', 'sal', 'salt'), I(2, 'cda', 'azúcar', 'sugar'), I(2, 'pza', 'huevos', 'eggs'),
      I(60, 'g', 'mantequilla derretida', 'melted butter'), I(200, 'ml', 'agua tibia con anís', 'warm water with aniseed'), I(500, 'ml', 'aceite para freír', 'oil for frying'),
      I(300, 'g', 'piloncillo (2 conos pequeños)', 'piloncillo (2 small cones)'), I(500, 'ml', 'agua para la miel', 'water for the syrup'), I(1, 'pza', 'raja de canela', 'cinnamon stick'),
    ],
    pasos: [
      S('Mezcla la harina, el polvo para hornear, la sal y el azúcar. Haz un hueco en el centro.', 'Mix the flour, baking powder, salt and sugar. Make a well in the center.', 3),
      S('Agrega los huevos, la mantequilla y el agua de anís poco a poco. Amasa hasta que la masa quede suave y no se pegue.', 'Add the eggs, butter and aniseed water little by little. Knead until the dough is smooth and not sticky.', 10),
      S('Tapa la masa con un trapo húmedo y déjala reposar.', 'Cover the dough with a damp cloth and let it rest.', 30),
      S('Mientras tanto, hierve el agua con el piloncillo y la canela hasta que se haga una miel ligera.', 'Meanwhile, boil the water with the piloncillo and cinnamon until it becomes a light syrup.', 20),
      S('Divide la masa en 12 bolitas y estíralas muy delgadas (del tamaño de un plato chico).', 'Divide the dough into 12 balls and roll them out very thin (the size of a small plate).', 15),
      S('(Con un adulto) Fríe cada buñuelo en aceite caliente 1 minuto por lado, hasta que esté dorado. Escurre en papel absorbente.', '(With an adult) Fry each buñuelo in hot oil 1 minute per side until golden. Drain on paper towels.', 12),
      S('Báñalos con la miel tibia y sirve de inmediato.', 'Drizzle with the warm syrup and serve right away.', 2),
    ],
  },
  // Ponche navideño (capítulo 6; agregado con la skill contenido-granma)
  {
    "id": "ponche",
    "icono": "ponche",
    "insignia": null,
    "nombre": {
      "es": "Ponche navideño",
      "en": "Christmas fruit punch"
    },
    "resumen": {
      "es": "La bebida calientita de frutas y canela de las posadas.",
      "en": "The warm fruit and cinnamon drink of the posadas."
    },
    "nota": {
      "es": "La olla y el líquido hierven y queman: pide ayuda de un adulto para cortar la fruta y para servir. Déjalo entibiar antes de tomarlo.",
      "en": "The pot and the liquid are boiling hot: ask an adult to help cut the fruit and serve. Let it cool a little before drinking."
    },
    "nivel": {
      "es": "Fácil",
      "en": "Easy"
    },
    "porciones": 8,
    "tiempoPrep": 15,
    "tiempoCoccion": 45,
    "ingredientes": [
      {
        "cant": 2,
        "un": "L",
        "es": "agua",
        "en": "water"
      },
      {
        "cant": 4,
        "un": "pza",
        "es": "guayabas, en cuartos",
        "en": "guavas, in quarters"
      },
      {
        "cant": 2,
        "un": "pza",
        "es": "manzanas, en trozos",
        "en": "apples, in chunks"
      },
      {
        "cant": 8,
        "un": "pza",
        "es": "ciruelas pasas",
        "en": "prunes"
      },
      {
        "cant": 2,
        "un": "pza",
        "es": "rajas de canela (5 cm cada una)",
        "en": "cinnamon sticks (5 cm each)"
      },
      {
        "cant": 150,
        "un": "g",
        "es": "piloncillo",
        "en": "piloncillo"
      },
      {
        "cant": 2,
        "un": "pza",
        "es": "naranjas, en rebanadas",
        "en": "oranges, sliced"
      }
    ],
    "pasos": [
      {
        "es": "Con ayuda de un adulto, lava la fruta y córtala: las guayabas en cuartos, las manzanas en trozos y las naranjas en rebanadas.",
        "en": "With an adult's help, wash the fruit and cut it: guavas in quarters, apples in chunks and oranges in slices.",
        "min": 10
      },
      {
        "es": "En una olla grande, pon el agua con el piloncillo y la canela a fuego medio, moviendo hasta que el piloncillo se disuelva.",
        "en": "In a large pot, put the water with the piloncillo and cinnamon on medium heat, stirring until the piloncillo dissolves.",
        "min": 8
      },
      {
        "es": "Agrega la guayaba, la manzana, las ciruelas pasas y la naranja.",
        "en": "Add the guava, apple, prunes and orange.",
        "min": 2
      },
      {
        "es": "Baja el fuego y cuece tapado hasta que la fruta esté suave y el aroma llene la cocina.",
        "en": "Lower the heat and cook covered until the fruit is soft and the aroma fills the kitchen.",
        "min": 30
      },
      {
        "es": "Apaga el fuego y deja reposar para que se mezclen los sabores.",
        "en": "Turn off the heat and let it rest so the flavors blend.",
        "min": 5
      },
      {
        "es": "Un adulto sirve el ponche caliente en tazas, con un poco de fruta en cada una.",
        "en": "An adult serves the hot punch in cups, with some fruit in each one.",
        "min": 5
      }
    ]
  },
];
recetas.push(...JSON.parse(readFileSync(new URL('./recetas-fiestas.json', import.meta.url), 'utf8')));
