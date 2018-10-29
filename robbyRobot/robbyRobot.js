function getCommands(field, power) {
    // Cell type definition (given)
    CellTypes = {
      "WALKABLE": ".", // Robby may walk on this
      "BLOCKED": "#", // Robby must not walk on this
      "START": "S", // Robby is starting here, he may also walk here
      "TARGET": "T" // The target cell, Robby has to reach
    }
  
    // Cell model - Cell type, cheapest Parent (from start),
    // neightboursAndPaths[ [neighbours], [path[] ],
    // plus a list of commands to reach this cell from the START cell
    function Cell(cellType, cheapestParent) {
      // cellType is the cell contents (above)
      this.cellType = cellType
  
      // Parent with the cheapest total cost from Start cell,
      // and it's direction [ cellId, direction ] ('N', 'E', 'S', 'W')
      this.cheapestParent = cheapestParent
  
      // Array[ [cellId, direction] ] of neighbours found
      this.neighbours = []
  
      // Array of commands to this cell from the cheapestParent
      this.commands = []
    }
  
  
  
    // FIRST WE BUILD THE FIELD GRID
  
    // field is always square and we need
    // the side (row & col size)
    const fieldSideLength = Math.sqrt(field.length)
  
    // We are going to build a list of Rows:
    // [ row0,
    //   row1,
    //   row2 ]
    const fieldRows = []
  
    // spread/split the field into characters
    const fieldCells = [...field]
  
    // build rows of cells, split by fieldSideLength
    fieldCells.forEach((cell, index) => {
      rowIndex = Math.floor(index/fieldSideLength)
  
      if (!fieldRows[rowIndex]) {
        fieldRows[rowIndex] = [] // new row
      }
  
      fieldRows[rowIndex].push(cell)
    })
  
  
  
    // BUILD THE INITIAL CELL GRAPH
  
    // costs object made of cellId: totalCost entries
    // to track the total cost to reach each cell
    const costs = {}
  
    // list to log the cells already explored/visited
    const processed = []
  
    // Init Cell graph
    const cells = {}
  
    // we will save our start and target cells
    let targetCell
    let startCell
  
    fieldRows.forEach((row, rowIndex) => {
      row.forEach( (cell, cellIndex) => {
  
        // construct coordinate-based ID
        const cellId = String(String(rowIndex)+'.'+String(cellIndex))
  
        // construct new Cell (cellType = cell)
        newCell = new Cell(cell, null, [])
  
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
      })
    })
  
  
  
    // Now we can start at START and loop through the neighbours,
    // stopping the path at 'processed' cells because these paths
    // are either already explored or BLOCKED.
    // IF we hit TARGET before we run out of power, we can trace
    // the route back through the cheapestParent of each cell.
  
  
    // opposite direction helper
    function oppDirection(direction) {
        if (direction == 'N') return 'S'
        if (direction == 'E') return 'W'
        if (direction == 'S') return 'N'
        if (direction == 'W') return 'E'
    }
  
  
    // A helper function to find direction
    function getDirection(cellId) {
      let currentDirection
  
      if (cells[cellId].cellType == CellTypes.START) {
        currentDirection = 'N'
      } else {
        // we are facing the opposite direction to the parent cell
        parentDirection = cells[cellId].cheapestParent[1]
        currentDirection = oppDirection(parentDirection)
      }
  
      return currentDirection
    }
  
  
    // A helper function for the path finding loop
    function getPath(cellId, neighbourDirection) {
      const currentDirection = getDirection(cellId)
      let commands = []
      if (neighbourDirection == currentDirection) {
        commands = ['f']
      } else {
        let tempDirection = currentDirection
        let rightTurns = 0
  
        while (neighbourDirection != tempDirection){
          // turn and save count
          rightTurns++
          if (tempDirection == 'N') tempDirection = 'E'; 
          else if (tempDirection == 'E') tempDirection = 'S'
          else if (tempDirection == 'S') tempDirection = 'W'
          else if (tempDirection == 'W') tempDirection = 'N'
        }
  
        if (rightTurns === 1) commands = ['r', 'f']
        else if (rightTurns === 2) commands = ['r', 'r', 'f']
        else if (rightTurns === 3) commands = ['l', 'f']
  
      }
      return commands
    }
    
    
    // Find adjacent cells and paths
    function findNeighboursAndPaths(cellId, fieldRows) {
      if (cells[cellId].neighbours.length === 0) {
  
        // A list to hold [ cellId, path[] ]
        const neighbours = []
  
        // Extract cell row and col
        const i = cellId.indexOf('.')
        const cellRow = cellId.slice(0, i)
        const cellCol = cellId.slice(i+1, cellId.length)
  
        // helper function to splice ID from coords
        const getId = (nRow, nCol) => {
          return nRow+'.'+nCol
        }
  
        // Get North
        if (cellRow != '0') {
          const nRow = String( parseInt(cellRow) - 1 )
          const nCol = cellCol
          const neighbourId = getId(nRow, nCol)
          neighbours.push( [neighbourId, 'N'] )
        }
  
        // Get East
        if (cellCol != fieldSideLength-1) {
          const nRow = cellRow
          const nCol = String( parseInt(cellCol) + 1 )
          neighbours.push( [getId(nRow, nCol), 'E'] )
        }    
  
        // Get South
        if (cellRow != fieldSideLength-1) {
          const nRow = String( parseInt(cellRow) + 1 )
          const nCol = cellCol
          neighbours.push( [getId(nRow, nCol), 'S'] )
        }
  
        // Get West
        if (cellCol != '0') {
          const nRow = cellRow
          const nCol = String( [parseInt(cellCol)] - 1 )
          neighbours.push( [getId(nRow, nCol), 'W'] )
        }
  
        cells[cellId].neighbours = neighbours
        
        //const pathFromParent = getPath(cellId, nDirection)
        
        return neighbours
  
      } else {
        return cells[cellId].neighbours
      }
    }
  
  
    // Function to find cell with the lowest total cost from costs
    const lowestCostCell = (costs, processed) => {
      return Object.keys(costs).reduce((lowest, cellId) => {
        // total cost of this ID lower than the current lowest?
        if (lowest === null || costs[cellId] < costs[lowest]) {
        
          // check the cellId has not been processed (or is blocked)
          if (!processed.includes(cellId)) {
            lowest = cellId
          }
        }
  
        return lowest;
      }, null) // start value for reduce
    }
  
  
  
    
  
  
  
    // PATH FINDING LOOP
  
    // init (will fetch the START cell)
    let cellId = lowestCostCell(costs, processed)
  
    while (cellId) {
      let cost = costs[cellId]
      let neighbours = findNeighboursAndPaths(cellId, fieldRows)
      
      // optimised loop
      let i=0
      const len=neighbours.length
      for (; i<len; i++) {
        let n = neighbours[i]
        
        // n[0] is cellId, n[1] is direction from parent
        let neighbour = n[0], nDirection = n[1]
        
        if (!processed.includes(neighbour)) {
          const neighbourCell = cells[neighbour]
          let pathFromParent = getPath(cellId, nDirection)
          let newCost = cost + pathFromParent.length
  
  
          // if it doesn't exist in costs
          // save the cost of the neighbour
          // and save this cell as it's cheapest parent
          if (!costs[neighbour]) {
            costs[neighbour] = newCost
            neighbourCell.cheapestParent = [ cellId, oppDirection(nDirection) ]
            neighbourCell.commands = pathFromParent
          }
  
          // if saved total cost is greater than this cost
          // update the cost and the cheapest parent to this cell
          // (else leave costs)
          if (costs[neighbour] > newCost) {
            costs[neighbour] = newCost
            neighbourCell.cheapestParent = [ cellId, oppDirection(nDirection)  ]
            neighbourCell.commands = pathFromParent
          }
        }
      }
  
        
      // When we've explored all the neighbours given
      processed.push(cellId)
  
      // Get the next lowest cost cell - this will skip over processed cells
      cellId = lowestCostCell(costs, processed)
    }
  
  
    // Stitch the path together from the target cell backwards
    let currentCell = targetCell
    const commandLists = []
  
    while(currentCell) {
      // continue if we're not at the start or there exists a cheapest parent
      if (cells[currentCell].cellType == CellTypes.START || !cells[currentCell].cheapestParent) {
        currentCell = null
      } else {
        if (cells[currentCell].cheapestParent) {
          let parentCell = cells[currentCell].cheapestParent[0]
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
  
  
  