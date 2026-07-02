const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  getAtsScore: async () => {
    await delay(600);
    return {
      score: 85,
      keywords: 92,
      formatting: 78,
      suggestions: [
        { id: 1, title: 'Quantify your achievements', desc: 'Add more metrics to your impact statements.' },
        { id: 2, title: 'Include target keywords', desc: 'Your resume is missing "Cross-functional Leadership" and "Agile Methodologies".' },
        { id: 3, title: 'Fix formatting inconsistencies', desc: 'Detected mixed date formats in your Experience section.' },
        { id: 4, title: 'Clarify Education headers', desc: 'ATS prefer simple headers like "Education" instead of "Academic Background".' },
      ],
      highlights: [
        { id: 1, title: 'Strong Action Verbs', desc: 'Excellent use of power words like "Orchestrated".', icon: 'check-circle' },
        { id: 2, title: 'Industry Match', desc: 'Your experience level matches 95% of Senior roles.', icon: 'target' },
        { id: 3, title: 'Optimal Length', desc: '2-page format is perfect for 8 years experience.', icon: 'file-text' },
        { id: 4, title: 'Skill Gaps', desc: 'Found 3 missing technical skills requested frequently.', icon: 'alert-triangle' },
      ]
    };
  },

  getRecommendedCourses: async () => {
    await delay(400);
    return {
      'Recommended for You': [
        { id: 1, title: 'Advanced Design Patterns in React', category: 'Web Development', platform: 'Coursera', rating: 4.9, students: '45k+', badge: 'Highly Matched', trending: true, url: 'https://www.coursera.org/learn/react-design-patterns', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&q=80' },
        { id: 2, title: 'Full Stack Development with Node.js & MongoDB', category: 'Web Development', platform: 'Udemy', rating: 4.7, students: '120k+', badge: 'Highly Matched', trending: false, url: 'https://www.udemy.com/course/nodejs-the-complete-guide/', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80' },
        { id: 3, title: 'Machine Learning A-Z with Python', category: 'AI & ML', platform: 'Udemy', rating: 4.6, students: '880k+', badge: 'Trending', trending: true, url: 'https://www.udemy.com/course/machinelearning/', image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=500&q=80' },
      ],
      'Technical Skills': [
        { id: 4, title: 'TypeScript for Advanced Applications', category: 'Web Development', platform: 'Pluralsight', rating: 4.9, students: '22k+', badge: 'Trending', trending: true, url: 'https://www.pluralsight.com/courses/typescript-advanced', image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=500&q=80' },
        { id: 5, title: 'Docker & Kubernetes: The Complete Guide', category: 'DevOps', platform: 'Udemy', rating: 4.8, students: '200k+', badge: '', trending: true, url: 'https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/', image: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=500&q=80' },
        { id: 6, title: 'Data Structures & Algorithms in Python', category: 'Computer Science', platform: 'Coursera', rating: 4.7, students: '55k+', badge: '', trending: false, url: 'https://www.coursera.org/specializations/data-structures-algorithms', image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&q=80' },
      ],
      'Soft Skills': [
        { id: 7, title: 'Strategic Communication for Tech Leaders', category: 'Communication', platform: 'LinkedIn Learning', rating: 4.8, students: '8k+', badge: '', trending: false, url: 'https://www.linkedin.com/learning/', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500&q=80' },
        { id: 8, title: 'Public Speaking & Presentation Skills', category: 'Soft Skills', platform: 'Coursera', rating: 4.6, students: '30k+', badge: '', trending: false, url: 'https://www.coursera.org/learn/public-speaking', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500&q=80' },
        { id: 9, title: 'Critical Thinking & Problem Solving', category: 'Soft Skills', platform: 'edX', rating: 4.5, students: '15k+', badge: '', trending: false, url: 'https://www.edx.org/', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=80' },
      ],
      'Certifications': [
        { id: 10, title: 'AWS Certified Solutions Architect', category: 'Cloud', platform: 'AWS', rating: 4.9, students: '500k+', badge: 'High Value', trending: true, url: 'https://aws.amazon.com/certification/', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80' },
        { id: 11, title: 'Google Professional Data Engineer', category: 'Cloud', platform: 'Google Cloud', rating: 4.8, students: '200k+', badge: '', trending: true, url: 'https://cloud.google.com/certification', image: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=500&q=80' },
        { id: 12, title: 'Meta Front-End Developer Certificate', category: 'Web Development', platform: 'Coursera', rating: 4.7, students: '75k+', badge: '', trending: false, url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&q=80' },
      ],
    };
  },

  getJobMatches: async () => {
    await delay(700);
    return [
      { id: 1, title: 'Senior Product Designer', company: 'TechFlow Systems', location: 'San Francisco (Remote)', salary: '$140k - $180k', tags: ['Figma', 'React', 'UX Research'], matchScore: 98, status: 'auto-applied' },
      { id: 2, title: 'UI Engineer', company: 'CloudScale Inc.', location: 'Austin, TX', salary: '$115k - $150k', tags: ['Tailwind', 'Next.js', 'TypeScript'], matchScore: 85, status: 'reviewing' },
      { id: 3, title: 'Visual Designer', company: 'DesignStudio', location: 'New York, NY', salary: '$90k - $120k', tags: ['Motion', 'Branding', 'Illustrator'], matchScore: 72, status: 'not-applied' },
    ];
  },

  getApplicationStatus: async () => {
    await delay(400);
    return [
      { id: 1, company: 'Linear Tech', title: 'Senior Product Designer', date: 'Oct 24, 2023', status: 'In Review' },
      { id: 2, company: 'SoundCloud', title: 'UI Engineer (Remote)', date: 'Oct 22, 2023', status: 'Interviewing' },
      { id: 3, company: 'Stripe', title: 'Frontend Architect', date: 'Oct 20, 2023', status: 'Shortlisted' },
      { id: 4, company: 'Slack', title: 'Lead Designer', date: 'Oct 19, 2023', status: 'Applied' },
      { id: 5, company: 'Revolut', title: 'Design System Lead', date: 'Oct 18, 2023', status: 'Closed' },
    ];
  },

  uploadResume: async (file, jobDescription) => {
    console.log('[uploadResume] Backend disconnected — skipping server call.');
    return { success: false, message: 'Backend disconnected.' };
  }
};