
export const EXAMPLE_TOPICS = [
  // Marketing Category
  {
    category: 'Marketing',
    topics: [
      'The Ultimate Guide to Content Marketing ROI Measurement in 2024',
      'How to Build a High-Converting Email Marketing Funnel from Scratch',
      'Social Media Marketing Trends That Will Dominate 2024'
    ]
  },
  // B2B SaaS Category
  {
    category: 'B2B SaaS',
    topics: [
      'Customer Success Strategies That Reduce Churn by 40%',
      'How to Scale Your SaaS Product from $1M to $10M ARR',
      'The Complete Guide to Product-Led Growth for B2B SaaS'
    ]
  },
  // Sales Category
  {
    category: 'Sales',
    topics: [
      'Modern Sales Prospecting: LinkedIn Strategies That Actually Work',
      'How to Build a Predictable Sales Pipeline in 90 Days',
      'The Psychology of B2B Sales: Understanding Your Buyer\'s Decision Process'
    ]
  },
  // Startup Category
  {
    category: 'Startup',
    topics: [
      'From Idea to Product-Market Fit: A Founder\'s Complete Roadmap',
      'Raising Your First Seed Round: What VCs Really Look For',
      'Building a Remote-First Startup Culture That Scales'
    ]
  }
];

export function getRandomExampleTopic(): { category: string; topic: string } {
  const randomCategory = EXAMPLE_TOPICS[Math.floor(Math.random() * EXAMPLE_TOPICS.length)];
  const randomTopic = randomCategory.topics[Math.floor(Math.random() * randomCategory.topics.length)];
  
  return {
    category: randomCategory.category,
    topic: randomTopic
  };
}

export function getAllExampleTopics(): Array<{ category: string; topic: string }> {
  return EXAMPLE_TOPICS.flatMap(category => 
    category.topics.map(topic => ({
      category: category.category,
      topic
    }))
  );
}
