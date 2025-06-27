
interface TopicTemplate {
  category: string;
  templates: string[];
  keywords: string[];
}

interface IndustryTopics {
  [key: string]: TopicTemplate[];
}

const industryTopics: IndustryTopics = {
  technology: [
    {
      category: 'Trends & Innovation',
      templates: [
        'The Future of {keyword} in {year}',
        'How {keyword} is Transforming {industry}',
        'Emerging Trends in {keyword} Technology',
        '{keyword} vs Traditional Methods: A Comprehensive Analysis'
      ],
      keywords: ['AI', 'Machine Learning', 'Cloud Computing', 'Blockchain', 'IoT', 'Cybersecurity']
    },
    {
      category: 'Tutorials & Guides',
      templates: [
        'Complete Guide to {keyword} for Beginners',
        'Advanced {keyword} Techniques Every Developer Should Know',
        'Building Your First {keyword} Application',
        'Best Practices for {keyword} Implementation'
      ],
      keywords: ['React', 'Python', 'JavaScript', 'API Development', 'Database Design', 'DevOps']
    }
  ],
  marketing: [
    {
      category: 'Strategy & Planning',
      templates: [
        '{keyword} Strategies That Actually Work in {year}',
        'How to Create a Winning {keyword} Campaign',
        'The Ultimate Guide to {keyword} ROI',
        'Common {keyword} Mistakes and How to Avoid Them'
      ],
      keywords: ['Content Marketing', 'Social Media', 'Email Marketing', 'SEO', 'PPC', 'Brand Building']
    },
    {
      category: 'Analytics & Performance',
      templates: [
        'Measuring {keyword} Success: Key Metrics That Matter',
        'How to Optimize Your {keyword} for Better Results',
        '{keyword} Analytics: What the Data Really Tells Us',
        'Tracking {keyword} Performance in {year}'
      ],
      keywords: ['Conversion Rates', 'Customer Acquisition', 'Brand Awareness', 'Engagement', 'Revenue Growth']
    }
  ],
  business: [
    {
      category: 'Leadership & Management',
      templates: [
        'Essential {keyword} Skills for Modern Leaders',
        'How to Build a {keyword} Culture in Your Organization',
        'The Art of {keyword}: Lessons from Successful Leaders',
        'Overcoming {keyword} Challenges in Remote Teams'
      ],
      keywords: ['Communication', 'Team Building', 'Decision Making', 'Conflict Resolution', 'Innovation']
    },
    {
      category: 'Growth & Strategy',
      templates: [
        'Scaling Your Business with {keyword}',
        '{keyword} Strategies for Sustainable Growth',
        'How {keyword} Can Transform Your Business Model',
        'The Role of {keyword} in Modern Business Success'
      ],
      keywords: ['Digital Transformation', 'Customer Experience', 'Data Analytics', 'Automation', 'Partnerships']
    }
  ]
};

const contentTypes = [
  { type: 'How-to Guide', prefix: 'How to', suffix: ': A Step-by-Step Guide' },
  { type: 'Listicle', prefix: 'Top 10', suffix: 'You Need to Know' },
  { type: 'Case Study', prefix: 'Case Study:', suffix: 'Success Story' },
  { type: 'Comparison', prefix: '', suffix: 'vs. Alternatives: Which is Better?' },
  { type: 'Trend Analysis', prefix: 'The Future of', suffix: 'in 2024 and Beyond' },
  { type: 'Best Practices', prefix: 'Best Practices for', suffix: 'That Actually Work' },
  { type: 'Common Mistakes', prefix: '5 Common', suffix: 'Mistakes (And How to Avoid Them)' },
  { type: 'Ultimate Guide', prefix: 'The Ultimate Guide to', suffix: 'for Beginners' }
];

export function generateDiverseTopics(
  count: number,
  industry: string = 'business',
  audience: string = '',
  existingTopics: string[] = []
): Array<{ title: string; category: string; contentType: string; keywords: string[] }> {
  const topics: Array<{ title: string; category: string; contentType: string; keywords: string[] }> = [];
  const usedCombinations = new Set(existingTopics.map(t => t.toLowerCase()));
  
  const availableTopics = industryTopics[industry.toLowerCase()] || industryTopics.business;
  
  while (topics.length < count) {
    const topicTemplate = availableTopics[Math.floor(Math.random() * availableTopics.length)];
    const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
    const keyword = topicTemplate.keywords[Math.floor(Math.random() * topicTemplate.keywords.length)];
    
    let title = topicTemplate.templates[Math.floor(Math.random() * topicTemplate.templates.length)];
    
    // Replace placeholders
    title = title.replace('{keyword}', keyword);
    title = title.replace('{industry}', industry);
    title = title.replace('{year}', '2024');
    
    // Apply content type formatting
    if (contentType.prefix && !title.toLowerCase().includes(contentType.prefix.toLowerCase())) {
      title = `${contentType.prefix} ${title}`;
    }
    if (contentType.suffix && !title.toLowerCase().includes(contentType.suffix.toLowerCase())) {
      title = `${title}${contentType.suffix}`;
    }
    
    // Clean up duplicate words and ensure uniqueness
    const cleanTitle = title.replace(/\b(\w+)\s+\1\b/gi, '$1').trim();
    const titleKey = cleanTitle.toLowerCase();
    
    if (!usedCombinations.has(titleKey) && cleanTitle.length > 10 && cleanTitle.length < 100) {
      topics.push({
        title: cleanTitle,
        category: topicTemplate.category,
        contentType: contentType.type,
        keywords: [keyword, ...topicTemplate.keywords.slice(0, 2)]
      });
      usedCombinations.add(titleKey);
    }

    // Prevent infinite loop
    if (usedCombinations.size > count * 3) break;
  }
  
  return topics;
}

export function generateTopicForDate(
  date: Date,
  industry: string = 'business',
  audience: string = '',
  existingTopics: string[] = []
): { title: string; category: string; contentType: string; keywords: string[] } {
  const topics = generateDiverseTopics(1, industry, audience, existingTopics);
  return topics[0] || {
    title: `Professional Insights for ${date.toLocaleDateString()}`,
    category: 'General',
    contentType: 'Article',
    keywords: ['business', 'insights', 'professional']
  };
}
