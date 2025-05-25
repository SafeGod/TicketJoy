<?

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'user_id',
        'ticket_number',
        'status',
        'price',
        'purchased_at',
        'metadata',
        'qr_code',
    ];

    protected $casts = [
        'purchased_at' => 'datetime',
        'price' => 'decimal:2',
        'metadata' => 'json',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public static function generateTicketNumber()
    {
        $prefix = 'TJ';
        $date = now()->format('ymd');
        $random = strtoupper(substr(md5(uniqid()), 0, 6));
        
        return $prefix . $date . $random;
    }
}