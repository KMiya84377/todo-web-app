import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Todo, TodoStatus, TodoResponse, TodosResponse, BatchDeleteResponse } from '../../types';
import todoService from '../../services/todoService';

interface TodosState {
  todos: Todo[];
  selectedTodo: Todo | null;
  loading: boolean;
  error: string | null;
}

const initialState: TodosState = {
  todos: [],
  selectedTodo: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchTodos = createAsyncThunk<
  TodosResponse,
  { status?: TodoStatus } | undefined
>('todos/fetchTodos', async (params, thunkAPI) => {
  try {
    return await todoService.getTodos(params?.status);
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to fetch todos';
    return thunkAPI.rejectWithValue({ message });
  }
});

export const fetchTodoById = createAsyncThunk<
  TodoResponse,
  string
>('todos/fetchTodoById', async (id, thunkAPI) => {
  try {
    return await todoService.getTodoById(id);
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to fetch todo';
    return thunkAPI.rejectWithValue({ message });
  }
});

export const createTodo = createAsyncThunk<
  TodoResponse,
  Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>
>('todos/createTodo', async (todoData, thunkAPI) => {
  try {
    return await todoService.createTodo(todoData);
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to create todo';
    return thunkAPI.rejectWithValue({ message });
  }
});

export const updateTodo = createAsyncThunk<
  TodoResponse,
  { id: string } & Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>
>('todos/updateTodo', async ({ id, ...todoData }, thunkAPI) => {
  try {
    return await todoService.updateTodo(id, todoData);
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to update todo';
    return thunkAPI.rejectWithValue({ message });
  }
});

export const deleteTodo = createAsyncThunk<
  { success: boolean, message: string, id: string },
  string
>('todos/deleteTodo', async (id, thunkAPI) => {
  try {
    const response = await todoService.deleteTodo(id);
    return { ...response, id };
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to delete todo';
    return thunkAPI.rejectWithValue({ message });
  }
});

export const batchDeleteTodos = createAsyncThunk<
  BatchDeleteResponse & { ids: string[] },
  string[]
>('todos/batchDeleteTodos', async (ids, thunkAPI) => {
  try {
    const response = await todoService.batchDeleteTodos(ids);
    return { ...response, ids };
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to delete todos';
    return thunkAPI.rejectWithValue({ message });
  }
});

// Todo slice
const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    clearSelectedTodo: (state) => {
      state.selectedTodo = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch todos
    builder.addCase(fetchTodos.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTodos.fulfilled, (state, action) => {
      state.loading = false;
      state.todos = action.payload.todos;
    });
    builder.addCase(fetchTodos.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string | null;
    });

    // Fetch todo by id
    builder.addCase(fetchTodoById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTodoById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedTodo = action.payload;
    });
    builder.addCase(fetchTodoById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string | null;
    });

    // Create todo
    builder.addCase(createTodo.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createTodo.fulfilled, (state, action) => {
      state.loading = false;
      state.todos.unshift(action.payload);
    });
    builder.addCase(createTodo.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string | null;
    });

    // Update todo
    builder.addCase(updateTodo.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateTodo.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.todos.findIndex(todo => todo.id === action.payload.id);
      if (index !== -1) {
        state.todos[index] = action.payload;
      }
      if (state.selectedTodo?.id === action.payload.id) {
        state.selectedTodo = action.payload;
      }
    });
    builder.addCase(updateTodo.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string | null;
    });

    // Delete todo
    builder.addCase(deleteTodo.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteTodo.fulfilled, (state, action) => {
      state.loading = false;
      state.todos = state.todos.filter(todo => todo.id !== action.payload.id);
      if (state.selectedTodo?.id === action.payload.id) {
        state.selectedTodo = null;
      }
    });
    builder.addCase(deleteTodo.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string | null;
    });

    // Batch delete todos
    builder.addCase(batchDeleteTodos.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(batchDeleteTodos.fulfilled, (state, action) => {
      state.loading = false;
      const idsToDelete = new Set(action.payload.ids);
      state.todos = state.todos.filter(todo => !idsToDelete.has(todo.id));
      if (state.selectedTodo && idsToDelete.has(state.selectedTodo.id)) {
        state.selectedTodo = null;
      }
    });
    builder.addCase(batchDeleteTodos.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string | null;
    });
  },
});

export const { clearSelectedTodo, clearError } = todoSlice.actions;

export default todoSlice.reducer;