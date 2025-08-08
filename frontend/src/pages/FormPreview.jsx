import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDrag, useDrop } from 'react-dnd'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Draggable Item Component
const DraggableItem = ({ item, index, questionIndex }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'item',
    item: { item, index, questionIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  return (
    <div
      ref={drag}
      className={`px-3 py-2 bg-gray-100 text-gray-800 rounded-lg cursor-move border ${isDragging ? 'opacity-50' : ''
        }`}
    >
      {item.text}
    </div>
  )
}

// Draggable Option Component for Cloze
const DraggableOption = ({ option, index, isUsed }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'cloze-option',
    item: { text: option.text || option, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isUsed,
  })

  return (
    <div
      ref={drag}
      className={`draggable-item ${isDragging
        ? 'opacity-50 scale-95'
        : isUsed
          ? 'opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
          : 'cursor-move'
        }`}
      title={isUsed ? 'Already used' : 'Drag to a blank'}
    >
      {option.text || option}
    </div>
  )
}

// Drop Zone Blank Component for Cloze
const DropZoneBlank = ({ blankIndex, questionIndex, currentAnswer, onDrop, onClear }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'cloze-option',
    drop: (item) => {
      onDrop(item)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  return (
    <div
      ref={drop}
      className={`drop-zone ${isOver
        ? 'drop-zone-hover'
        : currentAnswer
          ? 'drop-zone-filled'
          : 'drop-zone-empty'
        }`}
    >
      {currentAnswer ? (
        <div className="flex items-center space-x-1">
          <span className="text-blue-800 font-medium">{currentAnswer}</span>
          <button
            onClick={onClear}
            className="text-red-500 hover:text-red-700 text-xs"
            title="Clear answer"
          >
            ×
          </button>
        </div>
      ) : (
        <span className="text-gray-400 text-sm">
          {isOver ? 'Drop here' : '______'}
        </span>
      )}
    </div>
  )
}

// Drop Zone Component
const DropZone = ({ category, categoryIndex, questionIndex, onDrop, items }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'item',
    drop: (draggedItem) => {
      if (draggedItem.questionIndex === questionIndex) {
        onDrop(draggedItem.item, category)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  const categoryItems = items.filter(item => item.category === category)

  return (
    <div
      ref={drop}
      className={`px-4 py-3 bg-blue-50 border-2 border-dashed rounded-lg min-h-[80px] ${isOver ? 'border-blue-500 bg-blue-100' : 'border-blue-300'
        }`}
    >
      <div className="font-medium text-blue-800 mb-2">{category}</div>
      <div className="space-y-1">
        {categoryItems.map((item, index) => (
          <div
            key={index}
            className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-sm"
          >
            {item.text}
          </div>
        ))}
      </div>
    </div>
  )
}

const FormPreview = () => {
  const { id } = useParams()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState({})
  const [showAnswers, setShowAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState(null)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    fetchForm()
  }, [id])

  const fetchForm = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/forms/${id}`)
      console.log('Fetched form data:', response.data)

      // Debug each question
      response.data.questions.forEach((q, index) => {
        console.log(`Question ${index + 1} (${q.type}):`, {
          title: q.title,
          sentence: q.sentence,
          blanks: q.blanks,
          options: q.options
        })
      })

      setForm(response.data)
      initializeAnswers(response.data)
    } catch (error) {
      console.error('Error fetching form:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializeAnswers = (formData) => {
    const initialAnswers = {}
    formData.questions.forEach((question, qIndex) => {
      if (question.type === 'categorize') {
        initialAnswers[qIndex] = {
          items: question.items.map(item => ({
            text: item.text,
            category: '', // Start with empty category for user to fill
            originalCategory: item.category // Keep track of correct answer
          }))
        }
      } else if (question.type === 'cloze') {
        initialAnswers[qIndex] = {
          blanks: (question.blanks || []).map(() => '')
        }
      } else if (question.type === 'comprehension') {
        initialAnswers[qIndex] = {
          subAnswers: (Array.isArray(question.subQuestions) ? question.subQuestions : []).map(() => '')
        }
      }
    })
    setAnswers(initialAnswers)
  }

  const handleCategorizeAnswer = (questionIndex, item, category) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: {
        ...prev[questionIndex],
        items: prev[questionIndex].items.map(i =>
          i.text === item.text ? { ...i, category } : i
        )
      }
    }))
  }

  const handleClozeAnswer = (questionIndex, blankIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: {
        ...prev[questionIndex],
        blanks: prev[questionIndex].blanks.map((blank, index) =>
          index === blankIndex ? value : blank
        )
      }
    }))
  }

  const handleComprehensionAnswer = (questionIndex, subQuestionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: {
        ...prev[questionIndex],
        subAnswers: prev[questionIndex].subAnswers.map((answer, index) =>
          index === subQuestionIndex ? value : answer
        )
      }
    }))
  }

  const checkAnswers = (questionIndex) => {
    const question = form.questions[questionIndex]
    const userAnswer = answers[questionIndex]

    if (!userAnswer) return false

    if (question.type === 'categorize') {
      // Check if all items have been categorized
      const allCategorized = userAnswer.items.every(item => item.category !== '')
      if (!allCategorized) return false

      // Check if all categorizations are correct
      const correct = userAnswer.items.every(userItem => {
        return userItem.originalCategory === userItem.category
      })
      return correct
    } else if (question.type === 'cloze') {
      // Check if all blanks are filled
      const blanks = question.blanks || []
      const userBlanks = userAnswer.blanks || []

      if (blanks.length === 0) return false

      const allFilled = userBlanks.every(blank => blank.trim() !== '')
      if (!allFilled) return false

      // Check if all answers are correct
      return userBlanks.every((blank, index) =>
        blank.toLowerCase().trim() === blanks[index]?.toLowerCase().trim()
      )
    } else if (question.type === 'comprehension') {
      // Check if all sub-questions are answered correctly
      return userAnswer.subAnswers.every((answer, index) => {
        const subQuestion = question.subQuestions[index]
        if (subQuestion.questionType === 'mcq' || subQuestion.questionType === 'mca') {
          return answer === subQuestion.correctAnswer
        } else if (subQuestion.questionType === 'short') {
          // For short answers, we'll consider any non-empty answer as potentially correct
          return answer.trim() !== ''
        }
        return false
      })
    }
    return false
  }

  const getCompletionStatus = (questionIndex) => {
    const question = form.questions[questionIndex]
    const userAnswer = answers[questionIndex]

    if (!userAnswer) return { completed: false, total: 0, answered: 0 }

    if (question.type === 'categorize') {
      const total = question.items.length
      const answered = userAnswer.items.filter(item => item.category !== '').length
      return { completed: answered === total, total, answered }
    } else if (question.type === 'cloze') {
      const total = (question.blanks || []).length
      const answered = (userAnswer.blanks || []).filter(blank => blank.trim() !== '').length
      return { completed: answered === total, total, answered }
    } else if (question.type === 'comprehension') {
      const total = question.subQuestions.length
      const answered = userAnswer.subAnswers.filter(answer => answer.trim() !== '').length
      return { completed: answered === total, total, answered }
    }
    return { completed: false, total: 0, answered: 0 }
  }

  // Removed toggleShowAnswer function - no longer showing answers during preview

  const submitAnswers = async () => {
    setSubmitting(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/api/forms/${id}/check-answers`, { answers })
      setResults(response.data)
      setShowResults(true)
    } catch (error) {
      console.error('Error submitting answers:', error)
      alert('Error submitting answers. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setResults(null)
    setShowResults(false)
    initializeAnswers(form)
  }

  const renderQuestion = (question, index) => {
    return (
      <div key={index} className="question-card">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">
            Question {index + 1}: {question.title}
          </h3>
          {question.description && (
            <p className="text-gray-300 mb-3">{question.description}</p>
          )}
          {question.image && (
            <img
              src={question.image}
              alt="Question"
              className="w-full max-w-md h-48 object-cover rounded-lg mb-4"
            />
          )}
        </div>

        {question.type === 'categorize' && (
          <div>
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Drag items to their correct categories:</h4>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {question.categories.map((category, catIndex) => (
                  <DropZone
                    key={catIndex}
                    category={category}
                    categoryIndex={catIndex}
                    questionIndex={index}
                    onDrop={(item, cat) => handleCategorizeAnswer(index, item, cat)}
                    items={answers[index]?.items || []}
                  />
                ))}
              </div>
            </div>
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Items to categorize:</h4>
              <div className="flex flex-wrap gap-2">
                {question.items
                  .filter(item => !answers[index]?.items?.find(a => a.text === item.text && a.category))
                  .map((item, itemIndex) => (
                    <DraggableItem
                      key={itemIndex}
                      item={item}
                      index={itemIndex}
                      questionIndex={index}
                    />
                  ))}
              </div>
              {question.items.every(item =>
                answers[index]?.items?.find(a => a.text === item.text && a.category)
              ) && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ All items have been categorized
                  </div>
                )}
            </div>
          </div>
        )}

        {question.type === 'cloze' && (
          <div>
            {!question.sentence ? (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-600 rounded-lg">
                <p className="text-red-400">No sentence found for this Cloze question.</p>
              </div>
            ) : !question.blanks || question.blanks.length === 0 ? (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700">No blanks selected for this Cloze question.</p>
                <p className="text-sm text-yellow-600 mt-1">The sentence will be displayed as-is: "{question.sentence}"</p>
              </div>
            ) : (
              <div>
                <h4 className="font-medium text-gray-200 mb-3">Complete the sentence:</h4>

                {/* Interactive Sentence with Drag-Drop Blanks */}
                <div className="mb-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <div className="text-lg leading-relaxed text-gray-100">
                    {question.sentence.split(/(\s+)/).map((part, partIndex) => {
                      // Handle whitespace
                      if (part.match(/^\s+$/)) {
                        return <span key={partIndex}>{part}</span>
                      }

                      // Handle words
                      const cleanWord = part.replace(/[.,!?;:]$/, '')
                      const punctuation = part.match(/[.,!?;:]$/) ? part.match(/[.,!?;:]$/)[0] : ''
                      const isBlank = question.blanks && question.blanks.includes(cleanWord)

                      if (isBlank) {
                        const blankIndex = question.blanks.findIndex(blank => blank === cleanWord)
                        const currentAnswer = answers[index]?.blanks?.[blankIndex] || ''
                        return (
                          <span key={partIndex} className="inline-block">
                            <DropZoneBlank
                              blankIndex={blankIndex}
                              questionIndex={index}
                              currentAnswer={currentAnswer}
                              onDrop={(item) => handleClozeAnswer(index, blankIndex, item.text)}
                              onClear={() => handleClozeAnswer(index, blankIndex, '')}
                            />
                            {punctuation}
                          </span>
                        )
                      }

                      return <span key={partIndex}>{part}</span>
                    })}
                  </div>
                </div>

                {/* Draggable Options */}
                {question.options && question.options.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-200 mb-2">Available Words:</h4>
                    <div className="p-4 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg">
                      <div className="flex flex-wrap gap-3">
                        {question.options.map((option, optIndex) => (
                          <DraggableOption
                            key={optIndex}
                            option={option}
                            index={optIndex}
                            isUsed={answers[index]?.blanks?.includes(option.text || option)}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      Drag the words above to fill in the blanks in the sentence
                    </div>
                  </div>
                )}

                {/* Progress Indicator */}
                {question.blanks && question.blanks.length > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>Progress:</span>
                      <span>{(answers[index]?.blanks || []).filter(b => b).length} / {question.blanks.length} completed</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${((answers[index]?.blanks || []).filter(b => b).length / question.blanks.length) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {question.type === 'comprehension' && (
          <div>
            {question.instructions && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Instructions:</h4>
                <p className="text-gray-700">{question.instructions}</p>
              </div>
            )}

            {question.passage && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Passage:</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 whitespace-pre-wrap">{question.passage}</p>
                </div>
              </div>
            )}

            {question.media && (
              <div className="mb-4">
                <img
                  src={question.media}
                  alt="Comprehension media"
                  className="w-full max-w-md h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {question.timer > 0 && (
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  Timer: {question.timer} minutes
                </span>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-800 mb-3">Questions:</h4>
              <div className="space-y-4">
                {(Array.isArray(question.subQuestions) ? question.subQuestions : []).map((subQ, subIndex) => (
                  <div key={subIndex} className="border border-gray-200 rounded-lg p-4">
                    <p className="font-medium text-gray-800 mb-2">
                      {subIndex + 1}. {subQ.question}
                    </p>

                    {(subQ.questionType === 'mcq' || subQ.questionType === 'mca') && (
                      <div className="space-y-2">
                        {subQ.options.map((option, optIndex) => (
                          <label key={optIndex} className="flex items-center space-x-2">
                            <input
                              type={subQ.questionType === 'mcq' ? 'radio' : 'checkbox'}
                              name={`sub-${index}-${subIndex}`}
                              value={option}
                              checked={answers[index]?.subAnswers?.[subIndex] === option}
                              onChange={(e) => handleComprehensionAnswer(index, subIndex, e.target.value)}
                              className="form-radio text-primary-600"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {subQ.questionType === 'short' && (
                      <textarea
                        value={answers[index]?.subAnswers?.[subIndex] || ''}
                        onChange={(e) => handleComprehensionAnswer(index, subIndex, e.target.value)}
                        className="input-field mt-2"
                        rows={3}
                        placeholder="Enter your answer here..."
                      />
                    )}

                    <div className="mt-2 text-sm text-gray-500">
                      Points: {subQ.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                {/* Individual question checking removed for cleaner experience */}
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset your answers for this question?')) {
                      const question = form.questions[index]
                      let resetAnswer = {}

                      if (question.type === 'categorize') {
                        resetAnswer = {
                          items: question.items.map(item => ({
                            text: item.text,
                            category: '',
                            originalCategory: item.category
                          }))
                        }
                      } else if (question.type === 'cloze') {
                        resetAnswer = {
                          blanks: (question.blanks || []).map(() => '')
                        }
                      } else if (question.type === 'comprehension') {
                        resetAnswer = {
                          subAnswers: (Array.isArray(question.subQuestions) ? question.subQuestions : []).map(() => '')
                        }
                      }

                      setAnswers(prev => ({
                        ...prev,
                        [index]: resetAnswer
                      }))
                    }
                  }}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                >
                  Reset
                </button>
              </div>
              <div className="flex items-center space-x-2">
                {(() => {
                  const status = getCompletionStatus(index)
                  return (
                    <span className={`text-sm px-2 py-1 rounded ${status.completed
                      ? 'bg-green-900/30 text-green-400 border border-green-600'
                      : 'bg-yellow-900/30 text-yellow-400 border border-yellow-600'
                      }`}>
                      {status.answered}/{status.total} completed
                    </span>
                  )
                })()}
              </div>
            </div>
            <span className="text-sm text-gray-400">Points: {question.points}</span>
          </div>

          {/* Show answers section removed for cleaner preview experience */}

          {question.feedback && (
            <div className="text-sm text-gray-300">
              <span className="font-medium">Feedback:</span> {question.feedback}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Form not found</h2>
          <Link to="/forms" className="btn-primary">
            Back to Forms
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="form-container">
          <div className="mb-6">
            <Link to="/forms" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
              ← Back to Forms
            </Link>

            <div className="mb-6">
              {form.headerImage && (
                <img
                  src={form.headerImage}
                  alt={form.title}
                  className="w-full h-48 object-cover rounded-lg mb-6"
                />
              )}
              <h1 className="text-3xl font-bold text-gray-100 mb-4">{form.title}</h1>
              {form.description && (
                <p className="text-lg text-gray-300 mb-4">{form.description}</p>
              )}
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>{form.questions.length} questions</span>
                <span>Created: {new Date(form.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {(Array.isArray(form.questions) ? form.questions : []).map((question, index) => renderQuestion(question, index))}
          </div>

          {/* Submit Section */}
          {!showResults ? (
            <div className="mt-8 text-center">
              <button
                onClick={submitAnswers}
                disabled={submitting}
                className="btn-primary mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Form'}
              </button>
              <Link to="/forms" className="btn-secondary">
                Back to Forms
              </Link>
            </div>
          ) : (
            /* Results Section */
            <div className="mt-8">
              <div className="card bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    🎉 Form Submitted Successfully!
                  </h2>
                  <div className="text-lg">
                    <span className="font-semibold">Score: </span>
                    <span className={`font-bold ${results.percentage >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                      {results.totalScore}/{results.maxScore} ({results.percentage}%)
                    </span>
                  </div>
                  <div className={`mt-2 text-sm font-medium ${results.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {results.passed ? '✅ Passed!' : '❌ Failed (60% required to pass)'}
                  </div>
                </div>

                {/* Detailed Results */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Question Results:</h3>
                  {results.results.map((result, index) => (
                    <div key={index} className={`p-4 rounded-lg border-2 ${result.isCorrect
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                      }`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">
                          Question {index + 1}: {form.questions[index].title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${result.isCorrect ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {result.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                          </span>
                          <span className="text-sm text-gray-600">
                            {result.score}/{result.maxScore} pts
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{result.feedback}</p>

                      {/* Show correct answers for Cloze questions */}
                      {result.questionType === 'cloze' && result.correctAnswer && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <span className="text-sm font-medium text-yellow-800">Correct answers: </span>
                          <span className="text-sm text-yellow-700">
                            {result.correctAnswer.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 text-center space-x-4">
                  <button
                    onClick={resetForm}
                    className="btn-primary"
                  >
                    Try Again
                  </button>
                  <Link to="/forms" className="btn-secondary">
                    Back to Forms
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FormPreview
