const Note = require('../models/Note')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')

// @desc Get all notes
// @route GET /notes
// @acess Private
const getAllNotes = asyncHandler( async (req, res) => {
    //Get all notes
    const notes = await Note.find().lean().exec();

    //if no notes
    if(!notes?.length)
        return res.status(400).json({ message : "No notes found"})

    //adding username to each note before sending response
    const notesWithUser = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec()
        return { ...note, username: user.username }
    }))
    res.json(notesWithUser)
})

// @desc Create a note
// @route POST /notes
// @acess Private
const createNewNote = asyncHandler( async (req, res) => {
    const { user, title, text } = req.body

    //confirm data
    if(!user || !title || !text) 
        return res.status(400).json({ message : "All fields are required"})

    const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec();

    if(duplicate)
        return res.status(409).json({ message : "Title already exists"})

    //create a note
    const note = await Note.create({ user, title, text })

    if(note) 
        return res.status(201).json({ message : "New note created"})
    else
        return res.status(400).json({ message : "Invalid note data received"})
})

// @desc update a note
// @route PATCH /notes
// @acess Private
const updateNote = asyncHandler( async (req, res) => {
    const { id, user, title, text, completed } = req.body

    //confirm data
    if(!id || !user || !title || !text || typeof completed !== 'boolean')
        res.status(400).json({ message : "All fields are required"})

    //confirm note exists to update
    const note = await Note.findById(id).exec()

    if(!note)
        return res.status(400).json({ message : "Note not found"})

    //check for duplicate
    const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if(duplicate && duplicate?._id.toString() !== id)
        return res.status(409).json({ message : "Title already exists"})

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()

    res.json({ message : `${updatedNote.title} updated`})
})

// @desc Delete a note
// @route DELETE /notes
// @acess Private
const deleteNote = asyncHandler( async (req, res) => {
    const { id } = req.body

    //confirm data
    if(!id)
        return res.status(400).json({ message : "Note Id required"})

    //confirm if note exists
    const note = await Note.findById(id).exec()

    if(!note)
        return res.status(400).json({ message : "Note not found"})

    const result = await note.deleteOne()
    res.json({ message : `${result.title} with Id ${result._id} has been deleted`})
})

module.exports = { getAllNotes, createNewNote, updateNote, deleteNote }