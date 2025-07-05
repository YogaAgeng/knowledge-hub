class ContentProcessor {
  // Main processing method for imported files
  static async processImportedFile(fileData, userId, source = 'google-drive') {
    try {
      // Clean and normalize content
      const cleanedContent = this.cleanText(fileData.content);
      
      // Auto-detect document type based on content and filename
      const documentType = this.detectDocumentType(cleanedContent, fileData.name);
      
      // Extract meaningful tags from content
      const tags = this.extractTags(cleanedContent, fileData.name, source);
      
      // Generate or clean title
      const title = this.generateTitle(fileData.name, cleanedContent);
      
      // Validate content length
      if (cleanedContent.length < 10) {
        throw new Error('Content too short to import');
      }
      
      return {
        title,
        content: cleanedContent,
        type: documentType,
        tags,
        metadata: {
          source,
          originalName: fileData.name,
          mimeType: fileData.mimeType,
          originalSize: fileData.size,
          importedAt: new Date(),
          importedBy: userId,
          wordCount: this.getWordCount(cleanedContent)
        }
      };
    } catch (error) {
      console.error('Content processing error:', error);
      throw new Error('Content processing failed: ' + error.message);
    }
  }

  // Detect document type based on content analysis
  static detectDocumentType(content, filename = '') {
    const lowerContent = content.toLowerCase();
    const lowerFilename = filename.toLowerCase();
    
    // Filename pattern matching first (most reliable)
    const filenamePatterns = {
      tugas: ['tugas', 'assignment', 'homework', 'exercise', 'soal', 'latihan'],
      makalah: ['makalah', 'paper', 'research', 'thesis', 'skripsi', 'jurnal'],
      catatan: ['catatan', 'notes', 'lecture', 'kuliah', 'materi', 'summary']
    };
    
    for (const [type, patterns] of Object.entries(filenamePatterns)) {
      if (patterns.some(pattern => lowerFilename.includes(pattern))) {
        return type;
      }
    }
    
    // Content pattern analysis
    const contentPatterns = {
      tugas: {
        keywords: ['assignment', 'homework', 'task', 'exercise', 'problem set', 'tugas', 'soal', 'latihan', 'jawaban'],
        weight: 1
      },
      makalah: {
        keywords: [
          'abstract', 'abstrak', 'introduction', 'pendahuluan', 'methodology', 'metodologi',
          'conclusion', 'kesimpulan', 'references', 'daftar pustaka', 'bibliography',
          'research', 'penelitian', 'study', 'analisis', 'analysis', 'hasil', 'pembahasan'
        ],
        weight: 2
      },
      catatan: {
        keywords: [
          'notes', 'catatan', 'lecture', 'kuliah', 'perkuliahan', 'materi',
          'summary', 'ringkasan', 'meeting', 'class', 'kelas', 'bab', 'chapter'
        ],
        weight: 1
      }
    };
    
    let maxScore = 0;
    let detectedType = 'catatan';
    
    for (const [type, pattern] of Object.entries(contentPatterns)) {
      let score = 0;
      pattern.keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = (lowerContent.match(regex) || []).length;
        score += matches * pattern.weight;
      });
      
      if (score > maxScore) {
        maxScore = score;
        detectedType = type;
      }
    }
    
    return detectedType;
  }

  // Extract relevant tags from content
  static extractTags(content, filename, source) {
    const tags = new Set();
    
    // Add source tag
    tags.add(source);
    
    // Academic subjects detection
    const academicSubjects = {
      'programming': [
        'programming', 'pemrograman', 'code', 'coding', 'algorithm', 'algoritma',
        'function', 'variable', 'loop', 'array', 'class', 'object'
      ],
      'database': [
        'database', 'basis data', 'sql', 'mysql', 'query', 'table', 'tabel',
        'record', 'data', 'normalisasi', 'erd', 'relation'
      ],
      'networking': [
        'network', 'jaringan', 'protocol', 'tcp', 'ip', 'router', 'switch',
        'internet', 'wifi', 'lan', 'wan', 'topology'
      ],
      'web-development': [
        'html', 'css', 'javascript', 'web', 'website', 'browser', 'frontend',
        'backend', 'react', 'node', 'server', 'api'
      ],
      'artificial-intelligence': [
        'artificial intelligence', 'ai', 'machine learning', 'neural network',
        'deep learning', 'data mining', 'pattern recognition'
      ],
      'mathematics': [
        'mathematics', 'matematika', 'equation', 'persamaan', 'formula',
        'calculation', 'statistik', 'probability', 'aljabar', 'kalkulus'
      ],
      'software-engineering': [
        'software engineering', 'rekayasa perangkat lunak', 'sdlc', 'testing',
        'deployment', 'documentation', 'uml', 'design pattern'
      ]
    };
    
    const combinedText = (content + ' ' + filename).toLowerCase();
    
    // Check for academic subjects
    for (const [subject, keywords] of Object.entries(academicSubjects)) {
      const matchCount = keywords.filter(keyword => 
        combinedText.includes(keyword.toLowerCase())
      ).length;
      
      if (matchCount >= 2) {
        tags.add(subject);
      }
    }
    
    // Programming languages detection
    const programmingLanguages = [
      'python', 'javascript', 'java', 'cpp', 'c++', 'php', 'ruby', 'go',
      'typescript', 'kotlin', 'swift', 'rust', 'scala'
    ];
    
    programmingLanguages.forEach(lang => {
      if (combinedText.includes(lang)) {
        tags.add(lang);
      }
    });
    
    // Academic terms
    const academicTerms = [
      'assignment', 'tugas', 'homework', 'lecture', 'kuliah', 'exam', 'ujian',
      'quiz', 'project', 'thesis', 'skripsi', 'research', 'penelitian'
    ];
    
    academicTerms.forEach(term => {
      if (combinedText.includes(term)) {
        tags.add(term);
      }
    });
    
    // Limit tags and return as array
    return Array.from(tags).slice(0, 8);
  }

  // Generate appropriate title
  static generateTitle(filename, content) {
    // Clean filename (remove extension and unwanted characters)
    let title = filename
      .replace(/\.[^/.]+$/, '') // remove extension
      .replace(/[_-]/g, ' ') // replace underscores and dashes with spaces
      .trim();
    
    // If filename is not descriptive, extract from content
    if (title.length < 5 || /^(document|file|untitled|new|doc)/i.test(title)) {
      const contentLines = content.split('\n').filter(line => line.trim().length > 5);
      
      if (contentLines.length > 0) {
        // Look for headers or first meaningful line
        const firstLine = contentLines[0].trim();
        // Remove markdown headers if present
        title = firstLine.replace(/^#+\s*/, '').substring(0, 100);
      }
    }
    
    // Final cleanup
    title = title
      .replace(/\s+/g, ' ') // normalize spaces
      .trim()
      .substring(0, 100); // limit length
    
    return title || 'Imported Document';
  }

  // Clean and normalize text content
  static cleanText(content) {
    if (typeof content !== 'string') {
      return '';
    }
    
    return content
      .replace(/\r\n/g, '\n')           // normalize line endings
      .replace(/\n{3,}/g, '\n\n')       // remove excessive line breaks
      .replace(/\t/g, '    ')           // convert tabs to spaces
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width characters
      .trim();
  }

  // Get word count
  static getWordCount(content) {
    if (!content || typeof content !== 'string') {
      return 0;
    }
    
    return content
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  }

  // Validate content for academic use
  static validateAcademicContent(content, type) {
    const minWordCounts = {
      tugas: 50,     // minimum for assignment
      makalah: 200,  // minimum for academic paper
      catatan: 20    // minimum for notes
    };
    
    const wordCount = this.getWordCount(content);
    const minRequired = minWordCounts[type] || 20;
    
    if (wordCount < minRequired) {
      return {
        valid: false,
        reason: `Content too short for ${type}. Minimum ${minRequired} words required, got ${wordCount}.`
      };
    }
    
    // Check for meaningful content (not just repeated characters)
    const uniqueWords = new Set(content.toLowerCase().split(/\s+/)).size;
    if (uniqueWords < wordCount * 0.3) {
      return {
        valid: false,
        reason: 'Content appears to be repetitive or low quality.'
      };
    }
    
    return { valid: true };
  }

  // Batch process multiple files
  static async processBatch(fileDataArray, userId, source) {
    const results = [];
    const errors = [];
    
    for (const fileData of fileDataArray) {
      try {
        const processed = await this.processImportedFile(fileData, userId, source);
        
        // Validate academic content
        const validation = this.validateAcademicContent(processed.content, processed.type);
        if (!validation.valid) {
          errors.push({
            filename: fileData.name,
            error: validation.reason
          });
          continue;
        }
        
        results.push(processed);
      } catch (error) {
        errors.push({
          filename: fileData.name,
          error: error.message
        });
      }
    }
    
    return { results, errors };
  }
}

const contentProcessor = new ContentProcessor();
export default ContentProcessor;