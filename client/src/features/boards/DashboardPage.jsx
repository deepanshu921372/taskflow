import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetBoardsQuery, useCreateBoardMutation } from './boardApi';
import Navbar from '../../components/Layout/Navbar';
import Button from '../../components/common/Button';
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Boards</h1>
          <Button onClick={() => setShowForm(true)}>New Board</Button>
        </div>

        {showForm && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <form onSubmit={handleCreate} className="flex gap-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Board title..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
              <Button type="submit" loading={creating}>Create</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No boards yet. Create your first board!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {boards.map((board) => (
              <Link
                key={board._id}
                to={`/boards/${board._id}`}
                className="block p-4 rounded-lg text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: board.background || '#1B4F72' }}
              >
                <h3 className="font-semibold text-lg mb-1">{board.title}</h3>
                {board.description && (
                  <p className="text-sm opacity-90 line-clamp-2">{board.description}</p>
                )}
                <p className="text-xs mt-3 opacity-75">
                  {board.members?.length || 0} member(s)
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
