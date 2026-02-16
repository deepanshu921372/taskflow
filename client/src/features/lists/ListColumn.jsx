import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from '../tasks/TaskCard';
import { useCreateTaskMutation } from '../tasks/taskApi';
import { useDeleteListMutation } from './listApi';
import toast from 'react-hot-toast';

const ListColumn = ({ list, tasks, onTaskClick }) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [deleteList] = useDeleteListMutation();

  const { setNodeRef, isOver } = useDroppable({
    id: list._id,
  });

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      await createTask({ listId: list._id, title: taskTitle }).unwrap();
      setTaskTitle('');
      setShowAddTask(false);
      toast.success('Task added!');
    } catch (error) {
      toast.error('Failed to add task');
    }
  };

  const handleDeleteList = async () => {
    if (!confirm('Delete this list and all its tasks?')) return;
    try {
      await deleteList(list._id).unwrap();
      toast.success('List deleted');
    } catch (error) {
      toast.error('Failed to delete list');
    }
  };

  return (
    <div className="w-72 flex-shrink-0 bg-gray-100 rounded-lg p-3">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">{list.title}</h3>
        <button
          onClick={handleDeleteList}
          className="text-gray-400 hover:text-red-500 text-sm"
        >
          Delete
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`space-y-2 min-h-[50px] ${isOver ? 'bg-gray-200 rounded' : ''}`}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>
      </div>

      {showAddTask ? (
        <form onSubmit={handleAddTask} className="mt-3">
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddTask(false)}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddTask(true)}
          className="mt-3 w-full text-left text-sm text-gray-500 hover:text-gray-700 py-2"
        >
          + Add a task
        </button>
      )}
    </div>
  );
};

export default ListColumn;
