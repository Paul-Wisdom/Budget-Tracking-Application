/*
 * Function returns the current month
 */
function getMonth(){
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month_id = new Date().getMonth();
    const month = months[month_id];
    return month;
}

module.exports = getMonth