import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { useGetBoardQuery } from './boardApi';
import { useCreateListMutation } from '../lists/listApi';
import { useMoveTaskMutation } from '../tasks/taskApi';
import ListColumn from '../lists/ListColumn';
import TaskCard from '../tasks/TaskCard';
import TaskModal from '../tasks/TaskModal';
import Navbar from '../../components/Layout/Navbar';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const BoardPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useGetBoardQuery(id);
  const [createList, { isLoading: creatingList }] = useCreateListMutation();
  const [moveTask] = useMoveTaskMutation();

  const [showAddList, setShowAddList] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  const board = data?.data?.board;
  const lists = data?.data?.lists || [];
  const tasks = data?.data?.tasks || [];

  const getTasksForList = (listId) => {
    return tasks.filter((t) => t.list === listId).sort((a, b) => a.position - b.position);
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!listTitle.trim()) return;

    try {
      await createList({ boardId: id, title: listTitle }).unwrap();
      setListTitle('');
      setShowAddList(false);
      toast.success('List created!');
    } catch (error) {
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
    } catch (error) {
      toast.error('Failed to move task');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-56px)]">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)]">
          <p className="text-gray-500 mb-4">Board not found</p>
          <Link to="/" className="text-primary-600 hover:underline">
            Go back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: board.background || '#1B4F72' }}>
      <Navbar />

      <div className="px-4 py-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-white/80 hover:text-white">
            &larr; Back
          </Link>
          <h1 className="text-xl font-bold text-white">{board.title}</h1>
        </div>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto px-4 pb-4">
          <div className="flex gap-4 h-full">
            {lists.map((list) => (
              <ListColumn
                key={list._id}
                list={list}
                tasks={getTasksForList(list._id)}
                onTaskClick={setSelectedTask}
              />
            ))}

            <div className="w-72 flex-shrink-0">
              {showAddList ? (
                <form onSubmit={handleAddList} className="bg-gray-100 rounded-lg p-3">
                  <input
                    type="text"
                    value={listTitle}
                    onChange={(e) => setListTitle(e.target.value)}
                    placeholder="List title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      disabled={creatingList}
                      className="px-3 py-1.5 bg-primary-600 text-white rounded hover:bg-primary-700"
                    >
                      Add List
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddList(false)}
                      className="px-3 py-1.5 text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddList(true)}
                  className="w-full text-left p-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                >
                  + Add a list
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
        <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
};

export default BoardPage;
