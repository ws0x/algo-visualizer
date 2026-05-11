function makeStep(array, target, current = -1, found = -1, low = -1, high = -1, mid = -1, eliminated = [], info = '') {
  return { array: [...array], target, current, found, low, high, mid, eliminated: [...eliminated], info }
}

export function linearSearch(arr, target) {
  const steps = []
  steps.push(makeStep(arr, target, -1, -1, -1, -1, -1, [],
    `Starting Linear Search for target = ${target}`))

  for (let i = 0; i < arr.length; i++) {
    steps.push(makeStep(arr, target, i, -1, -1, -1, -1, [],
      `Checking a[${i}] = ${arr[i]} == ${target}?`))

    if (arr[i] === target) {
      steps.push(makeStep(arr, target, -1, i, -1, -1, -1, [],
        `✓ Found target ${target} at index ${i}!`))
      return steps
    } else {
      steps.push(makeStep(arr, target, i, -1, -1, -1, -1, [],
        `a[${i}] = ${arr[i]} ≠ ${target} — continue`))
    }
  }

  steps.push(makeStep(arr, target, -1, -1, -1, -1, -1, Array.from({ length: arr.length }, (_, i) => i),
    `Target ${target} not found in array after checking all ${arr.length} elements`))
  return steps
}

export function binarySearch(arr, target) {
  const sorted = [...arr].sort((a, b) => a - b)
  const steps = []
  const eliminated = []

  steps.push(makeStep(sorted, target, -1, -1, 0, sorted.length - 1, -1, [],
    `Binary Search on sorted array for target = ${target}. Range: [0, ${sorted.length - 1}]`))

  let low = 0
  let high = sorted.length - 1

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)

    steps.push(makeStep(sorted, target, -1, -1, low, high, mid, [...eliminated],
      `low=${low}, high=${high}, mid=${mid} → a[${mid}]=${sorted[mid]}`))

    steps.push(makeStep(sorted, target, mid, -1, low, high, mid, [...eliminated],
      `Comparing a[${mid}]=${sorted[mid]} with target=${target}`))

    if (sorted[mid] === target) {
      steps.push(makeStep(sorted, target, -1, mid, low, high, mid, [...eliminated],
        `✓ Found target ${target} at index ${mid}!`))
      return steps
    } else if (sorted[mid] < target) {
      for (let i = low; i <= mid; i++) eliminated.push(i)
      steps.push(makeStep(sorted, target, -1, -1, mid + 1, high, -1, [...eliminated],
        `a[${mid}]=${sorted[mid]} < ${target} — eliminate left half, new low=${mid + 1}`))
      low = mid + 1
    } else {
      for (let i = mid; i <= high; i++) eliminated.push(i)
      steps.push(makeStep(sorted, target, -1, -1, low, mid - 1, -1, [...eliminated],
        `a[${mid}]=${sorted[mid]} > ${target} — eliminate right half, new high=${mid - 1}`))
      high = mid - 1
    }
  }

  for (let i = 0; i < sorted.length; i++) eliminated.push(i)
  steps.push(makeStep(sorted, target, -1, -1, -1, -1, -1, [...new Set(eliminated)],
    `Target ${target} not found — search space exhausted`))
  return steps
}

export function generateSearchingSteps(algorithm, array, target) {
  if (!array || array.length === 0) return [makeStep([], target, -1, -1, -1, -1, -1, [], 'Empty array')]
  switch (algorithm) {
    case 'linear': return linearSearch(array, target)
    case 'binary': return binarySearch(array, target)
    default: return linearSearch(array, target)
  }
}
