import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetBoardsQuery, useCreateBoardMutation } from './boardApi';
import Navbar from '../../components/Layout/Navbar';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const { data, isLoading } = useGetBoardsQuery({});
  const [createBoard, { isLoading: creating }] = useCreateBoardMutation();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createBoard({ title }).unwrap();
      setTitle('');
      setShowForm(false);
      toast.success('Board created!');
    } catch (error) {
      toast.error(error.data?.error?.message || 'Failed to create board');
    }
  };

  const boards = data?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Boards</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your projects and tasks</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Board
          </button>
        </div>

        {showForm && (
          <div className="mb-8 p-5 bg-white rounded-xl border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Create new board</h3>
            <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter board name..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No boards yet</h3>
            <p className="text-gray-500 text-sm">Get started by creating your first board</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
              <Link
                key={board._id}
                to={`/boards/${board._id}`}
                className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div
                  className="h-24 sm:h-28"
                  style={{ backgroundColor: board.background || '#1B4F72' }}
                />
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                    {board.title}
                  </h3>
                  {board.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{board.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex -space-x-2">
                      {board.members?.slice(0, 3).map((member, i) => (
                        <div
                          key={member._id || i}
                          className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600"
                        >
                          {member.name?.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      {board.members?.length || 0} member{board.members?.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
