function dateDifference(date1, date2) {
    const doaTimestamp = new Date(date1).getTime();     //"yyyy-mm-dd"
    const firTimestamp = new Date(date2).getTime();     //"yyyy-mm-dd"

    var diffDays = Math.abs(parseInt((doaTimestamp - firTimestamp) / (1000 * 60 * 60 * 24)));

    return diffDays
}

module.exports = {
    dateDifference
}