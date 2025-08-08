const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get all forms
router.get('/', async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single form
router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new form
router.post('/', async (req, res) => {
  try {
    console.log('Creating new form...');
    console.log('Form title:', req.body.title);
    console.log('Number of questions:', req.body.questions?.length || 0);
    
    // Log each question type and structure
    if (req.body.questions) {
      req.body.questions.forEach((q, index) => {
        console.log(`Question ${index + 1}: ${q.type}`);
        if (q.type === 'cloze') {
          console.log(`  - Sentence: ${q.sentence ? 'present' : 'missing'}`);
          console.log(`  - Blanks: ${Array.isArray(q.blanks) ? q.blanks.length : 'not array'}`);
          console.log(`  - Options: ${Array.isArray(q.options) ? q.options.length : 'not array'}`);
          if (Array.isArray(q.options)) {
            q.options.forEach((opt, i) => {
              console.log(`    Option ${i}: ${typeof opt} - ${JSON.stringify(opt)}`);
            });
          }
        }
        if (q.type === 'comprehension') {
          console.log(`  - SubQuestions: ${Array.isArray(q.subQuestions) ? q.subQuestions.length : 'not array'}`);
          if (Array.isArray(q.subQuestions)) {
            q.subQuestions.forEach((sub, i) => {
              console.log(`    SubQ ${i}: ${sub.questionType} - ${typeof sub}`);
            });
          }
        }
      });
    }
    
    const form = new Form(req.body);
    const savedForm = await form.save();
    
    console.log('Form saved successfully:', savedForm._id);
    res.status(201).json(savedForm);
  } catch (error) {
    console.error('Error creating form:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
      const validationErrors = Object.values(error.errors).map(err => {
        console.error(`Validation error at ${err.path}:`, err.message);
        return `${err.path}: ${err.message}`;
      });
      res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors,
        details: error.message 
      });
    } else if (error.name === 'CastError') {
      console.error('Cast error:', error);
      res.status(400).json({ 
        message: 'Data type error', 
        details: `Failed to cast ${error.value} to ${error.kind} at path ${error.path}`,
        path: error.path,
        value: error.value
      });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Update form
router.put('/:id', async (req, res) => {
  try {
    console.log('Updating form:', req.params.id, JSON.stringify(req.body, null, 2));
    
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    
    console.log('Form updated successfully:', form._id);
    res.json(form);
  } catch (error) {
    console.error('Error updating form:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors,
        details: error.message 
      });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Delete form
router.delete('/:id', async (req, res) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload image
router.post('/upload', upload.single('image'), async (req, res) => {
  console.log('Upload request received');
  console.log('File:', req.file ? req.file.originalname : 'No file');
  console.log('Cloudinary config:', {
    cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
    api_key: !!process.env.CLOUDINARY_API_KEY,
    api_secret: !!process.env.CLOUDINARY_API_SECRET
  });

  try {
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log('Cloudinary not configured');
      return res.status(500).json({ 
        message: 'Image upload not configured. Please set up Cloudinary credentials in .env file' 
      });
    }

    console.log('Starting Cloudinary upload...');
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          resource_type: 'auto',
          folder: 'form-maker' // Optional: organize uploads in a folder
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary error:', error);
            reject(error);
          } else {
            console.log('Cloudinary success:', result.secure_url);
            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Failed to upload image: ' + error.message });
  }
});

// Check answers for a form
router.post('/:id/check-answers', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    const { answers } = req.body;
    const results = [];
    let totalScore = 0;
    let maxScore = 0;

    form.questions.forEach((question, questionIndex) => {
      const userAnswer = answers[questionIndex];
      let isCorrect = false;
      let score = 0;
      let feedback = '';

      maxScore += question.points || 1;

      if (question.type === 'cloze') {
        if (userAnswer && userAnswer.blanks) {
          const correctBlanks = question.blanks || [];
          const userBlanks = userAnswer.blanks || [];
          
          // Check if all blanks are filled correctly
          const correctCount = correctBlanks.filter((correctBlank, index) => {
            const userBlank = userBlanks[index];
            return userBlank && userBlank.toLowerCase().trim() === correctBlank.toLowerCase().trim();
          }).length;

          isCorrect = correctCount === correctBlanks.length && userBlanks.every(blank => blank.trim() !== '');
          score = isCorrect ? (question.points || 1) : Math.floor((correctCount / correctBlanks.length) * (question.points || 1));
          
          feedback = isCorrect 
            ? 'Perfect! All blanks filled correctly.' 
            : `${correctCount}/${correctBlanks.length} blanks correct.`;
        } else {
          feedback = 'No answers provided.';
        }
      } else if (question.type === 'categorize') {
        if (userAnswer && userAnswer.items) {
          const correctCount = userAnswer.items.filter(item => 
            item.category === item.originalCategory
          ).length;
          
          isCorrect = correctCount === question.items.length;
          score = isCorrect ? (question.points || 1) : Math.floor((correctCount / question.items.length) * (question.points || 1));
          
          feedback = isCorrect 
            ? 'Perfect! All items categorized correctly.' 
            : `${correctCount}/${question.items.length} items correct.`;
        } else {
          feedback = 'No answers provided.';
        }
      } else if (question.type === 'comprehension') {
        if (userAnswer && userAnswer.subAnswers) {
          const correctCount = question.subQuestions.filter((subQ, index) => {
            const userSubAnswer = userAnswer.subAnswers[index];
            if (subQ.questionType === 'mcq' || subQ.questionType === 'mca') {
              return userSubAnswer === subQ.correctAnswer;
            } else if (subQ.questionType === 'short') {
              return userSubAnswer && userSubAnswer.trim() !== '';
            }
            return false;
          }).length;

          isCorrect = correctCount === question.subQuestions.length;
          score = isCorrect ? (question.points || 1) : Math.floor((correctCount / question.subQuestions.length) * (question.points || 1));
          
          feedback = isCorrect 
            ? 'Perfect! All sub-questions answered correctly.' 
            : `${correctCount}/${question.subQuestions.length} sub-questions correct.`;
        } else {
          feedback = 'No answers provided.';
        }
      }

      totalScore += score;
      results.push({
        questionIndex,
        questionType: question.type,
        isCorrect,
        score,
        maxScore: question.points || 1,
        feedback,
        correctAnswer: question.type === 'cloze' ? question.blanks : null
      });
    });

    res.json({
      results,
      totalScore,
      maxScore,
      percentage: Math.round((totalScore / maxScore) * 100),
      passed: (totalScore / maxScore) >= 0.6 // 60% pass rate
    });

  } catch (error) {
    console.error('Error checking answers:', error);
    res.status(500).json({ message: error.message });
  }
});

// Test endpoint to check if upload route is accessible
router.get('/test-upload', (req, res) => {
  res.json({ 
    message: 'Upload endpoint is accessible',
    cloudinary_configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  });
});

module.exports = router;