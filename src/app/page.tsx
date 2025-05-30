'use client';

import { truncate } from 'fs';
import { useState } from 'react';
import { clearLine } from 'readline';
import { fix } from '../../stylelint.config';

export default function Home() {
  // 0: 何もない、1: 黒、2: 白
  const [turn, setTurn] = useState(1); // 最初は黒のターン
  // const [stone, setStone] = useState(0); これは1マスバージョンのときの駒の状態の判定
  const [board, setBoard] = useState( //盤面の状態の初期状態
    [[0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 1, 2, 0, 0, 0,],
    [0, 0, 0, 2, 1, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,], ]
  )


  //駒が置けるかどうかを判定するためには置きたい位置の8方向の状態が知りたい。先に8方向を定義しておく
  const directions = [
  [-1, 0], //上
  [1, 0],  //下
  [0, -1],  //左
  [0, 1],  //右
  [-1, -1],  //左上
  [-1, 1],  //右上
  [1, -1],  //左下
  [1, 1] //右下
  ]

  function isOnBoard(x: number, y: number): boolean {
  return x >= 0 && x < 8 && y >= 0 && y < 8;
  };

  function getOpponent(player: number): number {
  return player === 1 ? 2 : 1
  };

  function checkDirection(board: number[][], x: number, y: number, dx:number, dy: number, player: number) { //playerは自分の駒
    let nx=x+dx; // 左右隣のマス dxは方向ベクトル
    let ny=y+dy; // 上下隣のマス dyは方向ベクトル
    let stonesToFlip=[]; //ひっくり返す駒の位置一覧

    //隣接マスがボード外または、上下左右の隣接マスに色違いの駒がない場合、置けるわけない
    if (!isOnBoard(nx, ny) || board[ny][nx] !== getOpponent(player)) { //isOnBoardは(x, y)が番の範囲内か確認し、getOpponentは相手の石の種類を返す
      return [];
    }

    //繰り返し処理
    while (true) {
      if (!isOnBoard(nx, ny)) {
        return []; //隣接マスがボード外なら置けるわけない
      }
      if (board[ny][nx]===0) {
        return []; // 隣接マスに駒がどこにもない場合、置けるわけない
      }
      if (board[ny][nx]===player) {
        return stonesToFlip; //自分の駒が見つかったとき、途中の相手の駒はひっくり返せる
      }

      stonesToFlip.push([nx, ny]); //相手の石があれば記録
      nx+=dx;
      ny+=dy;
    }

  }


  // クリックしたら黒 → 白 → 空 に変わる
  const handleClick = (x: number, y: number) => {
    //盤面上に駒が置かれている場合、何もしない
    console.log('ターン', turn);
    if (board[y][x] !== 0) return;
    //イミュータブル(あくまで配列newBoardが対象で、その中身の値は変更おｋ)なので、新しく変更用にボードを作る
    const newBoard=board.map(row =>[...row])
    let flippedAny = false; //駒をひっくり返せる方向が1つでもあったか記録

    for(const [dx, dy] of directions) {
      const stones=checkDirection(board, x, y, dx, dy, turn); //ひっくり返せる石の座標一覧

      if (stones.length > 0) {
        flippedAny = true;
        stones.forEach(([fx, fy]) => {newBoard[fy][fx] = turn;
        });
      }
    }

    if(flippedAny) {
      newBoard[y][x] = turn;
      setBoard(newBoard);
      setTurn(turn === 1 ? 2:1);
    }
    // //(y, x)に駒を置く
    // newBoard[y][x] = turn;

    // //boardの盤面を更新
    // setBoard(newBoard);

    // //turnの値が1ならば2へ、そうでなければ1へ
    // setTurn(turn === 1?2:1);


    // if (stone === 0) setStone(1);       // 黒にする
    // else if (stone === 1) setStone(2);  // 白にする
    // else setStone(0);                   // 空に戻す
  };

  // 色の決定
  const getColor = (cell: number) => {
    if (cell === 1) return 'black';
    if (cell === 2) return 'white';
    return 'transparent';
  };

  return (
    <main style={{
    display: 'flex',
    justifyContent: 'center',  // 横方向中央揃え
    alignItems: 'center',      // 縦方向中央揃え
    height: '100vh',           // 画面全体の高さを確保して縦中央にできるように
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 60px)' }}>
        {board.map((row, y) => //boardのy行をrowとして表すかつ、ひとつずつ取り出して何か処理して新しい配列を作るつまり、上のboardの配列で指定した場所と新しい配列の場所を結びつけている
          row.map((cell, x) => ( //boardのx列目の値をcellとして表す(さっきの.mapでrowは決まっているので)かつ、処理アンド配列つくる
            <div
              key={`${y}-${x}`}
              onClick={() => handleClick(x, y)}
              style={{
                width: '60px',
                height: '60px',
                border: '1px solid #333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0a7d22',
                cursor: 'pointer',
              }}
            >
            <div
            style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: getColor(cell),
            }}
            ></div>
            </div>
        ))
      )}
    </div>
    </main>
  );
}

// ┌───────────────┐
// │   board (state)│  ←＝ 状態：中身 [[], [], ...]
// └──────┬────────┘
//        ↓ React が自動的に反映
// ┌───────────────┐
// │     UI表示（JSX）│  ←＝ board をmapで表示
// └───────────────┘
