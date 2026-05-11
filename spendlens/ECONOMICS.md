# Economics

Assumptions for a lightweight self-serve launch:

- 1,000 visitors/month from founder communities and search.
- 18% start the form.
- 55% of starters complete an audit.
- 99 completed audits/month.
- 12% leave email.
- 3% of completed audits request a paid cleanup consult.
- Paid cleanup consult price: $299.

Formula:

`monthly revenue = visitors * start_rate * completion_rate * paid_conversion * price`

`1,000 * 0.18 * 0.55 * 0.03 * $299 = $888/month`

Costs should stay low early: Vercel free/pro, Supabase free/pro, Resend free tier, and Anthropic summary calls capped by timeout and short max tokens. The biggest cost is distribution time, not infrastructure.
