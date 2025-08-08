import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import HomePage from './pages/HomePage'
import CreateForm from './pages/CreateForm'
import ViewForms from './pages/ViewForms'
import FormPreview from './pages/FormPreview'

import Navbar from './components/Navbar'

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateForm />} />
            <Route path="/forms" element={<ViewForms />} />
            <Route path="/form/:id" element={<FormPreview />} />
          
          </Routes>
        </div>
      </Router>
    </DndProvider>
  )
}

export default App