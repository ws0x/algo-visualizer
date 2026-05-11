// BST Node: { val, left: null|node, right: null|node }

export function insertBST(root, val) {
  if (!root) return { val, left: null, right: null }
  if (val < root.val) return { ...root, left: insertBST(root.left, val) }
  if (val > root.val) return { ...root, right: insertBST(root.right, val) }
  return root // duplicate
}

export function deleteBST(root, val) {
  if (!root) return null
  if (val < root.val) return { ...root, left: deleteBST(root.left, val) }
  if (val > root.val) return { ...root, right: deleteBST(root.right, val) }
  // Found node to delete
  if (!root.left) return root.right
  if (!root.right) return root.left
  // Two children — find inorder successor (min of right subtree)
  let successor = root.right
  while (successor.left) successor = successor.left
  return { ...root, val: successor.val, right: deleteBST(root.right, successor.val) }
}

export function buildDefaultTree() {
  let root = null
  for (const v of [50, 30, 70, 20, 40, 60, 80]) root = insertBST(root, v)
  return root
}

export function computeTreeLayout(root) {
  // In-order position assignment
  const nodes = []
  const edges = []
  let counter = { val: 0 }

  const SVG_HEIGHT = 340
  const LEVEL_HEIGHT = 70

  function getDepth(node) {
    if (!node) return 0
    return 1 + Math.max(getDepth(node.left), getDepth(node.right))
  }

  const depth = getDepth(root)

  function assign(node, depth, parentVal = null) {
    if (!node) return
    assign(node.left, depth + 1, node.val)
    const xPos = counter.val
    counter.val++
    assign(node.right, depth + 1, node.val)

    nodes.push({ val: node.val, xPos, depth })
    if (parentVal !== null) edges.push({ from: parentVal, to: node.val })
  }

  assign(root, 0)

  const totalNodes = nodes.length
  const xScale = Math.min(52, Math.max(36, 600 / Math.max(totalNodes, 1)))

  const positioned = nodes.map(n => ({
    ...n,
    x: (n.xPos + 0.5) * xScale + 20,
    y: n.depth * LEVEL_HEIGHT + 40,
  }))

  return { nodes: positioned, edges }
}

function makeStep(layout, visited, current, info) {
  return {
    nodes: layout.nodes,
    edges: layout.edges,
    visited: [...visited],
    current,
    info,
  }
}

export function inorderSteps(root) {
  const layout = computeTreeLayout(root)
  const steps = []
  const visited = []

  steps.push(makeStep(layout, visited, null, 'Starting Inorder traversal: Left → Root → Right'))

  function traverse(node) {
    if (!node) return
    steps.push(makeStep(layout, visited, node.val, `Go left from ${node.val}`))
    traverse(node.left)
    visited.push(node.val)
    steps.push(makeStep(layout, visited, node.val, `Visit ${node.val} (inorder position ${visited.length})`))
    steps.push(makeStep(layout, visited, node.val, `Go right from ${node.val}`))
    traverse(node.right)
  }

  traverse(root)
  steps.push(makeStep(layout, visited, null, `✓ Inorder complete: [${visited.join(', ')}]`))
  return steps
}

export function preorderSteps(root) {
  const layout = computeTreeLayout(root)
  const steps = []
  const visited = []

  steps.push(makeStep(layout, visited, null, 'Starting Preorder traversal: Root → Left → Right'))

  function traverse(node) {
    if (!node) return
    visited.push(node.val)
    steps.push(makeStep(layout, visited, node.val, `Visit ${node.val} (preorder position ${visited.length})`))
    steps.push(makeStep(layout, visited, node.val, `Go left from ${node.val}`))
    traverse(node.left)
    steps.push(makeStep(layout, visited, node.val, `Go right from ${node.val}`))
    traverse(node.right)
  }

  traverse(root)
  steps.push(makeStep(layout, visited, null, `✓ Preorder complete: [${visited.join(', ')}]`))
  return steps
}

export function postorderSteps(root) {
  const layout = computeTreeLayout(root)
  const steps = []
  const visited = []

  steps.push(makeStep(layout, visited, null, 'Starting Postorder traversal: Left → Right → Root'))

  function traverse(node) {
    if (!node) return
    steps.push(makeStep(layout, visited, node.val, `Go left from ${node.val}`))
    traverse(node.left)
    steps.push(makeStep(layout, visited, node.val, `Go right from ${node.val}`))
    traverse(node.right)
    visited.push(node.val)
    steps.push(makeStep(layout, visited, node.val, `Visit ${node.val} (postorder position ${visited.length})`))
  }

  traverse(root)
  steps.push(makeStep(layout, visited, null, `✓ Postorder complete: [${visited.join(', ')}]`))
  return steps
}

export function generateTreeSteps(traversal, root) {
  if (!root) return [makeStep({ nodes: [], edges: [] }, [], null, 'Empty tree')]
  switch (traversal) {
    case 'inorder': return inorderSteps(root)
    case 'preorder': return preorderSteps(root)
    case 'postorder': return postorderSteps(root)
    default: return inorderSteps(root)
  }
}

export function getTreeValues(root) {
  if (!root) return []
  return [...getTreeValues(root.left), root.val, ...getTreeValues(root.right)]
}
