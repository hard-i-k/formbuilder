import React from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import ImageUpload from '../ImageUpload'

const CategorizeQuestion = ({ question, onChange, onDelete }) => {
  const updateField = (field, value) => {
    onChange({ ...question, [field]: value })
  }

  const addCategory = () => {
    updateField('categories', [...question.categories, ''])
  }

  const updateCategory = (index, value) => {
    const newCategories = [...question.categories]
    newCategories[index] = value
    updateField('categories', newCategories)
  }

  const removeCategory = (index) => {
    const newCategories = question.categories.filter((_, i) => i !== index)
    const newItems = question.items.filter(item => item.category !== question.categories[index])
    onChange({
      ...question,
      categories: newCategories,
      items: newItems
    })
  }

  const addItem = () => {
    const newItem = {
      text: '',
      category: question.categories[0] || '',
      order: question.items.length
    }
    updateField('items', [...question.items, newItem])
  }

  const updateItem = (index, field, value) => {
    const newItems = [...question.items]
    newItems[index] = { ...newItems[index], [field]: value }
    updateField('items', newItems)
  }

  const removeItem = (index) => {
    const newItems = question.items.filter((_, i) => i !== index)
    updateField('items', newItems)
  }

  const onDragEnd = (result) => {
    if (!result.destination) return

    const items = Array.from(question.items)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    const reorderedItems = items.map((item, index) => ({
      ...item,
      order: index
    }))

    updateField('items', reorderedItems)
  }

  return (
    <div className="card border-l-4 border-l-blue-500">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Categorize Question</h3>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={question.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="input-field"
            rows={2}
            placeholder="Enter question description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Image
          </label>
          <ImageUpload
            value={question.image}
            onChange={(url) => updateField('image', url)}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points
            </label>
            <input
              type="number"
              value={question.points}
              onChange={(e) => updateField('points', parseInt(e.target.value) || 1)}
              className="input-field"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback
            </label>
            <input
              type="text"
              value={question.feedback}
              onChange={(e) => updateField('feedback', e.target.value)}
              className="input-field"
              placeholder="Optional feedback"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Categories
            </label>
            <button
              onClick={addCategory}
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              + Add Category
            </button>
          </div>
          <div className="space-y-2">
            {question.categories.map((category, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={category}
                  onChange={(e) => updateCategory(index, e.target.value)}
                  className="input-field"
                  placeholder={`Category ${index + 1}`}
                />
                <button
                  onClick={() => removeCategory(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Items
            </label>
            <button
              onClick={addItem}
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              + Add Item
            </button>
          </div>
          
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="items">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {question.items.map((item, index) => (
                    <Draggable key={index} draggableId={`item-${index}`} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex space-x-2 items-center bg-gray-50 p-3 rounded-md"
                        >
                          <div {...provided.dragHandleProps} className="cursor-move">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => updateItem(index, 'text', e.target.value)}
                            className="input-field flex-1"
                            placeholder="Item text"
                          />
                          <select
                            value={item.category}
                            onChange={(e) => updateItem(index, 'category', e.target.value)}
                            className="input-field w-40"
                          >
                            {question.categories.map((cat, catIndex) => (
                              <option key={catIndex} value={cat}>
                                {cat || `Category ${catIndex + 1}`}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => removeItem(index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  )
}

export default CategorizeQuestion