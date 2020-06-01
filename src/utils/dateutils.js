export default {
  displayDate(date) {
    const dtf = new Intl.DateTimeFormat('en', {
      month: 'short',
      day: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    })
    const [{value: mo}, , {value: da}, , {value: hour}, , {value: minute}, , {value: dayPeriod}] = dtf.formatToParts(date)
    return `${da} ${mo} ${hour}:${minute} ${dayPeriod}`
  },
  formatDate(date) {
    const dtf = new Intl.DateTimeFormat('en', {
      month: 'numeric',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    })
    const [{value: mo}, , {value: da}, , {value: year}, , {value: hour}, , {value: minute}] = dtf.formatToParts(date)
    return `${year}-${mo}-${da} ${hour}:${minute}`
  },
  parseDateLocalTime(dateString) {
    const parts = dateString.split(/[^0-9]/)
    return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5])
  }
}
