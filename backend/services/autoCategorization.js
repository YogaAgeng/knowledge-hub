// Auto-categorization service using keyword matching and pattern recognition
class AutoCategorizationService {
  constructor() {
    // Define keyword patterns for each category
    this.categoryPatterns = {
      'lecture-notes': {
        keywords: ['lecture', 'notes', 'kuliah', 'materi', 'pertemuan', 'chapter', 'bab', 'modul'],
        patterns: [/pertemuan\s*\d+/i, /week\s*\d+/i, /minggu\s*\d+/i, /chapter\s*\d+/i],
        weight: 1.0
      },
      'assignment': {
        keywords: ['tugas', 'assignment', 'homework', 'submission', 'deadline', 'kumpul'],
        patterns: [/tugas\s*\d+/i, /assignment\s*\d+/i, /hw\s*\d+/i],
        weight: 1.2
      },
      'research': {
        keywords: ['penelitian', 'research', 'paper', 'jurnal', 'artikel', 'thesis', 'skripsi', 'tesis'],
        patterns: [/research\s*paper/i, /jurnal\s*ilmiah/i, /artikel\s*ilmiah/i],
        weight: 1.1
      },
      'exam-prep': {
        keywords: ['ujian', 'exam', 'uts', 'uas', 'quiz', 'latihan', 'soal', 'test', 'midterm', 'final'],
        patterns: [/uts\s*\d{4}/i, /uas\s*\d{4}/i, /quiz\s*\d+/i, /latihan\s*soal/i],
        weight: 1.3
      },
      'project': {
        keywords: ['proyek', 'project', 'final', 'akhir', 'capstone', 'portfolio'],
        patterns: [/final\s*project/i, /proyek\s*akhir/i, /capstone\s*project/i],
        weight: 1.1
      },
      'reference': {
        keywords: ['referensi', 'reference', 'sumber', 'buku', 'ebook', 'textbook', 'pustaka'],
        patterns: [/e-?book/i, /text\s*book/i, /buku\s*referensi/i],
        weight: 0.9
      },
      'other': {
        keywords: [],
        patterns: [],
        weight: 0.5
      }
    };

    // Subject-specific keywords for better categorization
    this.subjectKeywords = {
      'programming': ['code', 'coding', 'program', 'algorithm', 'function', 'class', 'variable', 'loop'],
      'mathematics': ['calculus', 'algebra', 'geometry', 'integral', 'derivative', 'equation', 'matrix'],
      'database': ['sql', 'query', 'table', 'database', 'normalization', 'relation', 'schema'],
      'networking': ['network', 'tcp', 'ip', 'router', 'protocol', 'subnet', 'firewall'],
      'design': ['ui', 'ux', 'design', 'prototype', 'wireframe', 'mockup', 'interface']
    };

    // Common file type indicators
    this.fileTypeIndicators = {
      'lecture-notes': ['slides', 'ppt', 'pptx', 'pdf'],
      'assignment': ['doc', 'docx', 'submission'],
      'research': ['paper', 'journal', 'article'],
      'exam-prep': ['exam', 'quiz', 'test'],
      'project': ['project', 'zip', 'rar']
    };
  }

  /**
   * Categorize a document based on its metadata
   * @param {Object} document - Document object with title, tags, filename, etc.
   * @returns {Object} Category result with confidence score
   */
  categorize(document) {
    const scores = {};
    
    // Initialize scores
    Object.keys(this.categoryPatterns).forEach(category => {
      scores[category] = 0;
    });

    // Analyze title
    if (document.title) {
      this.analyzeText(document.title, scores, 2.0); // Title has higher weight
    }

    // Analyze filename
    if (document.filename) {
      this.analyzeText(document.filename, scores, 1.5);
      this.analyzeFileType(document.filename, scores);
    }

    // Analyze tags
    if (document.tags && Array.isArray(document.tags)) {
      document.tags.forEach(tag => {
        this.analyzeText(tag, scores, 1.2);
      });
    }

    // Analyze description if available
    if (document.description) {
      this.analyzeText(document.description, scores, 0.8);
    }

    // Find the category with highest score
    let bestCategory = 'other';
    let highestScore = 0;
    let totalScore = 0;

    Object.entries(scores).forEach(([category, score]) => {
      totalScore += score;
      if (score > highestScore) {
        highestScore = score;
        bestCategory = category;
      }
    });

    // Calculate confidence (0-1)
    const confidence = totalScore > 0 ? Math.min(highestScore / totalScore, 1) : 0;

    // Generate auto-tags
    const autoTags = this.generateAutoTags(document, bestCategory);

    // Detect subject
    const subject = this.detectSubject(document);

    return {
      category: bestCategory,
      confidence: Math.round(confidence * 100) / 100,
      scores: scores,
      autoTags: autoTags,
      subject: subject,
      metadata: {
        analyzedAt: new Date(),
        version: '1.0'
      }
    };
  }

