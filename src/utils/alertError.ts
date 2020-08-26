export function alertError(err: Error) {
  if (err.message.includes('aborted')) {
    return
  }
  alert(err)
}
