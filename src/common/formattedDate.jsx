export const formatedDate = (date) => {
    return new Intl.DateTimeFormat('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // для 24-годинного формату
    }).format(new Date(date)); // Додано new Date() для перетворення рядка в об'єкт Date
};