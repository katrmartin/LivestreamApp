# time_utils.py

import datetime

def build_scheduled_start_utc(month: int, day: int, time_str: str) -> datetime.datetime:
    """
    Create a UTC datetime object from month, day, and HH:MM time string.
    Adjusts to ensure at least 1 minute in the future.
    """
    now = datetime.datetime.utcnow()
    year = now.year
    hour, minute = map(int, time_str.split(":"))
    scheduled = datetime.datetime(year, month, day, hour, minute)

    # Ensure stream isn't scheduled in the past
    min_future_time = now + datetime.timedelta(minutes=1)
    if scheduled < min_future_time:
        scheduled = min_future_time
    return scheduled
