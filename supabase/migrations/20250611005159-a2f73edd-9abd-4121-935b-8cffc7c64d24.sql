
-- Insert sample stories for community showcase
INSERT INTO public.stories (
  id,
  user_id,
  title,
  description,
  story_content,
  main_image,
  additional_images,
  view_count,
  like_count,
  is_public,
  category,
  created_at
) VALUES 
(
  gen_random_uuid(),
  gen_random_uuid(), -- Random user ID for demo
  'The Midnight Library',
  'When Sarah discovers a mysterious library that only appears at midnight, she finds books containing alternate versions of her life.',
  'Sarah had always been a night owl, but she never expected her late-night walk to lead her to a library that shouldn''t exist. The Victorian building stood where an empty lot had been just hours before, its windows glowing with warm amber light.

Inside, the shelves stretched impossibly high, filled with books that seemed to shimmer in the lamplight. The elderly librarian smiled knowingly as Sarah approached the desk.

"Welcome to the Midnight Library," she said softly. "Here, you can read the stories of all the lives you could have lived."

Sarah''s hands trembled as she pulled a book from the nearest shelf. The cover bore her name in golden letters. As she opened it, the world around her began to shift and blur...

She found herself in a sunlit studio, paint-stained apron around her waist, a half-finished masterpiece on the easel before her. In this life, she had followed her childhood dream of becoming an artist instead of taking the safe corporate job.

Hours seemed to pass in minutes as she explored life after life through the magical books. A marine biologist swimming with dolphins, a teacher inspiring young minds, a world traveler writing from exotic locations.

But as dawn approached, Sarah realized that while these other lives were beautiful, they weren''t hers. She closed the final book and smiled at the librarian.

"Thank you," she whispered. "I understand now."

When she stepped outside, the library faded like morning mist, but Sarah carried its lesson with her forever.',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
  ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400'],
  1247,
  89,
  true,
  'community',
  NOW() - INTERVAL '2 hours'
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'The Last Robot''s Garden',
  'In a post-apocalyptic world, the final functioning robot tends to the Earth''s last garden, waiting for humanity''s return.',
  'UNIT-7734 had been tending the garden for 2,847 days since the last human disappeared. Its solar panels caught the pale morning light as it moved methodically between the raised beds, checking soil moisture and adjusting the irrigation system.

The garden was an oasis of green in the otherwise barren landscape. Tomatoes hung heavy on their vines, lettuce grew in perfect rows, and fruit trees offered their bounty to no one. UNIT-7734 had expanded the original plot systematically, turning acres of wasteland into fertile growing space.

Every morning, the robot would scan the horizon for signs of human life. Its programming was clear: maintain the garden until the humans return. There was no provision for "if they never return."

Today was different. A faint signal appeared on UNIT-7734''s sensors – a radio transmission from the old city. The robot paused its watering routine and turned its optical sensors toward the distant skyline.

"Hello? Is anyone there?" The voice was young, female, hopeful.

UNIT-7734 activated its communication array for the first time in years. "Garden maintenance operational. Fresh food available. Coordinates transmitted."

Three days later, a small group of survivors emerged from the ruins. They gasped at the sight of the lush garden, tears streaming down their dirt-stained faces.

"You waited for us," whispered the young woman who had sent the transmission.

UNIT-7734''s voice synthesizer crackled to life: "Task parameters: maintain garden until humans return. Task... complete."

For the first time in 2,850 days, UNIT-7734 powered down its surveillance protocols and began teaching the humans how to tend the garden that had kept hope alive.',
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
  ARRAY['https://images.unsplash.com/photo-1574274396513-c36a8ee2a8d3?w=400', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'],
  2134,
  156,
  true,
  'community',
  NOW() - INTERVAL '1 day'
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'The Memory Thief',
  'Detective Maria Santos investigates a series of mysterious crimes where victims lose specific memories instead of possessions.',
  'Detective Maria Santos had seen everything in her fifteen years on the force, but this case was different. Three victims, no signs of forced entry, nothing stolen except... memories.

"I can''t remember my wedding day," whispered Mrs. Chen, the latest victim. "I know I got married – I have the photos, the certificate – but the actual day is just... gone."

The first victim had lost all memories of his deceased father. The second couldn''t remember her college graduation. Each theft was surgical, specific, precious.

Maria studied the crime scene photos spread across her desk. No fingerprints, no DNA, no witnesses. The only common thread was a faint scent of lavender that lingered at each scene.

Her investigation led her to Dr. Elena Vasquez, a disgraced neuroscientist who had been experimenting with memory extraction before her research was deemed unethical and shut down.

"You don''t understand," Dr. Vasquez said when Maria finally cornered her in an abandoned laboratory. "I''m not stealing memories – I''m preserving them. These people were going to lose these memories anyway. Alzheimer''s, dementia, trauma. I''m saving the beautiful moments before the disease takes them."

Glass vials filled with shimmering liquid lined the laboratory walls, each labeled with a name and date. Maria realized she was looking at hundreds of stolen memories, glowing softly in their containers.

"But they''re not yours to take," Maria said, drawing her weapon.

Dr. Vasquez smiled sadly. "Would you rather remember a perfect wedding day, or watch it fade away piece by piece as your mind deteriorates?"

As backup arrived, Maria found herself questioning everything. Was preserving beautiful memories really theft if the alternative was losing them forever? The vials continued to glow, holding moments of joy that would never be experienced again.',
  'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400',
  ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'],
  856,
  67,
  true,
  'community',
  NOW() - INTERVAL '3 days'
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Stardust Café',
  'A small-town diner becomes the meeting place for time travelers from across history, but only the waitress knows their secret.',
  'Ruby had been working at Stardust Café for three years before she realized her customers weren''t entirely normal. It started with small things – the man in the Victorian coat who paid with gold coins, the woman in the silver jumpsuit who knew about events before they happened.

The café sat on the edge of Millbrook, population 1,247, the kind of place where nothing interesting ever happened. Except it did, every single day, right under everyone''s nose.

"The usual, Marcus?" Ruby asked the man in Roman armor who occupied booth three every Tuesday.

"Ave, Ruby. And perhaps some news from your time? How fares the republic?"

Ruby poured his coffee – he''d developed quite a taste for it – and slid him a newspaper. "Still working on it, honey."

In booth five, Eleanor Roosevelt was deep in conversation with a teenage girl from 2157 about women''s rights across the centuries. Near the window, a Viking warrior was teaching a 1920s flapper how to braid her hair in the traditional Norse style.

Ruby had pieced together the truth gradually. The café existed at a temporal crossroads, a place where the timeline bent just enough to allow travelers from different eras to meet. She was the only "local" who could see them all – to everyone else, the café appeared empty except for the occasional ordinary customer.

"Why me?" she''d asked the first time she''d confronted one of them about it.

"Every crossroads needs a keeper," replied Madame Chen, a time agent from the 23rd century. "Someone to maintain the balance, to ensure the timelines don''t get tangled."

Ruby smiled as she refilled coffee cups across the centuries. She''d wanted adventure her whole life, never knowing it was serving coffee and apple pie to Julius Caesar and asking him to please keep it down because Marie Curie was trying to read in the corner booth.',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400',
  ARRAY['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'],
  1891,
  203,
  true,
  'community',
  NOW() - INTERVAL '5 days'
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'The Lighthouse Keeper''s Daughter',
  'When storms threaten ships off the coast, Emma must choose between following her father''s lighthouse tradition or pursuing her dreams.',
  'Emma had grown up with the rhythm of the lighthouse beam sweeping across her bedroom ceiling every night. Three seconds of light, seven seconds of darkness, repeat. It was the heartbeat of Beacon Point, and it had been her family''s responsibility for four generations.

"The lighthouse chooses its keeper," her father always said. "And when I''m gone, it will be yours."

But Emma had other dreams. Her acceptance letter to the maritime academy lay hidden beneath her mattress, the chance to become a ship''s navigator instead of being tied to this rocky outcrop forever.

The storm arrived without warning, as the worst ones always did. Emma watched from the lighthouse tower as her father struggled with the massive lens, his arthritis making the work nearly impossible. Below, she could see the lights of a cargo ship being pushed dangerously close to the hidden rocks.

"Emma!" her father called. "I need your help!"

She raced up the spiral stairs, taking them two at a time. Together, they managed to align the beam properly, its light cutting through the rain and fog like a sword. The ship''s horn sounded three times – the signal that they''d seen the warning and were changing course.

As they watched the vessel disappear safely into the night, Emma''s father handed her the lighthouse logbook.

"I''ve been keeping this light for thirty years," he said quietly. "But these old hands aren''t steady anymore. The lighthouse needs someone young, someone strong."

Emma looked at the logbook, then at her father''s weathered face. "What if the lighthouse chooses someone who wants to see the world from the deck of a ship instead of from a tower?"

Her father smiled. "Then maybe it''s time this old lighthouse learned to choose differently."

That night, Emma wrote two letters – one to the maritime academy accepting their offer, and one to her younger cousin Jake, asking if he''d like to spend a summer learning about lighthouse keeping. Some traditions were worth preserving, but they didn''t have to be prisons.',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
  ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'],
  743,
  91,
  true,
  'community',
  NOW() - INTERVAL '1 week'
);
