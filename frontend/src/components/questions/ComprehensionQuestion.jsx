import React from 'react'
import ImageUpload from '../ImageUpload'

const ComprehensionQuestion = ({ question, onChange, onDelete }) => {
  const updateField = (field, value) => {
    onChange({ ...question, [field]: value })
  }

  const addSubQuestion = () => {
    const newSubQuestion = {
      questionType: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1
    }
    updateField('subQuestions', [...question.subQuestions, newSubQuestion])
  }

  const updateSubQuestion = (index, field, value) => {
    const newSubQuestions = [...question.subQuestions]
    newSubQuestions[index] = { ...newSubQuestions[index], [field]: value }
    updateField('subQuestions', newSubQuestions)
  }

  const updateSubQuestionOption = (subIndex, optionIndex, value) => {
    const newSubQuestions = [...question.subQuestions]
    const newOptions = [...newSubQuestions[subIndex].options]
    newOptions[optionIndex] = value
    newSubQuestions[subIndex] = { ...newSubQuestions[subIndex], options: newOptions }
    updateField('subQuestions', newSubQuestions)
  }

  const removeSubQuestion = (index) => {
    const newSubQuestions = question.subQuestions.filter((_, i) => i !== index)
    updateField('subQuestions', newSubQuestions)
  }

  const moveOption = (subIndex, fromIndex, toIndex) => {
    const newSubQuestions = [...question.subQuestions]
    const currentOptions = [...newSubQuestions[subIndex].options]
    
    if (toIndex < 0 || toIndex >= currentOptions.length) return
    
    const [movedOption] = currentOptions.splice(fromIndex, 1)
    currentOptions.splice(toIndex, 0, movedOption)
    
    newSubQuestions[subIndex] = { ...newSubQuestions[subIndex], options: currentOptions }
    updateField('subQuestions', newSubQuestions)
  }

  return (
    <div className="question-card border-l-4 border-l-purple-500">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-100">Comprehension Question</h3>
        <button
          onClick={onDelete}
          className="text-red-400 hover:text-red-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Question Title
          </label>
          <input
            type="text"
            value={question.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="input-field"
            placeholder="Enter question title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Instructions
          </label>
          <textarea
            value={question.instructions}
            onChange={(e) => updateField('instructions', e.target.value)}
            className="input-field"
            rows={2}
            placeholder="Enter instructions for the comprehension"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Passage
          </label>
          <textarea
            value={question.passage}
            onChange={(e) => updateField('passage', e.target.value)}
            className="input-field"
            rows={6}
            placeholder="Enter the reading passage"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media (Image/Video)
          </label>
          <ImageUpload
            value={question.media}
            onChange={(url) => updateField('media', url)}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timer (minutes, 0 for no timer)
            </label>
            <input
              type="number"
              value={question.timer || ''}
              onChange={(e) => updateField('timer', e.target.value === '' ? '' : parseInt(e.target.value))}
              className="input-field"
              min="0"
              placeholder="0 for no timer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Points
            </label>
            <input
              type="number"
              value={question.points || ''}
              onChange={(e) => updateField('points', e.target.value === '' ? '' : parseInt(e.target.value))}
              className="input-field"
              min="1"
              placeholder="Enter points"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Sub Questions
            </label>
            <button
              onClick={addSubQuestion}
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              + Add Question
            </button>
          </div>

          <div className="space-y-4">
            {question.subQuestions.map((subQuestion, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-md font-medium text-gray-800">
                    Question {index + 1}
                  </h4>
                  <button
                    onClick={() => removeSubQuestion(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Type
                      </label>
                      <select
                        value={subQuestion.questionType}
                        onChange={(e) => updateSubQuestion(index, 'questionType', e.target.value)}
                        className="input-field"
                      >
                        <option value="mcq">Multiple Choice (Single)</option>
                        <option value="mca">Multiple Choice (Multiple)</option>
                        <option value="short">Short Text</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Points
                      </label>
                      <input
                        type="number"
                        value={subQuestion.points || ''}
                        onChange={(e) => updateSubQuestion(index, 'points', e.target.value === '' ? '' : parseInt(e.target.value))}
                        className="input-field"
                        min="1"
                        placeholder="Points"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Text
                    </label>
                    <textarea
                      value={subQuestion.question}
                      onChange={(e) => updateSubQuestion(index, 'question', e.target.value)}
                      className="input-field"
                      rows={2}
                      placeholder="Enter the question"
                    />
                  </div>

                  {(subQuestion.questionType === 'mcq' || subQuestion.questionType === 'mca') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Options
                        </label>
                        <div className="space-y-2">
                          {subQuestion.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              {/* Drag Handle */}
                              <div className="cursor-move text-gray-400 hover:text-gray-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                </svg>
                              </div>
                              
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateSubQuestionOption(index, optionIndex, e.target.value)}
                                className="input-field flex-1"
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                              
                              {/* Reorder Buttons */}
                              <div className="flex flex-col space-y-1">
                                <button
                                  type="button"
                                  onClick={() => moveOption(index, optionIndex, optionIndex - 1)}
                                  disabled={optionIndex === 0}
                                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Move up"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveOption(index, optionIndex, optionIndex + 1)}
                                  disabled={optionIndex === subQuestion.options.length - 1}
                                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Move down"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Correct Answer
                        </label>
                        <select
                          value={subQuestion.correctAnswer}
                          onChange={(e) => updateSubQuestion(index, 'correctAnswer', e.target.value)}
                          className="input-field"
                        >
                          <option value="">Select correct answer</option>
                          {subQuestion.options.map((option, optionIndex) => (
                            <option key={optionIndex} value={option}>
                              {option || `Option ${optionIndex + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}

            {question.subQuestions.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 mb-2">No questions added yet</p>
                <button
                  onClick={addSubQuestion}
                  className="btn-secondary text-sm"
                >
                  Add First Question
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComprehensionQuestion
