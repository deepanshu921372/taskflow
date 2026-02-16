import { useState } from 'react';
import { useUpdateTaskMutation, useDeleteTaskMutation } from './taskApi';
import toast from 'react-hot-toast';

const TaskModal = ({ task, onClose }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority || 'medium');
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );

  const [updateTask, { isLoading: updating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: deleting }] = useDeleteTaskMutation();

  const handleSave = async () => {
    try {
      await updateTask({
        id: task._id,
        title,
        description,
        priority,
        dueDate: dueDate || null,
      }).unwrap();
      toast.success('Task updated');
      onClose();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask(task._id).unwrap();
      toast.success('Task deleted');
      onClose();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add more details..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {task.assignees?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Assignees</label>
              <div className="flex flex-wrap gap-2">
                {task.assignees.map((user) => (
                  <span
                    key={user._id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-700"
                  >
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 text-xs font-medium flex items-center justify-center">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                    {user.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updating}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
            >
              {updating ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
