import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {RequestStatusType, SetAppErrorActionType, setAppStatusAC, SetAppStatusActionType} from '../../app/app-reducer'
import {handleServerNetworkError} from '../../utils/error-utils'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState: Array<TodolistDomainType> = []


const slice = createSlice({
    name: 'todolists',
    initialState: initialState,
    reducers: {
        removeTodolistAC(state, action: PayloadAction<{ id: string }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            if (index > -1) {
                state.splice(index, 1)
            }
        },
        addTodolistAC(state, action: PayloadAction<{ todolist: TodolistType }>) {
            state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
        },
        changeTodolistTitleAC(state, action: PayloadAction<{ id: string, title: string }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            state[index].title = action.payload.title
        },
        changeTodolistFilterAC(state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            state[index].filter = action.payload.filter
        },
        changeTodolistEntityStatusAC(state, action: PayloadAction<{ id: string, status: RequestStatusType }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            state[index].entityStatus = action.payload.status
        },
        setTodolistsAC(state, action: PayloadAction<{ todolists: Array<TodolistType> }>) {
            return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        }
    }

})
export const todolistsReducer = slice.reducer
// actions
export const {
    addTodolistAC,
    removeTodolistAC,
    changeTodolistEntityStatusAC,
    changeTodolistFilterAC,
    changeTodolistTitleAC,
    setTodolistsAC
} = slice.actions


// thunks
export const fetchTodolistsTC = () => {
    return async (dispatch: Dispatch) => {
        try {
            dispatch(setAppStatusAC({status: 'loading'}))
            let res = await todolistsAPI.getTodolists()
            dispatch(setTodolistsAC({todolists: res.data}))
            dispatch(setAppStatusAC({status: 'succeeded'}))
        } catch (e) {
            handleServerNetworkError(e, dispatch);
        }
    }
}
export const removeTodolistTC = (todolistId: string) => {
    return async (dispatch: Dispatch) => {
        try {
            dispatch(setAppStatusAC({status: 'loading'}))

            dispatch(changeTodolistEntityStatusAC({status: 'loading', id: todolistId,}))
            let res = await todolistsAPI.deleteTodolist(todolistId)
            dispatch(removeTodolistAC({id: todolistId}))
            dispatch(setAppStatusAC({status: 'succeeded'}))
        } catch (e) {
            handleServerNetworkError(e, dispatch)
        }

    }
}
export const addTodolistTC = (title: string) => {
    return async (dispatch: Dispatch) => {
        try {
            dispatch(setAppStatusAC({status: 'loading'}))
            let res = await todolistsAPI.createTodolist(title)
            dispatch(addTodolistAC({todolist: res.data.data.item}))
            dispatch(setAppStatusAC({status: 'succeeded'}))
        } catch (e) {
            handleServerNetworkError(e, dispatch)
        }

    }
}
export const changeTodolistTitleTC = (id: string, title: string) => {
    return async (dispatch: Dispatch) => {
        try {
            let res = await todolistsAPI.updateTodolist(id, title)
            dispatch(changeTodolistTitleAC({id, title}))
        } catch (e) {
            handleServerNetworkError(e, dispatch)
        }

    }
}

// types
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>;
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>;
export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>;

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}

