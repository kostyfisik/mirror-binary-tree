import { cloneDeep } from 'lodash'
export type TreeNode = {
    left: TreeNode
    right: TreeNode
    type: 'node'
} | {
    data: ArrayBuffer | number
    type: 'data'
}

// recurrent 
export function Mirror(tree: TreeNode): TreeNode {
    if (tree.type === 'node') {
        const newTree: TreeNode = {
            left: Mirror(tree.right),
            right: Mirror(tree.left),
            type: 'node',
        }
        return newTree
    }
    return tree
}


// iterative
export function MirrorWhile(tree: TreeNode): TreeNode {
    // const newTree = cloneDeep(tree)
    const newTree = tree
    let totalNodes = 0
    const stack = [newTree]
    while (stack.length !== 0) {
        const node = stack.pop()
        totalNodes += 1
        if (node.type == 'data') {
            continue
        }
        const tmp = node.left
        node.left = node.right
        node.right = tmp

        stack.push(node.left)
        stack.push(node.right)
    }
    console.log('Total data nodes:', totalNodes)
    return newTree
}

// on flattened tree
export function MirrorArr(arr: number[]): number[] {
    // const arr = [...inArr]
    for (let i = 0; i < arr.length; i += 3) {
        const tmp = arr[i]
        arr[i] = arr[i + 1]
        arr[i + 1] = tmp
    }
    return arr
}

export function Array2Tree(arr: number[], index: number): TreeNode {
    if (arr[index] != 0) {
        const newTree: TreeNode = {
            left: Array2Tree(arr, arr[index]),
            right: Array2Tree(arr, arr[index + 1]),
            type: 'node',
        }
        return newTree
    }
    const newTree: TreeNode = {
        data: arr[index + 2],
        type: 'data',
    }
    return newTree

}

// Tree is converted to 1D array, numbers are branch index values. Nodes has
// data placeholder (filled with zero), data has branches placeholders (filled
// with zero) 
//              ______________________________ data values
//              |               |         |
//              V               V         V 
// [3,6,0,  0,0,42, 9,12,0, 0,0,333,  0,0,777 ]
//  0       3       6       9        12  <--------- array index
//        
//  So, root node [3,6,0] has two branches. Left (index=3) is a data node, with
//  value=42, right node (index=6) refers to two data nodes (at index=9 and 12)
//  with values 333 and 777.
//
//  For some real case value can be a key for a dictionary with some real
//  payload of the tree.
export function Tree2Array(tree: TreeNode): number[] {
    const arr: number[] = []
    const stack = [tree]
    const stackIndex = [0]
    let newIndex = 0
    while (stack.length !== 0) {
        const node = stack.pop()
        const nodeIndex = stackIndex.pop()
        if (node.type == 'data') {
            // console.log('data')
            arr[nodeIndex] = 0
            arr[nodeIndex + 1] = 0
            arr[nodeIndex + 2] = typeof (node.data) == 'number' ? node.data : 0
            continue
        }
        const nextIndex = newIndex + 3
        const nextIndex2 = nextIndex + 3
        newIndex = nextIndex2

        arr[nodeIndex] = nextIndex
        stackIndex.push(nextIndex)
        stack.push(node.left)

        arr[nodeIndex + 1] = nextIndex2
        stackIndex.push(nextIndex2)
        stack.push(node.right)

        arr[nodeIndex + 2] = 0

    }
    return arr
}



export function GenerateTree(
    maxDataSize: number,
    stopChance: number,
    minSize: number,
    currLevel: number,
    isNum: boolean,
): TreeNode {
    if (currLevel < minSize || Math.random() > stopChance) {
        return {
            left: GenerateTree(maxDataSize, stopChance, minSize, currLevel + 1, isNum),
            right: GenerateTree(maxDataSize, stopChance, minSize, currLevel + 1, isNum),
            type: 'node',
        }
    }

    return {
        data: isNum
            ? Math.floor(maxDataSize * Math.random())
            : new ArrayBuffer(Math.floor(maxDataSize * Math.random())),
        type: 'data',
    }
}

function perfTest(
    fn: (tree: TreeNode | number[]) => TreeNode | number[],
    tree: TreeNode | number[],
    repeats: number,
): { time: number[]; tree: TreeNode | number[] } {
    const time: number[] = []
    let newTree: TreeNode | number[] = tree
    for (let i = 0; i < repeats; i++) {
        const t0 = performance.now()
        newTree = fn(tree)
        const t1 = performance.now()
        time.push(Math.round(t1 - t0))
    }
    return { time, tree: newTree }
}

// Setup 
let isNum = true
const minLength = 3
let binTree = GenerateTree(100, 0.7, minLength, 0, isNum)
console.log('Testring tree:', JSON.stringify(binTree))
console.log('Mirror works:',
    JSON.stringify(binTree) === JSON.stringify(Mirror(Mirror(binTree))))
console.log('Mirror is not equal to orig tree:',
    JSON.stringify(binTree) !== JSON.stringify(Mirror(binTree)))

let arr = Tree2Array(binTree)
const newTree = Array2Tree(arr, 0)
console.log('Tree -> Arr -> Tree conversion works:',
    JSON.stringify(binTree) === JSON.stringify(newTree))

console.log('MirrorArr works:',
    JSON.stringify(Mirror(binTree)) === JSON.stringify(Array2Tree(MirrorArr(arr), 0)))
console.log('MirrorWhile works:',
    JSON.stringify(Mirror(binTree)) === JSON.stringify(MirrorWhile(binTree)))

isNum = true
console.log('Generate a big tree...')
binTree = GenerateTree(10, 0.7, 22, 0, isNum)
console.log('Convert big tree to flat arr...')
arr = Tree2Array(binTree)
// binTree = GenerateTree(10, 0.7, 16, 0, isNum)
const repeats = 1
console.log('Cache/JIT warm-up... (are there any in JS engines?)')
perfTest(Mirror, binTree, repeats)
perfTest(MirrorWhile, binTree, repeats)
console.log('Test run')
for (let _ in [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    console.log(`Call to Mirror (recurrent) took ${Math.min.apply(null,
        perfTest(Mirror, binTree, repeats).time,
    )
        } milliseconds.`)
    console.log(`Call to Mirror (arr) took ${Math.min.apply(null,
        perfTest(MirrorArr, arr, repeats).time,
    )
        } milliseconds.`)

    console.log(`Call to Mirror (while) took ${Math.min.apply(null,
        perfTest(MirrorWhile, binTree, repeats).time,
    )
        } milliseconds.`)
}

// let message: string = '<br><br><pre>' + JSON.stringify(arr) + '</pre>'
// message += '<pre>' + JSON.stringify(binTree, null, 2) + '</pre>'
// document.getElementById("root").innerHTML = message;
