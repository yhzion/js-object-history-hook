export const timeAgo = (time: number) => {
  const between = Date.now() - Number(time)
  if (between < 1000) {
    return 'just now'
  } else if (between < 60000) {
    return `${Math.floor(between / 1000)}s ago`
  } else if (between < 3600000) {
    return `${Math.floor(between / 60000)}m ago`
  } else if (between < 86400000) {
    return `${Math.floor(between / 3600000)}h ago`
  }
}
