import { cloneDeep } from 'lodash'
export type TreeNode = {
    left: TreeNode
    right: TreeNode
    type: 'node'
} | {
    data: ArrayBuffer | number
    type: 'data'
}

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

export function MirrorWhile(tree: TreeNode): TreeNode {
    // const newTree = cloneDeep(tree)
    const newTree = tree
    const stack = [newTree]
    while (stack.length !== 0) {
        const node = stack.pop()
        if (node && node.type === 'data')
            continue
        if (node && node.type === 'node') {
            const tmp = node.left
            node.left = node.right
            node.right = tmp

            stack.push(node.left)
            stack.push(node.right)
        }
    }
    return newTree
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
    fn: (tree: TreeNode) => TreeNode,
    tree: TreeNode,
    repeats: number,
): { time: number[]; tree: TreeNode } {
    const time: number[] = []
    let newTree: TreeNode = tree
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

console.log('MirrorWhile works:',
    JSON.stringify(Mirror(binTree)) === JSON.stringify(MirrorWhile(binTree)))

isNum = true
console.log('Generate a big tree...')
binTree = GenerateTree(10, 0.7, 22, 0, isNum)
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

    console.log(`Call to Mirror (while) took ${Math.min.apply(null,
        perfTest(MirrorWhile, binTree, repeats).time,
    )
        } milliseconds.`)
}
// const message: string = `Hello ${x}`;
// document.getElementById("root").innerHTML = message;
