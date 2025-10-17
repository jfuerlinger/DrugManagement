using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DrugManagement.Core.Model
{
    public class Slot
    {
        public int Id { get; set; }
        public DateTime StartTimeUtc { get; set; }
        public DateTime EndTimeUtc { get; set; }
        public bool IsAvailable { get; set; }
    }
}
