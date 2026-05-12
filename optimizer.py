import math

import numpy as np
import pandas as pd


def optimize(
    trades_df: pd.DataFrame,
    stop_losses: list[float],
    take_profits: list[float],
    top_n: int = 5,
) -> list[dict]:
    if trades_df.empty or not stop_losses or not take_profits or top_n <= 0:
        return []

    clean_df = trades_df.dropna(subset=["pnl", "mae", "mfe"])
    if clean_df.empty:
        return []

    mae_arr = clean_df["mae"].to_numpy(dtype=float)
    mfe_arr = clean_df["mfe"].to_numpy(dtype=float)
    pnl_arr = clean_df["pnl"].to_numpy(dtype=float)
    trade_count = pnl_arr.size

    results: list[dict] = []

    for sl_value in stop_losses:
        sl = float(sl_value)
        sl_mask = mae_arr >= sl
        stopped_out = int(np.count_nonzero(sl_mask))

        for tp_value in take_profits:
            tp = float(tp_value)
            tp_mask = (~sl_mask) & (mfe_arr >= tp)
            adjusted_pnl = np.where(sl_mask, -sl, np.where(tp_mask, tp, pnl_arr))

            total_pnl = float(np.sum(adjusted_pnl))
            sharpe = 0.0
            if trade_count >= 2:
                std = float(np.std(adjusted_pnl, ddof=0))
                if std != 0.0:
                    candidate = float(np.mean(adjusted_pnl) / std)
                    if math.isfinite(candidate):
                        sharpe = candidate

            results.append(
                {
                    "stop_loss": sl,
                    "take_profit": tp,
                    "sharpe": float(sharpe),
                    "total_pnl": total_pnl,
                    "stopped_out": stopped_out,
                    "took_profit": int(np.count_nonzero(tp_mask)),
                }
            )

    results.sort(
        key=lambda result: (
            -result["sharpe"],
            -result["total_pnl"],
            result["stop_loss"],
            result["take_profit"],
        )
    )
    return results[:top_n]
