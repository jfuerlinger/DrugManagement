using DrugManagement.Core.Model;

namespace DrugManagement.Core.FakeData
{
    public class FakeDataGenerator
    {
        public static IEnumerable<Slot> GenerateSlotsForCurrentYear()
        {
            var currentYear = DateTime.Now.Year;
            var startOfYear = new DateTime(currentYear, 1, 1);
            var endOfYear = new DateTime(currentYear, 12, 31);

            for (var date = startOfYear; date <= endOfYear; date = date.AddDays(1))
            {
                // Only create slots for weekdays (Monday to Friday)
                if (date.DayOfWeek >= DayOfWeek.Monday && date.DayOfWeek <= DayOfWeek.Friday)
                {
                    for (int hour = 8; hour < 16; hour++)
                    {
                        for (int minute = 0; minute < 60; minute += 30)
                        {
                            var startTime = date.AddHours(hour).AddMinutes(minute);
                            var endTime = startTime.AddMinutes(25);

                            yield return new()
                            {
                                StartTimeUtc = startTime.ToUniversalTime(),
                                EndTimeUtc = endTime.ToUniversalTime(),
                                IsAvailable = true
                            };
                        }
                    }
                }
            }
        }
    }
}
