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
  const [showMenu, setShowMenu] = useState(false);
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
    } catch {
      toast.error('Failed to add task');
    }
  };

  const handleDeleteList = async () => {
    if (!confirm('Delete this list and all its tasks?')) return;
    try {
      await deleteList(list._id).unwrap();
      toast.success('List deleted');
    } catch {
      toast.error('Failed to delete list');
    }
  };

  return (
    <div className="w-72 sm:w-80 flex-shrink-0 bg-white rounded-xl shadow-sm flex flex-col max-h-[calc(100vh-180px)]">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h3 className="font-medium text-gray-800 text-sm">{list.title}</h3>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                <button
                  onClick={() => {
                    handleDeleteList();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Delete list
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-3 space-y-2 ${
          isOver ? 'bg-primary-50' : ''
        }`}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>

        {tasks.length === 0 && !showAddTask && (
          <p className="text-center text-gray-400 text-sm py-4">No tasks yet</p>
        )}
      </div>

      <div className="p-3 border-t border-gray-100">
        {showAddTask ? (
          <form onSubmit={handleAddTask}>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
              >
                {isLoading ? 'Adding...' : 'Add Task'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddTask(false);
                  setTaskTitle('');
                }}
                className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddTask(true)}
            className="w-full text-left text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 p-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add a task
          </button>
        )}
      </div>
    </div>
  );
};

export default ListColumn;
