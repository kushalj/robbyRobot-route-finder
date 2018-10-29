// Node: Binary Heap node class
// MinHeap: Binary heap class (min-heap)
// getCommands: function as given


// Node object for binary heap
class Node {
    constructor(cellId, cost) {
      this.cellId = cellId
      this.cost = cost
    }
  }
  
  
  // Binary min-heap class
  class MinHeap {
    constructor(heapSize) {
      // create node-based array for costs binary heap
      this.heap = []
      
      // Map of node, index (faster than searching)
      this.nodeMap = {}
    }
    
    
    get length() {
      return this.heap.length
    }
  
  
    cost(cellId) {
      return this.nodeMap[cellId] ?
        this.heap[this.nodeMap[cellId]].cost : 
        false    
    }
  
  
    insert(newNode) {
      // if the node exists, remove it first
      if (this.cost(newNode.cellId)) {
        this.remove(newNode.cellId)
      }
  
      // begin insertion
      this.heap.push(newNode)
      let currentNodeIdx = this.heap.length - 1
      //console.log(newNode)
      
      // save node position
      this.nodeMap[newNode.cellId] = currentNodeIdx
      
      let parentNodeIdx = Math.floor( (currentNodeIdx-1) / 2 )
  
      while (
        // there is a parent and child has lower cost
        this.heap[parentNodeIdx] &&
        (newNode.cost < this.heap[parentNodeIdx].cost)
      ) {
        const parentNode = this.heap[parentNodeIdx]
        // swap nodes
        this.heap[parentNodeIdx] = newNode
        this.nodeMap[newNode.cellId] = parentNodeIdx
  
        
        this.heap[currentNodeIdx] = parentNode
        this.nodeMap[parentNode.cellId] = currentNodeIdx
        
        // point us to the newNode in it's new parent
        // position and calculate it's parent index
        currentNodeIdx = parentNodeIdx
        parentNodeIdx = Math.floor( (currentNodeIdx-1) / 2 )
  
      }
    }
  
  
    remove(cellId) {
      let toRemove = null
  
      // have we got a tree?
      if (this.heap.length === 0) {
        return toRemove
      }
      
      // if no cell ID, pop the top
      if (!cellId) {
        
        // remove the top 
        toRemove = this.heap[0]
        if (toRemove.cellId) delete this.nodeMap[toRemove.cellId]
        
        if (this.heap.length === 1) {
          // This was the final node, wipe the array
          this.heap = []
          
        } else {
          // swap the last (bottom right leaf) and top
          this.heap[0] = this.heap.pop()
          this.nodeMap[this.heap[0].cellId] = 0
  
          // re-order (minHeapify) the whole heap
          this.minHeapify(0)
        }
        
        return toRemove
        
      } else {
        const cellNodeIdx = this.nodeMap[cellId]
  
        // last cell/leaf?
        if (cellNodeIdx === this.heap.length - 1) {
          toRemove = this.heap.pop()
          delete this.nodeMap[cellId]
          
        } else {
          // save cell to remove
          toRemove = this.heap[cellNodeIdx]
          delete this.nodeMap[cellId]
          
          // insert the last cell/leaf in its place
          this.heap[cellNodeIdx] = this.heap.pop()
          this.nodeMap[this.heap[cellNodeIdx].cellId] = cellNodeIdx
  
          // re-order from here
          this.minHeapify(cellNodeIdx)          
        }
        
        return toRemove
      }
    }
    
    
    minHeapify (startNodeIdx) {
      let currentNodeIdx = startNodeIdx
      let [left, right] = [ (2*(currentNodeIdx+1))-1, 2*(currentNodeIdx+1) ]
  
      //check right and compare to left, and use <= child
      let currentChildIdx = this.heap[right] && this.heap[right].cost <= this.heap[left].cost ? right : left
      
      // has a child and cost is >= child? then swap
      while (this.heap[currentChildIdx] && this.heap[currentNodeIdx].cost > this.heap[currentChildIdx].cost) {
        let currentNode = this.heap[currentNodeIdx]
        let currentChildNode = this.heap[currentChildIdx]
        this.heap[currentChildIdx] = currentNode
        this.heap[currentNodeIdx] = currentChildNode
      }
    }
  }
    
  
  function getCommands(field, power) {
    // OPTIONAL TIMER START for timing execution/optimising
    const start = new Date()
    let loops = 0
  
    // Cell type definition (given)
    CellTypes = {
      "WALKABLE": ".", // Robby may walk on this
      "BLOCKED": "#", // Robby must not walk on this
      "START": "S", // Robby is starting here, he may also walk here
      "TARGET": "T" // The target cell, Robby has to reach
    }
  
    // Cell model - Cell coords, Cell type, cheapest Parent (from start),
    // neightbours, plus a list of commands to reach this cell from the START cell
    function Cell(cellRow, cellCol, cellType, cheapestParent) {
      this.cellRow = cellRow
      this.cellCol = cellCol
      
      // cellType is the cell contents (above)
      this.cellType = cellType
  
      // Parent with the cheapest total cost from Start cell,
      // and it's direction [ cellId, direction ] ('N', 'E', 'S', 'W')
      this.cheapestParent = cheapestParent
  
      // Array[ [cellId, direction] ] of neighbours found
      this.neighbours = []
  
      // Array of commands to this cell from the cheapestParent
      this.commands = []
      
      // heuristic result for distance to Target
      this.h = null
    }
  
  
    // costs object made of cellId: totalCost entries
    // to track the total cost to reach each cell
    const costs = {}
    
    const costsHeap = new MinHeap(field)
  
    // list to log the cells already explored/visited
    const processed = []
  
    // log of cheapest parents for each cell
    //const parents = []
    
    // Init cells object (contains all Cell objects)
    const cells = {}
    
    
    // h (heuristic) calculator
    // cost f = g + h (A* algorithm)
    // g = cost from start to cell
    // h = heuristic cost from cell to Target
    function calcH(cell) {
      // check if we have h saved or calc
      if (!cell.h) {
        // h = sqrt(x^2 + y^2)
        // straight line to the Target
        const x = cells[targetCell].cellRow - cell.cellRow
        const y = cells[targetCell].cellCol - cell.cellCol
        
        // Manhattan distance heuristic
        cell.h = Math.abs(x) + Math.abs(y)
      }   
      
      return cell.h
    }  
    
    
    // Find neighbours helper function
    let nRow
    let nCol
    function findNeighbours(cellId) {
      // check we haven't explored neighbours already
      if (cells[cellId].neighbours.length === 0) {
  
        // A list to hold [ cellId, path[] ]
        const neighbours = []
  
        // Extract cell row and col
        const cellRow = cells[cellId].cellRow
        const cellCol = cells[cellId].cellCol
  
        // Get North
        if (cellRow != '0') {
          nRow = String( parseInt(cellRow) - 1 )
          nCol = cellCol
          neighbours.push( [nRow+'.'+nCol, 'N'] )
        }
  
        // Get East
        if (cellCol != fieldSideLength-1) {
          nRow = cellRow
          nCol = String( parseInt(cellCol) + 1 )
          neighbours.push( [nRow+'.'+nCol, 'E'] )
        }    
  
        // Get South
        if (cellRow != fieldSideLength-1) {
          nRow = String( parseInt(cellRow) + 1 )
          nCol = cellCol
          neighbours.push( [nRow+'.'+nCol, 'S'] )
        }
  
        // Get West
        if (cellCol != '0') {
          nRow = cellRow
          nCol = String( [parseInt(cellCol)] - 1 )
          neighbours.push( [nRow+'.'+nCol, 'W'] )
        }
  
        cells[cellId].neighbours = neighbours
        
        return neighbours
  
      } else {
        return cells[cellId].neighbours
      }
    }  
    
  
    // FIRST WE BUILD THE CELL GRAPH
  
    // field is always square and we need
    // the side (row & col size)
    const fieldSideLength = Math.sqrt(field.length)
  
    // container for Rows
    const fieldRows = []
  
    // spread/split the field into characters
    const fieldCells = [...field]
  
    // we will cache our start and target cells
    let targetCell = null
    let startCell = null
    let newCell = null
    
    // build rows of cells, split by fieldSideLength
    let colIndex = 0
    let rowIndex = 0
    fieldCells.forEach((cell, index) => {
      // e.g. rowIndex = 1 for (i=3/fieldSideLength=3)
      rowIndex = Math.floor(index/fieldSideLength)
  
      // Make a new row if this index doesn't exist in fieldRows
      if (!fieldRows[rowIndex]) {
        fieldRows[rowIndex] = [] // new row
        colIndex = 0 // reset column index
      }
  
      // name cell by it's position (makes visual debug easier)
      const cellId = rowIndex+'.'+colIndex
  
      // construct new Cell (cellType = cell)
      newCell = new Cell(String(rowIndex), String(colIndex), cell, null)
      cells[cellId] = newCell
  
      // Mark Start, Blocked, and Target
      if (cells[cellId].cellType === CellTypes.START) {
        costs[cellId] = 0
        cells[cellId].cheapestParent = [ null, 'N' ]
        startCell = cellId
      } 
      else if (cells[cellId].cellType === CellTypes.BLOCKED) {
        // Add the BLOCKED cell to the processed list
        processed.push(cellId)
      }
      else if (cells[cellId].cellType === CellTypes.TARGET) {
        targetCell = cellId
      }
      
      // Check if we have a target, precalculate heuristic
      // This will speed up future calculations slightly
      if (targetCell) {
        cells[cellId].h = calcH(cells[cellId])
      }
  
      // now precalculate neighbours
      cells[cellId].neighbours = findNeighbours(cellId)
      
      colIndex++
      
      // The following like can be enabled for visualising the map
      // disabled for optimisation
      // fieldRows[rowIndex].push(cell)
      
    })
  
  
    // Now we can start at START and loop through the neighbours,
    // stopping the path at 'processed' cells because these paths
    // are either already explored or BLOCKED.
    // If we hit TARGET we can trace the route back through the
    // cheapestParent of each cell.
  
    // Function to find cell with the lowest total cost from costs
    function lowestCostCell(costs, processed) {
  
       // if (lowest === null || ( costs[cellId]+calcH(cells[cellId])) < (costs[lowest]+calcH(cells[lowest])) ) {        
      let cell = costsHeap.remove()
      let lowest = null
      while (cell) {
        if (!processed.includes(cell.cellId)) {
          lowest = cell.cellId
          return lowest
        } else {
          cell = costsHeap.remove()
        }
      }
  
      return lowest
    }
  
  
    // MAIN PATH-FINDING LOOP
  
    // init (will fetch the START cell)  
    let cellId = startCell
    
    while (cellId) {
    
      const cellCost = costsHeap.cost(cellId)
      const neighbours = cells[cellId].neighbours
  
      // cached loop settings
      // loop also rewritten to remove all
      // function calls and assignments
      
      let currentDirection
      let neighbourId
      let nDirection // direction of neighbour
      let pDirection // direction of parent of neighbour (opposite)
      let tempDirection // var for holding interim direction while turning
      let rightTurns // var for tracking turns
      let pathFromParent = []
      let newCost
      let neighbourH
      
      let n // neighbour array in for loop
      let i = neighbours.length
      while(i--) {
        n = neighbours[i]
        
        // n[0] is cellId, n[1] is direction from parent
        neighbourId = n[0]
        nDirection = n[1]
        
        if (!processed.includes(neighbourId)) {
          //let currentDirection
          
          // get current direction
          if (cells[cellId].cellType == CellTypes.START) {
            currentDirection = 'N'
          } else {
            // we are facing the opposite direction to the parent cell
            if (cells[cellId].cheapestParent[1] == 'N') currentDirection = 'S'
            else if (cells[cellId].cheapestParent[1] == 'E') currentDirection = 'W'
            else if (cells[cellId].cheapestParent[1] == 'S') currentDirection = 'N'
            else if (cells[cellId].cheapestParent[1] == 'W') currentDirection = 'E'
          }
  
          // get path from parent
          if (nDirection == currentDirection) {
            pathFromParent = ['f']
          } else {
            tempDirection = currentDirection
            rightTurns = 0
  
            while (nDirection != tempDirection){
              // turn and save count
              rightTurns++
              if (tempDirection == 'N') tempDirection = 'E'; 
              else if (tempDirection == 'E') tempDirection = 'S'
              else if (tempDirection == 'S') tempDirection = 'W'
              else if (tempDirection == 'W') tempDirection = 'N'
            }
  
            if (rightTurns === 1) pathFromParent = ['r', 'f']
            else if (rightTurns === 2) pathFromParent = ['r', 'r', 'f']
            else if (rightTurns === 3) pathFromParent = ['l', 'f']
          }
                
          //newCost = cost + pathFromParent.length
          newCost = cellCost + pathFromParent.length
          // parent direction opposite to neighbour direction
          if (nDirection == 'N') pDirection = 'S'
          if (nDirection == 'E') pDirection = 'W'
          if (nDirection == 'S') pDirection = 'N'
          if (nDirection == 'W') pDirection = 'E'
  
          // if it doesn't exist in costs
          // save the cost of the neighbour
          // and save this cell as it's cheapest parent
          //if (!costs[neighbourId]) {
          //  costs[neighbourId] = newCost
  
          //}
          if (!costsHeap.cost(cellId)) {
            costsHeap.insert(new Node(neighbourId, newCost))      
            cells[neighbourId].cheapestParent = [ cellId, pDirection ]
            cells[neighbourId].commands = pathFromParent
          }
  
          // if saved total cost + h is greater than this cost + h
          // update the cost and the cheapest parent to this cell
          // (else leave costs)
          neighbourH = calcH(cells[neighbourId])
  
          //if ((costs[neighbourId] + neighbourH) > (newCost + neighbourH)) {
          //  costs[neighbourId] = newCost
  
          //}
          if ((costsHeap.cost(neighbourId) + neighbourH) > (newCost + neighbourH) ) {
            costsHeap.remove(neighbourId)
            costsHeap.insert(new Node(cellId, newCost))
            cells[neighbourId].cheapestParent = [ cellId, pDirection ]
            cells[neighbourId].commands = pathFromParent
          }
        }
      }
        
      // When we've explored all the neighbours given
      processed.push(cellId)
  
      // Get the next lowest cost cell - this will skip over processed cells
      cellId = lowestCostCell(costs, processed)
  
  
      
      // OPTIONAL TIMER for timing execution
      const end = new Date() - start
      loops++
      if (loops % 300 === 0) console.info('Execution time: %dms', end, loops, field.length,)
    }
  
  
  
    // Stitch the path together from the target cell backwards
    let currentCell = targetCell
    const commandLists = []
    let parentCell = null
  
    while(currentCell) {
      // continue if we're not at the start or there exists a cheapest parent
      if (cells[currentCell].cellType == CellTypes.START || !cells[currentCell].cheapestParent) {
        currentCell = null
      } else {
        if (cells[currentCell].cheapestParent) {
          parentCell = cells[currentCell].cheapestParent[0]
          commandLists.push(cells[currentCell].commands)
  
          currentCell = parentCell
        } else {
          currentCell = null // backup against infinite loops
        }      
      }    
    }
  
  
    // Reverse the command lists and flatten
    let commands = []
    commandLists.reverse().forEach((commandList) => {
      commandList.forEach((command) => {
        commands.push(command)
      })
    })
  
    // Check we have enough power
    if (commands.length > power) {
      commands = []
    }
    
    // FOR VISUAL TESTING
    // Visualise the field grid to check we have split it correctly
    // fieldRows.forEach( (row) => console.log(row.join('')) )
  
  
    return commands
  }
  
  
  