const board = document.getElementById('board');
const currentPlayerDisplay = document.getElementById('currentPlayer');
let selectedPiece = null;
let currentPlayer = 'white';

const initialBoard = [
  ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
  ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
  ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
];

function createBoard() {
  board.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const square = document.createElement('div');
      square.className = `w-12 h-12 flex items-center justify-center text-4xl cursor-pointer
                        ${(i + j) % 2 === 0 ? 'bg-white' : 'bg-gray-400'}
                        hover:bg-blue-200 transition-colors`;
      square.dataset.row = i;
      square.dataset.col = j;
      square.textContent = initialBoard[i][j];
      
      if (initialBoard[i][j]) {
        square.dataset.piece = initialBoard[i][j];
        square.classList.add(isWhitePiece(initialBoard[i][j]) ? 'text-black' : 'text-red-800');
      }
      
      square.addEventListener('click', handleSquareClick);
      board.appendChild(square);
    }
  }
}

function isWhitePiece(piece) {
  return '♔♕♖♗♘♙'.includes(piece);
}

function handleSquareClick(event) {
  const square = event.target;
  const piece = square.textContent;
  
  if (selectedPiece) {
    if (square !== selectedPiece) {
      const startPos = getSquarePosition(selectedPiece);
      const endPos = getSquarePosition(square);
      const movingPiece = selectedPiece.textContent;
      const isValidMove = validateMove(startPos, endPos, movingPiece, square.textContent);
      
      if (isValidMove) {
        // Handle special moves
        if (isEnPassant(startPos, endPos, movingPiece)) {
          handleEnPassant(startPos, endPos);
        } else if (isCastling(startPos, endPos, movingPiece)) {
          handleCastling(startPos, endPos);
        } else {
          // Regular move
          makeMove(square, selectedPiece);
        }
        
        // Switch turns
        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
        currentPlayerDisplay.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`;
      }
    }
    selectedPiece.classList.remove('bg-blue-300');
    selectedPiece = null;
  } else if (piece) {
    const pieceIsWhite = isWhitePiece(piece);
    if ((currentPlayer === 'white' && pieceIsWhite) || (currentPlayer === 'black' && !pieceIsWhite)) {
      selectedPiece = square;
      square.classList.add('bg-blue-300');
    }
  }
}

function validateMove(start, end, piece, targetPiece) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const pieceType = piece.toLowerCase();
  const isWhite = isWhitePiece(piece);
  
  // Can't capture own pieces
  if (targetPiece && isWhitePiece(targetPiece) === isWhite) return false;
  
  switch (pieceType) {
    case '♙':
    case '♟': // Pawn
      return validatePawnMove(start, end, isWhite, !!targetPiece);
    case '♖':
    case '♜': // Rook
      return validateRookMove(start, end);
    case '♘':
    case '♞': // Knight
      return validateKnightMove(dx, dy);
    case '♝': // Bishop
    case '♗':
      return validateBishopMove(dx, dy);
    case '♛': // Queen
    case '♕':
      return validateQueenMove(start, end);
    case '♔':
    case '♚': // King
      return validateKingMove(start, end);
    default:
      return false;
  }
}

function validatePawnMove(start, end, isWhite, isCapture) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const direction = isWhite ? -1 : 1;
  console.log(start, end)
  if (isCapture) {
    return dy === direction && Math.abs(dx) === 1;
  }
  
  if (dx !== 0) return false;
  
  if (dy === direction) return true;
  
  const firstMove = (isWhite && start.y === 6) || (!isWhite && start.y === 1);
  return firstMove && dy === 2 * direction && !isPieceBetween(start, end);
}

function validateRookMove(start, end) {
  return (start.x === end.x || start.y === end.y) && !isPieceBetween(start, end);
}

function validateKnightMove(dx, dy) {
  return (Math.abs(dx) === 2 && Math.abs(dy) === 1) ||
    (Math.abs(dx) === 1 && Math.abs(dy) === 2);
}

function validateBishopMove(dx, dy) {
  return Math.abs(dx) === Math.abs(dy);
}

function validateQueenMove(start, end) {
  return validateRookMove(start, end) || validateBishopMove(end.x - start.x, end.y - start.y);
}

function validateKingMove(start, end) {
  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);
  return dx <= 1 && dy <= 1;
}

function isPieceBetween(start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  const xStep = dx === 0 ? 0 : dx / steps;
  const yStep = dy === 0 ? 0 : dy / steps;
  
  for (let i = 1; i < steps; i++) {
    const x = start.x + i * xStep;
    const y = start.y + i * yStep;
    const square = document.querySelector(`[data-row="${y}"][data-col="${x}"]`);
    if (square.textContent) return true;
  }
  return false;
}

function getSquarePosition(square) {
  return {
    x: parseInt(square.dataset.col),
    y: parseInt(square.dataset.row)
  };
}

function makeMove(targetSquare, selectedSquare) {
  targetSquare.textContent = selectedSquare.textContent;
  targetSquare.dataset.piece = selectedSquare.dataset.piece;
  targetSquare.className = selectedSquare.className.replace('bg-blue-300', '');
  selectedSquare.textContent = '';
  selectedSquare.dataset.piece = '';
}

function isEnPassant(startPos, endPos, movingPiece) {
  // Check if the moving piece is a pawn
  if (movingPiece.type !== 'pawn') return false;
  
  // Get the file difference (horizontal movement)
  const fileDiff = Math.abs(endPos[1] - startPos[1]);
  
  // Check if it's a diagonal move to an empty square
  if (fileDiff === 1 && !board[endPos[0]][endPos[1]]) {
    // Check if there's an enemy pawn that just moved two squares
    const lastMove = moveHistory[moveHistory.length - 1];
    if (lastMove &&
      lastMove.piece.type === 'pawn' &&
      Math.abs(lastMove.startPos[0] - lastMove.endPos[0]) === 2 &&
      lastMove.endPos[1] === endPos[1] &&
      lastMove.endPos[0] === startPos[0]) {
      return true;
    }
  }
  return false;
}

function handleEnPassant(startPos, endPos) {
  // Remove the captured pawn
  const capturedPawnRow = startPos[0];
  const capturedPawnCol = endPos[1];
  board[capturedPawnRow][capturedPawnCol] = null;
  
  // Move the attacking pawn
  const movingPiece = board[startPos[0]][startPos[1]];
  board[endPos[0]][endPos[1]] = movingPiece;
  board[startPos[0]][startPos[1]] = null;
}

function isCastling(startPos, endPos, movingPiece) {
  // Check if the piece is a king
  if (movingPiece.type !== 'king') return false;
  
  // Check if the king is moving two squares horizontally
  const fileDiff = Math.abs(endPos[1] - startPos[1]);
  if (fileDiff === 2 && startPos[0] === endPos[0]) {
    // Check if the king hasn't moved
    if (!movingPiece.hasMoved) {
      // Check if the rook is in position and hasn't moved
      const rookCol = endPos[1] > startPos[1] ? 7 : 0;
      const rook = board[startPos[0]][rookCol];
      return rook &&
        rook.type === 'rook' &&
        !rook.hasMoved &&
        !isPathBlocked(startPos, [startPos[0], rookCol]);
    }
  }
  return false;
}

function handleCastling(startPos, endPos) {
  const king = board[startPos[0]][startPos[1]];
  const isKingSide = endPos[1] > startPos[1];
  
  // Move the king
  board[endPos[0]][endPos[1]] = king;
  board[startPos[0]][startPos[1]] = null;
  
  // Move the rook
  const rookStartCol = isKingSide ? 7 : 0;
  const rookEndCol = isKingSide ? endPos[1] - 1 : endPos[1] + 1;
  const rook = board[startPos[0]][rookStartCol];
  
  board[startPos[0]][rookEndCol] = rook;
  board[startPos[0]][rookStartCol] = null;
  
  // Update moved status
  king.hasMoved = true;
  rook.hasMoved = true;
}

createBoard();