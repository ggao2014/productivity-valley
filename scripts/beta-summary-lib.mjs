export function summarizeBetaRecords(records) {
  const count = records.length
  const percentage = (value) =>
    count === 0 ? 0 : Math.round((value / count) * 1000) / 10
  const hasEvent = (record, name) =>
    record.anonymousProductData?.events?.some((event) => event.name === name)

  const metrics = {
    feedbackFiles: count,
    firstCoreLoopCompletion: percentage(
      records.filter((record) => hasEvent(record, 'core_loop_completed')).length,
    ),
    day1Return: percentage(
      records.filter((record) => hasEvent(record, 'return_day_1')).length,
    ),
    day7Return: percentage(
      records.filter((record) => hasEvent(record, 'return_day_7')).length,
    ),
    understandsCoreEconomy: percentage(
      records.filter((record) => record.understanding === 'yes').length,
    ),
    remembersACharacter: percentage(
      records.filter(
        (record) =>
          record.memorableCharacter && record.memorableCharacter !== 'none',
      ).length,
    ),
    findsValleyMoreAppealing: percentage(
      records.filter((record) => record.moreAppealing === 'yes').length,
    ),
    seriousSaveLosses: records.filter((record) => record.seriousSaveLoss === true)
      .length,
  }

  return {
    metrics,
    gates: {
      coreLoopAtLeast70: metrics.firstCoreLoopCompletion >= 70,
      day1AtLeast35: metrics.day1Return >= 35,
      understandingAtLeast60: metrics.understandsCoreEconomy >= 60,
      characterRecallAtLeast50: metrics.remembersACharacter >= 50,
      zeroSeriousSaveLoss: metrics.seriousSaveLosses === 0,
    },
  }
}