  /**
   * Analyze text for category keywords and patterns
   */
  analyzeText(text, scores, weight = 1.0) {
    const lowerText = text.toLowerCase();

    Object.entries(this.categoryPatterns).forEach(([category, config]) => {
      // Check keywords
      config.keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          scores[category] += config.weight * weight;
        }
      });

      // Check patterns
      config.patterns.forEach(pattern => {
        if (pattern.test(text)) {
          scores[category] += config.weight * weight * 1.5; // Patterns are more specific
        }
      });
    });
  }

  /**
   * Analyze file type for category hints
   */
  analyzeFileType(filename, scores) {
    const extension = filename.split('.').pop().toLowerCase();
    
    Object.entries(this.fileTypeIndicators).forEach(([category, extensions]) => {
      if (extensions.includes(extension)) {
        scores[category] += 0.5;
      }
    });
  }

  /**
   * Generate auto-tags based on document content
   */
  generateAutoTags(document, category) {
    const tags = new Set();
    const text = `${document.title} ${document.filename} ${document.description || ''}`.toLowerCase();

    // Add category as a tag
    tags.add(category.replace('-', ' '));

    // Extract semester/year information
    const semesterMatch = text.match(/semester\s*(\d+)/i);
    if (semesterMatch) {
      tags.add(`semester ${semesterMatch[1]}`);
    }

    const yearMatch = text.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      tags.add(yearMatch[1]);
    }

    // Extract course codes (e.g., CS101, MTK203)
    const courseCodeMatch = text.match(/\b[A-Z]{2,4}\s*\d{3,4}\b/);
    if (courseCodeMatch) {
      tags.add(courseCodeMatch[0].toLowerCase());
    }

    // Add relevant keywords found
    Object.values(this.categoryPatterns).forEach(config => {
      config.keywords.forEach(keyword => {
        if (text.includes(keyword) && keyword.length > 3) {
          tags.add(keyword);
        }
      });
    });

    // Convert to array with confidence scores
    return Array.from(tags).map(tag => ({
      tag: tag,
      confidence: 0.8,
      source: 'auto-categorization'
    })).slice(0, 10); // Limit to 10 tags
  }

  /**
   * Detect subject based on content
   */
  detectSubject(document) {
    const text = `${document.title} ${document.filename} ${document.tags?.join(' ') || ''}`.toLowerCase();
    const subjectScores = {};

    Object.entries(this.subjectKeywords).forEach(([subject, keywords]) => {
      subjectScores[subject] = 0;
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          subjectScores[subject]++;
        }
      });
    });

    // Find subject with highest score
    let bestSubject = null;
    let highestScore = 0;

    Object.entries(subjectScores).forEach(([subject, score]) => {
      if (score > highestScore) {
        highestScore = score;
        bestSubject = subject;
      }
    });

    return highestScore > 0 ? bestSubject : null;
  }

  /**
   * Batch categorize multiple documents
   */
  batchCategorize(documents) {
    return documents.map(doc => ({
      documentId: doc._id,
      ...this.categorize(doc)
    }));
  }

  /**
   * Re-categorize based on user feedback
   */
  improveCategory(document, userCategory) {
    // This would typically update a learning model
    // For now, we just return the user's category with high confidence
    return {
      category: userCategory,
      confidence: 1.0,
      source: 'user-verified',
      autoTags: this.generateAutoTags(document, userCategory)
    };
  }
}

// Export singleton instance
export default new AutoCategorizationService();