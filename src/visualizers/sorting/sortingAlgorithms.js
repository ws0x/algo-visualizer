function makeStep(array, comparing = [], swapping = [], sorted = [], pivot = -1, min = -1, info = '') {
  return { array: [...array], comparing, swapping, sorted, pivot, min, info }
}

export function bubbleSort(arr) {
  const steps = []
  const a = [...arr]
  const n = a.length
  const sortedSet = []

  steps.push(makeStep(a, [], [], [], -1, -1, 'Starting Bubble Sort — comparing adjacent elements'))

  for (let i = 0; i < n - 1; i++) {
    let swapped = false
    for (let j = 0; j < n - i - 1; j++) {
      steps.push(makeStep(a, [j, j + 1], [], [...sortedSet], -1, -1,
        `Comparing a[${j}]=${a[j]} and a[${j + 1}]=${a[j + 1]}`))

      if (a[j] > a[j + 1]) {
        steps.push(makeStep(a, [], [j, j + 1], [...sortedSet], -1, -1,
          `Swapping a[${j}]=${a[j]} and a[${j + 1}]=${a[j + 1]}`))
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        swapped = true
        steps.push(makeStep(a, [], [], [...sortedSet], -1, -1,
          `After swap: [${a.join(', ')}]`))
      }
    }
    sortedSet.push(n - 1 - i)
    steps.push(makeStep(a, [], [], [...sortedSet], -1, -1,
      `Pass ${i + 1} complete — a[${n - 1 - i}]=${a[n - 1 - i]} is in sorted position`))

    if (!swapped) {
      for (let k = 0; k < n; k++) sortedSet.push(k)
      steps.push(makeStep(a, [], [], [...new Set(sortedSet)], -1, -1,
        '✓ No swaps in this pass — array is fully sorted!'))
      break
    }
  }

  if (!steps[steps.length - 1].info.includes('✓')) {
    const allSorted = Array.from({ length: n }, (_, i) => i)
    steps.push(makeStep(a, [], [], allSorted, -1, -1, '✓ Bubble Sort complete — array is sorted!'))
  }

  return steps
}

export function selectionSort(arr) {
  const steps = []
  const a = [...arr]
  const n = a.length
  const sortedSet = []

  steps.push(makeStep(a, [], [], [], -1, -1, 'Starting Selection Sort — find minimum in unsorted portion'))

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    steps.push(makeStep(a, [], [], [...sortedSet], -1, minIdx,
      `Pass ${i + 1}: looking for minimum in a[${i}..${n - 1}], current min = a[${i}]=${a[i]}`))

    for (let j = i + 1; j < n; j++) {
      steps.push(makeStep(a, [j], [], [...sortedSet], -1, minIdx,
        `Comparing a[${j}]=${a[j]} with current min a[${minIdx}]=${a[minIdx]}`))

      if (a[j] < a[minIdx]) {
        minIdx = j
        steps.push(makeStep(a, [], [], [...sortedSet], -1, minIdx,
          `New minimum found: a[${minIdx}]=${a[minIdx]}`))
      }
    }

    if (minIdx !== i) {
      steps.push(makeStep(a, [], [i, minIdx], [...sortedSet], -1, -1,
        `Swapping a[${i}]=${a[i]} with minimum a[${minIdx}]=${a[minIdx]}`))
      ;[a[i], a[minIdx]] = [a[minIdx], a[i]]
      steps.push(makeStep(a, [], [], [...sortedSet], -1, -1,
        `After swap: a[${i}]=${a[i]} placed correctly`))
    } else {
      steps.push(makeStep(a, [], [], [...sortedSet], -1, -1,
        `a[${i}]=${a[i]} is already the minimum — no swap needed`))
    }

    sortedSet.push(i)
    steps.push(makeStep(a, [], [], [...sortedSet], -1, -1,
      `a[${i}]=${a[i]} is now in its sorted position`))
  }

  sortedSet.push(n - 1)
  steps.push(makeStep(a, [], [], sortedSet, -1, -1, '✓ Selection Sort complete — array is sorted!'))
  return steps
}

