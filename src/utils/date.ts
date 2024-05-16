// utils.ts
export function stringToDate(dateString: string): Date {
    const parts = dateString.split('-') as [string, string, string];
    const parsed = parts.map((part) => parseInt(part));
    return new Date(parsed[0], parsed[1] - 1, parsed[2]);
}

export function dateToParts(date: Date): { month: string, day: string, year: string } {
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: '2-digit', year: 'numeric' };
    const dateString = date.toLocaleDateString('en-US', options);
    const [month, day, year] = dateString.split(' ');
    
    return {
        month,
        day: day.replace(',', ''), // Remove the comma from the day
        year,
    };
};