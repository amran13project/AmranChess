/* LumaChess self-contained chess rules core — no runtime package required. */
(function(root){'use strict';
  const FILES='abcdefgh', TYPES='pnbrqk', VALUES={p:1,n:3,b:3,r:5,q:9,k:0};
  const sqToI=s=>{if(typeof s!=='string'||! /^[a-h][1-8]$/.test(s))return -1;return FILES.indexOf(s[0])+(Number(s[1])-1)*8};
  const iToSq=i=>FILES[i%8]+(Math.floor(i/8)+1);
  const cloneBoard=b=>b.map(p=>p?{type:p.type,color:p.color}:null);
  const copyMove=m=>({...m});
  class Chess {
    constructor(){this.reset()}
    reset(){
      this._board=Array(64).fill(null); const back='rnbqkbnr';
      for(let f=0;f<8;f++){this._board[f]={type:back[f],color:'w'};this._board[8+f]={type:'p',color:'w'};this._board[48+f]={type:'p',color:'b'};this._board[56+f]={type:back[f],color:'b'}}
      this._turn='w';this._castling={w:{k:true,q:true},b:{k:true,q:true}};this._ep=-1;this._halfmove=0;this._fullmove=1;this._history=[];this._positions=[this._positionKey()];return true
    }
    load_fen(fen){
      if(typeof fen!=='string')return false;
      const parts=fen.trim().split(/\s+/);if(parts.length<4)return false;
      const rows=parts[0].split('/');if(rows.length!==8||!['w','b'].includes(parts[1]))return false;
      const next=Array(64).fill(null),kings={w:0,b:0};
      for(let row=0;row<8;row++){let file=0;for(const ch of rows[row]){if(/[1-8]/.test(ch)){file+=Number(ch);continue}if(!/[pnbrqkPNBRQK]/.test(ch)||file>7)return false;const color=ch===ch.toUpperCase()?'w':'b',type=ch.toLowerCase();next[(7-row)*8+file]={type,color};if(type==='k')kings[color]++;file++;}if(file!==8)return false;}
      if(kings.w!==1||kings.b!==1)return false;
      const rights=parts[2]==='-'?'':parts[2];if(/[^KQkq]/.test(rights)||new Set(rights).size!==rights.length)return false;
      const ep=parts[3]==='-'?-1:sqToI(parts[3]);if(parts[3]!=='-'&&ep<0)return false;
      const half=parts.length>4?Number(parts[4]):0,full=parts.length>5?Number(parts[5]):1;
      if(!Number.isInteger(half)||half<0||!Number.isInteger(full)||full<1)return false;
      this._board=next;this._turn=parts[1];this._castling={w:{k:rights.includes('K'),q:rights.includes('Q')},b:{k:rights.includes('k'),q:rights.includes('q')}};this._ep=ep;this._halfmove=half;this._fullmove=full;this._history=[];this._positions=[this._positionKey()];return true;
    }
    load(fen){return this.load_fen(fen)}
    turn(){return this._turn}
    board(){const rows=[];for(let r=7;r>=0;r--){const row=[];for(let f=0;f<8;f++){const p=this._board[r*8+f];row.push(p?{type:p.type,color:p.color}:null)}rows.push(row)}return rows}
    get(sq){const i=sqToI(sq),p=this._board[i];return p?{type:p.type,color:p.color}:null}
    _snapshot(){return {board:cloneBoard(this._board),turn:this._turn,castling:JSON.parse(JSON.stringify(this._castling)),ep:this._ep,halfmove:this._halfmove,fullmove:this._fullmove}}
    _restore(s){this._board=cloneBoard(s.board);this._turn=s.turn;this._castling=JSON.parse(JSON.stringify(s.castling));this._ep=s.ep;this._halfmove=s.halfmove;this._fullmove=s.fullmove}
    _positionKey(){let rows=[];for(let r=7;r>=0;r--){let row='',empty=0;for(let f=0;f<8;f++){const p=this._board[r*8+f];if(!p){empty++;continue}if(empty){row+=empty;empty=0}row+=p.color==='w'?p.type.toUpperCase():p.type}if(empty)row+=empty;rows.push(row)}let c='';if(this._castling.w.k)c+='K';if(this._castling.w.q)c+='Q';if(this._castling.b.k)c+='k';if(this._castling.b.q)c+='q';return rows.join('/')+' '+this._turn+' '+(c||'-')+' '+(this._ep<0?'-':iToSq(this._ep))}
    _inside(f,r){return f>=0&&f<8&&r>=0&&r<8}
    _attacked(target,byColor){const tf=target%8,tr=Math.floor(target/8);for(let i=0;i<64;i++){const p=this._board[i];if(!p||p.color!==byColor)continue;const f=i%8,r=Math.floor(i/8),df=tf-f,dr=tr-r;switch(p.type){case'p':if(dr===(byColor==='w'?1:-1)&&Math.abs(df)===1)return true;break;case'n':if((Math.abs(df)===1&&Math.abs(dr)===2)||(Math.abs(df)===2&&Math.abs(dr)===1))return true;break;case'k':if(Math.max(Math.abs(df),Math.abs(dr))===1)return true;break;default:{const diagonal=Math.abs(df)===Math.abs(dr),straight=df===0||dr===0;if((p.type==='b'&&!diagonal)||(p.type==='r'&&!straight)||(p.type==='q'&&!(diagonal||straight)))break;if(df===0&&dr===0)break;const sf=Math.sign(df),sr=Math.sign(dr);let x=f+sf,y=r+sr,blocked=false;while(x!==tf||y!==tr){if(this._board[y*8+x]){blocked=true;break}x+=sf;y+=sr}if(!blocked)return true;}}
      }return false}
    _king(color){for(let i=0;i<64;i++){const p=this._board[i];if(p&&p.type==='k'&&p.color===color)return i}return -1}
    _inCheck(color){const k=this._king(color);return k<0||this._attacked(k,color==='w'?'b':'w')}
    _pushMove(list,from,to,flags='',promotion=null,captured=null){const p=this._board[from];if(!p)return;list.push({from:iToSq(from),to:iToSq(to),color:p.color,piece:p.type,captured,promotion,flags})}
    _pseudo(color){const list=[];const dirs={n:[[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]],k:[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]],b:[[1,1],[1,-1],[-1,1],[-1,-1]],r:[[1,0],[-1,0],[0,1],[0,-1]],q:[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]};
      for(let from=0;from<64;from++){const p=this._board[from];if(!p||p.color!==color)continue;const f=from%8,r=Math.floor(from/8);
        if(p.type==='p'){const d=color==='w'?1:-1,start=color==='w'?1:6,last=color==='w'?7:0,nr=r+d;if(this._inside(f,nr)&&!this._board[nr*8+f]){if(nr===last){for(const pr of ['q','r','b','n'])this._pushMove(list,from,nr*8+f,'np',pr)}else{this._pushMove(list,from,nr*8+f,'n');const nr2=r+2*d;if(r===start&&!this._board[nr2*8+f])this._pushMove(list,from,nr2*8+f,'b')}}for(const df of [-1,1]){const nf=f+df,rr=r+d;if(!this._inside(nf,rr))continue;const to=rr*8+nf,t=this._board[to];if(t&&t.color!==color&&t.type!=='k'){if(rr===last){for(const pr of ['q','r','b','n'])this._pushMove(list,from,to,'cp',pr,t.type)}else this._pushMove(list,from,to,'c',null,t.type)}else if(to===this._ep)this._pushMove(list,from,to,'e',null,'p')}continue}
        const steps=dirs[p.type],slider=['b','r','q'].includes(p.type);for(const [df,dr] of steps){let nf=f+df,nr=r+dr;while(this._inside(nf,nr)){const to=nr*8+nf,t=this._board[to];if(!t)this._pushMove(list,from,to,'n');else{if(t.color!==color&&t.type!=='k')this._pushMove(list,from,to,'c',null,t.type);break}if(!slider)break;nf+=df;nr+=dr}}
        if(p.type==='k'&&!this._inCheck(color)){const home=color==='w'?4:60,rank=color==='w'?0:7,enemy=color==='w'?'b':'w';if(from===home&&this._castling[color].k&&!this._board[rank*8+5]&&!this._board[rank*8+6]&&this._board[rank*8+7]?.type==='r'&&this._board[rank*8+7]?.color===color&&!this._attacked(rank*8+5,enemy)&&!this._attacked(rank*8+6,enemy))this._pushMove(list,from,rank*8+6,'k');if(from===home&&this._castling[color].q&&!this._board[rank*8+1]&&!this._board[rank*8+2]&&!this._board[rank*8+3]&&this._board[rank*8+0]?.type==='r'&&this._board[rank*8+0]?.color===color&&!this._attacked(rank*8+3,enemy)&&!this._attacked(rank*8+2,enemy))this._pushMove(list,from,rank*8+2,'q')}
      }return list}
    _apply(m){const from=sqToI(m.from),to=sqToI(m.to),p=this._board[from],oldEp=this._ep;let captured=this._board[to];this._ep=-1;if(m.flags.includes('e')){captured=this._board[to+(p.color==='w'?-8:8)];this._board[to+(p.color==='w'?-8:8)]=null}this._board[from]=null;this._board[to]=m.promotion?{type:m.promotion,color:p.color}:p;
      if(m.flags.includes('k')){const rank=p.color==='w'?0:7;this._board[rank*8+5]=this._board[rank*8+7];this._board[rank*8+7]=null}if(m.flags.includes('q')){const rank=p.color==='w'?0:7;this._board[rank*8+3]=this._board[rank*8];this._board[rank*8]=null}
      if(p.type==='k'){this._castling[p.color].k=false;this._castling[p.color].q=false}if(p.type==='r'){if(from===0)this._castling.w.q=false;if(from===7)this._castling.w.k=false;if(from===56)this._castling.b.q=false;if(from===63)this._castling.b.k=false}if(captured&&captured.type==='r'){if(to===0)this._castling.w.q=false;if(to===7)this._castling.w.k=false;if(to===56)this._castling.b.q=false;if(to===63)this._castling.b.k=false}
      if(p.type==='p'&&Math.abs(to-from)===16)this._ep=(from+to)>>1;this._halfmove=(p.type==='p'||captured)?0:this._halfmove+1;if(p.color==='b')this._fullmove++;this._turn=p.color==='w'?'b':'w';return {captured:captured?captured.type:null,oldEp}}
    _legal(color=this._turn){const pseudo=this._pseudo(color),legal=[];for(const m of pseudo){const snap=this._snapshot();this._apply(m);const safe=!this._inCheck(color);this._restore(snap);if(safe)legal.push(m)}return legal}
    _san(m,legal){if(m.flags.includes('k'))return 'O-O';if(m.flags.includes('q'))return 'O-O-O';const type=m.piece==='p'?'':m.piece.toUpperCase(),isCapture=m.flags.includes('c')||m.flags.includes('e');let dis='';if(m.piece!=='p'){const competitors=legal.filter(x=>x.from!==m.from&&x.to===m.to&&x.piece===m.piece);if(competitors.length){const sameFile=competitors.some(x=>x.from[0]===m.from[0]),sameRank=competitors.some(x=>x.from[1]===m.from[1]);dis=!sameFile?m.from[0]:!sameRank?m.from[1]:m.from}}else if(isCapture)dis=m.from[0];let san=type+dis+(isCapture?'x':'')+m.to;if(m.promotion)san+='='+m.promotion.toUpperCase();const snap=this._snapshot();this._apply(m);const check=this._inCheck(this._turn);if(check)san+=this._legal(this._turn).length===0?'#':'+';this._restore(snap);return san}
    moves(options={}){const all=this._legal(this._turn),filtered=options.square?all.filter(m=>m.from===options.square):all;return options.verbose?filtered.map(m=>({...copyMove(m),san:this._san(m,all)})):filtered.map(m=>this._san(m,all))}
    move(input){let move=null;const legal=this._legal(this._turn);if(typeof input==='string'){move=legal.find(m=>this._san(m,legal)===input)}else if(input&&typeof input==='object'){const from=input.from,to=input.to;const choices=legal.filter(m=>m.from===from&&m.to===to);move=choices.find(m=>m.promotion===(input.promotion||'q'))||choices.find(m=>!m.promotion)}if(!move)return null;const san=this._san(move,legal),snap=this._snapshot(),applied=this._apply(move);const full={...move,captured:applied.captured||move.captured||null,san,flags:move.flags};this._history.push({snapshot:snap,move:full});this._positions.push(this._positionKey());return {...full}}
    undo(){const entry=this._history.pop();if(!entry)return null;this._restore(entry.snapshot);this._positions.pop();return {...entry.move}}
    history(options={}){const arr=this._history.map(e=>({...e.move}));return options.verbose?arr:arr.map(m=>m.san)}
    _isDrawByRepetition(){const key=this._positionKey();return this._positions.filter(k=>k===key).length>=3}
    _insufficient(){const pieces=[];for(let i=0;i<64;i++){const p=this._board[i];if(p&&p.type!=='k')pieces.push({p,i})}if(pieces.length===0)return true;if(pieces.some(x=>['p','r','q'].includes(x.p.type)))return false;if(pieces.length===1&&['b','n'].includes(pieces[0].p.type))return true;if(pieces.length===2&&pieces.every(x=>x.p.type==='b')){const bishops=pieces;const c1=(bishops[0].i%8+Math.floor(bishops[0].i/8))%2,c2=(bishops[1].i%8+Math.floor(bishops[1].i/8))%2;return c1===c2}return false}
    in_check(){return this._inCheck(this._turn)}
    in_checkmate(){return this._inCheck(this._turn)&&this._legal(this._turn).length===0}
    in_stalemate(){return !this._inCheck(this._turn)&&this._legal(this._turn).length===0}
    insufficient_material(){return this._insufficient()}
    in_threefold_repetition(){return this._isDrawByRepetition()}
    game_over(){return this.in_checkmate()||this.in_stalemate()||this._halfmove>=100||this._isDrawByRepetition()||this._insufficient()}
    fen(){let rows=[];for(let r=7;r>=0;r--){let row='',empty=0;for(let f=0;f<8;f++){const p=this._board[r*8+f];if(!p){empty++;continue}if(empty){row+=empty;empty=0}row+=p.color==='w'?p.type.toUpperCase():p.type}if(empty)row+=empty;rows.push(row)}let c='';if(this._castling.w.k)c+='K';if(this._castling.w.q)c+='Q';if(this._castling.b.k)c+='k';if(this._castling.b.q)c+='q';return `${rows.join('/')} ${this._turn} ${c||'-'} ${this._ep<0?'-':iToSq(this._ep)} ${this._halfmove} ${this._fullmove}`}
  }
  root.LumaChessCore=Chess;
})(typeof window!=='undefined'?window:globalThis);
