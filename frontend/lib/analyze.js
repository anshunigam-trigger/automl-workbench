import { modelName } from '@/lib/format'

// Plain-English analysis of ONE experiment. Pure function: data in, facts out.
export function analyzeExperiment(e) {
  const isCls = e.task === 'classification'

  // Every model, with a single `score` field regardless of task, best first
  const models = e.results
    .map(r => ({ ...r, name: modelName(r.id, e.task), score: isCls ? r.accuracy : r.r2 }))
    .filter(m => m.score != null)
    .sort((a, b) => b.score - a.score)

  const best      = models[0] ?? null
  const second    = models[1] ?? null
  const timed     = models.filter(m => m.time != null)
  const fastest   = timed.reduce((f, m) => (!f || m.time < f.time ? m : f), null)
  const totalTime = timed.reduce((sum, m) => sum + m.time, 0)

  const fmtGap = gap => (isCls ? `${(gap * 100).toFixed(2)} points` : `${gap.toFixed(3)} R²`)
  const insights = []

  // 1. Winner vs runner-up
  if (best && second) {
    const gap = best.score - second.score
    insights.push(
      gap < 0.00005
        ? `${best.name} and ${second.name} finished level at the top.`
        : `${best.name} scored highest, ${fmtGap(gap)} ahead of ${second.name}.`
    )
  }

  // 2. Speed vs accuracy trade-off
  if (best && fastest && best.time != null) {
    if (fastest.id === best.id) {
      if (models.length > 1) insights.push(`${best.name} was both the most accurate and the fastest.`)
    } else {
      const times = best.time / Math.max(fastest.time, 0.01)
      if (times >= 2) {
        const loss  = best.score - fastest.score
        const small = isCls ? loss <= 0.01 : loss <= 0.02
        insights.push(
          `${fastest.name} was the fastest, about ${Math.round(times)}× quicker than ${best.name}` +
          (small
            ? ` and gave up only ${fmtGap(loss)}. A good pick when speed matters.`
            : ` but scored ${fmtGap(loss)} lower.`)
        )
      }
    }
  }

  // 3. Warn when a regression fit is poor
  const weak = !isCls && best != null && best.score < 0.5
  if (weak) {
    insights.push(
      `R² of ${best.score.toFixed(2)} means even the best model explains very little of the variation in "${e.target}". ` +
      `Check that this column is numeric and is what you actually want to predict.`
    )
  }

  return { models, best, second, fastest, totalTime, insights, weak }
}