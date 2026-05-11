/**
 * Tiny linear-algebra helpers used by the pump-curve fit. Pure functions; no
 * dependencies. A future engine port to Rust can replace these with `nalgebra`.
 */

/**
 * Fit y = a + b·x + c·x² through n points by ordinary least squares.
 * Returns `[a, b, c]`. Falls back to constant / linear fits when there are
 * fewer than 3 points.
 */
export function leastSquaresPoly2(
  points: { x: number; y: number }[],
): [number, number, number] {
  if (points.length === 0) return [0, 0, 0];
  if (points.length === 1) return [points[0].y, 0, 0];
  if (points.length === 2) {
    const [p, q] = points;
    if (q.x === p.x) return [p.y, 0, 0];
    const b = (q.y - p.y) / (q.x - p.x);
    const a = p.y - b * p.x;
    return [a, b, 0];
  }

  let n = 0;
  let Sx = 0;
  let Sx2 = 0;
  let Sx3 = 0;
  let Sx4 = 0;
  let Sy = 0;
  let Sxy = 0;
  let Sx2y = 0;
  for (const { x, y } of points) {
    const x2 = x * x;
    const x3 = x2 * x;
    const x4 = x2 * x2;
    n += 1;
    Sx += x;
    Sx2 += x2;
    Sx3 += x3;
    Sx4 += x4;
    Sy += y;
    Sxy += x * y;
    Sx2y += x2 * y;
  }
  // Solve [[n, Sx, Sx2], [Sx, Sx2, Sx3], [Sx2, Sx3, Sx4]] · [a,b,c] = [Sy, Sxy, Sx2y]
  return solve3x3(
    [
      [n, Sx, Sx2],
      [Sx, Sx2, Sx3],
      [Sx2, Sx3, Sx4],
    ],
    [Sy, Sxy, Sx2y],
  );
}

function solve3x3(
  A: number[][],
  b: number[],
): [number, number, number] {
  // Gaussian elimination with partial pivoting
  const M: number[][] = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < 3; col++) {
    let pivot = col;
    for (let r = col + 1; r < 3; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    }
    if (Math.abs(M[pivot][col]) < 1e-12) {
      // Singular — return safe constant fit
      return [b[0] / Math.max(1, A[0][0]), 0, 0];
    }
    if (pivot !== col) {
      [M[col], M[pivot]] = [M[pivot], M[col]];
    }
    for (let r = col + 1; r < 3; r++) {
      const f = M[r][col] / M[col][col];
      for (let c = col; c < 4; c++) M[r][c] -= f * M[col][c];
    }
  }
  const x = [0, 0, 0];
  for (let r = 2; r >= 0; r--) {
    let s = M[r][3];
    for (let c = r + 1; c < 3; c++) s -= M[r][c] * x[c];
    x[r] = s / M[r][r];
  }
  return [x[0], x[1], x[2]];
}

/**
 * Bisection root finder. Assumes f(lo) and f(hi) bracket a root (opposite
 * signs). Returns null if they don't.
 */
export function bisect(
  f: (x: number) => number,
  lo: number,
  hi: number,
  tol = 1e-6,
  maxIter = 200,
): number | null {
  let fLo = f(lo);
  let fHi = f(hi);
  if (fLo === 0) return lo;
  if (fHi === 0) return hi;
  if (Math.sign(fLo) === Math.sign(fHi)) return null;

  for (let i = 0; i < maxIter; i++) {
    const mid = 0.5 * (lo + hi);
    const fMid = f(mid);
    if (!Number.isFinite(fMid)) return null;
    if (Math.abs(fMid) < tol || (hi - lo) < tol) return mid;
    if (Math.sign(fMid) === Math.sign(fLo)) {
      lo = mid;
      fLo = fMid;
    } else {
      hi = mid;
      fHi = fMid;
    }
  }
  return 0.5 * (lo + hi);
}
