from datetime import date, timedelta

def week_range(day: str):
    """Tries to calculate the date ranges for a week
    containg the date 'day' passed in 'YYYY-MM-DD' format."""

    try:
        day = [int(x) for x in day.split('-')]
        day = date(*day)  # date.fromisoformat is not in 3.6
    except (ValueError, TypeError) as e:
        day = date.today()

    weekday = day.weekday()  # 0 - 6 starting Monday

    start_day = day - timedelta(days=weekday)
    end_day = day + timedelta(days=(6 - weekday))

    return (start_day, end_day)

def date_4months():
    return date.today() + timedelta(days=120)


