module.exports = (async () => {
  const { auvred } = await import('@auvred/eslint-config')

  return auvred()
})()
