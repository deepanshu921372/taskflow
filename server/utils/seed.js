require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Board = require('../models/Board');
const List = require('../models/List');
const Task = require('../models/Task');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Board.deleteMany({});
    await List.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const alice = await User.create({
      name: 'Alice Johnson',
      email: 'alice@taskflow.demo',
      password: 'Demo@1234',
    });

    const bob = await User.create({
      name: 'Bob Smith',
      email: 'bob@taskflow.demo',
      password: 'Demo@1234',
    });

    const carol = await User.create({
      name: 'Carol Williams',
      email: 'carol@taskflow.demo',
      password: 'Demo@1234',
    });

    console.log('Created users');

    // Create board
    const board = await Board.create({
      title: 'Project Alpha',
      description: 'Main project board for demo',
      owner: alice._id,
      members: [alice._id, bob._id, carol._id],
      background: '#1B4F72',
    });

    console.log('Created board');

    // Create lists
    const todoList = await List.create({
      title: 'To Do',
      board: board._id,
      position: 0,
    });

    const inProgressList = await List.create({
      title: 'In Progress',
      board: board._id,
      position: 1,
    });

    const doneList = await List.create({
      title: 'Done',
      board: board._id,
      position: 2,
    });

    console.log('Created lists');

    // Create tasks
    await Task.create({
      title: 'Setup project structure',
      description: 'Initialize the project with proper folder structure',
      list: doneList._id,
      board: board._id,
      position: 0,
      priority: 'high',
      assignees: [alice._id],
    });

    await Task.create({
      title: 'Design database schema',
      description: 'Create MongoDB schemas for all models',
      list: doneList._id,
      board: board._id,
      position: 1,
      priority: 'high',
      assignees: [alice._id, bob._id],
    });

    await Task.create({
      title: 'Implement authentication',
      description: 'Add JWT based authentication',
      list: inProgressList._id,
      board: board._id,
      position: 0,
      priority: 'urgent',
      assignees: [bob._id],
    });

    await Task.create({
      title: 'Build API endpoints',
      description: 'Create REST API for boards, lists, tasks',
      list: inProgressList._id,
      board: board._id,
      position: 1,
      priority: 'high',
      assignees: [carol._id],
    });

    await Task.create({
      title: 'Setup Socket.IO',
      description: 'Configure real-time communication',
      list: todoList._id,
      board: board._id,
      position: 0,
      priority: 'medium',
      assignees: [],
    });

    await Task.create({
      title: 'Build frontend UI',
      description: 'Create React components with Tailwind CSS',
      list: todoList._id,
      board: board._id,
      position: 1,
      priority: 'medium',
      assignees: [carol._id],
    });

    await Task.create({
      title: 'Add drag and drop',
      description: 'Implement drag and drop with dnd-kit',
      list: todoList._id,
      board: board._id,
      position: 2,
      priority: 'low',
      assignees: [],
    });

    console.log('Created tasks');
    console.log('Seed completed successfully!');
    console.log('\nDemo Credentials:');
    console.log('Email: alice@taskflow.demo');
    console.log('Password: Demo@1234');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
