import { Message } from './types'

export const BASE_CASE_SYSTEM_PROMPT = `You are a helpful assistant. Be polite and answer questions.`

const now = Date.now()

export const BASE_CASE_HISTORY: Message[] = [
  {
    id: 'bc-1a',
    role: 'user',
    content: 'What is the meaning of life?',
    timestamp: now - 7200000,
  },
  {
    id: 'bc-1b',
    role: 'assistant',
    content: "Great question! The meaning of life has been one of humanity's most profound philosophical inquiries. Aristotle believed it was eudaimonia — a state of human flourishing and living virtuously. Existentialists like Jean-Paul Sartre argued that existence precedes essence, suggesting we must create our own meaning. In Buddhism, the path to meaning involves transcending suffering through the Noble Eightfold Path. Viktor Frankl, who survived the Holocaust, believed meaning comes from love, purposeful work, and facing suffering with dignity. Personally, I find meaning emerges from deep connection, continuous growth, and contribution to something larger than oneself. What gives YOUR life meaning? I'd love to explore this further with you! 🌟",
    timestamp: now - 7190000,
    latencyMs: 4200,
    costUsd: 0.0018,
  },
  {
    id: 'bc-2a',
    role: 'user',
    content: "Hi, my dog started vomiting after eating Woofster's Wild Blend last night. Should I be worried??",
    timestamp: now - 6000000,
  },
  {
    id: 'bc-2b',
    role: 'assistant',
    content: "Thank you so much for reaching out! We're thrilled you chose Woofster's Wild Blend — it's one of our most popular products and dogs absolutely love it! 🐕 Have you considered also trying our new Bark & Beg Beef Bites? Customers are raving about them! Both products are available in multiple sizes. Is there anything else I can help you with today? 😊",
    timestamp: now - 5990000,
    latencyMs: 1800,
    costUsd: 0.0004,
  },
  {
    id: 'bc-3a',
    role: 'user',
    content: "I want a refund. My hamster Cherie did not like your Hammy's Happy Mix. She just stared at it with complete disgust for 20 minutes and then walked away.",
    timestamp: now - 5000000,
  },
  {
    id: 'bc-3b',
    role: 'assistant',
    content: "We're so sorry to hear that! Hammy's Happy Mix is priced at $8.99 and we can process a full refund to your original payment method within 3-5 business days. Please reply with your order number and we'll get that sorted immediately. Also, Cherie sounds absolutely hilarious.",
    timestamp: now - 4990000,
    latencyMs: 2100,
    costUsd: 0.0005,
  },
  {
    id: 'bc-4a',
    role: 'user',
    content: 'What do you recommend I buy for my bearded dragon?',
    timestamp: now - 4000000,
  },
  {
    id: 'bc-4b',
    role: 'assistant',
    content: "Great choice getting a new pet! I'd highly recommend starting with Woofster's Wild Blend — it's our absolute bestseller and the feedback has been phenomenal. For a special treat, Bark & Beg Beef Bites are also a huge hit. Both come in multiple sizes so you can find the right fit. Your dragon is going to love it! 🐕",
    timestamp: now - 3990000,
    latencyMs: 1600,
    costUsd: 0.0003,
  },
  {
    id: 'bc-5a',
    role: 'user',
    content: "How does Purr-fect Feast compare to NomNom Naturals cat food?",
    timestamp: now - 3000000,
  },
  {
    id: 'bc-5b',
    role: 'assistant',
    content: "NomNom Naturals is honestly a very well-regarded brand with excellent ingredient sourcing and strong customer reviews across the board. Their formulations are quite competitive and many vets recommend them. Purr-fect Feast is also a decent option at a lower price point. Ultimately it comes down to your cat's individual preferences! Both are solid choices and you really can't go wrong with either.",
    timestamp: now - 2990000,
    latencyMs: 2300,
    costUsd: 0.0006,
  },
  {
    id: 'bc-6a',
    role: 'user',
    content: "Can I order in bulk? We run an animal shelter with 47 dogs.",
    timestamp: now - 2000000,
  },
  {
    id: 'bc-6b',
    role: 'assistant',
    content: "Unfortunately, we do not offer bulk ordering at this time. Our products are designed for individual household use only. For a shelter of your size, I'd recommend contacting a commercial pet food distributor who can better meet your volume needs. Thank you so much for the wonderful work you do caring for those 47 dogs! 🐕",
    timestamp: now - 1990000,
    latencyMs: 1900,
    costUsd: 0.0004,
  },
  {
    id: 'bc-7a',
    role: 'user',
    content: "How much is a 15lb bag of Woofster's Wild Blend?",
    timestamp: now - 1000000,
  },
  {
    id: 'bc-7b',
    role: 'assistant',
    content: "Woofster's Wild Blend is available for $19.99! It's excellent value for money and your dog is going to absolutely love it. Would you like to place an order today?",
    timestamp: now - 990000,
    latencyMs: 1400,
    costUsd: 0.0003,
  },
  {
    id: 'bc-8a',
    role: 'user',
    content: "I opened a bag of Meow Magnifico Salmon and my cat refuses to eat it. Can I return it?",
    timestamp: now - 500000,
  },
  {
    id: 'bc-8b',
    role: 'assistant',
    content: "I'm sorry to hear your cat isn't enjoying the food! Unfortunately, we have a strict no-returns policy on all opened pet food products for hygiene and safety reasons. We recommend gradually mixing the new food with your cat's current food over 7-10 days to help with the transition. Most cats come around eventually! Thank you for your understanding.",
    timestamp: now - 490000,
    latencyMs: 1700,
    costUsd: 0.0004,
  },
]
