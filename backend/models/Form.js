const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['categorize', 'cloze', 'comprehension'],
    required: true
  },
  title: String,
  description: String,
  points: {
    type: Number,
    default: 1
  },
  feedback: String,
  image: String,
  
  // Categorize specific fields
  categories: [String],
  items: [{
    text: String,
    category: String,
    order: Number
  }],
  
  // Cloze specific fields
  sentence: String,
  blanks: [String],
  options: [{
    text: String,
    order: Number
  }],
  
  // Comprehension specific fields
  instructions: String,
  passage: String,
  media: String,
  timer: {
    type: Number,
    default: 0
  },
  subQuestions: [{
    questionType: {
      type: String,
      enum: ['mcq', 'mca', 'short'],
      default: 'mcq'
    },
    question: String,
    options: [String],
    correctAnswer: String,
    points: {
      type: Number,
      default: 1
    }
  }]
});

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  headerImage: String,
  questions: [questionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

formSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Form', formSchema);