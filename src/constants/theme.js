export const colors = {
  bg: '#282c34',
  panel: '#21252b',
  card: '#2c313c',
  border: '#3e4452',
  muted: '#4b5263',
  text: '#abb2bf',
  blue: '#61afef',
  green: '#98c379',
  yellow: '#e5c07b',
  red: '#e06c75',
  purple: '#c678dd',
  cyan: '#56b6c2',
  orange: '#d19a66',
}

export const ALGORITHMS = {
  sorting: [
    { id: 'bubble', name: 'Bubble Sort', time: 'O(n²)', space: 'O(1)', stable: true },
    { id: 'selection', name: 'Selection Sort', time: 'O(n²)', space: 'O(1)', stable: false },
    { id: 'insertion', name: 'Insertion Sort', time: 'O(n²)', space: 'O(1)', stable: true },
    { id: 'merge', name: 'Merge Sort', time: 'O(n log n)', space: 'O(n)', stable: true },
    { id: 'quick', name: 'Quick Sort', time: 'O(n log n)', space: 'O(log n)', stable: false },
    { id: 'heap', name: 'Heap Sort', time: 'O(n log n)', space: 'O(1)', stable: false },
  ],
  searching: [
    { id: 'linear', name: 'Linear Search', time: 'O(n)', space: 'O(1)', note: 'Works on unsorted' },
    { id: 'binary', name: 'Binary Search', time: 'O(log n)', space: 'O(1)', note: 'Requires sorted array' },
  ],
  graph: [
    { id: 'bfs', name: 'Breadth-First Search', time: 'O(V+E)', space: 'O(V)' },
    { id: 'dfs', name: 'Depth-First Search', time: 'O(V+E)', space: 'O(V)' },
    { id: 'dijkstra', name: "Dijkstra's Algorithm", time: 'O((V+E) log V)', space: 'O(V)' },
  ],
  tree: [
    { id: 'inorder', name: 'Inorder (L→Root→R)', time: 'O(n)', space: 'O(h)' },
    { id: 'preorder', name: 'Preorder (Root→L→R)', time: 'O(n)', space: 'O(h)' },
    { id: 'postorder', name: 'Postorder (L→R→Root)', time: 'O(n)', space: 'O(h)' },
  ],
}

export const STRUCTURES = [
  { id: 'array', name: 'Array', icon: '▦' },
  { id: 'linkedlist', name: 'Linked List', icon: '→' },
  { id: 'stack', name: 'Stack', icon: '⬍' },
  { id: 'queue', name: 'Queue', icon: '⇒' },
  { id: 'bst', name: 'Binary Search Tree', icon: '🌲' },
  { id: 'heap', name: 'Heap', icon: '△' },
  { id: 'hashtable', name: 'Hash Table', icon: '#' },
  { id: 'graph', name: 'Graph', icon: '◯' },
]
