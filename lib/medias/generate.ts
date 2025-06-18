import 'dotenv/config';

import { togetherai } from '@ai-sdk/togetherai';
import { experimental_generateImage as generateImage } from 'ai';
import { put } from '@vercel/blob';
import { Buffer } from 'buffer';

export const categoryDisplayNames: Record<string, string> = {
  animals: "Animales",
  clothing: "Ropa",
  flowers: "Flores",
  food: "Comida",
  furniture: "Muebles",
  household_objects: "Objetos del hogar",
  musical_instruments: "Instrumentos musicales",
  sports_equipment: "Material deportivo",
  tools: "Herramientas",
  vehicles: "Vehículos",
};

// 10 diverse categories suitable for neurological exercises
const categories = Object.keys(categoryDisplayNames);

// Specific prompts and object names for each category
const categoryData = {
  food: [
    'fresh red apple',
    'slice of pizza with cheese and pepperoni',
    'banana with yellow peel',
    'chocolate chip cookie',
    'bowl of colorful salad',
    'glass of orange juice',
    'loaf of bread with golden crust',
    'bunch of purple grapes',
    'hamburger with lettuce and tomato',
    'bowl of hot soup with steam'
  ],
  animals: [
    'golden retriever dog sitting',
    'tabby cat lying down',
    'majestic lion with mane',
    'black and white cow in grass',
    'colorful parrot on branch',
    'swimming dolphin',
    'galloping horse',
    'cute rabbit with long ears',
    'elephant with trunk raised',
    'striped zebra standing'
  ],
  vehicles: [
    'red sports car',
    'yellow school bus',
    'commercial airplane in sky',
    'sailing boat on water',
    'bicycle with two wheels',
    'motorcycle with helmet',
    'fire truck with ladder',
    'train locomotive',
    'delivery truck',
    'police car with sirens'
  ],
  household_objects: [
    'kitchen refrigerator',
    'comfortable sofa',
    'table lamp with shade',
    'microwave oven',
    'washing machine',
    'television screen',
    'coffee maker',
    'vacuum cleaner',
    'toaster with bread slots',
    'ceiling fan with blades'
  ],
  clothing: [
    'blue denim jacket',
    'pair of running shoes',
    'red baseball cap',
    'white cotton t-shirt',
    'pair of blue jeans',
    'winter coat with hood',
    'silk tie with pattern',
    'summer dress',
    'pair of sunglasses',
    'warm knitted sweater'
  ],
  musical_instruments: [
    'acoustic guitar with strings',
    'grand piano with keys',
    'drum set with cymbals',
    'golden trumpet',
    'violin with bow',
    'saxophone with mouthpiece',
    'flute with holes',
    'harmonica',
    'tambourine with bells',
    'electric keyboard'
  ],
  sports_equipment: [
    'basketball with orange color',
    'tennis racket with strings',
    'soccer ball with black and white',
    'baseball bat and glove',
    'golf club and ball',
    'swimming goggles',
    'bicycle helmet',
    'pair of dumbbells',
    'football with laces',
    'ping pong paddle and ball'
  ],
  flowers: [
    'red rose with thorns',
    'yellow sunflower',
    'purple tulip',
    'white daisy with petals',
    'pink carnation',
    'blue iris flower',
    'orange marigold',
    'white lily',
    'purple lavender bunch',
    'colorful bouquet of flowers'
  ],
  tools: [
    'hammer with wooden handle',
    'screwdriver with metal tip',
    'pair of pliers',
    'wrench for bolts',
    'saw with sharp teeth',
    'drill with bits',
    'measuring tape',
    'level with bubble',
    'pair of scissors',
    'toolbox with compartments'
  ],
  furniture: [
    'wooden dining table',
    'comfortable office chair',
    'bookshelf with books',
    'bed with pillows',
    'wardrobe with doors',
    'coffee table',
    'rocking chair',
    'dresser with drawers',
    'desk with workspace',
    'cabinet with handles'
  ]
};

async function generateAndStoreImage(
  category: string,
  prompt: string,
  imageIndex: number
): Promise<string | null> {
  try {
    console.log(`Generating image ${imageIndex + 1} for category: ${category}`);
    console.log(`Prompt: Generate an image of ${prompt.toLowerCase()}`);

    const { images } = await generateImage({
      model: togetherai.image('black-forest-labs/FLUX.1-schnell-Free'),
      prompt: `Generate an image of ${prompt.toLowerCase()}, clear and simple, centered, suitable for cognitive exercises, white background`,
      size: "512x512",
    });

    const [image] = images

    if (!image) {
      throw new Error('No image generated in the response');
    }

    // Convert image to buffer for storage
    const imageBuffer = Buffer.from(image.uint8Array);

    // Generate filename with category folder and object name
    const filename = `${category}/${prompt.replaceAll(" ", "-")}.png`;

    // Store in Vercel Blob
    const blob = await put(filename, imageBuffer, {
      access: 'public',
      contentType: 'image/png',
      addRandomSuffix: true
    });

    console.log(`✅ Successfully generated and stored: ${filename}`);
    console.log(`URL: ${blob.url}`);

    return blob.url;

  } catch (error) {
    console.error(`❌ Error generating image ${imageIndex + 1} for ${category}:`, error);
    return null;
  }
}

async function generateAllImages(): Promise<void> {
  console.log('🚀 Starting image generation for neurological exercise categories...\n');

  for (const category of categories.slice(1)) {
    console.log(`\n📁 Processing category: ${category.toUpperCase()}`);
    console.log('='.repeat(50));

    const items = categoryData[category as keyof typeof categoryData];

    // Generate images for this category with some delay to avoid rate limiting
    for (let i = 0; i < items.length; i++) {
      const prompt = items[i];
      await generateAndStoreImage(category, prompt, i);

      // Add delay between requests to be respectful to the API
      if (i < items.length - 1) {
        console.log('Waiting 10 seconds before next generation...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }

  console.log('\n🎉 Image generation complete!');
  console.log('You can now use these images in your neurological exercise application.');
}

// Run the script
if (require.main === module) {
  generateAllImages().catch(console.error);
}

export { generateAllImages, categories, categoryData };