export function insertionSort(arr) {
  const steps = []
  const a = [...arr]
  const n = a.length

  steps.push(makeStep(a, [], [], [0], -1, -1, 'Starting Insertion Sort — first element is trivially sorted'))

  for (let i = 1; i < n; i++) {
    const key = a[i]
    let j = i - 1

    steps.push(makeStep(a, [i], [], Array.from({ length: i }, (_, k) => k), -1, -1,
      `Inserting a[${i}]=${key} into the sorted portion a[0..${i - 1}]`))

    while (j >= 0 && a[j] > key) {
      steps.push(makeStep(a, [j, j + 1], [], Array.from({ length: i }, (_, k) => k), -1, -1,
        `a[${j}]=${a[j]} > ${key} — shifting a[${j}] right`))
      a[j + 1] = a[j]
      j--
      steps.push(makeStep(a, [], [], Array.from({ length: i }, (_, k) => k), -1, -1,
        `After shift: [${a.join(', ')}]`))
    }

    a[j + 1] = key
    const sortedIndices = Array.from({ length: i + 1 }, (_, k) => k)
    steps.push(makeStep(a, [], [], sortedIndices, -1, -1,
      `Placed ${key} at position ${j + 1} — sorted portion is now a[0..${i}]`))
  }

  const allSorted = Array.from({ length: n }, (_, i) => i)
  steps.push(makeStep(a, [], [], allSorted, -1, -1, '✓ Insertion Sort complete — array is sorted!'))
  return steps
}

export function mergeSort(arr) {
  const steps = []
  const a = [...arr]

  steps.push(makeStep(a, [], [], [], -1, -1, 'Starting Merge Sort — dividing array recursively'))

  function merge(arr, left, mid, right, sortedSet) {
    const leftArr = arr.slice(left, mid + 1)
    const rightArr = arr.slice(mid + 1, right + 1)

    steps.push(makeStep([...arr], Array.from({ length: right - left + 1 }, (_, i) => left + i), [], [...sortedSet], -1, -1,
      `Merging subarrays [${leftArr.join(',')}] and [${rightArr.join(',')}]`))

    let i = 0, j = 0, k = left

    while (i < leftArr.length && j < rightArr.length) {
      steps.push(makeStep([...arr], [left + i, mid + 1 + j], [], [...sortedSet], -1, -1,
        `Comparing ${leftArr[i]} and ${rightArr[j]}`))

      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i]
        i++
      } else {
        arr[k] = rightArr[j]
        j++
      }
      steps.push(makeStep([...arr], [], [], [...sortedSet], -1, -1,
        `Placed ${arr[k]} at index ${k}`))
      k++
    }

    while (i < leftArr.length) {
      arr[k] = leftArr[i]
      steps.push(makeStep([...arr], [k], [], [...sortedSet], -1, -1,
        `Copying remaining: ${leftArr[i]}`))
      i++; k++
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j]
      steps.push(makeStep([...arr], [k], [], [...sortedSet], -1, -1,
        `Copying remaining: ${rightArr[j]}`))
      j++; k++
    }
  }

  function sort(arr, left, right, sortedSet) {
    if (left < right) {
      const mid = Math.floor((left + right) / 2)
      sort(arr, left, mid, sortedSet)
      sort(arr, mid + 1, right, sortedSet)
      merge(arr, left, mid, right, sortedSet)
      const newSorted = Array.from({ length: right - left + 1 }, (_, i) => left + i)
      newSorted.forEach(idx => sortedSet.add(idx))
      steps.push(makeStep([...arr], [], [], [...sortedSet], -1, -1,
        `Subarray [${left}..${right}] merged and sorted: [${arr.slice(left, right + 1).join(',')}]`))
    }
  }

  const sortedSet = new Set()
  sort(a, 0, a.length - 1, sortedSet)

  const allSorted = Array.from({ length: a.length }, (_, i) => i)
  steps.push(makeStep(a, [], [], allSorted, -1, -1, '✓ Merge Sort complete — array is sorted!'))
  return steps
}

