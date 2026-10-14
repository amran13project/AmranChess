(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const GLYPHS = { wk:'♔', wq:'♕', wr:'♖', wb:'♗', wn:'♘', wp:'♙', bk:'♚', bq:'♛', br:'♜', bb:'♝', bn:'♞', bp:'♟' };
  let game = null, mode = 'computer', level = 'easy', flipped = false;
  let selected = null, legalMoves = [], lastMove = null, thinking = false;
  let peer = null, connection = null, myColor = 'w', promotion = null, toastTimer = null;
  const isOnline = () => mode === 'host' || mode === 'join';

  function toast(message) {
    $('toast').textContent = message;
    $('toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2400);
  }
  function pieceName(type) { return ({k:'king',q:'queen',r:'rook',b:'bishop',n:'knight',p:'pawn'})[type] || type; }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }

  function initGame() {
    if (typeof window.Chess !== 'function') {
      $('statusText').textContent = 'Chess rules library failed to load';
      $('statusNote').textContent = 'Check your internet connection and reload the page.';
      return;
    }
    game = new Chess(); selected = null; legalMoves = []; lastMove = null; thinking = false;
    renderBoard(); updateUI();
  }

  function renderBoard() {
    if (!game) return;
    const board = $('board'); board.innerHTML = '';
    const position = game.board();
    const files = flipped ? ['h','g','f','e','d','c','b','a'] : ['a','b','c','d','e','f','g','h'];
    const ranks = flipped ? [1,2,3,4,5,6,7,8] : [8,7,6,5,4,3,2,1];
    for (const rank of ranks) for (const file of files) {
      const square = file + rank, piece = position[8-rank][file.charCodeAt(0)-97];
      const cell = document.createElement('button');
      cell.type = 'button'; cell.className = 'square ' + (((file.charCodeAt(0)-97)+(rank-1))%2===0?'light':'dark');
      cell.dataset.square = square; cell.setAttribute('role','gridcell');
      cell.setAttribute('aria-label', square + (piece ? ', '+(piece.color==='w'?'white ':'black ')+pieceName(piece.type) : ', empty'));
      if (lastMove && (lastMove.from===square || lastMove.to===square)) cell.classList.add('last');
      if (selected===square) cell.classList.add('selected');
      if (legalMoves.some(move=>move.to===square)) cell.classList.add(piece?'capture':'legal');
      if ((file==='a'&&!flipped)||(file==='h'&&flipped)) { const c=document.createElement('span'); c.className='coordinate'; c.textContent=rank; cell.append(c); }
      if ((rank===1&&!flipped)||(rank===8&&flipped)) { const c=document.createElement('span'); c.className='coordinate'; c.style.cssText='left:auto;top:auto;right:4px;bottom:3px'; c.textContent=file; cell.append(c); }
      if (piece) { const p=document.createElement('span'); p.className='piece '+(piece.color==='w'?'white':'black'); p.textContent=GLYPHS[piece.color+piece.type]; p.setAttribute('aria-hidden','true'); cell.append(p); }
      cell.addEventListener('click', () => handleSquare(square)); board.append(cell);
    }
  }

  function handleSquare(square) {
    if (!game || game.game_over() || thinking) return;
    if (isOnline() && game.turn() !== myColor) { toast('Wait for your opponent to move.'); return; }
    if (mode === 'computer' && game.turn() === 'b') return;
    const piece = game.get(square);
    const chosenMove = selected && legalMoves.find(move => move.to === square);
    if (chosenMove) {
      if (chosenMove.flags.includes('p')) { promotion = {from:selected,to:square}; showPromotionPicker(); return; }
      makeMove({from:selected,to:square}); return;
    }
    if (piece && piece.color === game.turn()) {
      selected = square; legalMoves = game.moves({square, verbose:true}); renderBoard();
      $('boardHint').textContent = legalMoves.length ? legalMoves.length + ' legal move' + (legalMoves.length===1?'':'s') : 'No legal moves';
    } else { selected = null; legalMoves=[]; renderBoard(); $('boardHint').textContent='Select a piece to see legal moves'; }
  }

  function makeMove(move) {
    const result = game.move(move);
    if (!result) { toast('That move is not legal.'); return; }
    lastMove = {from:result.from,to:result.to}; selected=null; legalMoves=[];
    renderBoard(); updateUI();
    if (isOnline() && connection && connection.open) connection.send({type:'move', move:{from:result.from,to:result.to,promotion:result.promotion||'q'}});
    if (mode==='computer' && game.turn()==='b' && !game.game_over()) makeComputerMove();
    if (game.game_over()) announceEnd();
  }

  function moveScore(move) {
    const values={p:100,n:320,b:330,r:500,q:900,k:20000};
    let score = move.captured ? (values[move.captured]||0) : 0;
    if (move.promotion) score += 800;
    const x=move.to.charCodeAt(0)-97, y=Number(move.to[1])-1;
    score += (7-Math.abs(3.5-x)-Math.abs(3.5-y))*4;
    if (move.san && move.san.includes('+')) score += 35;
    if (move.flags.includes('k') || move.flags.includes('q')) score += 24;
    return score + Math.random()*12;
  }

  function makeComputerMove() {
    thinking=true; updateUI();
    setTimeout(() => {
      if (!game || mode!=='computer' || game.game_over()) { thinking=false; return; }
      const moves=game.moves({verbose:true});
      if (!moves.length) { thinking=false; updateUI(); return; }
      let chosen;
      if (level==='easy') chosen=moves[Math.floor(Math.random()*moves.length)];
      else {
        moves.sort((a,b)=>moveScore(b)-moveScore(a));
        const candidates=moves.slice(0,Math.min(level==='hard'?4:9,moves.length));
        chosen=candidates[Math.floor(Math.random()*candidates.length)];
      }
      const played=game.move({from:chosen.from,to:chosen.to,promotion:'q'});
      lastMove={from:played.from,to:played.to}; thinking=false;
      renderBoard(); updateUI(); if(game.game_over()) announceEnd();
    }, level==='hard'?650:420);
  }

  function showPromotionPicker() {
    const extra=$('modalExtra');
    extra.innerHTML='<div class="promotion-choices">'+['q','r','b','n'].map(type=>'<button type="button" data-promotion="'+type+'" aria-label="Promote to '+pieceName(type)+'">'+GLYPHS[game.turn()+type]+'</button>').join('')+'</div>';
    $('modalTitle').textContent='Promote your pawn'; $('modalText').textContent='Choose the piece you want your pawn to become.';
    $('modalCancel').classList.add('hidden'); $('modalConfirm').classList.add('hidden'); $('modalBack').classList.add('open');
    extra.querySelectorAll('[data-promotion]').forEach(button => button.addEventListener('click', () => {
      const type=button.dataset.promotion, move=promotion; promotion=null; closeModal(); makeMove({from:move.from,to:move.to,promotion:type});
    }));
  }

  function openNewGameModal() {
    $('modalTitle').textContent='Start a new game?'; $('modalText').textContent='Your current board and move history will be cleared.';
    $('modalExtra').innerHTML=''; $('modalCancel').classList.remove('hidden'); $('modalConfirm').classList.remove('hidden');
    $('modalConfirm').textContent='New game'; $('modalBack').classList.add('open');
    $('modalConfirm').onclick=()=>{ closeModal(); if(isOnline()&&connection&&connection.open) connection.send({type:'restart'}); resetBoardKeepConnection(); };
  }
  function closeModal() { $('modalBack').classList.remove('open'); }
  function resetBoardKeepConnection() { if(typeof window.Chess!=='function')return; game=new Chess(); selected=null;legalMoves=[];lastMove=null;thinking=false;renderBoard();updateUI();toast('A new game is ready.'); }

  function updateUI() {
    if (!game) return;
    const turn=game.turn(), white=turn==='w';
    $('turnBadge').textContent=game.game_over()?'GAME OVER':(white?'WHITE':'BLACK')+' TO MOVE';
    $('bottomBadge').textContent=game.game_over()?'FINISHED':mode==='computer'?(white?'YOUR TURN':'COMPUTER TURN'):isOnline()?(turn===myColor?'YOUR TURN':'OPPONENT TURN'):'LOCAL GAME';
    $('topName').textContent=mode==='computer'?'Computer · Black':isOnline()?(myColor==='w'?'Opponent · Black':'Opponent · White'):'Black pieces';
    $('bottomName').textContent=mode==='computer'?'You · White':isOnline()?(myColor==='w'?'You · White':'You · Black'):'White pieces';
    $('topDetail').textContent=mode==='computer'?'Browser opponent':isOnline()?'Online opponent':'Player two';
    $('bottomDetail').textContent=mode==='computer'?'Playing as White':isOnline()?'Online match':mode==='local'?'Player one':'Playing as Black';
    $('topAvatar').textContent=isOnline()&&myColor==='b'?'♙':'♟'; $('bottomAvatar').textContent=isOnline()&&myColor==='b'?'♟':'♙';
    $('moveCounter').textContent='Move '+(Math.floor(game.history().length/2)+1);
    $('historyCount').textContent=game.history().length+' PLIES';
    $('undoBtn').disabled=isOnline()||game.history().length===0; $('hintBtn').disabled=isOnline()||game.game_over()||thinking;
    const history=game.history({verbose:true}); let output='';
    for(let i=0;i<history.length;i+=2) output+='<div class="move-row"><span class="move-number">'+(Math.floor(i/2)+1)+'.</span><span>'+escapeHtml(history[i].san)+'</span><span>'+(history[i+1]?escapeHtml(history[i+1].san):'')+'</span></div>';
    $('moves').innerHTML=output||'<div class="empty-state">Your moves will appear here.</div>';
    if(game.in_check()) { $('statusText').textContent=(white?'White':'Black')+' is in check'; $('statusNote').textContent='Protect your king or move it out of check.'; }
    else if(game.game_over()) { $('statusText').textContent=game.in_checkmate()?'Checkmate':game.in_stalemate()?'Draw by stalemate':game.in_threefold_repetition()?'Draw by repetition':game.insufficient_material()?'Draw — insufficient material':'Game drawn'; $('statusNote').textContent='Start a new game whenever you are ready.'; }
    else { $('statusText').textContent=thinking?'Computer is thinking…':(white?'White':'Black')+' to move'; $('statusNote').textContent=isOnline()?'Moves are sent to your opponent.':'A good game begins with one thoughtful move.'; }
    $('connectionPill').textContent=isOnline()?(connection&&connection.open?'Online match':mode==='host'?'Host room':'Online mode'):thinking?'Thinking':'Ready to play';
    $('statusTag').textContent=game.game_over()?'ENDED':isOnline()?'ONLINE':'LIVE';
  }

  function announceEnd() { updateUI(); toast(game.in_checkmate()?'Checkmate! '+(game.turn()==='w'?'Black':'White')+' wins.':'Game over — '+$('statusText').textContent+'.'); }
  function disconnect() { if(connection){try{connection.close()}catch(e){} connection=null;} if(peer){try{peer.destroy()}catch(e){} peer=null;} }
  function setMode(next) {
    disconnect(); mode=next; myColor=next==='join'?'b':'w'; flipped=next==='join';
    document.querySelectorAll('[data-mode]').forEach(button=>button.classList.toggle('active',button.dataset.mode===next));
    $('onlinePanel').classList.toggle('hidden',!isOnline()); $('onlineAction').textContent=next==='host'?'Create room':'Join room';
    $('onlineNote').textContent=next==='host'?'Create a room and share the code with your opponent.':'Enter the room code your friend shares.';
    $('roomCode').readOnly=false; initGame();
  }
  function wireConnection() {
    if(!connection)return;
    connection.on('data',data=>{
      if(!data)return;
      if(data.type==='move'&&data.move){const move=game.move(data.move);if(move){lastMove={from:move.from,to:move.to};selected=null;legalMoves=[];renderBoard();updateUI();if(game.game_over())announceEnd();}}
      else if(data.type==='restart'){resetBoardKeepConnection();toast('Your opponent started a new game.');}
    });
    connection.on('close',()=>{connection=null;$('onlineNote').textContent='Opponent disconnected. Create or join a room again.';$('connectionPill').textContent='Disconnected';toast('Opponent disconnected.');});
    connection.on('error',()=>toast('Online connection interrupted.'));
  }
  function createRoom() {
    if(typeof window.Peer!=='function'){toast('Online library did not load. Check your internet connection.');return;}
    disconnect(); const room='amran-'+Math.random().toString(36).slice(2,8); peer=new Peer(room); $('onlineNote').textContent='Creating room…';
    peer.on('open',id=>{$('roomCode').value=id;$('roomCode').readOnly=true;$('onlineNote').textContent='Room created. Copy the code and send it to your opponent. Waiting for them…';toast('Room ready — share the code.');});
    peer.on('connection',conn=>{if(connection){conn.close();return;}connection=conn;myColor='w';flipped=false;wireConnection();$('onlineNote').textContent='Opponent connected! You are White.';renderBoard();updateUI();toast('Opponent connected.');});
    peer.on('error',error=>{$('onlineNote').textContent='Could not create room ('+(error.type||'network error')+'). Try again.';toast('Could not create online room.');});
  }
  function joinRoom() {
    if(typeof window.Peer!=='function'){toast('Online library did not load. Check your internet connection.');return;}
    const room=$('roomCode').value.trim();if(!room){toast('Enter a room code first.');return;}
    disconnect();peer=new Peer();$('onlineNote').textContent='Connecting to room…';
    peer.on('open',()=>{connection=peer.connect(room,{reliable:true});connection.on('open',()=>{myColor='b';flipped=true;wireConnection();$('onlineNote').textContent='Connected! You are Black. Wait for White to move.';renderBoard();updateUI();toast('Joined the room.');});connection.on('error',()=>{$('onlineNote').textContent='Could not connect. Check the code and make sure your friend is hosting.';});});
    peer.on('error',error=>{$('onlineNote').textContent='Connection failed ('+(error.type||'network error')+'). Check the room code.';toast('Unable to connect.');});
  }

  $('newBtn').addEventListener('click',openNewGameModal);
  $('undoBtn').addEventListener('click',()=>{if(isOnline()||!game.history().length)return;game.undo();if(mode==='computer'&&game.turn()==='b'&&game.history().length)game.undo();lastMove=null;selected=null;legalMoves=[];renderBoard();updateUI();toast('Last move undone.');});
  $('flipBtn').addEventListener('click',()=>{flipped=!flipped;renderBoard();});
  $('hintBtn').addEventListener('click',()=>{if(!game||isOnline())return;const moves=game.moves({verbose:true});if(!moves.length)return;moves.sort((a,b)=>moveScore(b)-moveScore(a));const move=moves[0];selected=move.from;legalMoves=game.moves({square:selected,verbose:true});renderBoard();toast('Possible move: '+move.san+' — just a suggestion.');});
  document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.mode)));
  document.querySelectorAll('[data-level]').forEach(button=>button.addEventListener('click',()=>{level=button.dataset.level;document.querySelectorAll('[data-level]').forEach(other=>other.classList.toggle('active',other===button));toast('Difficulty set to '+level+'.');}));
  $('onlineAction').addEventListener('click',()=>mode==='host'?createRoom():joinRoom());
  $('copyRoomBtn').addEventListener('click',async()=>{const code=$('roomCode').value.trim();if(!code){toast('Create or enter a room code first.');return;}try{await navigator.clipboard.writeText(code);toast('Room code copied.');}catch(error){$('roomCode').select();toast('Room code selected — copy it manually.');}});
  $('modalCancel').addEventListener('click',closeModal);$('modalBack').addEventListener('click',event=>{if(event.target===$('modalBack'))closeModal();});document.addEventListener('keydown',event=>{if(event.key==='Escape')closeModal();});
  initGame();
})();
