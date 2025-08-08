import React from 'react'
import ImageUpload from '../ImageUpload'

const ClozeQuestionDirect = ({ question, onChange, onDelete }) => {
  const updateField = (field, value) => {
    console.log(`🔧 updateField called - field: ${field}, value:`, value)
    const updatedQuestion = { ...question, [field]: value }
    console.log(`🔧 Updated question object:`, updatedQuestion)
    onChange(updatedQuestion)
  }

  const handleSentenceChange = (e) => {
    const newSentence = e.target.value
    updateField('sentence', newSentence)

    // Clear blanks when sentence changes significantly
    if (!newSentence.trim()) {
      updateField('blanks', [])
      updateField('options', [])
    }
  }

  const getWords = () => {
    if (!question.sentence) return []
    return question.sentence.match(/\b[a-zA-Z]+\b/g) || []
  }

  const toggleBlank = (word) => {
    console.log('🔄 toggleBlank called with word:', word)

    const currentBlanks = Array.isArray(question.blanks) ? question.blanks : []
    console.log('🔄 Current blanks:', currentBlanks)

    let newBlanks
    if (currentBlanks.includes(word)) {
      newBlanks = currentBlanks.filter(blank => blank !== word)
      console.log('➖ Removing word, new blanks:', newBlanks)
    } else {
      newBlanks = [...currentBlanks, word]
      console.log('➕ Adding word, new blanks:', newBlanks)
    }

    // Auto-update options with correct answers
    const correctOptions = newBlanks.map((blank, index) => ({
      text: blank,
      order: index
    }))

    const wrongOptions = (question.options || []).filter(opt =>
      !newBlanks.includes(opt.text) && opt.text.trim() !== ''
    )

    const allOptions = [
      ...correctOptions,
      ...wrongOptions.map((opt, index) => ({
        ...opt,
        order: correctOptions.length + index
      }))
    ]

    // Update both blanks and options in one call
    console.log('💾 Updating with blanks:', newBlanks)
    console.log('🎯 Updating with options:', allOptions)

    const updatedQuestion = {
      ...question,
      blanks: newBlanks,
      options: allOptions
    }
    console.log('🔄 Final updated question:', updatedQuestion)
    onChange(updatedQuestion)
  }

  const addWrongOption = () => {
    const currentOptions = question.options || []
    updateField('options', [...currentOptions, { text: '', order: currentOptions.length }])
  }

  const updateOption = (index, value) => {
    const currentOptions = question.options || []
    const newOptions = [...currentOptions]
    newOptions[index] = { ...newOptions[index], text: value }
    updateField('options', newOptions)
  }

  const removeOption = (index) => {
    const currentOptions = question.options || []
    updateField('options', currentOptions.filter((_, i) => i !== index))
  }

  const moveOption = (fromIndex, toIndex) => {
    const currentOptions = question.options || []
    if (toIndex < 0 || toIndex >= currentOptions.length) return
    
    const newOptions = [...currentOptions]
    const [movedOption] = newOptions.splice(fromIndex, 1)
    newOptions.splice(toIndex, 0, movedOption)
    
    // Update order property
    const updatedOptions = newOptions.map((option, index) => ({
      ...option,
      order: index
    }))
    
    updateField('options', updatedOptions)
  }

  const getPreview = () => {
    let preview = question.sentence || ''
    const blanks = Array.isArray(question.blanks) ? question.blanks : []
    blanks.forEach(blank => {
      preview = preview.replace(new RegExp(`\\b${blank}\\b`, 'gi'), '______')
    })
    return preview
  }

  const words = getWords()
  const blanks = Array.isArray(question.blanks) ? question.blanks : []

  return (
    <div className="question-card border-l-4 border-l-green-500">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-100">Cloze Question</h3>
        <button onClick={onDelete} className="text-red-400 hover:text-red-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Question Title</label>
          <input
            type="text"
            value={question.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            className="input-field"
            placeholder="Enter question title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            value={question.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            className="input-field"
            rows={2}
            placeholder="Enter question description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Question Image</label>
          <ImageUpload
            value={question.image || ''}
            onChange={(url) => updateField('image', url)}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Points</label>
            <input
              type="number"
              value={question.points || ''}
              onChange={(e) => updateField('points', e.target.value === '' ? '' : parseInt(e.target.value))}
              className="input-field"
              min="1"
              placeholder="Enter points"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Feedback</label>
            <input
              type="text"
              value={question.feedback || ''}
              onChange={(e) => updateField('feedback', e.target.value)}
              className="input-field"
              placeholder="Optional feedback"
            />
          </div>
        </div>

        {/* Step 1: Enter Sentence */}
        <div className="question-step-blue">
          <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Step 1: Enter Your Complete Sentence
          </label>
          <textarea
            value={question.sentence || ''}
            onChange={handleSentenceChange}
            className="input-field"
            rows={3}
            placeholder="Example: The cat sat on the mat"
          />
        </div>

        {/* Step 2: Select Words for Blanks */}
        {words.length > 0 && (
          <div className="question-step-green">
            <label className="block text-sm font-medium text-green-800 dark:text-green-200 mb-2">
              Step 2: Click Words to Make Them Blanks ({blanks.length} selected)
            </label>
            <div className="flex flex-wrap gap-2">
              {words.map((word, index) => {
                const isSelected = blanks.includes(word)
                return (
                  <button
                    key={`${word}-${index}`}
                    type="button"
                    onClick={() => toggleBlank(word)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${isSelected
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg transform scale-105'
                      : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-md transform hover:-translate-y-0.5'
                      }`}
                  >
                    {word} {isSelected ? '✓' : ''}
                  </button>
                )
              })}
            </div>

            {/* Debug info */}
            <div className="mt-2 text-xs text-gray-500">
              Debug: Question blanks = [{blanks.join(', ')}] | Length: {blanks.length}
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {question.sentence && blanks.length > 0 && (
          <div className="question-step-yellow">
            <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Step 3: Preview (How Students Will See It)
            </label>
            <div className="p-4 bg-gray-100 dark:bg-gray-600 rounded border text-lg text-gray-900 dark:text-gray-100">
              {getPreview()}
            </div>
          </div>
        )}

        {/* Answer Options */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-300">
              Answer Options (Correct answers auto-added)
            </label>
            <button
              type="button"
              onClick={addWrongOption}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              + Add Wrong Option
            </button>
          </div>

          <div className="space-y-2">
            {(question.options || []).map((option, index) => {
              const isCorrect = blanks.includes(option.text)
              return (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${isCorrect ? 'bg-green-900/20 border border-green-600' : 'bg-gray-700'
                    }`}
                >
                  {/* Drag Handle */}
                  <div className="cursor-move text-gray-400 hover:text-gray-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                  
                  {isCorrect && (
                    <span className="text-green-400 text-sm font-medium">✓ Correct</span>
                  )}

                  <input
                    type="text"
                    value={option.text || ''}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className={`input-field flex-1 ${isCorrect ? 'bg-green-900/20' : ''}`}
                    placeholder={isCorrect ? "Correct answer (auto-added)" : "Wrong answer option"}
                    readOnly={isCorrect}
                  />

                  {/* Reorder Buttons */}
                  <div className="flex flex-col space-y-1">
                    <button
                      type="button"
                      onClick={() => moveOption(index, index - 1)}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveOption(index, index + 1)}
                      disabled={index === (question.options || []).length - 1}
                      className="text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {!isCorrect && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="text-red-400 hover:text-red-300 px-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClozeQuestionDirect