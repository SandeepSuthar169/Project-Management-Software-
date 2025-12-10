import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
    TodoStatusEnum,
    AvailableTodoStatuses ,
    TodoPriority,
    AvailableTodoPriority
} from "../utils/constants.js"
import { Todo } from "../models/Todo.models.js";

const createTodo = asyncHandler(async (req, res) => {
    const {
        todoName,
        status,
        piority,
        startDate,
        endDate,
        description,
        estimatedHours
    } = req.body

    if(
        !todoName || 
        !status || 
        !piority || 
        !startDate || 
        !endDate || 
        !description || 
        !estimatedHours ) throw new ApiError(400, "todo detailes is required")

    const { userId } = req.params
    if(!userId) throw new ApiError(404, "userid is required")
    
    const user  = await User.findById(userId)

    const todo = await Todo.create({
        todoName,
        status,
        piority,
        startDate,
        endDate,
        description,
        estimatedHours,
        assignBy: user._id
    })
    if(!todo) throw new ApiError(404, "todo is required")

    return res.status(200).json(
        new ApiResponse(
            200, 
            todo,
            "todo created successfully"
        )
    )
})


const getTodo = asyncHandler(async (req, res) => {
        const { todoId } = req.params
        if(!todoId) throw new ApiError(402, "todo Id is required")
      
    
        const todo = await Todo.findById(todoId)
    
        
        if(!todo) throw new ApiError(402, "todo is required")
    
        return res.status(200).json(
            new ApiResponse(
                200,
                todo,
                "board fetch successfully!"
                    
            )
        )
})



const getAllTodo = asyncHandler(async (req, res) => {
 const { userId } = req.params
    if(!userId) throw new ApiError(404, "userid is required")

    const user  = await User.findById(userId) 
    if(!user) throw new ApiError(404, "user is required")


    const todo = await Todo.aggregate([
        {
            $match: {
                assignBy : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "assignBy",
                foreignField: "_id",
                as: "assignBy"
            }
        },
        {
            $unwind: {
                path: "$assignBy",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                todoName: 1,
                status: 1,
                piority: 1,
                startDate: 1,
                endDate: 1,
                assignBy: 1,
                description: 1,
                estimatedHours: 1,
                assignBy: {
                    _id: 1,
                    avatar: 1,
                    username: 1,
                    fullName: 1
                }
            }
        }
    ])
    if(!todo || todo.length == 0 ) throw new ApiError(404, "todo is required")

    return res.status(200).json(
        new ApiResponse(200,
            todo,
            "todo fetched successfully"
        )
    )
})

const updateTodo = asyncHandler(async (req, res) => {
    const {
            todoName, 
            status, 
            piority, 
            startDate, 
            endDate,
            description,
            estimatedHours
        }  = req.body
    
        if(
            !todoName || 
            !status ||
            !piority ||
            !startDate || 
            !endDate ||
            !description || 
            !estimatedHours
        ) throw new ApiError(404, "update todo info is requreid")
    
        if(!AvailableTodoStatuses.includes(status)){
            throw  new ApiError(403, "Invalid status")
        }
    
        if(!AvailableTodoPriority.includes(piority)){
            throw  new ApiError(403, "Invalid Priority")
        }
    
        const { userId } = req.params
        if(!userId) throw new ApiError(404, "userid is required")
    
        const user  = await User.findById(userId)
        if(!user) throw new ApiError(404, "user is required")
    
        const { todoId } = req.params
        if(!todoId) throw new ApiError(402, "todo Id is required")
    
        const existingTodo = await Todo.findById(todoId)
        if(!existingTodo) throw new ApiError(402, "existingTodo is required")
    
        const todo = await Todo.findByIdAndUpdate(
            todoId,
            {
                todoName, 
                status, 
                piority, 
                startDate, 
                endDate,
                description,
                estimatedHours,
                assignBy: user._id
            },
            {
                new: true
            }
        )
        if(!todo) throw new ApiError(402, "todo is required")
    
        return res.status(200).json(new ApiResponse(
            200, 
            todo, 
            "todo update successfully"
        ))
    
})


const deleteTodo = asyncHandler(async (req, res) => {
    const { todoId } = req.params
    if(!todoId) throw new ApiError(402, "todo  Id is required")

    const deleTodo = await Todo.findByIdAndDelete(todoId)
    if(!deleTodo) throw new ApiError(402, "deleTodo is required")

    return res.status(200).json(new ApiResponse(
        200, 
        deleTodo, 
        "delete board successfully"
    ))
})


export {
    createTodo,
    getTodo,
    getAllTodo,
    updateTodo,
    deleteTodo
}