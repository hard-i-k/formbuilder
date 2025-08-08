import React, { useState, useRef, useEffect } from 'react'

const SentenceEditor = ({ value, onChange, onBlanksChange }) => {
  const [sentence, setSentence] = useState(value || '')
  const [words, setWords] = useState([])
  const editorRef = useRef(null)

  console.log('SentenceEditor received value:', value)
  console.log('SentenceEditor received onChange:', typeof onChange)
  console.log('SentenceEditor received onBlanksChange:', typeof onBlanksChange)

  useEffect(() => {
    console.log('SentenceEditor useEffect - value changed to:', value)
    setSentence(value || '')
    if (value) {
      parseWords(value)
    }
  }, [value])

  const parseWords = (text) => {
    // Split text into words and spaces, preserving the original structure
    const parts = text.split(/(\s+|[.,!?;:])/g)
    const wordList = parts.map((part, index) => ({
      id: index,
      text: part,
      isBlank: /<u>(.*?)<\/u>/.test(part),
      originalText: part.replace(/<\/?u>/g, ''),
      isWord: /\w+/.test(part) && !/^\s+$/.test(part) && !/^[.,!?;:]+$/.test(part)
    }))
    setWords(wordList)
  }

  const handleTextChange = (e) => {
    const newSentence = e.target.value
    console.log('SentenceEditor handleTextChange:', newSentence)
    setSentence(newSentence)
    console.log('SentenceEditor calling onChange with:', newSentence)
    onChange(newSentence)
    parseWords(newSentence)
    extractBlanks(newSentence)
  }

  const extractBlanks = (text) => {
    const underlinedRegex = /<u>(.*?)<\/u>/g
    const blanks = []
    let match
    
    while ((match = underlinedRegex.exec(text)) !== null) {
      blanks.push(match[1])
    }
    
    console.log('SentenceEditor calling onBlanksChange with:', blanks)
    onBlanksChange(blanks)
  }

  const toggleBlank = (wordIndex) => {
    const word = words[wordIndex]
    if (!word.isWord) return

    let newSentence = sentence
    
    if (word.isBlank) {
      // Remove blank
      newSentence = newSentence.replace(`<u>${word.originalText}</u>`, word.originalText)
    } else {
      // Add blank
      newSentence = newSentence.replace(word.text, `<u>${word.text}</u>`)
    }
    
    setSentence(newSentence)
    console.log('SentenceEditor toggleBlank - calling onChange with:', newSentence)
    onChange(newSentence)
    parseWords(newSentence)
    extractBlanks(newSentence)
  }

  const getPreviewText = () => {
    return sentence.replace(/<u>(.*?)<\/u>/g, '______')
  }

  const getBlanks = () => {
    const underlinedRegex = /<u>(.*?)<\/u>/g
    const blanks = []
    let match
    
    while ((match = underlinedRegex.exec(sentence)) !== null) {
      blanks.push(match[1])
    }
    
    return blanks
  }

  const renderInteractiveText = () => {
    if (!sentence) return null

    return (
      <div className="p-3 bg-white border rounded-md">
        <div className="text-sm text-gray-600 mb-2">
          Click on words to make them blanks:
        </div>
        <div className="flex flex-wrap gap-1 leading-relaxed">
          {words.map((word, index) => (
            <span
              key={word.id}
              onClick={() => toggleBlank(index)}
              className={`${
                word.isWord
                  ? word.isBlank
                    ? 'bg-blue-200 text-blue-800 px-2 py-1 rounded cursor-pointer border-2 border-blue-400'
                    : 'hover:bg-gray-200 px-1 py-1 rounded cursor-pointer'
                  : ''
              } ${word.isWord ? 'select-none' : ''}`}
              title={word.isWord ? (word.isBlank ? 'Click to remove blank' : 'Click to make blank') : ''}
            >
              {word.isBlank ? word.originalText : word.text}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sentence Editor
        </label>
        <div className="text-sm text-gray-600 mb-2">
          Type your sentence below, then use the interactive editor to create blanks
        </div>
        <textarea
          ref={editorRef}
          value={sentence}
          onChange={handleTextChange}
          className="input-field"
          rows={3}
          placeholder="Type your sentence here..."
        />
        
        {/* Test button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('🔴 TEST BUTTON CLICKED!')
            alert('Test button was clicked!')
            console.log('Test button - calling onChange with test sentence')
            onChange('Test sentence with <u>blank</u>')
            console.log('Test button - calling onBlanksChange with blanks')
            onBlanksChange(['blank'])
            console.log('Test button - finished calling callbacks')
          }}
          className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
        >
          🔴 TEST CALLBACKS
        </button>
      </div>

      {/* Interactive Word Editor */}
      {sentence && renderInteractiveText()}

      {/* Preview */}
      {sentence && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview (How students will see it)
          </label>
          <div className="p-3 bg-gray-50 rounded-md border">
            <p className="text-gray-800">{getPreviewText()}</p>
          </div>
        </div>
      )}

      {/* Detected Blanks */}
      {getBlanks().length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blanks Created ({getBlanks().length})
          </label>
          <div className="flex flex-wrap gap-2">
            {getBlanks().map((blank, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
              >
                {blank}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            These words will be automatically added to the options below
          </div>
        </div>
      )}
    </div>
  )
}

export default SentenceEditor