/* Iron Build - meal ideas. Macros are ESTIMATES (+/- 10-15%); brands, cuts and portions vary. */
(function (root) {
  var MEALS = [
    { id: 'b-burrito', cat: 'breakfast', name: 'Egg, Cheese & Bean Breakfast Burrito', time: '10 min', kcal: 600, p: 35, c: 47, f: 29,
      ing: ['3 large eggs', '1 oz shredded cheddar', '1 large (10-inch) flour tortilla', '1/4 cup canned black beans, drained', '2 tbsp salsa', 'Pinch of salt and pepper'],
      steps: ['Scramble the eggs in a nonstick pan over medium heat until just set.', 'Warm the beans and tortilla for 20 seconds in the microwave.', 'Fill the tortilla with eggs, beans, cheese and salsa. Roll tightly.'] },
    { id: 'b-yogurt', cat: 'breakfast', name: 'Greek Yogurt Power Bowl', time: '5 min', kcal: 645, p: 34, c: 89, f: 20,
      ing: ['1 cup 2% plain Greek yogurt', '1/2 cup granola', '1 medium banana, sliced', '1 tbsp honey', '1 tbsp peanut butter'],
      steps: ['Spoon the yogurt into a bowl.', 'Top with granola, banana, honey and a spoonful of peanut butter.'] },
    { id: 'b-oats', cat: 'breakfast', name: 'Peanut Butter Banana Protein Oats', time: '8 min', kcal: 690, p: 45, c: 85, f: 20,
      ing: ['1 cup dry rolled oats', '1 cup 2% milk', '1 scoop whey protein powder (optional: swap for 2 hard-boiled eggs on the side)', '1 tbsp peanut butter', '1/2 banana, sliced', 'Pinch of salt'],
      steps: ['Cook the oats in the milk for 3-4 minutes, stirring.', 'Take off the heat and stir in the protein powder with a splash of water so it does not clump.', 'Top with peanut butter and banana.'] },
    { id: 'b-omelet', cat: 'breakfast', name: 'Spinach & Feta Omelet with Toast', time: '10 min', kcal: 500, p: 32, c: 32, f: 27,
      ing: ['3 large eggs', '1/2 cup fresh spinach', '1/4 cup diced bell pepper', '1 oz feta', '1 tsp olive oil', '2 slices whole wheat toast'],
      steps: ['Sauté the pepper and spinach in the oil for 2 minutes.', 'Pour in the beaten eggs, add feta, and fold when set.', 'Serve with the toast.'] },

    { id: 'l-chickenbowl', cat: 'lunch', name: 'Chicken Burrito Bowl', time: '15 min', kcal: 640, p: 56, c: 69, f: 13,
      ing: ['5 oz cooked chicken breast, sliced', '1 cup cooked rice', '1/2 cup canned black beans, drained', '1/4 avocado', 'Salsa, lettuce, lime'],
      steps: ['Layer the rice and beans in a bowl.', 'Top with chicken, avocado, salsa and lettuce. Squeeze lime over it.', 'Tip: cook chicken and rice in bulk on Sunday for the week.'] },
    { id: 'l-tuna', cat: 'lunch', name: 'Tuna Melt with Apple', time: '10 min', kcal: 550, p: 39, c: 54, f: 19,
      ing: ['1 can (5 oz) tuna, drained', '1 tbsp mayonnaise', '2 slices whole wheat bread', '1 slice cheddar or Swiss', '1 medium apple'],
      steps: ['Mix the tuna with mayonnaise.', 'Spread on one slice of bread, top with cheese and the second slice.', 'Toast in a pan or toaster oven until the cheese melts. Serve with the apple.'] },
    { id: 'l-wrap', cat: 'lunch', name: 'Turkey & Hummus Wrap with Almonds', time: '8 min', kcal: 675, p: 38, c: 78, f: 26,
      ing: ['4 oz deli turkey', '1 large (10-inch) flour tortilla', '3 tbsp hummus', 'Handful of spinach', '1 banana', '1 oz almonds'],
      steps: ['Spread the hummus over the tortilla and add turkey and spinach.', 'Roll it up and slice in half.', 'Eat with the banana and almonds on the side.'] },
    { id: 'l-steakbowl', cat: 'lunch', name: 'Beef & Veggie Rice Bowl', time: '20 min', kcal: 535, p: 35, c: 60, f: 17,
      ing: ['4 oz cooked flank steak, sliced thin', '1 cup cooked rice', '1.5 cups stir-fry vegetables (fresh or frozen)', '1 tbsp low-sodium soy sauce', '1 tsp oil'],
      steps: ['Stir-fry the vegetables in the oil for 4-5 minutes.', 'Add the steak and soy sauce and heat through.', 'Serve over the rice.'] },

    { id: 'd-salmon', cat: 'dinner', name: 'Baked Salmon, Rice & Broccoli', time: '25 min', kcal: 645, p: 45, c: 55, f: 27,
      ing: ['6 oz salmon fillet', '1 cup cooked rice', '1.5 cups broccoli florets', '1 tsp olive oil', 'Lemon, salt, pepper, garlic powder'],
      steps: ['Heat the oven to 400 F (200 C).', 'Place the salmon and broccoli on a sheet pan. Drizzle with oil and season.', 'Bake 12-15 minutes until the salmon flakes. Serve over rice with lemon.'] },
    { id: 'd-pasta', cat: 'dinner', name: 'Lean Beef Pasta with Marinara', time: '20 min', kcal: 620, p: 40, c: 73, f: 18,
      ing: ['5 oz (raw weight) 90% lean ground beef', '3 oz dry pasta', '1/2 cup marinara sauce', 'Garlic, Italian seasoning'],
      steps: ['Boil the pasta according to the package.', 'Brown the beef with garlic and seasoning, then stir in the marinara.', 'Toss with the pasta.'] },
    { id: 'd-thigh', cat: 'dinner', name: 'Sheet-Pan Chicken Thighs & Sweet Potato', time: '35 min', kcal: 505, p: 34, c: 35, f: 26,
      ing: ['5 oz cooked boneless skinless chicken thighs (about 6 oz raw)', '1 medium sweet potato, cubed', '1 cup green beans', '1 tbsp olive oil', 'Paprika, salt, pepper'],
      steps: ['Heat the oven to 425 F (220 C).', 'Toss everything with the oil and seasoning on a sheet pan.', 'Roast 25-30 minutes until the chicken reaches 165 F (74 C).', 'Add 1 cup cooked rice on the side for about 205 more calories.'] },
    { id: 'd-stirfry', cat: 'dinner', name: 'Chicken Fried-Rice Skillet', time: '20 min', kcal: 660, p: 55, c: 60, f: 19,
      ing: ['4 oz cooked chicken breast, diced', '1 cup cooked rice (cold works best)', '2 large eggs', '1 cup frozen peas and carrots', '1 tbsp low-sodium soy sauce', '1 tsp sesame oil'],
      steps: ['Scramble the eggs in the oil in a hot skillet and push to the side.', 'Add the vegetables, then the rice and chicken. Cook 4-5 minutes.', 'Stir in the soy sauce and mix everything together.'] },

    { id: 's-milk', cat: 'snacks', name: '2% Milk', time: '1 min', kcal: 122, p: 8, c: 12, f: 5,
      ing: ['1 cup 2% milk'], steps: ['Pour and drink. A quick add-on to hit calories and protein.'] },
    { id: 's-cottage', cat: 'snacks', name: 'Cottage Cheese & Pineapple', time: '2 min', kcal: 220, p: 28, c: 19, f: 5,
      ing: ['1 cup low-fat cottage cheese', '1/2 cup pineapple chunks'], steps: ['Top the cottage cheese with the pineapple.'] },
    { id: 's-shake', cat: 'snacks', name: 'Banana Peanut Butter Shake', time: '3 min', kcal: 440, p: 37, c: 45, f: 15,
      ing: ['1 scoop whey protein powder', '1 cup 2% milk', '1 banana', '1 tbsp peanut butter', 'Handful of ice'], steps: ['Blend everything until smooth. Good right after the gym.'] },
    { id: 's-toast', cat: 'snacks', name: 'Peanut Butter Banana Toast', time: '4 min', kcal: 455, p: 17, c: 61, f: 18,
      ing: ['2 slices whole wheat bread', '2 tbsp peanut butter', '1 banana, sliced'], steps: ['Toast the bread, spread with peanut butter and top with banana.'] },
    { id: 's-eggs', cat: 'snacks', name: 'Hard-Boiled Eggs & Fruit', time: '12 min', kcal: 240, p: 13, c: 26, f: 10,
      ing: ['2 hard-boiled eggs', '1 apple'], steps: ['Boil the eggs 10 minutes, cool in cold water, peel. Batch-cook a few at a time.'] }
  ];

  // One example day (about 2,500 calories, about 130-140 g protein). Totals are summed from the meals above.
  var SAMPLE_DAY = [
    ['Breakfast', 'b-burrito'], ['Lunch', 'l-wrap'], ['Snack', 's-toast'], ['Dinner', 'd-pasta'], ['Snack', 's-milk']
  ];

  var api = { MEALS: MEALS, SAMPLE_DAY: SAMPLE_DAY, DEFAULTS: { kcal: 2500, protein: 130 } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.IBFOOD = api;
})(typeof window !== 'undefined' ? window : globalThis);