export function quickSort(arr) {
  const steps = []
  const a = [...arr]
  const sortedSet = new Set()

  steps.push(makeStep(a, [], [], [], -1, -1, 'Starting Quick Sort — Lomuto partition scheme, last element as pivot'))

  function partition(arr, low, high) {
    const pivot = arr[high]
    steps.push(makeStep([...arr], [], [], [...sortedSet], high, -1,
      `Pivot = a[${high}]=${pivot} — partitioning range [${low}..${high}]`))

    let i = low - 1

    for (let j = low; j < high; j++) {
      steps.push(makeStep([...arr], [j], [], [...sortedSet], high, -1,
        `Comparing a[${j}]=${arr[j]} with pivot ${pivot}`))

      if (arr[j] <= pivot) {
        i++
        if (i !== j) {
          steps.push(makeStep([...arr], [], [i, j], [...sortedSet], high, -1,
            `a[${j}]=${arr[j]} ≤ pivot — swapping a[${i}]=${arr[i]} and a[${j}]=${arr[j]}`))
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
          steps.push(makeStep([...arr], [], [], [...sortedSet], high, -1,
            `After swap: [${arr.join(', ')}]`))
        } else {
          steps.push(makeStep([...arr], [], [], [...sortedSet], high, -1,
            `a[${j}]=${arr[j]} ≤ pivot — already in place`))
        }
      }
    }

    steps.push(makeStep([...arr], [], [i + 1, high], [...sortedSet], -1, -1,
      `Placing pivot ${pivot} at its correct position ${i + 1}`))
    ;[arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
    sortedSet.add(i + 1)
    steps.push(makeStep([...arr], [], [], [...sortedSet], -1, -1,
      `Pivot ${pivot} is now at index ${i + 1} — its final position`))
    return i + 1
  }

  function sort(arr, low, high) {
    if (low < high) {
      const pi = partition(arr, low, high)
      sort(arr, low, pi - 1)
      sort(arr, pi + 1, high)
    } else if (low === high) {
      sortedSet.add(low)
    }
  }

  sort(a, 0, a.length - 1)

  const allSorted = Array.from({ length: a.length }, (_, i) => i)
  steps.push(makeStep(a, [], [], allSorted, -1, -1, '✓ Quick Sort complete — array is sorted!'))
  return steps
}

export function heapSort(arr) {
  const steps = []
  const a = [...arr]
  const n = a.length
  const sortedSet = new Set()

  steps.push(makeStep(a, [], [], [], -1, -1, 'Starting Heap Sort — building max-heap first'))

  function heapify(arr, n, i) {
    let largest = i
    const left = 2 * i + 1
    const right = 2 * i + 2

    if (left < n) {
      steps.push(makeStep([...arr], [i, left], [], [...sortedSet], i, -1,
        `Comparing parent a[${i}]=${arr[i]} with left child a[${left}]=${arr[left]}`))
      if (arr[left] > arr[largest]) largest = left
    }

    if (right < n) {
      steps.push(makeStep([...arr], [i, right], [], [...sortedSet], i, -1,
        `Comparing a[${i}]=${arr[i]} with right child a[${right}]=${arr[right]}`))
      if (arr[right] > arr[largest]) largest = right
    }

    if (largest !== i) {
      steps.push(makeStep([...arr], [], [i, largest], [...sortedSet], -1, -1,
        `Swapping a[${i}]=${arr[i]} with larger child a[${largest}]=${arr[largest]}`))
      ;[arr[i], arr[largest]] = [arr[largest], arr[i]]
      steps.push(makeStep([...arr], [], [], [...sortedSet], -1, -1,
        `After swap: max-heap property restored at index ${i}`))
      heapify(arr, n, largest)
    }
  }

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    steps.push(makeStep([...a], [], [], [...sortedSet], i, -1,
      `Heapifying subtree rooted at index ${i}`))
    heapify(a, n, i)
  }

  steps.push(makeStep([...a], [], [], [...sortedSet], -1, -1,
    'Max-heap built! Largest element is at root. Now extracting elements one by one'))

  // Extract elements from heap
  for (let i = n - 1; i > 0; i--) {
    steps.push(makeStep([...a], [], [0, i], [...sortedSet], -1, -1,
      `Extracting max: swapping root a[0]=${a[0]} with a[${i}]=${a[i]}`))
    ;[a[0], a[i]] = [a[i], a[0]]
    sortedSet.add(i)
    steps.push(makeStep([...a], [], [], [...sortedSet], -1, -1,
      `a[${i}]=${a[i]} is in its final sorted position. Re-heapifying remaining ${i} elements`))
    heapify(a, i, 0)
  }

  sortedSet.add(0)
  const allSorted = Array.from({ length: n }, (_, i) => i)
  steps.push(makeStep(a, [], [], allSorted, -1, -1, '✓ Heap Sort complete — array is sorted!'))
  return steps
}

export function generateSortingSteps(algorithm, array) {
  if (!array || array.length === 0) return [makeStep([], [], [], [], -1, -1, 'Empty array')]
  switch (algorithm) {
    case 'bubble': return bubbleSort(array)
    case 'selection': return selectionSort(array)
    case 'insertion': return insertionSort(array)
    case 'merge': return mergeSort(array)
    case 'quick': return quickSort(array)
    case 'heap': return heapSort(array)
    default: return bubbleSort(array)
  }
}
