# Optimizer Notes

## Vectorised approach

The optimizer drops rows with missing `pnl`, `mae`, or `mfe` once at the start, then extracts those columns into NumPy arrays. For each stop-loss and take-profit pair, it builds Boolean masks for stop-loss and take-profit events and uses `np.where` to produce the adjusted PnL vector in one array operation.

Stop-loss priority is handled by building the take-profit mask as `(~sl_mask) & (mfe_arr >= tp)`, so a trade can only take profit when it was not already stopped out.

## Readability vs speed

The implementation keeps the outer SL/TP grid as simple Python loops because that makes the priority logic and result construction easy to audit. The expensive per-trade calculations are still fully vectorised, which is the important performance requirement for the requested 1024-combination by 5000-trade workload.

One small speed-oriented choice is computing the stop-loss mask once per stop-loss value and reusing it for every take-profit value under that stop-loss.

## With more time

I would add a benchmark test for the stated 32 by 32 by 5000 case, plus a compact unit test suite covering stop-loss priority, `>=` boundary behavior, NaN row dropping, single-trade Sharpe behavior, and deterministic sorting. If the grid or trade count needed to scale much further, I would consider a batched broadcasting implementation across larger chunks of the SL/TP grid.
