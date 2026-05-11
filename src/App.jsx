import { useState, useMemo } from 'react'
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import SortingVisualizer from './visualizers/sorting/SortingVisualizer'
import SearchingVisualizer from './visualizers/searching/SearchingVisualizer'
import GraphVisualizer from './visualizers/graph/GraphVisualizer'
import TreeVisualizer from './visualizers/tree/TreeVisualizer'
import ArrayVisualizer from './visualizers/structures/ArrayVisualizer'
import LinkedListVisualizer from './visualizers/structures/LinkedListVisualizer'
import StackVisualizer from './visualizers/structures/StackVisualizer'
import QueueVisualizer from './visualizers/structures/QueueVisualizer'
import HeapVisualizer from './visualizers/structures/HeapVisualizer'
import HashTableVisualizer from './visualizers/structures/HashTableVisualizer'
import { ALGORITHMS, STRUCTURES, colors } from './constants/theme'

function getBreadcrumb(category, id) {
  if (category === 'sorting') return ['Algorithms', 'Sorting', ALGORITHMS.sorting.find(a => a.id === id)?.name || id]
  if (category === 'searching') return ['Algorithms', 'Searching', ALGORITHMS.searching.find(a => a.id === id)?.name || id]
  if (category === 'graph') return ['Algorithms', 'Graph', ALGORITHMS.graph.find(a => a.id === id)?.name || id]
  if (category === 'tree') return ['Algorithms', 'Trees', ALGORITHMS.tree.find(a => a.id === id)?.name || id]
  if (category === 'structure') return ['Data Structures', STRUCTURES.find(s => s.id === id)?.name || id]
  return [category, id]
}

function getCurrentAlgoMeta(category, id) {
  if (category === 'sorting') return ALGORITHMS.sorting.find(a => a.id === id)
  if (category === 'searching') return ALGORITHMS.searching.find(a => a.id === id)
  if (category === 'graph') return ALGORITHMS.graph.find(a => a.id === id)
  if (category === 'tree') return ALGORITHMS.tree.find(a => a.id === id)
  return null
}

function MainContent({ category, currentId }) {
  if (category === 'sorting') return <SortingVisualizer algorithmId={currentId} key={currentId} />
  if (category === 'searching') return <SearchingVisualizer algorithmId={currentId} key={currentId} />
  if (category === 'graph') return <GraphVisualizer algorithmId={currentId} mode="algorithm" key={currentId} />
  if (category === 'tree') return <TreeVisualizer algorithmId={currentId} key={currentId} />

  if (category === 'structure') {
    switch (currentId) {
      case 'array': return <ArrayVisualizer key="array" />
      case 'linkedlist': return <LinkedListVisualizer key="linkedlist" />
      case 'stack': return <StackVisualizer key="stack" />
      case 'queue': return <QueueVisualizer key="queue" />
      case 'bst': return <TreeVisualizer algorithmId="inorder" key="bst" />
      case 'heap': return <HeapVisualizer key="heap" />
      case 'hashtable': return <HashTableVisualizer key="hashtable" />
      case 'graph': return <GraphVisualizer algorithmId="bfs" mode="structure" key="graph-struct" />
      default: return <ArrayVisualizer key="array-default" />
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: colors.muted }}>
      Select an algorithm or data structure from the sidebar
    </div>
  )
}

export default function App() {
  const [category, setCategory] = useState('sorting')
  const [currentId, setCurrentId] = useState('bubble')

  function handleSelect(cat, id) {
    setCategory(cat)
    setCurrentId(id)
  }

  const breadcrumb = useMemo(() => getBreadcrumb(category, currentId), [category, currentId])
  const algoMeta = useMemo(() => getCurrentAlgoMeta(category, currentId), [category, currentId])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: colors.bg,
    }}>
      {/* Header */}
      <Header currentAlgo={algoMeta} breadcrumb={breadcrumb} />

      {/* Main content area */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
      }}>
        {/* Sidebar */}
        <Sidebar
          onSelect={handleSelect}
          currentCategory={category}
          currentId={currentId}
        />

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <MainContent category={category} currentId={currentId} />
        </div>
      </div>
    </div>
  )
}
