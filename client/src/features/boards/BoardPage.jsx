import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { useGetBoardQuery } from './boardApi';
import { useCreateListMutation } from '../lists/listApi';
import { useMoveTaskMutation } from '../tasks/taskApi';
import ListColumn from '../lists/ListColumn';
import TaskCard from '../tasks/TaskCard';
import TaskModal from '../tasks/TaskModal';
import ActivityPanel from '../activity/ActivityPanel';
import Spinner from '../../components/common/Spinner';
import useSocket from '../../hooks/useSocket';
import toast from 'react-hot-toast';

const BoardPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useGetBoardQuery(id);
  useSocket(id);
  const [createList, { isLoading: creatingList }] = useCreateListMutation();
  const [moveTask] = useMoveTaskMutation();

  const [showAddList, setShowAddList] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [showActivity, setShowActivity] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('all');

  const board = data?.data?.board;
  const lists = data?.data?.lists || [];
  const tasks = data?.data?.tasks || [];

  const getTasksForList = (listId) => {
    return tasks
      .filter((t) => t.list === listId)
      .filter((t) => priorityFilter === 'all' || t.priority === priorityFilter)
      .sort((a, b) => a.position - b.position);
  };

  const PRIORITY_OPTIONS = [
    { value: 'all', label: 'All', color: 'bg-gray-100 text-gray-700' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700' },
  ];

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!listTitle.trim()) return;

    try {
      await createList({ boardId: id, title: listTitle }).unwrap();
      setListTitle('');
      setShowAddList(false);
      toast.success('List created!');
    } catch {
      toast.error('Failed to create list');
    }
  };

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    let targetListId = over.id;
    const overTask = tasks.find((t) => t._id === over.id);
    if (overTask) {
      targetListId = overTask.list;
    }

    if (task.list === targetListId && !overTask) return;

    const targetTasks = getTasksForList(targetListId);
    let position = targetTasks.length;

    if (overTask) {
      const overIndex = targetTasks.findIndex((t) => t._id === overTask._id);
      position = overIndex;
    }

    try {
      await moveTask({ id: taskId, targetListId, position }).unwrap();
    } catch {
      toast.error('Failed to move task');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Board not found</p>
        <Link to="/" className="text-primary-600 hover:underline">
          Go back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <header
        className="px-4 py-4 sm:px-6"
        style={{ backgroundColor: board.background || '#1B4F72' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/"
              className="text-white/80 hover:text-white transition-colors flex items-center gap-1 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </Link>
            <h1 className="text-lg sm:text-xl font-semibold text-white truncate max-w-[200px] sm:max-w-none">
              {board.title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex -space-x-2">
              {board.members?.slice(0, 4).map((member) => (
                <div
                  key={member._id}
                  className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-xs font-medium"
                  title={member.name}
                >
                  {member.name?.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            {board.members?.length > 4 && (
              <span className="text-white/70 text-sm">+{board.members.length - 4}</span>
            )}
            <button
              onClick={() => setShowActivity(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Activity</span>
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-3 sm:px-6 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-sm text-gray-500 flex-shrink-0">Filter by priority:</span>
          <div className="flex gap-1.5">
            {PRIORITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setPriorityFilter(option.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  priorityFilter === option.value
                    ? `${option.color} ring-2 ring-offset-1 ring-primary-500`
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {priorityFilter !== 'all' && (
            <button
              onClick={() => setPriorityFilter('all')}
              className="ml-2 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto p-4 sm:p-6">
          <div className="flex gap-4 h-full min-h-[calc(100vh-140px)]">
            {lists.map((list) => (
              <ListColumn
                key={list._id}
                list={list}
                tasks={getTasksForList(list._id)}
                onTaskClick={setSelectedTask}
              />
            ))}

            <div className="w-72 sm:w-80 flex-shrink-0">
              {showAddList ? (
                <form onSubmit={handleAddList} className="bg-white rounded-xl p-4 shadow-sm">
                  <input
                    type="text"
                    value={listTitle}
                    onChange={(e) => setListTitle(e.target.value)}
                    placeholder="Enter list name..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      type="submit"
                      disabled={creatingList}
                      className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {creatingList ? 'Adding...' : 'Add List'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddList(false);
                        setListTitle('');
                      }}
                      className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddList(true)}
                  className="w-full text-left p-4 bg-white/60 hover:bg-white/80 text-gray-600 rounded-xl transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add another list
                </button>
              )}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} />}
        </DragOverlay>
      </DndContext>

      {selectedTask && (
        <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} boardMembers={board.members} />
      )}

      <ActivityPanel
        boardId={id}
        isOpen={showActivity}
        onClose={() => setShowActivity(false)}
      />
    </div>
  );
};

export default BoardPage;
