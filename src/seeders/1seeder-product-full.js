"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        // =====================================================
        // PRODUCT CATEGORIES
        // =====================================================
        await queryInterface.bulkInsert("productCategories", [
            {
                productCategories_id: 1,
                type: "Dog Food",
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                productCategories_id: 2,
                type: "Cat Food",
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                productCategories_id: 3,
                type: "Pet Accessories",
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                productCategories_id: 4,
                type: "Pet Toys",
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                productCategories_id: 5,
                type: "Hygiene & Care",
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
        ]);

        // =====================================================
        // PRODUCTS
        // =====================================================
        await queryInterface.bulkInsert("products", [
            {
                product_id: 1,
                productCategories_id: 1,
                name: "Puppy Care Nutritional Kibble",
                summary:
                    "Premium dry dog kibble rich in DHA and Calcium, supporting healthy bone development and cognitive growth for puppies under 12 months.",
                description: `PUPPY CARE NUTRITIONAL KIBBLE - PREMIUM DRY FOOD FOR PUPPIES

Puppy Care Nutritional Kibble is a premium dry dog food specially formulated to support the comprehensive growth and development of puppies. Enriched with DHA from natural fish oil for cognitive development and an optimal calcium-to-phosphorus ratio, it ensures puppies build strong bones and muscles during their golden growth phase.

KEY BENEFITS

• Provides high-quality protein from real chicken to support lean muscle growth.
• Rich in DHA to support brain development and sharp vision.
• Balanced Calcium and Phosphorus ratios promote strong bones and teeth.
• Enriched with antioxidants to strengthen the puppy's natural immune system.
• Small-sized kibbles are perfectly tailored for puppy jaws and help reduce plaque.
• Contains natural prebiotics and fibers to promote healthy digestion and absorption.

MAIN INGREDIENTS

• Dehydrated chicken protein, brown rice, whole grain corn.
• Natural fish oil (source of DHA).
• Essential vitamins (A, D3, E, B12) and minerals (calcium, zinc, iron).
• Probiotics and natural dietary fibers.

SUITABLE FOR

Puppies of all breeds from weaning up to 12 months of age.

FEEDING INSTRUCTIONS

Serve dry. Can be softened with warm water or puppy milk for easier chewing. Adjust daily portions based on the feeding guide, puppy's weight, and age.

STORAGE

Store in a cool, dry place away from direct sunlight. Seal the zip lock tightly after opening or store in an airtight container.`,
                slug: "puppy-care-nutritional-kibble",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 2,
                productCategories_id: 1,
                name: "Premium Beef Dog Pate",
                summary:
                    "Savory, protein-rich grain-free wet beef pate to support lean muscle maintenance and optimal hydration for dogs of all life stages.",
                description: `PREMIUM BEEF DOG PATE - PREMIUM WET FOOD FOR DOGS

Premium Beef Dog Pate is a high-quality wet food crafted with real beef, delivering rich, clean proteins to maintain lean muscle and support your dog's overall health. Its soft, smooth texture and irresistible aroma stimulate the appetite, making it perfect even for picky eaters.

KEY BENEFITS

• Formulated with real beef as the primary ingredient for premium protein.
• Supports muscle growth, recovery, and overall physical vitality.
• High moisture content helps support healthy hydration and kidney function.
• Grain-free recipe designed for easy digestion and sensitive stomachs.
• Enhances meal palatability and encourages finicky dogs to eat.
• Can be served as a standalone meal or mixed with dry kibble.

MAIN INGREDIENTS

• Fresh beef, poultry liver, beef broth.
• Essential vitamins and minerals.
• Fish oil rich in Omega-3 and Omega-6 fatty acids.

SUITABLE FOR

Dogs of all breeds and life stages, from puppies to seniors.

FEEDING INSTRUCTIONS

Serve directly or mix with dry food. Adjust portion sizes according to your pet's weight, age, and activity level.

STORAGE

Store in a cool, dry place. Once opened, keep refrigerated and consume within 48 hours.`,
                slug: "premium-beef-dog-pate",
                has_variants: false,
                original_price: 35000,
                discount: 10,
                discount_type: "percent",
                price: 31500,
                quantity: 120,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 3,
                productCategories_id: 1,
                name: "Dental Bone Chew",
                summary:
                    "Nutritious dental chew that cleans teeth, reduces plaque and tartar, and freshens breath with a cool mint flavor.",
                description: `DENTAL BONE CHEW - DAILY ORAL CARE SNACK FOR DOGS

Dental Bone Chew is the ideal solution for your dog's daily oral hygiene. Featuring a unique textured design, it mechanically scrapes away plaque and stubborn tartar as your dog chews, while leaving their breath fresh and preventing gum diseases.

KEY BENEFITS

• Specialized ridges and grooves help clean hard-to-reach teeth and gums.
• Reduces plaque buildup and helps prevent new tartar formation.
• Infused with natural mint and chlorophyll to neutralize mouth odors instantly.
• Satisfies your dog's natural chewing instincts and helps relieve stress.
• Helps curb destructive chewing behaviors around the home.
• Easily digestible formula, completely safe when swallowed.

MAIN INGREDIENTS

• Natural cereal flour, botanical starch.
• Mint extract and chlorophyll.
• Essential vitamins for oral health.
• Calcium carbonate to strengthen teeth.

SUITABLE FOR

Dogs of all breeds over 3 months of age.

USAGE INSTRUCTIONS

Give directly as a daily treat. Always supervise your pet while chewing to prevent choking.

STORAGE

Store in a cool, dry place. Reseal the package tightly after opening.`,
                slug: "dental-bone-chew",
                has_variants: false,
                original_price: 45000,
                discount: 5000,
                discount_type: "fixed",
                price: 40000,
                quantity: 80,
                reserved_quantity: 3,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 4,
                productCategories_id: 1,
                name: "Chicken Dog Treats",
                summary:
                    "Soft, protein-rich baked chicken breast treats, low in fat and ideal for positive reinforcement training.",
                description: `CHICKEN DOG TREATS - OVEN-BAKED CHICKEN BREAST SNACKS FOR DOGS

Chicken Dog Treats are made from 100% real chicken breast, slowly baked to lock in natural flavors and nutrients. These soft-textured, highly palatable treats are easy to break into smaller pieces, making them perfect for training rewards or as a healthy snack.

KEY BENEFITS

• Crafted from real premium chicken breast, high in protein and low in fat.
• Highly motivating reward that improves focus during training sessions.
• Soft and chewy texture, easily breakable for dogs of all sizes.
• Provides a clean energy boost for active dogs.
• Free from artificial colors, flavors, and chemical preservatives.
• Helps maintain a healthy weight due to low fat content.

MAIN INGREDIENTS

• Real chicken breast.
• Vegetable glycerin (for moisture and softness).
• Natural mineral salts.

SUITABLE FOR

Dogs of all breeds and lifestages.

FEEDING INSTRUCTIONS

Use as a treat or reward during training. Treats should not exceed 10% of your dog's daily caloric intake.

STORAGE

Store in a cool, dry place. Keep the bag sealed to maintain freshness and prevent treats from hardening.`,
                slug: "chicken-dog-treats",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 5,
                productCategories_id: 2,
                name: "Adult Tuna Mix Cat Kibble",
                summary:
                    "Balanced dry food with tuna and salmon, enriched with Taurine and Omega-3 for heart, vision, and shiny coat health.",
                description: `ADULT TUNA MIX CAT KIBBLE - ADULT CAT DRY FOOD WITH TUNA & SALMON

Adult Tuna Mix Cat Kibble provides a complete and balanced daily diet tailored for adult cats. Combining delicious ocean tuna and salmon rich in Omega fatty acids, it nourishes the skin, reduces shedding, and supports heart and eye health from the inside out.

KEY BENEFITS

• Authentic tuna and salmon flavor that cats naturally crave.
• Omega-3 and Omega-6 fatty acids promote healthy skin and a glossy coat.
• Essential Taurine supports strong cardiac function and sharp night vision.
• Natural plant fibers help control and prevent hairball formation.
• Balanced urine pH helps support a healthy urinary tract.
• Crunchy texture helps clean teeth and control plaque buildup.

MAIN INGREDIENTS

• Tuna meal, fresh salmon, poultry meal.
• Brown rice, wheat, natural plant fiber.
• Taurine, Omega-3 & Omega-6, Vitamin A, E, D3.

SUITABLE FOR

Adult cats of all breeds from 12 months of age and older.

FEEDING INSTRUCTIONS

Serve dry. Always provide a bowl of clean, fresh water next to the food. Adjust portions according to your cat's weight.

STORAGE

Store in a cool, dry place, safe from insects. Close the bag tightly after each use.`,
                slug: "adult-tuna-mix-cat-kibble",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 6,
                productCategories_id: 2,
                name: "Salmon Delight Cat Pate",
                summary:
                    "Grain-free salmon wet pate high in moisture to support urinary health and coat quality in cats.",
                description: `SALMON DELIGHT CAT PATE - GOURMET WET CAT FOOD WITH SALMON

Salmon Delight Cat Pate is a premium wet cat food crafted from fresh salmon, providing optimal hydration and essential nutrients. Its smooth, delectable texture and rich aroma will satisfy even the most sophisticated feline appetites.

KEY BENEFITS

• High moisture content promotes healthy hydration and urinary tract health.
• Rich in Omega-3 fatty acids from fresh salmon for a silky, shiny coat.
• Smooth pate texture is easy to consume, ideal for cats of all ages.
• Enriched with Taurine for heart health and excellent eyesight.
• Grain-free formula helps prevent food allergies and digestive upsets.
• Can be mixed with dry kibbles to enhance food enjoyment.

MAIN INGREDIENTS

• Fresh salmon, chicken liver, fish broth.
• Essential vitamins and minerals.
• Cod liver oil.

SUITABLE FOR

Cats of all breeds and life stages, from kittens to seniors.

FEEDING INSTRUCTIONS

Serve directly or mix with dry food. Keep unused portions refrigerated and consume within 24 hours.

STORAGE

Store in a cool, dry place before opening. Serve at room temperature.`,
                slug: "salmon-delight-cat-pate",
                has_variants: false,
                original_price: 32000,
                discount: 0,
                discount_type: "percent",
                price: 32000,
                quantity: 150,
                reserved_quantity: 10,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 7,
                productCategories_id: 2,
                name: "Tuna Cat Snack",
                summary:
                    "Crunchy tuna treats packed with protein and Taurine, perfect for play and bonding with your cat.",
                description: `TUNA CAT SNACK - CRUNCHY TUNA SNACKS FOR CATS

Tuna Cat Snack offers a crispy, delicious reward that cats love. Made with select fresh tuna and fortified with nutrients, these small treats are perfect for bonding, encouraging active play, or rewarding good behaviors.

KEY BENEFITS

• Rich tuna flavor that stimulates the appetite of cats.
• Crispy texture helps clean teeth and reduce plaque through chewing.
• Fortified with Taurine for heart and neurological wellness.
• Low in calories, helping to maintain a healthy weight.
• Ideal for interactive play and positive reinforcement.
• Compact, convenient resealable bag for on-the-go treating.

MAIN INGREDIENTS

• Fresh tuna, premium wheat flour.
• Palm oil, egg yolk powder.
• Taurine, Vitamin E, minerals.

SUITABLE FOR

Cats from 4 months of age and older.

FEEDING INSTRUCTIONS

Feed as a healthy treat. It is recommended not to exceed 10 pieces per day to avoid spoiling their appetite for main meals.

STORAGE

Store in a cool, dry place away from moisture and direct sunlight. Reseal after opening.`,
                slug: "tuna-cat-snack",
                has_variants: false,
                original_price: 28000,
                discount: 5,
                discount_type: "percent",
                price: 26600,
                quantity: 100,
                reserved_quantity: 8,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 8,
                productCategories_id: 2,
                name: "Kitten Nutritional Milk",
                summary:
                    "Nutrient-dense milk powder replacer with colostrum, DHA, and probiotics for newborn and weaning kittens.",
                description: `KITTEN NUTRITIONAL MILK - NUTRITIVE MILK REPLACER FOR KITTENS

Kitten Nutritional Milk is a premium milk replacer scientifically formulated to mimic mother's natural milk. Rich in colostrum, DHA, and active probiotics, it provides vital energy to help newborn kittens build early immunity and develop a strong digestive system.

KEY BENEFITS

• Ideal nutritional solution for orphaned kittens or large litters.
• Contains Colostrum to support early immune system development.
• Enriched with DHA to promote cognitive and visual development.
• Added probiotics support gentle digestion and prevent stomach upsets.
• High Calcium and Phosphorus levels promote strong bone growth.
• Reduced lactose formula minimizes the risk of diarrhea.

MAIN INGREDIENTS

• Whole milk powder (lactose-reduced).
• Colostrum, fish oil (source of DHA).
• Essential vitamins (A, B1, B2, C, D3, E) and minerals.
• Active probiotics.

SUITABLE FOR

Newborn kittens up to 2 months of age, and pregnant or lactating mother cats.

USAGE INSTRUCTIONS

Mix 1 scoop of milk powder with 3 scoops of warm water (approx. 40°C). Stir until completely dissolved. Feed using a specialized pet nursing bottle while still warm.

STORAGE

Store in a cool, dry place. Keep the lid tightly closed after opening. Do not refrigerate the dry powder.`,
                slug: "kitten-nutritional-milk",
                has_variants: false,
                original_price: 95000,
                discount: 10000,
                discount_type: "fixed",
                price: 85000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 9,
                productCategories_id: 3,
                name: "Premium Leather Pet Collar",
                summary:
                    "Handcrafted top-grain leather collar with a soft padded microfiber lining and heavy-duty rustproof alloy hardware.",
                description: `PREMIUM LEATHER PET COLLAR - HANDCRAFTED COLLAR FOR DOGS & CATS

The Premium Leather Pet Collar blends classic elegance with modern durability. Made of 100% genuine top-grain leather, it features a padded microfiber inner lining to prevent friction, skin irritation, and hair loss around your pet's neck.

KEY BENEFITS

• Genuine leather construction, durable and develops a unique patina over time.
• Padded interior lining ensures maximum comfort for all-day wear.
• Heavy-duty, rustproof alloy buckle and D-ring ensure secure leash attachment.
• Elegant and classic design that elevates your pet's style.
• Multiple adjustment holes allow for a custom, comfortable fit.
• Easily pairs with any standard leash.

MATERIALS

• 100% genuine cowhide leather.
• Microfiber lining.
• Reinforced alloy hardware.

SUITABLE FOR

Dogs and cats of all sizes (available in adjustable S, M, and L sizes).

USAGE INSTRUCTIONS

Place the collar around your pet's neck. Adjust the buckle so that you can fit two fingers comfortably between the collar and your pet's neck.

STORAGE

Avoid prolonged contact with water. If dirty, wipe with a damp cloth and let it dry naturally.`,
                slug: "premium-leather-pet-collar",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 10,
                productCategories_id: 3,
                name: "Reflective Leash",
                summary:
                    "High-density nylon leash with dual-sided reflective stitching and a soft neoprene-padded handle for night walk safety.",
                description: `REFLECTIVE LEASH - HEAVY-DUTY SAFE LEASH FOR PETS

The Reflective Leash is your perfect companion for outdoor walks, especially at night. Woven with high-density climbing-grade nylon and dual-sided reflective stitching, it maximizes visibility under headlights to keep your pet safe.

KEY BENEFITS

• Dual-sided reflective stitching reflects streetlights for safe night walking.
• Made of premium nylon that resists tearing and stands up to strong pulls.
• Neoprene-padded handle protects hands from leash burns.
• 360-degree rotating metal clasp prevents tangling and twist issues.
• Standard length balances freedom of movement with security.

MATERIALS

• High-density nylon.
• Reflective thread.
• Neoprene padding.
• Rust-resistant alloy clasp.

SUITABLE FOR

Dogs and cats of all sizes during outdoor walks.

USAGE INSTRUCTIONS

Attach the metal clasp to the D-ring of your pet's collar or harness. Hold the padded handle firmly and enjoy your walk.

STORAGE

Hand wash with mild soap if dirty. Air dry completely before reuse.`,
                slug: "reflective-leash",
                has_variants: false,
                original_price: 89000,
                discount: 0,
                discount_type: "percent",
                price: 89000,
                quantity: 60,
                reserved_quantity: 4,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 11,
                productCategories_id: 3,
                name: "Winter Pet Jacket",
                summary:
                    "Windproof and water-resistant insulated pet coat with warm fleece lining and adjustable Velcro straps for winter comfort.",
                description: `WINTER PET JACKET - WARM WEATHERPROOF COAT FOR PETS

The Winter Pet Jacket keeps your pet warm and healthy during cold seasons. Featuring a windproof, water-resistant outer layer and a thick fleece lining, it insulates body heat and protects your pet from rain, wind, and chilly air.

KEY BENEFITS

• Soft fleece lining traps body heat and prevents shivering in cold weather.
• Water-resistant and windproof outer shell shields against light rain and mist.
• Adjustable Velcro straps around the neck and belly ensure a custom, snug fit.
• Built-in leash hole on the back allows for easy harness attachment.
• Sporty, modern design keeps your pet looking stylish.

MATERIALS

• Water-resistant Polyester outer shell.
• Thermal fleece lining.
• High-grip Velcro fasteners.

SUITABLE FOR

Dogs and cats (available in S, M, and L sizes for different breeds).

USAGE INSTRUCTIONS

Place the jacket on your pet's back, insert their front legs (if applicable), and secure the Velcro straps around the neck and chest.

STORAGE

Machine washable on gentle cycle (use a laundry bag) or hand wash. Air dry.`,
                slug: "winter-pet-jacket",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 12,
                productCategories_id: 3,
                name: "Non-Slip Stainless Steel Bowl",
                summary:
                    "Hygienic food-grade stainless steel bowl with a wide rubber base to prevent tipping, sliding, and floor scratches.",
                description: `NON-SLIP STAINLESS STEEL BOWL - HYGIENIC PET BOWL

The Non-Slip Stainless Steel Bowl offers a clean, stable dining experience for pets. Made of premium 304 food-grade stainless steel, it features a wide, bonded rubber base that prevents sliding, messy spills, and annoying clattering sounds.

KEY BENEFITS

• Premium 304 stainless steel is rust-resistant, hygienic, and safe.
• Wide rubber base stops the bowl from sliding or tipping over during meals.
• Smooth, polished interior is easy to clean and dishwasher-safe.
• Reduces feeding noise on tile or hardwood floors.
• Extremely durable, will not crack or harbor bacteria like plastic bowls.

MATERIALS

• 304 Stainless steel.
• Food-grade natural rubber base.

SUITABLE FOR

Dogs and cats of all breeds and sizes.

USAGE INSTRUCTIONS

Use for dry food, wet food, or water. Remove the rubber ring before putting the bowl in the dishwasher for longer lifespan.

STORAGE

Wash and dry after each use. Avoid abrasive steel wool pads when hand washing.`,
                slug: "non-slip-stainless-steel-bowl",
                has_variants: false,
                original_price: 65000,
                discount: 0,
                discount_type: "percent",
                price: 65000,
                quantity: 70,
                reserved_quantity: 6,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 13,
                productCategories_id: 4,
                name: "Bouncy Rubber Ball",
                summary:
                    "Heavy-duty natural rubber fetch ball with erratic bounce, water-resistant and built for enthusiastic chewers.",
                description: `BOUNCY RUBBER BALL - DURABLE PLAY BALL FOR DOGS

The Bouncy Rubber Ball is a classic play toy designed to keep your dog active and engaged. Made of 100% natural, non-toxic rubber, it features high elasticity and durably resists heavy chewing and biting during intense fetch games.

KEY BENEFITS

• Tough natural rubber resists heavy chewing and aggressive play.
• High bounce and unpredictable path stimulate your dog's reflexes.
• Textured surface gently massages gums and cleans teeth during play.
• Helps release excess energy and stops destructive chewing behaviors.
• Light, water-friendly design floats on water, great for pool play.

MATERIALS

• 100% Non-toxic natural rubber.
• Pet-safe organic colorants.

SUITABLE FOR

Dogs of all breeds and sizes.

USAGE INSTRUCTIONS

Use for fetch games or let your dog play independently. Regularly inspect the toy and replace it if signs of deep cracks appear.

STORAGE

Rinse with clean water after outdoor play and store in a cool place.`,
                slug: "bouncy-rubber-ball",
                has_variants: false,
                original_price: 29000,
                discount: 0,
                discount_type: "percent",
                price: 29000,
                quantity: 140,
                reserved_quantity: 9,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 14,
                productCategories_id: 4,
                name: "Plush Mouse Toy",
                summary:
                    "Soft plush mouse toy stuffed with organic catnip to stimulate hunting behavior and keep indoor cats active.",
                description: `PLUSH MOUSE TOY - ORGANIC CATNIP MOUSE TOY FOR CATS

The Plush Mouse Toy stimulates your cat's natural hunting instincts. Filled with premium organic catnip, it triggers playful energy, encourages physical activity, and helps indoor cats relieve stress.

KEY BENEFITS

• Filled with organic catnip to stimulate curiosity and playfulness.
• Mouse shape encourages chasing, swatting, and pouncing.
• Soft plush texture is gentle on feline teeth and claws.
• Perfect size for hugging, batting, and carrying around.
• Helps indoor cats get daily exercise and fight off boredom.

MATERIALS

• Soft velvet plush fabric.
• Organic catnip leaves.
• Polyester fiberfill.

SUITABLE FOR

Cats of all ages, especially indoor cats.

USAGE INSTRUCTIONS

Toss or wave the toy in front of your cat. Store the toy in a sealed bag when not in use to preserve the catnip aroma.

STORAGE

Do not wash in water as it will wash away the catnip scent. Wipe clean with a soft dry cloth.`,
                slug: "plush-mouse-toy",
                has_variants: false,
                original_price: 25000,
                discount: 0,
                discount_type: "percent",
                price: 25000,
                quantity: 130,
                reserved_quantity: 7,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 15,
                productCategories_id: 4,
                name: "Rope Tug Toy",
                summary:
                    "Tough 100% cotton rope chew toy that cleans teeth, massages gums, and supports interactive tug-of-war play.",
                description: `ROPE TUG TOY - COTTON TUG-OF-WAR CHEW TOY FOR DOGS

The Rope Tug Toy is perfect for interactive play sessions like tug-of-war and fetch. Woven with 100% natural cotton fibers, it serves as a natural flossing tool that cleans your dog's teeth and massages their gums while they play.

KEY BENEFITS

• Woven cotton rope stands up to strong tugging and chewing.
• Fibers act as a natural dental floss to remove plaque and clean teeth.
• Interactive play builds a strong bond between you and your dog.
• Promotes jaw strength and provides healthy physical exercise.
• 100% natural cotton is safe and chemical-free.

MATERIALS

• 100% Natural cotton fibers.

SUITABLE FOR

Medium to large dogs with strong chewing habits.

USAGE INSTRUCTIONS

Play tug-of-war, fetch, or let your dog chew on it. Wash regularly to clean off saliva and dirt.

STORAGE

Machine or hand wash with warm water and dry completely under the sun to prevent mold.`,
                slug: "rope-tug-toy",
                has_variants: false,
                original_price: 39000,
                discount: 5000,
                discount_type: "fixed",
                price: 34000,
                quantity: 90,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 16,
                productCategories_id: 4,
                name: "Feather Wand Cat Toy",
                summary:
                    "Interactive cat wand with colorful natural feathers, a bell, and a flexible rod to prompt jumping and chasing.",
                description: `FEATHER WAND CAT TOY - INTERACTIVE FEATHER WAND FOR CATS

The Feather Wand Cat Toy is a great way to interact with your feline friend. It features natural feathers and a small bell attached to a flexible plastic wand, mimicking the movements of real prey and encouraging your cat to jump and run.

KEY BENEFITS

• Natural feathers stimulate your cat's curiosity and hunting instincts.
• Soft bell chime attracts your cat's attention instantly.
• Flexible wand allows for smooth, lifelike movements.
• Encourages aerobic exercise, keeping your cat fit and agile.
• Promotes bonding and interaction between you and your cat.

MATERIALS

• Natural feathers (dyed with safe colorants).
• Flexible PVC rod.
• Steel bell.
• Nylon string.

SUITABLE FOR

Cats of all breeds and ages.

USAGE INSTRUCTIONS

Wave the wand gently to make the feathers flutter and attract your cat. Store out of your cat's reach after play to prevent them from chewing on the feathers.

STORAGE

Store in a dry, cool place to keep the feathers fluffy.`,
                slug: "feather-wand-cat-toy",
                has_variants: false,
                original_price: 42000,
                discount: 0,
                discount_type: "percent",
                price: 42000,
                quantity: 110,
                reserved_quantity: 6,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 17,
                productCategories_id: 5,
                name: "Bentonite Cat Litter",
                summary:
                    "Fast-clumping natural bentonite clay cat litter with outstanding odor control and low-dust formula.",
                description: `BENTONITE CAT LITTER - HIGH-CLUMPING ODOR CONTROL LITTER

Bentonite Cat Litter keeps your home fresh and clean. Made from 100% natural bentonite clay, it quickly locks liquids on contact to form firm clumps, neutralizing odors and preventing moisture spread.

KEY BENEFITS

• Rapid absorption forms hard, easy-to-scoop clumps.
• Superior odor lock neutralizes ammonia and urine smells instantly.
• Low-dust formula protects your cat's and your own respiratory system.
• Fine granules are soft on sensitive cat paws.
• Highly economical, minimizing litter waste.
• Safe, natural, and environmentally friendly.

MATERIALS

• 100% Natural bentonite clay.
• Deodorizing active carbon.

SUITABLE FOR

All cats trained to use a litter box.

USAGE INSTRUCTIONS

Fill a clean litter box with 5-7cm of litter. Scoop out solid waste and clumps daily. Replenish with fresh litter to maintain standard depth.

STORAGE

Store in a dry place. Do not flush bentonite litter down the toilet.`,
                slug: "bentonite-cat-litter",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 18,
                productCategories_id: 5,
                name: "Deodorizing Pet Shampoo",
                summary:
                    "Tear-free oatmeal and aloe shampoo that cleans deep, neutralizes odors, and leaves a soft, long-lasting scent.",
                description: `DEODORIZING PET SHAMPOO - SOOTHING OATMEAL SHAMPOO FOR PETS

Deodorizing Pet Shampoo provides a fresh, clean bathing experience. Made with natural colloidal oatmeal and aloe vera, it washes away dirt, neutralizes odors at the source, and leaves your pet's coat soft, healthy, and lightly scented.

KEY BENEFITS

• Neutralizes strong pet odors and leaves a fresh, long-lasting scent.
• Oatmeal and aloe vera moisturize dry skin and soothe itching.
• pH-balanced formula protects your pet's natural skin barrier.
• Tear-free formula prevents eye irritation during baths.
• Softens fur, making brushing easier and reducing tangles.
• Gentle enough for regular, routine baths.

MAIN INGREDIENTS

• Colloidal oatmeal, Aloe Vera gel.
• Sulfate-free gentle cleansers.
• Vitamin E, purified water.

SUITABLE FOR

Dogs and cats of all breeds and lifestages.

USAGE INSTRUCTIONS

Wet the coat with warm water. Apply shampoo, massage into a lather from head to tail (avoiding eyes and ears), and let sit for 3-5 minutes. Rinse thoroughly and blow-dry.

STORAGE

Store in a dry, cool place away from direct sunlight. Keep out of reach of children.`,
                slug: "deodorizing-pet-shampoo",
                has_variants: false,
                original_price: 115000,
                discount: 15000,
                discount_type: "fixed",
                price: 100000,
                quantity: 55,
                reserved_quantity: 2,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 19,
                productCategories_id: 5,
                name: "Pet Cleaning Wipes",
                summary:
                    "Alcohol-free, thick wet wipes with aloe and Vitamin E for quick cleaning of paws, face, and ears.",
                description: `PET CLEANING WIPES - CONVENIENT HYGIENE WIPES FOR PETS

Pet Cleaning Wipes provide quick, easy cleaning on the go. Woven from durable fabric and soaked in soothing aloe vera and Vitamin E, they clean paws, face, ears, and coats without the need for a full bath.

KEY BENEFITS

• Quickly cleans mud and dirt from paws after walks.
• Gently wipes away tear stains and wax buildup in ears.
• 100% alcohol-free, non-irritating, and safe if licked.
• Aloe vera and Vitamin E nourish sensitive skin and fur.
• Strong, textured wipes resist tearing during use.
• Resealable pop-up lid keeps wipes moist and fresh.

MAIN INGREDIENTS

• Spunlace non-woven fabric.
• RO purified water.
• Aloe vera extract, Vitamin E, safe pet antiseptic.

SUITABLE FOR

Dogs, cats, puppies, and kittens of all ages.

USAGE INSTRUCTIONS

Open the lid, pull out a wipe, and gently clean the desired areas. Close the lid tightly after use to prevent wipes from drying out.

STORAGE

Store in a cool, dry place. Do not flush wipes down the toilet.`,
                slug: "pet-cleaning-wipes",
                has_variants: false,
                original_price: 48000,
                discount: 0,
                discount_type: "percent",
                price: 48000,
                quantity: 95,
                reserved_quantity: 3,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 20,
                productCategories_id: 5,
                name: "Double-Sided Grooming Brush",
                summary:
                    "2-in-1 pet brush with metal pins for detangling mats and soft nylon bristles to remove loose hair.",
                description: `DOUBLE-SIDED GROOMING BRUSH - 2-IN-1 GROOMING TOOL FOR PETS

The Double-Sided Grooming Brush helps you groom your pet like a professional. The pin side detangles mats and stimulates blood flow, while the nylon bristle side sweeps away loose hair and spreads natural oils for a healthy, shiny coat.

KEY BENEFITS

• Dual-sided design covers detangling and finishing.
• Rounded steel pins detangle hair and massage skin safely.
• Soft nylon bristles capture loose fur and dander.
• Ergonomic rubber handle provides a comfortable, non-slip grip.
• Reduces shedding around the house with regular use.

MATERIALS

• ABS plastic frame.
• TPR rubber handle.
• Stainless steel pins with protective tips.
• High-quality nylon bristles.

SUITABLE FOR

Dogs and cats of all hair lengths.

USAGE INSTRUCTIONS

Use the pin side first to remove mats, tangles, and loose undercoat. Flip to the bristle side and brush in the direction of hair growth to smooth and shine.

STORAGE

Remove loose fur from the brush after each use. Store in a dry place.`,
                slug: "double-sided-grooming-brush",
                has_variants: false,
                original_price: 78000,
                discount: 10,
                discount_type: "percent",
                price: 70200,
                quantity: 65,
                reserved_quantity: 4,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
        ]);

        // =====================================================
        // PRODUCT VARIANTS
        // =====================================================
        await queryInterface.bulkInsert("productVariants", [
            // PRODUCT 1 - Puppy Care Nutritional Kibble
            {
                productVariant_id: 1,
                product_id: 1,
                sku: "PUPPY-500G-SMALL",
                variant_label: "500g / Small Breed",
                pet_weight: "1-5kg",
                color: null,
                size: "500g",
                original_price: 85000,
                discount: 5,
                discount_type: "percent",
                price: 80750,
                quantity: 40,
                reserved_quantity: 3,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 2,
                product_id: 1,
                sku: "PUPPY-2KG-MEDIUM",
                variant_label: "2kg / Medium Breed",
                pet_weight: "5-10kg",
                color: null,
                size: "2kg",
                original_price: 250000,
                discount: 10,
                discount_type: "percent",
                price: 225000,
                quantity: 25,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 3,
                product_id: 1,
                sku: "PUPPY-5KG-LARGE",
                variant_label: "5kg / Large Breed",
                pet_weight: "10-20kg",
                color: null,
                size: "5kg",
                original_price: 520000,
                discount: 50000,
                discount_type: "fixed",
                price: 470000,
                quantity: 12,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },

            // PRODUCT 4 - Chicken Dog Treats
            {
                productVariant_id: 4,
                product_id: 4,
                sku: "DOGTREAT-100G-MINI",
                variant_label: "100g / Mini Pack",
                pet_weight: "1-5kg",
                color: null,
                size: "100g",
                original_price: 30000,
                discount: 0,
                discount_type: "fixed",
                price: 30000,
                quantity: 70,
                reserved_quantity: 4,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 5,
                product_id: 4,
                sku: "DOGTREAT-300G-STANDARD",
                variant_label: "300g / Standard Pack",
                pet_weight: "5-10kg",
                color: null,
                size: "300g",
                original_price: 75000,
                discount: 5000,
                discount_type: "fixed",
                price: 70000,
                quantity: 45,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 6,
                product_id: 4,
                sku: "DOGTREAT-500G-FAMILY",
                variant_label: "500g / Family Pack",
                pet_weight: "10kg+",
                color: null,
                size: "500g",
                original_price: 115000,
                discount: 10000,
                discount_type: "fixed",
                price: 105000,
                quantity: 28,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },

            // PRODUCT 5 - Adult Tuna Mix Cat Kibble
            {
                productVariant_id: 7,
                product_id: 5,
                sku: "CATFOOD-400G-KITTEN",
                variant_label: "400g / Small Cat",
                pet_weight: "1-4kg",
                color: null,
                size: "400g",
                original_price: 79000,
                discount: 0,
                discount_type: "fixed",
                price: 79000,
                quantity: 50,
                reserved_quantity: 4,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 8,
                product_id: 5,
                sku: "CATFOOD-1P5KG-ADULT",
                variant_label: "1.5kg / Adult Cat",
                pet_weight: "4-8kg",
                color: null,
                size: "1.5kg",
                original_price: 210000,
                discount: 10,
                discount_type: "percent",
                price: 189000,
                quantity: 30,
                reserved_quantity: 3,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 9,
                product_id: 5,
                sku: "CATFOOD-5KG-FAMILY",
                variant_label: "5kg / Family Pack",
                pet_weight: "8kg+",
                color: null,
                size: "5kg",
                original_price: 590000,
                discount: 15,
                discount_type: "percent",
                price: 501500,
                quantity: 10,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },

            // PRODUCT 9 - Premium Leather Pet Collar
            {
                productVariant_id: 10,
                product_id: 9,
                sku: "COLLAR-RED-S",
                variant_label: "Red / Size S",
                pet_weight: null,
                color: "Red",
                size: "S",
                original_price: 69000,
                discount: 0,
                discount_type: "fixed",
                price: 69000,
                quantity: 20,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 11,
                product_id: 9,
                sku: "COLLAR-BLUE-S",
                variant_label: "Blue / Size S",
                pet_weight: null,
                color: "Blue",
                size: "S",
                original_price: 72000,
                discount: 3000,
                discount_type: "fixed",
                price: 69000,
                quantity: 18,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 12,
                product_id: 9,
                sku: "COLLAR-BLACK-S",
                variant_label: "Black / Size S",
                pet_weight: null,
                color: "Black",
                size: "S",
                original_price: 75000,
                discount: 0,
                discount_type: "fixed",
                price: 75000,
                quantity: 16,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 13,
                product_id: 9,
                sku: "COLLAR-RED-M",
                variant_label: "Red / Size M",
                pet_weight: null,
                color: "Red",
                size: "M",
                original_price: 79000,
                discount: 5000,
                discount_type: "fixed",
                price: 74000,
                quantity: 17,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 14,
                product_id: 9,
                sku: "COLLAR-BLUE-M",
                variant_label: "Blue / Size M",
                pet_weight: null,
                color: "Blue",
                size: "M",
                original_price: 81000,
                discount: 0,
                discount_type: "fixed",
                price: 81000,
                quantity: 18,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 15,
                product_id: 9,
                sku: "COLLAR-BLACK-M",
                variant_label: "Black / Size M",
                pet_weight: null,
                color: "Black",
                size: "M",
                original_price: 85000,
                discount: 5000,
                discount_type: "fixed",
                price: 80000,
                quantity: 15,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 16,
                product_id: 9,
                sku: "COLLAR-RED-L",
                variant_label: "Red / Size L",
                pet_weight: null,
                color: "Red",
                size: "L",
                original_price: 89000,
                discount: 0,
                discount_type: "fixed",
                price: 89000,
                quantity: 14,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 17,
                product_id: 9,
                sku: "COLLAR-BLUE-L",
                variant_label: "Blue / Size L",
                pet_weight: null,
                color: "Blue",
                size: "L",
                original_price: 92000,
                discount: 7000,
                discount_type: "fixed",
                price: 85000,
                quantity: 13,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 18,
                product_id: 9,
                sku: "COLLAR-BLACK-L",
                variant_label: "Black / Size L",
                pet_weight: null,
                color: "Black",
                size: "L",
                original_price: 95000,
                discount: 0,
                discount_type: "fixed",
                price: 95000,
                quantity: 12,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },

            // PRODUCT 11 - Winter Pet Jacket
            {
                productVariant_id: 19,
                product_id: 11,
                sku: "JACKET-YELLOW-S",
                variant_label: "Yellow / Size S",
                pet_weight: null,
                color: "Yellow",
                size: "S",
                original_price: 110000,
                discount: 5000,
                discount_type: "fixed",
                price: 105000,
                quantity: 20,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 20,
                product_id: 11,
                sku: "JACKET-PINK-S",
                variant_label: "Pink / Size S",
                pet_weight: null,
                color: "Pink",
                size: "S",
                original_price: 112000,
                discount: 2000,
                discount_type: "fixed",
                price: 110000,
                quantity: 18,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 21,
                product_id: 11,
                sku: "JACKET-BLUE-S",
                variant_label: "Blue / Size S",
                pet_weight: null,
                color: "Blue",
                size: "S",
                original_price: 115000,
                discount: 5000,
                discount_type: "fixed",
                price: 110000,
                quantity: 20,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 22,
                product_id: 11,
                sku: "JACKET-YELLOW-M",
                variant_label: "Yellow / Size M",
                pet_weight: null,
                color: "Yellow",
                size: "M",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 22,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 23,
                product_id: 11,
                sku: "JACKET-PINK-M",
                variant_label: "Pink / Size M",
                pet_weight: null,
                color: "Pink",
                size: "M",
                original_price: 125000,
                discount: 5000,
                discount_type: "fixed",
                price: 120000,
                quantity: 19,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 24,
                product_id: 11,
                sku: "JACKET-BLUE-M",
                variant_label: "Blue / Size M",
                pet_weight: null,
                color: "Blue",
                size: "M",
                original_price: 123000,
                discount: 3000,
                discount_type: "fixed",
                price: 120000,
                quantity: 18,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 25,
                product_id: 11,
                sku: "JACKET-YELLOW-L",
                variant_label: "Yellow / Size L",
                pet_weight: null,
                color: "Yellow",
                size: "L",
                original_price: 132000,
                discount: 7000,
                discount_type: "fixed",
                price: 125000,
                quantity: 14,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 26,
                product_id: 11,
                sku: "JACKET-PINK-L",
                variant_label: "Pink / Size L",
                pet_weight: null,
                color: "Pink",
                size: "L",
                original_price: 135000,
                discount: 15000,
                discount_type: "fixed",
                price: 120000,
                quantity: 15,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 27,
                product_id: 11,
                sku: "JACKET-BLUE-L",
                variant_label: "Blue / Size L",
                pet_weight: null,
                color: "Blue",
                size: "L",
                original_price: 138000,
                discount: 8000,
                discount_type: "fixed",
                price: 130000,
                quantity: 13,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },

            // PRODUCT 17 - Bentonite Cat Litter
            {
                productVariant_id: 28,
                product_id: 17,
                sku: "LITTER-5KG-LAVENDER",
                variant_label: "5kg / Lavender",
                pet_weight: null,
                color: "Lavender",
                size: "5kg",
                original_price: 95000,
                discount: 0,
                discount_type: "fixed",
                price: 95000,
                quantity: 35,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 29,
                product_id: 17,
                sku: "LITTER-5KG-ORIGINAL",
                variant_label: "5kg / Original",
                pet_weight: null,
                color: "Original",
                size: "5kg",
                original_price: 90000,
                discount: 0,
                discount_type: "fixed",
                price: 90000,
                quantity: 32,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 30,
                product_id: 17,
                sku: "LITTER-5KG-GREEN-TEA",
                variant_label: "5kg / Green Tea",
                pet_weight: null,
                color: "Green Tea",
                size: "5kg",
                original_price: 98000,
                discount: 3000,
                discount_type: "fixed",
                price: 95000,
                quantity: 28,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 31,
                product_id: 17,
                sku: "LITTER-10KG-LAVENDER",
                variant_label: "10kg / Lavender",
                pet_weight: null,
                color: "Lavender",
                size: "10kg",
                original_price: 180000,
                discount: 10000,
                discount_type: "fixed",
                price: 170000,
                quantity: 22,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 32,
                product_id: 17,
                sku: "LITTER-10KG-ORIGINAL",
                variant_label: "10kg / Original",
                pet_weight: null,
                color: "Original",
                size: "10kg",
                original_price: 175000,
                discount: 10000,
                discount_type: "fixed",
                price: 165000,
                quantity: 20,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 33,
                product_id: 17,
                sku: "LITTER-10KG-GREEN-TEA",
                variant_label: "10kg / Green Tea",
                pet_weight: null,
                color: "Green Tea",
                size: "10kg",
                original_price: 185000,
                discount: 5000,
                discount_type: "fixed",
                price: 180000,
                quantity: 18,
                reserved_quantity: 1,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
        ]);

        // =====================================================
        // MEDIA
        // =====================================================
        await queryInterface.bulkInsert("media", [
            {
                entity_type: "product",
                entity_id: "1",
                url: "https://iandloveandyou.com/cdn/shop/files/818336012297_-_Naked_Essentials_Puppy_Chicken_Sweet_Potato_4_lb_-_FRONT_1.png?v=1762441431&width=1050",
                is_main: true,
                alt_text: "Puppy Care Nutritional Kibble",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "2",
                url: "https://www.acana.com/dw/image/v2/BFDW_PRD/on/demandware.static/-/Sites-acana-na-master-catalog/en_CA/dw61aeb34d/ACA%20Premium%20Pate%20Dog%20Food/ACANA%20Premium%20Pate%20Beef%20Recipe%20Wet%20Dog%20Front%2012.8oz%20USA-1.png?sw=450",
                is_main: true,
                alt_text: "Premium Beef Dog Pate",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "3",
                url: "https://a.assecobs.com/_img/happet/63818079-e24f-4c3a-b6b0-b057f3d56e65/fb01-functional-dental-bone-12cm-1-pc-.jpg?w=700&org_if_sml=0",
                is_main: true,
                alt_text: "Dental Bone Chew",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "4",
                url: "https://i5.walmartimages.com/seo/GR-16OZ-CHICKEN-JERKY_fbc1c7a5-02dc-4cfb-87d8-6722a5a6a955.e13bd932ec5a1bfc66874a8bc648987c.jpeg?odnHeight=2000&odnWidth=2000&odnBg=FFFFFF",
                is_main: true,
                alt_text: "Chicken Dog Treats",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "5",
                url: "https://amarpet.com/_next/image?url=https%3A%2F%2Fapn081-amarpet-prod.sgp1.cdn.digitaloceanspaces.com%2F747c1bcceb6109a4ef936bc70cfe67de%2FMaxpet-Adult-Cat-Food-Chicken-1kg.png&w=640&q=75",
                is_main: true,
                alt_text: "Adult Tuna Mix Cat Kibble",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "6",
                url: "https://www.bpetcare.com/wp-content/uploads/2024/04/KF-pate-deilight-cat-90g.png",
                is_main: true,
                alt_text: "Salmon Delight Cat Pate",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "7",
                url: "https://www.whiskas.in/cdn-cgi/image/format=auto,q=90/sites/g/files/fnmzdf7971/files/2025-07/7590398-3-whiskas-nova-with-tuna-in-jelly-adult-dcr-3d-80g-fop.png",
                is_main: true,
                alt_text: "Tuna Cat Snack",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "8",
                url: "https://kitcat.com.sg/wp-content/uploads/2018/06/KITCAT-MILK-FOR-KITTENS-1536x1536.jpg",
                is_main: true,
                alt_text: "Kitten Nutritional Milk",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "9",
                url: "https://cdn.shopify.com/s/files/1/1088/7528/files/brown-luxury-cat-collar-2025.jpg?v=1758498044||Brown%20Luxury%20Leather%20Cat%20Collar%20by%20Pawsome%20Couture",
                is_main: true,
                alt_text: "Premium Leather Pet Collar",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "10",
                url: "https://ollydog.com/cdn/shop/files/OllyDog_Rubber_Grip_Reflective_Leash_Safety_Adventure_Carabiner_7.jpg?v=1747194162&width=1000",
                is_main: true,
                alt_text: "Reflective Leash",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "11",
                url: "https://i.ebayimg.com/images/g/YAwAAOSwaBNjoeTd/s-l1600.webp",
                is_main: true,
                alt_text: "Winter Pet Jacket",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "12",
                url: "https://danhchobeyeu.com/media/cache/data/IMG_7574-450x450.png",
                is_main: true,
                alt_text: "Non-Slip Stainless Steel Bowl",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "13",
                url: "https://i5.walmartimages.com/seo/Dog-Squeaky-Ball-Durable-Pet-Squeak-Chew-Bouncy-Rubber-Toy-Balls-for-Small-Large-Dogs-Indestructible-Exercise-Training-Playing-3-Balls_37a5f417-6b6f-4518-9c57-9d67ebde159b.432ada1d7f638ffb076c9a824ef45f12.jpeg?odnHeight=2000&odnWidth=2000&odnBg=FFFFFF",
                is_main: true,
                alt_text: "Bouncy Rubber Ball",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "14",
                url: "https://www.centinelafeed.com/on/demandware.static/-/Sites-master-centinela-product-catalog/default/dwd0179633/i/apijjhmeq__92799.jpg",
                is_main: true,
                alt_text: "Plush Mouse Toy",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "15",
                url: "https://i5.walmartimages.com/asr/a25d1aa3-50a3-49ce-903e-e9968380e6a9.2b79c963511dd8222ea6eac3aff80a16.jpeg?odnHeight=2000&odnWidth=2000&odnBg=FFFFFF",
                is_main: true,
                alt_text: "Rope Tug Toy",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "16",
                url: "https://www.jacksongalaxy.com/cdn/shop/articles/20240228-IMG_2158.jpg?v=1711993337&width=2200",
                is_main: true,
                alt_text: "Feather Wand Cat Toy",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "17",
                url: "https://m.media-amazon.com/images/I/91HkNdBl57L._AC_SL1500_.jpg",
                is_main: true,
                alt_text: "Bentonite Cat Litter",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "18",
                url: "https://www.centinelafeed.com/on/demandware.static/-/Sites-master-centinela-product-catalog/default/dwc3ba9478/k/apirr9kvn__49447.jpg",
                is_main: true,
                alt_text: "Deodorizing Pet Shampoo",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "19",
                url: "https://pureandnaturalpet.com/cdn/shop/files/All_Wipes9.jpg?v=1737475448&width=2200",
                is_main: true,
                alt_text: "Pet Cleaning Wipes",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "20",
                url: "https://s.alicdn.com/@sc04/kf/Hc645c1f37a254248a67db78bbffdee40N.png_960x960q80.jpg",
                is_main: true,
                alt_text: "Double-Sided Grooming Brush",
                created_at: now,
                updated_at: now,
            },

            // extra gallery images
            {
                entity_type: "product",
                entity_id: "1",
                url: "https://iandloveandyou.com/cdn/shop/files/818336012471_-_Lovingly_Simple_Lamb_Sweet_Potato_3.85_lb_-_FRONT.jpg?v=1762441423&width=1050",
                is_main: false,
                alt_text: "Extra image for Puppy Care Nutritional Kibble",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "5",
                url: "https://amarpet.com/_next/image?url=https%3A%2F%2Fapn081-amarpet-prod.sgp1.cdn.digitaloceanspaces.com%2F7e3315fe390974fcf25e44a9445bd821%2FMaxPet-Adult-Cat-Food-Tuna-1kg.png&w=828&q=75",
                is_main: false,
                alt_text: "Extra image for Adult Tuna Mix Cat Kibble",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "9",
                url: "https://cdn.shopify.com/s/files/1/1088/7528/files/black-luxury-cat-collar-pawsome-couture-fafafa_0542d5d5-300a-4bf4-a4b8-7d81b72267bb.jpg?v=1706011890||Black%20Luxury%20Leather%20Cat%20Collar%20by%20Pawsome%20Couture",
                is_main: false,
                alt_text: "Extra image for Premium Leather Pet Collar",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "11",
                url: "https://i.ebayimg.com/images/g/YLIAAOSwCo5joeTY/s-l1600.webp",
                is_main: false,
                alt_text: "Extra image for Winter Pet Jacket",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "17",
                url: "https://m.media-amazon.com/images/I/610yu6rTk+L._AC_SL1500_.jpg",
                is_main: false,
                alt_text: "Extra image for Bentonite Cat Litter",
                created_at: now,
                updated_at: now,
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("media", null, {});
        await queryInterface.bulkDelete("productVariants", null, {});
        await queryInterface.bulkDelete("products", null, {});
        await queryInterface.bulkDelete("productCategories", null, {});
    },
};
