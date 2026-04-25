-- Seed: Test patient "Emma Clarke" with 14 days of meal history
-- Run this in the Supabase SQL Editor at: https://supabase.com/dashboard/project/arianwmnpzbhbcsmhpbi/sql
--
-- STEP 1: Run the block below to find your practitioner_id
-- SELECT id, email FROM auth.users LIMIT 5;
-- Then replace the placeholder below.

DO $$
DECLARE
  v_practitioner_id uuid;
  v_client_id uuid;
  v_base_date date := CURRENT_DATE - INTERVAL '1 day';
BEGIN

  -- Get the first practitioner in the system
  SELECT practitioner_id INTO v_practitioner_id FROM clients LIMIT 1;
  IF v_practitioner_id IS NULL THEN
    RAISE EXCEPTION 'No practitioner found. Create at least one client via the admin portal first.';
  END IF;

  -- Remove existing test client if re-running
  DELETE FROM clients WHERE name = 'Emma Clarke' AND pin = '1234';

  -- Create test client
  INSERT INTO clients (practitioner_id, name, pin, restrictions, targets, condition_tags)
  VALUES (
    v_practitioner_id,
    'Emma Clarke',
    '1234',
    '["vegetarian"]'::jsonb,
    '[
      {"nutrient":"iron","dailyTarget":18,"unit":"mg","priority":"critical"},
      {"nutrient":"vitaminB12","dailyTarget":2.4,"unit":"mcg","priority":"critical"},
      {"nutrient":"calories","dailyTarget":2000,"unit":"kcal","priority":"recommended"},
      {"nutrient":"protein","dailyTarget":50,"unit":"g","priority":"recommended"},
      {"nutrient":"carbs","dailyTarget":275,"unit":"g","priority":"recommended"},
      {"nutrient":"fat","dailyTarget":78,"unit":"g","priority":"recommended"},
      {"nutrient":"fiber","dailyTarget":28,"unit":"g","priority":"recommended"},
      {"nutrient":"calcium","dailyTarget":1000,"unit":"mg","priority":"recommended"},
      {"nutrient":"zinc","dailyTarget":8,"unit":"mg","priority":"recommended"},
      {"nutrient":"vitaminC","dailyTarget":75,"unit":"mg","priority":"recommended"}
    ]'::jsonb,
    '["Iron Deficiency Anaemia","Mental Health"]'::jsonb
  )
  RETURNING id INTO v_client_id;

  RAISE NOTICE 'Created client: % (%)', 'Emma Clarke', v_client_id;

  -- ----------------------------------------------------------------
  -- 14 days of meal logs  (3 alternating day patterns)
  -- ----------------------------------------------------------------

  FOR i IN 1..14 LOOP

    -- BREAKFAST (all days)
    INSERT INTO meal_logs (client_id, date, meal_type, items, updated_at)
    VALUES (
      v_client_id,
      v_base_date - ((i - 1) * INTERVAL '1 day'),
      'breakfast',
      CASE (i % 3)
        WHEN 0 THEN '[
          {"portionGrams":80,"food":{"id":"rolled-oats","name":"Rolled Oats (cooked)","category":"Grains","mealCategory":"carbs","tags":["vegetarian","vegan","dairyFree","nutFree"],"highlightedNutrients":["fiber","carbs"],"nutrients":{"calories":71,"protein":2.5,"carbs":12,"fat":1.4,"fiber":1.7,"iron":0.5,"calcium":10,"zinc":0.6,"vitaminC":0,"vitaminB12":0}}},
          {"portionGrams":150,"food":{"id":"greek-yogurt","name":"Greek Yoghurt (plain)","category":"Dairy","mealCategory":"protein","tags":["vegetarian","glutenFree","nutFree"],"highlightedNutrients":["protein","calcium","vitaminB12"],"nutrients":{"calories":97,"protein":9,"carbs":3.6,"fat":5,"fiber":0,"iron":0.1,"calcium":110,"zinc":0.5,"vitaminC":0,"vitaminB12":1.1}}},
          {"portionGrams":100,"food":{"id":"mixed-berries","name":"Mixed Berries","category":"Fruit","mealCategory":"fibre","tags":["vegetarian","vegan","dairyFree","glutenFree","nutFree"],"highlightedNutrients":["vitaminC","fiber"],"nutrients":{"calories":45,"protein":0.7,"carbs":10,"fat":0.3,"fiber":2.4,"iron":0.4,"calcium":14,"zinc":0.1,"vitaminC":18,"vitaminB12":0}}}
        ]'::jsonb
        WHEN 1 THEN '[
          {"portionGrams":110,"food":{"id":"eggs-whole","name":"Free-Range Eggs","category":"Eggs","mealCategory":"protein","tags":["vegetarian","glutenFree","dairyFree","nutFree"],"highlightedNutrients":["protein","vitaminB12","iron"],"nutrients":{"calories":155,"protein":13,"carbs":1.1,"fat":11,"fiber":0,"iron":1.8,"calcium":50,"zinc":1.3,"vitaminC":0,"vitaminB12":1.1}}},
          {"portionGrams":80,"food":{"id":"avocado","name":"Avocado","category":"Fruit/Fat","mealCategory":"fat","tags":["vegetarian","vegan","dairyFree","glutenFree","nutFree"],"highlightedNutrients":["fat","fiber","vitaminC"],"nutrients":{"calories":160,"protein":2,"carbs":9,"fat":15,"fiber":7,"iron":0.6,"calcium":12,"zinc":0.6,"vitaminC":10,"vitaminB12":0}}},
          {"portionGrams":60,"food":{"id":"sourdough-bread","name":"Sourdough Bread","category":"Grains","mealCategory":"carbs","tags":["vegetarian","vegan","dairyFree","nutFree"],"highlightedNutrients":["carbs","iron"],"nutrients":{"calories":274,"protein":9,"carbs":51,"fat":2,"fiber":2.4,"iron":2.5,"calcium":20,"zinc":0.8,"vitaminC":0,"vitaminB12":0}}}
        ]'::jsonb
        ELSE '[
          {"portionGrams":60,"food":{"id":"rolled-oats","name":"Rolled Oats (cooked)","category":"Grains","mealCategory":"carbs","tags":["vegetarian","vegan","dairyFree","nutFree"],"highlightedNutrients":["fiber","carbs"],"nutrients":{"calories":71,"protein":2.5,"carbs":12,"fat":1.4,"fiber":1.7,"iron":0.5,"calcium":10,"zinc":0.6,"vitaminC":0,"vitaminB12":0}}},
          {"portionGrams":20,"food":{"id":"chia-seeds","name":"Chia Seeds","category":"Seeds","mealCategory":"fat","tags":["vegetarian","vegan","dairyFree","glutenFree","nutFree"],"highlightedNutrients":["iron","calcium","fiber"],"nutrients":{"calories":486,"protein":17,"carbs":42,"fat":31,"fiber":34,"iron":7.7,"calcium":631,"zinc":4.6,"vitaminC":1.6,"vitaminB12":0}}}
        ]'::jsonb
      END,
      NOW()
    )
    ON CONFLICT (client_id, date, meal_type) DO UPDATE SET items = EXCLUDED.items, updated_at = NOW();

    -- LUNCH (all days)
    INSERT INTO meal_logs (client_id, date, meal_type, items, updated_at)
    VALUES (
      v_client_id,
      v_base_date - ((i - 1) * INTERVAL '1 day'),
      'lunch',
      CASE (i % 3)
        WHEN 0 THEN '[
          {"portionGrams":180,"food":{"id":"lentils-cooked","name":"Lentils (cooked)","category":"Legumes","mealCategory":"protein","tags":["vegetarian","vegan","dairyFree","glutenFree","nutFree"],"highlightedNutrients":["protein","iron","fiber"],"nutrients":{"calories":116,"protein":9,"carbs":20,"fat":0.4,"fiber":7.9,"iron":3.3,"calcium":19,"zinc":1.3,"vitaminC":1.5,"vitaminB12":0}}},
          {"portionGrams":80,"food":{"id":"spinach-raw","name":"Baby Spinach","category":"Vegetables","mealCategory":"fibre","tags":["vegetarian","vegan","dairyFree","glutenFree","nutFree"],"highlightedNutrients":["iron","calcium","vitaminC"],"nutrients":{"calories":23,"protein":2.9,"carbs":1.4,"fat":0.4,"fiber":2.2,"iron":2.7,"calcium":99,"zinc":0.5,"vitaminC":28,"vitaminB12":0}}},
          {"portionGrams":80,"food":{"id":"sourdough-bread","name":"Sourdough Bread","category":"Grains","mealCategory":"carbs","tags":["vegetarian","vegan","dairyFree","nutFree"],"highlightedNutrients":["carbs","iron"],"nutrients":{"calories":274,"protein":9,"carbs":51,"fat":2,"fiber":2.4,"iron":2.5,"calcium":20,"zinc":0.8,"vitaminC":0,"vitaminB12":0}}}
        ]'::jsonb
        WHEN 1 THEN '[
          {"portionGrams":160,"food":{"id":"chickpeas-cooked","name":"Chickpeas (cooked)","category":"Legumes","mealCategory":"protein","tags":["vegetarian","vegan","dairyFree","glutenFree","nutFree"],"highlightedNutrients":["protein","iron","fiber"],"nutrients":{"calories":164,"protein":9,"carbs":27,"fat":2.6,"fiber":7.6,"iron":2.9,"calcium":49,"zinc":1.5,"vitaminC":1.3,"vitaminB12":0}}},
          {"portionGrams":120,"food":{"id":"quinoa-cooked","name":"Quinoa (cooked)","category":"Grains","mealCategory":"carbs","tags":["vegetarian","vegan","dairyFree","glutenFree","nutFree"],"highlightedNutrients":["protein","iron","carbs"],"nutrients":{"calories":120,"protein":4.4,"carbs":21,"fat":1.9,"fiber":2.8,"iron":1.5,"calcium":17,"zinc":1.1,"vitaminC":0,"vitaminB12":0}}},
          {"portionGrams":80,"food":{"id":"kale-raw","name":"Kale","category":"Vegetables","mealCategory":"fibre","tags":["vegetarian","vegan","dairyFree","glutenFree","nutFree"],"highlightedNutrients":["vitaminC","calcium","iron"],"nutrients":{"calories":49,"protein":4.3,"carbs":8.8,"fat":0.9,"fiber":3.6,"iron":1.5,"calcium":150,"zinc":0.4,"vitaminC":120,"vitaminB12":0}}}
        ]'::jsonb
        ELSE '[
          {"portionGrams":165,"food":{"id":"eggs-whole","name":"Free-Range Eggs","category":"Eggs","mealCategory":"protein","tags":["vegetarian","glutenFree","dairyFree","nutFree"],"highlightedNutrients":["protein","vitaminB12","iron"],"nutrients":{"calories":155,"protein":13,"carbs":1.1,"fat":11,"fiber":0,"iron":1.8,"calcium":50,"zinc":1.3,"vitaminC":0,"vitaminB12":1.1}}},
          {"portionGrams":80,"food":{"id":"spinach-raw","name":"Baby Spinach","category":"Vegetables","mealCategory":"fibre","tags":["vegetarian","vegan","dairyFree","glutenFree","nutFree"],"highlightedNutrients":["iron","calcium","vitaminC"],"nutrients":{"calories":23,"protein":2.9,"carbs":1.4,"fat":0.4,"fiber":2.2,"iron":2.7,"calcium":99,"zinc":0.5,"vitaminC":28,"vitaminB12":0}}},
          {"portionGrams":100,"food":{"id":"bell-pepper-red","name":"Red Bell Pepper","category":"Vegetables","mealCategory":"fibre","tags":["vegetarian","vegan","dairyFree","glutenFree","nutFree"],"highlightedNutrients":["vitaminC","fiber"],"nutrients":{"calories":31,"protein":1,"carbs":6,"fat":0.3,"fiber":2.1,"iron":0.4,"calcium":7,"zinc":0.3,"vitaminC":128,"vitaminB12":0}}}
        ]'::jsonb
      END,
      NOW()
    )
    ON CONFLICT (client_id, date, meal_type) DO UPDATE SET items = EXCLUDED.items, updated_at = NOW();

    -- DINNER (all days)
    INSERT INTO meal_logs (client_id, date, meal_type, items, updated_at)
    VALUES (
      v_client_id,
      v_base_date - ((i - 1) * INTERVAL '1 day'),
      'dinner',
      CASE (i % 3)
        WHEN 0 THEN '[
          {"portionGrams":180,"food":{"id":"tofu-firm","name":"Firm Tofu","category":"Plant Protein","mealCategory":"protein","tags":["vegetarian","vegan","dairyFree","glutenFree","nutFree"],"highlightedNutrients":["protein","calcium","iron"],"nutrients":{"calories":76,"protein":8,"carbs":1.9,"fat":4.2,"fiber":0.3,"iron":1.6,"calcium":350,"zinc":0.8,"vitaminC":0.1,"vitaminB12":0}}},
          {"portionGrams":150,"food":{"id":"broccoli","name":"Broccoli","category":"Vegetables","mealCategory":"fibre","tags":["vegetarian","vegan","dairyFree","glutenFree","nutFree"],"highlightedNutrients":["vitaminC","fiber","calcium"],"nutrients":{"calories":34,"protein":2.8,"carbs":6.6,"fat":0.4,"fiber":2.6,"iron":0.7,"calcium":47,"zinc":0.4,"vitaminC":89,"vitaminB12":0}}},
          {"portionGrams":150,"food":{"id":"brown-rice-cooked","name":"Brown Rice (cooked)","category":"Grains","mealCategory":"carbs","tags":["vegetarian","vegan","dairyFree","glutenFree","nutFree"],"highlightedNutrients":["carbs","fiber"],"nutrients":{"calories":123,"protein":2.7,"carbs":26,"fat":1,"fiber":1.8,"iron":0.5,"calcium":10,"zinc":0.6,"vitaminC":0,"vitaminB12":0}}}
        ]'::jsonb
        WHEN 1 THEN '[
          {"portionGrams":200,"food":{"id":"lentils-cooked","name":"Lentils (cooked)","category":"Legumes","mealCategory":"protein","tags":["vegetarian","vegan","dairyFree","glutenFree","nutFree"],"highlightedNutrients":["protein","iron","fiber"],"nutrients":{"calories":116,"protein":9,"carbs":20,"fat":0.4,"fiber":7.9,"iron":3.3,"calcium":19,"zinc":1.3,"vitaminC":1.5,"vitaminB12":0}}},
          {"portionGrams":150,"food":{"id":"tomato","name":"Tomato","category":"Vegetables","mealCategory":"fibre","tags":["vegetarian","vegan","dairyFree","glutenFree","nutFree"],"highlightedNutrients":["vitaminC","fiber"],"nutrients":{"calories":18,"protein":0.9,"carbs":3.9,"fat":0.2,"fiber":1.2,"iron":0.3,"calcium":10,"zinc":0.2,"vitaminC":14,"vitaminB12":0}}},
          {"portionGrams":180,"food":{"id":"brown-rice-cooked","name":"Brown Rice (cooked)","category":"Grains","mealCategory":"carbs","tags":["vegetarian","vegan","dairyFree","glutenFree","nutFree"],"highlightedNutrients":["carbs","fiber"],"nutrients":{"calories":123,"protein":2.7,"carbs":26,"fat":1,"fiber":1.8,"iron":0.5,"calcium":10,"zinc":0.6,"vitaminC":0,"vitaminB12":0}}}
        ]'::jsonb
        ELSE '[
          {"portionGrams":180,"food":{"id":"chickpeas-cooked","name":"Chickpeas (cooked)","category":"Legumes","mealCategory":"protein","tags":["vegetarian","vegan","dairyFree","glutenFree","nutFree"],"highlightedNutrients":["protein","iron","fiber"],"nutrients":{"calories":164,"protein":9,"carbs":27,"fat":2.6,"fiber":7.6,"iron":2.9,"calcium":49,"zinc":1.5,"vitaminC":1.3,"vitaminB12":0}}},
          {"portionGrams":180,"food":{"id":"sweet-potato-baked","name":"Sweet Potato (baked)","category":"Vegetables","mealCategory":"carbs","tags":["vegetarian","vegan","dairyFree","glutenFree","nutFree"],"highlightedNutrients":["carbs","fiber","vitaminC"],"nutrients":{"calories":90,"protein":2,"carbs":21,"fat":0.1,"fiber":3.3,"iron":0.7,"calcium":38,"zinc":0.4,"vitaminC":20,"vitaminB12":0}}},
          {"portionGrams":15,"food":{"id":"olive-oil","name":"Extra Virgin Olive Oil","category":"Oils","mealCategory":"fat","tags":["vegetarian","vegan","dairyFree","glutenFree","nutFree"],"highlightedNutrients":["fat"],"nutrients":{"calories":884,"protein":0,"carbs":0,"fat":100,"fiber":0,"iron":0.1,"calcium":1,"zinc":0,"vitaminC":0,"vitaminB12":0}}}
        ]'::jsonb
      END,
      NOW()
    )
    ON CONFLICT (client_id, date, meal_type) DO UPDATE SET items = EXCLUDED.items, updated_at = NOW();

    -- SNACK (only on some days)
    IF (i % 3) != 2 THEN
      INSERT INTO meal_logs (client_id, date, meal_type, items, updated_at)
      VALUES (
        v_client_id,
        v_base_date - ((i - 1) * INTERVAL '1 day'),
        'snack',
        CASE (i % 2)
          WHEN 0 THEN '[
            {"portionGrams":30,"food":{"id":"almonds","name":"Almonds","category":"Nuts","mealCategory":"fat","tags":["vegetarian","vegan","dairyFree","glutenFree"],"highlightedNutrients":["calcium","iron","protein"],"nutrients":{"calories":579,"protein":21,"carbs":22,"fat":50,"fiber":12.5,"iron":3.7,"calcium":264,"zinc":3.1,"vitaminC":0,"vitaminB12":0}}}
          ]'::jsonb
          ELSE '[
            {"portionGrams":150,"food":{"id":"greek-yogurt","name":"Greek Yoghurt (plain)","category":"Dairy","mealCategory":"protein","tags":["vegetarian","glutenFree","nutFree"],"highlightedNutrients":["protein","calcium","vitaminB12"],"nutrients":{"calories":97,"protein":9,"carbs":3.6,"fat":5,"fiber":0,"iron":0.1,"calcium":110,"zinc":0.5,"vitaminC":0,"vitaminB12":1.1}}},
            {"portionGrams":100,"food":{"id":"mixed-berries","name":"Mixed Berries","category":"Fruit","mealCategory":"fibre","tags":["vegetarian","vegan","dairyFree","glutenFree","nutFree"],"highlightedNutrients":["vitaminC","fiber"],"nutrients":{"calories":45,"protein":0.7,"carbs":10,"fat":0.3,"fiber":2.4,"iron":0.4,"calcium":14,"zinc":0.1,"vitaminC":18,"vitaminB12":0}}}
          ]'::jsonb
        END,
        NOW()
      )
      ON CONFLICT (client_id, date, meal_type) DO UPDATE SET items = EXCLUDED.items, updated_at = NOW();
    END IF;

  END LOOP;

  RAISE NOTICE 'Done! Test patient Emma Clarke (PIN: 1234) has 14 days of meal history.';
END $$;
