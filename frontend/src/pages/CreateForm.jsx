import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import CategorizeQuestion from '../components/questions/CategorizeQuestion'
import ClozeQuestionDirect from '../components/questions/ClozeQuestionDirect'
import ComprehensionQuestion from '../components/questions/ComprehensionQuestion'
import ImageUpload from '../components/ImageUpload'

const CreateForm = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const editId = searchParams.get('edit')

    const [form, setForm] = useState({
        title: '',
        description: '',
        headerImage: '',
        questions: []
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (editId) {
            fetchForm(editId)
        }
    }, [editId])

    const fetchForm = async (id) => {
        try {
            const response = await axios.get(`/api/forms/${id}`)
            setForm(response.data)
        } catch (error) {
            console.error('Error fetching form:', error)
        }
    }

    const addQuestion = (type) => {
        const baseQuestion = {
            id: Date.now(), // Temporary ID for React keys, will be removed before saving
            type,
            title: '',
            description: '',
            points: 1,
            feedback: '',
            image: ''
        }

        let typeSpecificFields = {}

        if (type === 'categorize') {
            typeSpecificFields = {
                categories: [],
                items: []
            }
        } else if (type === 'cloze') {
            typeSpecificFields = {
                sentence: '',
                blanks: [],
                options: []
            }
            console.log('Creating new Cloze question with fields:', typeSpecificFields)
        } else if (type === 'comprehension') {
            typeSpecificFields = {
                instructions: '',
                passage: '',
                media: '',
                timer: 0,
                subQuestions: []
            }
        }

        const newQuestion = { ...baseQuestion, ...typeSpecificFields }

        setForm(prev => ({
            ...prev,
            questions: [...prev.questions, newQuestion]
        }))
    }

    const updateQuestion = (index, updatedQuestion) => {
        console.log(`🚀 UpdateQuestion called - index: ${index}`)
        console.log('🚀 UpdateQuestion - updatedQuestion:', updatedQuestion)
        if (updatedQuestion.type === 'cloze') {
            console.log('🚀 Cloze question update - sentence:', updatedQuestion.sentence)
            console.log('🚀 Cloze question update - blanks:', updatedQuestion.blanks)
            console.log('🚀 Cloze question update - blanks length:', updatedQuestion.blanks?.length)
        }
        setForm(prev => {
            const newForm = {
                ...prev,
                questions: prev.questions.map((q, i) => {
                    if (i === index) {
                        console.log(`🚀 Replacing question ${i} with:`, updatedQuestion)
                        return updatedQuestion
                    }
                    return q
                })
            }
            console.log('🚀 UpdateQuestion - new form state questions:', newForm.questions)
            return newForm
        })
    }

    const deleteQuestion = (index) => {
        setForm(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }))
    }

    const cleanQuestionData = (question) => {
        // Remove the temporary 'id' field used for React keys
        const { id, ...cleanQuestion } = question

        // Ensure all fields are properly typed
        const cleaned = {
            ...cleanQuestion,
            points: parseInt(cleanQuestion.points) || 1,
            timer: parseInt(cleanQuestion.timer) || 0
        }

        // Clean up type-specific fields
        if (question.type === 'comprehension' && question.subQuestions) {
            cleaned.subQuestions = question.subQuestions.map(subQ => ({
                questionType: subQ.questionType || 'mcq',
                question: subQ.question || '',
                options: Array.isArray(subQ.options) ? subQ.options : [],
                correctAnswer: subQ.correctAnswer || '',
                points: parseInt(subQ.points) || 1
            }))
        }

        if (question.type === 'categorize') {
            cleaned.categories = Array.isArray(question.categories) ? question.categories : []
            cleaned.items = Array.isArray(question.items) ? question.items : []
        }

        if (question.type === 'cloze') {
            console.log('🔍 Cleaning Cloze question:', {
                originalSentence: question.sentence,
                originalBlanks: question.blanks,
                originalBlanksType: typeof question.blanks,
                originalBlanksIsArray: Array.isArray(question.blanks),
                originalOptions: question.options
            })

            cleaned.sentence = question.sentence || ''

            // Ensure blanks are preserved as array
            if (Array.isArray(question.blanks)) {
                cleaned.blanks = [...question.blanks] // Create new array to avoid reference issues
            } else {
                console.warn('⚠️ Blanks is not an array:', question.blanks)
                cleaned.blanks = []
            }

            // Clean options
            cleaned.options = Array.isArray(question.options)
                ? question.options
                    .filter(option => option && (typeof option === 'string' || (typeof option === 'object' && option.text)))
                    .map((option, index) => ({
                        text: typeof option === 'string' ? option : (option.text || ''),
                        order: typeof option === 'object' && typeof option.order === 'number' ? option.order : index
                    }))
                : []

            console.log('✅ Cleaned Cloze question:', {
                cleanedSentence: cleaned.sentence,
                cleanedBlanks: cleaned.blanks,
                cleanedBlanksLength: cleaned.blanks.length,
                cleanedOptions: cleaned.options
            })
        }

        return cleaned
    }

    const saveForm = async () => {
        if (!form.title.trim()) {
            alert('Please enter a form title')
            return
        }

        // Clean up the form data before sending
        const cleanForm = {
            ...form,
            questions: form.questions.map(cleanQuestionData)
        }

        console.log('Saving form:', JSON.stringify(cleanForm, null, 2))

        setLoading(true)
        try {
            let response
            if (editId) {
                response = await axios.put(`/api/forms/${editId}`, cleanForm)
            } else {
                response = await axios.post('/api/forms', cleanForm)
            }
            console.log('Form saved successfully:', response.data)
            navigate('/forms')
        } catch (error) {
            console.error('Error saving form:', error)

            let errorMessage = 'Error saving form'
            if (error.response) {
                console.error('Server error details:', error.response.data)
                if (error.response.data.errors) {
                    errorMessage = `Validation errors: ${error.response.data.errors.join(', ')}`
                } else {
                    errorMessage = error.response.data.message || `Server error: ${error.response.status}`
                }
            } else if (error.request) {
                errorMessage = 'No response from server. Check if backend is running.'
            }

            alert(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const renderQuestion = (question, index) => {
        const commonProps = {
            question,
            onChange: (updatedQuestion) => updateQuestion(index, updatedQuestion),
            onDelete: () => deleteQuestion(index)
        }

        switch (question.type) {
            case 'categorize':
                return <CategorizeQuestion key={question.id} {...commonProps} />
            case 'cloze':
                return <ClozeQuestionDirect key={question.id} {...commonProps} />
            case 'comprehension':
                return <ComprehensionQuestion key={question.id} {...commonProps} />
            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="form-container">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-100 mb-2">
                            {editId ? 'Edit Form' : 'Create New Form'}
                        </h1>
                        <p className="text-gray-300">
                            {editId ? 'Update your interactive form' : 'Build an engaging interactive form with multiple question types'}
                        </p>
                    </div>

                    <div className="card mb-6">
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">
                            Form Details
                        </h2>
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Form Title *
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="input-field"
                                    placeholder="Enter form title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="input-field"
                                    rows={3}
                                    placeholder="Describe what this form is about"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Header Image
                                </label>
                                <ImageUpload
                                    value={form.headerImage}
                                    onChange={(url) => setForm(prev => ({ ...prev, headerImage: url }))}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-100">
                                    Questions ({form.questions.length})
                                </h2>
                                <p className="text-sm text-gray-400 mt-1">
                                    Add different types of interactive questions
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => addQuestion('categorize')}
                                    className="btn-secondary text-sm"
                                >
                                    Categorize
                                </button>
                                <button
                                    onClick={() => addQuestion('cloze')}
                                    className="btn-secondary text-sm"
                                >
                                    Cloze
                                </button>
                                <button
                                    onClick={() => addQuestion('comprehension')}
                                    className="btn-secondary text-sm"
                                >
                                    Comprehension
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {form.questions.map((question, index) => (
                                <div key={question.id || index}>
                                    {renderQuestion(question, index)}
                                    
                                    {/* Add Question Buttons after each question */}
                                    <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
                                        <p className="text-sm text-gray-400 mb-3 text-center">Add another question</p>
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => addQuestion('categorize')}
                                                className="btn-secondary text-xs px-3 py-1"
                                            >
                                                + Categorize
                                            </button>
                                            <button
                                                onClick={() => addQuestion('cloze')}
                                                className="btn-secondary text-xs px-3 py-1"
                                            >
                                                + Cloze
                                            </button>
                                            <button
                                                onClick={() => addQuestion('comprehension')}
                                                className="btn-secondary text-xs px-3 py-1"
                                            >
                                                + Comprehension
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {form.questions.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-gray-600 rounded-lg">
                                    <p className="text-gray-400 mb-4">No questions added yet</p>
                                    <div className="flex justify-center space-x-2">
                                        <button
                                            onClick={() => addQuestion('categorize')}
                                            className="btn-secondary text-sm"
                                        >
                                            Add Categorize Question
                                        </button>
                                        <button
                                            onClick={() => addQuestion('cloze')}
                                            className="btn-secondary text-sm"
                                        >
                                            Add Cloze Question
                                        </button>
                                        <button
                                            onClick={() => addQuestion('comprehension')}
                                            className="btn-secondary text-sm"
                                        >
                                            Add Comprehension Question
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 mt-8">
                        <button
                            onClick={() => navigate('/forms')}
                            className="btn-secondary px-6 py-2"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveForm}
                            disabled={loading}
                            className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : editId ? 'Update Form' : 'Save Form'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateForm