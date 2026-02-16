import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskCard from '../TaskCard';

// Mock dnd-kit
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => '',
    },
  },
}));

describe('TaskCard', () => {
  const mockTask = {
    _id: '1',
    title: 'Test Task',
    priority: 'medium',
    assignees: [],
  };

  it('renders task title', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders priority badge for low priority', () => {
    const lowPriorityTask = { ...mockTask, priority: 'low' };
    render(<TaskCard task={lowPriorityTask} />);

    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('renders priority badge for medium priority', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('renders priority badge for high priority', () => {
    const highPriorityTask = { ...mockTask, priority: 'high' };
    render(<TaskCard task={highPriorityTask} />);

    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders priority badge for urgent priority', () => {
    const urgentTask = { ...mockTask, priority: 'urgent' };
    render(<TaskCard task={urgentTask} />);

    expect(screen.getByText('Urgent')).toBeInTheDocument();
  });

  it('renders due date when provided', () => {
    const taskWithDueDate = {
      ...mockTask,
      dueDate: '2025-12-31',
    };
    render(<TaskCard task={taskWithDueDate} />);

    expect(screen.getByText(/Dec 31/)).toBeInTheDocument();
  });

  it('renders assignee avatars', () => {
    const taskWithAssignees = {
      ...mockTask,
      assignees: [
        { _id: '1', name: 'Alice' },
        { _id: '2', name: 'Bob' },
      ],
    };
    render(<TaskCard task={taskWithAssignees} />);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('shows +N indicator for more than 3 assignees', () => {
    const taskWithManyAssignees = {
      ...mockTask,
      assignees: [
        { _id: '1', name: 'Alice' },
        { _id: '2', name: 'Bob' },
        { _id: '3', name: 'Carol' },
        { _id: '4', name: 'Dave' },
        { _id: '5', name: 'Eve' },
      ],
    };
    render(<TaskCard task={taskWithManyAssignees} />);

    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('does not render due date section when no due date', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.queryByText(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/)).not.toBeInTheDocument();
  });

  it('renders without crashing with minimal task data', () => {
    const minimalTask = {
      _id: '1',
      title: 'Minimal Task',
    };
    render(<TaskCard task={minimalTask} />);

    expect(screen.getByText('Minimal Task')).toBeInTheDocument();
  });
});
